import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useNavigate } from 'react-router-dom';
import { Info, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

/**
 * Six-question progressive profile, then an immediate first result.
 *
 * The previous wizard asked three things (territory, stage, industry) and its
 * finish() only wrote to localStorage before navigating — nothing ever reached
 * business_profiles, so the answers were collected and silently discarded, and
 * matching had nothing to work from.
 *
 * Every answer here maps to a column that already exists on business_profiles;
 * no migration was needed.
 */
const STORAGE_KEY = 'onboarding-v2';

const IDENTITY = [
  { value: 'first_nations', label: 'First Nations' },
  { value: 'metis', label: 'Métis' },
  { value: 'inuit', label: 'Inuit' },
  { value: 'multiple', label: 'More than one of these' },
  { value: 'not_indigenous', label: 'Not Indigenous-owned' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];
const PROVINCES = ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'];
const STAGES = [
  { value: 'idea', label: 'Idea — not started yet' },
  { value: 'startup', label: 'Starting — first customers' },
  { value: 'early', label: 'Early — growing steadily' },
  { value: 'established', label: 'Established — several years in' },
];
const SECTORS = ['Agriculture','Arts & Culture','Construction','Energy','Food & Beverage','Health','Manufacturing','Professional Services','Retail','Technology','Tourism','Transportation','Other'];
const REVENUE = [
  { value: 'pre_revenue', label: 'No revenue yet' },
  { value: 'under_50k', label: 'Under $50,000' },
  { value: '50k_250k', label: '$50,000 – $250,000' },
  { value: '250k_1m', label: '$250,000 – $1M' },
  { value: 'over_1m', label: 'Over $1M' },
];
const GOALS = [
  { value: 'find_funding', label: 'Find funding' },
  { value: 'write_plan', label: 'Write a business plan' },
  { value: 'get_procurement_ready', label: 'Get procurement-ready' },
  { value: 'grow_revenue', label: 'Grow revenue' },
];

interface Answers {
  identity: string; province: string; stage: string;
  sector: string; revenue: string; goal: string;
}
const EMPTY: Answers = { identity: '', province: '', stage: '', sector: '', revenue: '', goal: '' };

interface Grant {
  id: string; name: string; funder: string | null; funding_type: string | null;
  is_repayable: boolean | null; source_url: string | null; last_verified: string | null;
  provinces: string[] | null; industries: string[] | null; business_stages: string[] | null;
}
interface Scored { grant: Grant; met: string[]; unknown: string[] }

const QUESTIONS: Array<{
  key: keyof Answers; label: string; options: Array<{ value: string; label: string }>; why?: string;
}> = [
  {
    key: 'identity',
    label: 'Is your business Indigenous-owned?',
    options: IDENTITY,
    // The brief requires a visible reason next to this question specifically.
    why: 'Most programs here are open only to First Nations, Métis or Inuit owned businesses, so this decides which ones can apply to you. You can skip it — we will just mark those criteria as not assessed rather than guess.',
  },
  { key: 'province', label: 'Where is your business based?', options: PROVINCES.map((p) => ({ value: p, label: p })) },
  { key: 'stage', label: 'What stage is your business at?', options: STAGES },
  { key: 'sector', label: 'What industry are you in?', options: SECTORS.map((s) => ({ value: s, label: s })) },
  { key: 'revenue', label: 'What is your current annual revenue?', options: REVENUE },
  { key: 'goal', label: 'What do you want to do first?', options: GOALS },
];

const OnboardingWizard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [matches, setMatches] = useState<Scored[] | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAnswers({ ...EMPTY, ...JSON.parse(raw) });
    } catch { /* ignore corrupt draft */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(answers)); } catch { /* ignore */ }
  }, [answers]);

  const total = QUESTIONS.length;
  const current = QUESTIONS[step];
  const answered = current ? answers[current.key] !== '' : true;

  /** Deterministic criteria match — never a bare score. */
  const scoreGrants = useCallback((grants: Grant[], a: Answers): Scored[] =>
    grants
      .map((grant) => {
        const met: string[] = [];
        const unknown: string[] = [];
        const check = (list: string[] | null, value: string, met_: string, unknown_: string) => {
          if (!list || list.length === 0) return;             // programme does not restrict on this
          if (!value) { unknown.push(unknown_); return; }      // we did not ask / user skipped
          if (list.includes(value)) met.push(met_);
        };
        check(grant.provinces, a.province, `Open in ${a.province}`, 'Your province');
        check(grant.industries, a.sector, `Covers ${a.sector}`, 'Your industry');
        check(grant.business_stages, a.stage, 'Matches your business stage', 'Your business stage');
        if (a.identity === 'prefer_not_to_say' || a.identity === '') {
          unknown.push('Indigenous ownership');
        } else if (a.identity !== 'not_indigenous') {
          met.push('Indigenous-owned');
        }
        return { grant, met, unknown };
      })
      .filter((s) => s.met.length > 0)
      .sort((x, y) => y.met.length - x.met.length)
      .slice(0, 3),
  []);

  const finish = async () => {
    if (!user) { toast.error('Please sign in again to save your answers'); return; }
    setSaving(true);
    try {
      // The old finish() never wrote here — answers went to localStorage and
      // were then invisible to matching, the dashboard, and export.
      const { error } = await supabase.from('business_profiles').upsert(
        {
          user_id: user.id,
          ownership_type: answers.identity || null,
          province: answers.province || null,
          stage: answers.stage || null,
          sector: answers.sector || null,
          revenue_range: answers.revenue || null,
          goals: answers.goal || null,
        },
        { onConflict: 'user_id' }
      );
      if (error) throw error;

      const { data, error: gErr } = await supabase
        .from('grants')
        .select('id,name,funder,funding_type,is_repayable,source_url,last_verified,provinces,industries,business_stages')
        .eq('is_published', true);
      if (gErr) throw gErr;

      setMatches(scoreGrants((data ?? []) as Grant[], answers));
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    } catch (err) {
      // Never claim a save that did not happen.
      setMatchError(err instanceof Error ? err.message : 'Could not save your answers');
      toast.error('Could not save your answers — please try again');
    } finally {
      setSaving(false);
    }
  };

  // ── First win ────────────────────────────────────────────────────────────
  if (matches) {
    const missing = QUESTIONS.filter((q) => !answers[q.key] || answers[q.key] === 'prefer_not_to_say');
    return (
      <div className="mx-auto w-full max-w-3xl py-8">
        <Card className="p-8">
          <h1 className="text-2xl font-bold">Here is what you can apply for</h1>
          <p className="mt-1 text-muted-foreground">
            Matched from {matches.length > 0 ? 'our verified programme list' : 'our verified programme list'} using
            the answers you just gave. These are matches on stated criteria — the funder decides eligibility, not us.
          </p>

          {matches.length === 0 ? (
            <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <p className="font-medium text-foreground">No programme matched every criterion yet.</p>
              <p className="mt-1 text-muted-foreground">
                That usually means a detail is missing rather than that nothing fits. Complete the items below
                and run a match from your dashboard.
              </p>
            </div>
          ) : (
            <ul className="mt-6 space-y-4">
              {matches.map(({ grant, met, unknown }) => (
                <li key={grant.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold">{grant.name}</p>
                      <p className="text-sm text-muted-foreground">{grant.funder}</p>
                    </div>
                    {grant.is_repayable && (
                      <span className="text-xs font-medium text-destructive">You pay this back</span>
                    )}
                  </div>
                  <div className="mt-3 space-y-1 text-sm">
                    {met.map((m) => (
                      <p key={m} className="flex items-center gap-2 text-foreground">
                        <Check className="h-4 w-4 text-primary" aria-hidden="true" /> {m}
                      </p>
                    ))}
                    {unknown.map((u) => (
                      <p key={u} className="flex items-center gap-2 text-muted-foreground">
                        <AlertCircle className="h-4 w-4" aria-hidden="true" /> Not assessed — {u}
                      </p>
                    ))}
                  </div>
                  {grant.last_verified && (
                    <p className="mt-2 font-mono text-xs text-muted-foreground">
                      Programme details last verified {grant.last_verified}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {missing.length > 0 && (
            <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm font-medium">To assess more criteria, add:</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {missing.map((q) => <li key={q.key}>• {q.label.replace(/\?$/, '')}</li>)}
              </ul>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => navigate('/dashboard/funding/matches')}>See all matches</Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>Go to dashboard</Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Your answers are stored in Canada and used to match you to programmes. You can{' '}
            <Link to="/dashboard/settings" className="underline">export or delete them</Link> at any time.
          </p>
        </Card>
      </div>
    );
  }

  // ── Questions ────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto flex w-full max-w-3xl items-center py-8">
      <Card className="w-full p-8">
        <div className="mb-6">
          <div className="text-sm text-muted-foreground">Question {step + 1} of {total}</div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted/30">
            <div className="h-2 bg-primary transition-all" style={{ width: `${((step + 1) / total) * 100}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor={`q-${current.key}`} className="text-lg font-semibold">{current.label}</Label>
          {current.why && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" aria-label="Why we ask this" className="text-muted-foreground hover:text-foreground">
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-sm">{current.why}</TooltipContent>
            </Tooltip>
          )}
        </div>
        {current.why && <p className="mt-2 text-sm text-muted-foreground">{current.why}</p>}

        <div className="mt-4">
          <Select
            value={answers[current.key]}
            onValueChange={(v) => setAnswers((prev) => ({ ...prev, [current.key]: v }))}
          >
            <SelectTrigger id={`q-${current.key}`}><SelectValue placeholder="Choose one" /></SelectTrigger>
            <SelectContent>
              {current.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {matchError && <p className="mt-4 text-sm text-destructive">{matchError}</p>}

        <div className="mt-8 flex justify-between">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Back
          </Button>
          {step < total - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!answered}>Next</Button>
          ) : (
            <Button onClick={finish} disabled={!answered || saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? 'Saving…' : 'See my matches'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OnboardingWizard;
