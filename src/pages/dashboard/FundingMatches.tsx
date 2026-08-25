import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShinyButton } from '@/components/ui/shiny-button';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { SUPABASE_STORAGE_KEY, readStoredSession } from '@/lib/auth-storage';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  Sparkles,
  Loader2,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  XCircle,
  DollarSign,
  Calendar,
  ArrowRight,
  AlertCircle,
  Bookmark,
  Info,
  AlertTriangle,
} from 'lucide-react';

interface Criterion {
  label: string;
  status: 'met' | 'unmet' | 'unknown';
}

interface Match {
  grant_id: string;
  name: string;
  funder: string;
  amount_min: number | null;
  amount_max: number | null;
  amount_currency: string;
  deadline: string | null;
  is_recurring: boolean;
  application_url: string;
  funding_type: string;
  is_repayable: boolean | null;
  criteria?: Criterion[];
  eligibility: 'yes' | 'no' | 'maybe';
  fit_score?: number;
  explanation?: string;
}

type Tier = 'free' | 'growth' | 'pro' | 'enterprise';

interface MatchResponse {
  matches: Match[];
  tier: Tier;
  matches_remaining_this_month: number | null;
  message?: string;
  error?: string;
  missing_fields?: string[];
  quota_exceeded?: boolean;
  rate_limited?: boolean;
  upgrade_url?: string;
}

type PageState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'results'; data: MatchResponse }
  | { kind: 'profile-incomplete'; missing: string[] }
  | { kind: 'quota-exceeded'; message: string; upgradeUrl: string }
  | { kind: 'rate-limited'; message: string }
  | { kind: 'error'; message: string };

function formatAmount(m: Match): string {
  if (!m.amount_min && !m.amount_max) return 'Amount varies';
  const fmt = (n: number) => '$' + n.toLocaleString('en-CA');
  if (m.amount_min && m.amount_max && m.amount_min !== m.amount_max) {
    return `${fmt(m.amount_min)} – ${fmt(m.amount_max)}`;
  }
  return `Up to ${fmt(m.amount_max ?? m.amount_min ?? 0)}`;
}

function formatDeadline(m: Match): string {
  if (m.is_recurring && !m.deadline) return 'Rolling intake';
  if (!m.deadline) return 'No deadline';
  const deadline = new Date(m.deadline);
  const today = new Date();
  const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const formatted = deadline.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
  if (daysLeft < 0) return formatted;
  if (daysLeft === 0) return `${formatted} — today`;
  return `${formatted} — ${daysLeft} days left`;
}

// The criteria list is the honest core of this page: which stated requirements
// the profile meets, which it doesn't, and — crucially — which were never
// assessed. It is computed by deterministic rules in the edge function, not by
// the model, and it renders on EVERY tier. Charging to see why something
// matched is what made the old "Likely eligible" badge necessary in the first
// place.
function CriteriaList({ criteria }: { criteria: Criterion[] }) {
  if (!criteria || criteria.length === 0) return null;
  const met = criteria.filter((c) => c.status === 'met').length;
  const unknown = criteria.filter((c) => c.status === 'unknown').length;

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <p className="text-xs font-medium text-foreground mb-2">
        Meets {met} of {criteria.length} stated criteria
        {unknown > 0 && <span className="text-muted-foreground"> · {unknown} not assessed</span>}
      </p>
      <ul className="space-y-1.5">
        {criteria.map((c) => (
          <li key={c.label} className="flex items-start gap-2 text-xs leading-relaxed">
            {c.status === 'met' && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-px" aria-hidden="true" />}
            {c.status === 'unmet' && <XCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-px" aria-hidden="true" />}
            {c.status === 'unknown' && <HelpCircle className="w-3.5 h-3.5 text-yellow-600 shrink-0 mt-px" aria-hidden="true" />}
            <span className={c.status === 'unmet' ? 'text-muted-foreground line-through' : 'text-foreground/80'}>
              {c.label}
              {c.status === 'unknown' && (
                <span className="text-muted-foreground"> — not assessed</span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {unknown > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          <Link to="/dashboard/profile" className="text-primary underline">
            Add the missing details
          </Link>{' '}
          to assess these.
        </p>
      )}
    </div>
  );
}

// Most of this catalogue is repayable financing from Indigenous Financial
// Institutions, not grants. Rendering a $350,000 LOAN in the same card as a
// non-repayable contribution — under a heading that said "grant
// recommendations" — is the most consequential category error this page can
// make, so repayability is stated on the card face.
// is_repayable === null means "not stated in the record"; that is shown as
// "confirm with funder", never silently as non-repayable.
function FundingTypeBadge({ fundingType, isRepayable }: { fundingType: string; isRepayable: boolean | null }) {
  const label =
    fundingType === 'loan' ? 'Loan — repayable'
    : fundingType === 'loan_guarantee' ? 'Loan guarantee — repayable'
    : fundingType === 'grant' ? 'Grant — non-repayable'
    : fundingType === 'mixed' ? 'Loans & non-repayable — varies'
    : 'Type varies — confirm with funder';

  if (isRepayable === true) {
    return (
      <Badge className="bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/40">
        <AlertTriangle className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  }
  if (isRepayable === false) {
    return (
      <Badge className="bg-primary/10 text-primary border border-primary/30">
        {label}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      {label}
    </Badge>
  );
}

// These badges describe how well a program matches the PROFILE, never whether
// the person is eligible. Eligibility for most Indigenous-specific programs
// turns on First Nations / Métis / Inuit identity, community or Nation
// affiliation, and percentage of Indigenous ownership — none of which this
// product collects. Saying "Likely eligible" on inputs that cannot establish
// eligibility sends someone to spend weeks on an application they may be
// screened out of on the first criterion.
function EligibilityBadge({ eligibility }: { eligibility: Match['eligibility'] }) {
  if (eligibility === 'yes') {
    return (
      <Badge className="bg-primary/10 text-primary border-primary/30 border">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Strong profile match
      </Badge>
    );
  }
  if (eligibility === 'no') {
    // Deliberately hedged. This is an AI assessment, not a funder's decision —
    // stating "Not eligible" as fact could stop someone applying for funding
    // they actually qualify for, which is the costliest error this page can make.
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <XCircle className="w-3 h-3 mr-1" />
        Likely not a fit
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30">
      <HelpCircle className="w-3 h-3 mr-1" />
      Check eligibility
    </Badge>
  );
}

const FundingMatches: React.FC = () => {
  const { user } = useAuth();
  const [state, setState] = useState<PageState>({ kind: 'idle' });
  const [savingId, setSavingId] = useState<string | null>(null);

  const runMatching = async () => {
    if (!user) {
      toast.error('You must be signed in to run matching');
      return;
    }

    setState({ kind: 'loading' });

    try {
      // Read access token directly from localStorage — supabase.auth.getSession()
      // is known to hang in this project (see useAuth.tsx for the full story).
      // The SDK's functions.invoke() also doesn't reliably auto-attach the
      // token in our environment, so we pass it explicitly via headers.
      let accessToken: string | undefined;
      try {
        const raw = localStorage.getItem(SUPABASE_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const stored = parsed?.currentSession ?? parsed;
          accessToken = stored?.access_token;
        }
      } catch (e) {
        console.error('[FundingMatches] could not read session token:', e);
      }

      if (!accessToken) {
        setState({ kind: 'error', message: 'Sign-in session expired. Please sign in again.' });
        return;
      }

      // Bypass supabase.functions.invoke() entirely. The SDK wraps errors in
      // a way where the response body is a ReadableStream that can't be
      // parsed synchronously, and our error handler was failing silently
      // on quota_exceeded and rate_limited responses. Going direct to fetch
      // gives us clean access to response.json() for any status code.
      const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/match-funding-opportunities`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      let response: Response;
      try {
        response = await fetch(FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'apikey': SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({}),
          signal: controller.signal,
        });
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        if ((fetchErr as Error).name === 'AbortError') {
          setState({ kind: 'error', message: 'Request timed out after 30 seconds. Please try again.' });
        } else {
          console.error('[FundingMatches] fetch failed:', fetchErr);
          setState({ kind: 'error', message: 'Could not reach matching service. Check your connection.' });
        }
        return;
      }
      clearTimeout(timeoutId);

      // Parse the response body as JSON regardless of status code.
      let parsed: MatchResponse;
      try {
        parsed = await response.json();
      } catch (parseErr) {
        console.error('[FundingMatches] failed to parse response JSON:', parseErr, 'status:', response.status);
        setState({ kind: 'error', message: `Matching service returned an unreadable response (HTTP ${response.status}).` });
        return;
      }

      // Handle non-success statuses with specific UI states based on parsed body
      if (!response.ok) {
        if (parsed.missing_fields && parsed.missing_fields.length > 0) {
          setState({ kind: 'profile-incomplete', missing: parsed.missing_fields });
          return;
        }
        if (parsed.quota_exceeded) {
          setState({
            kind: 'quota-exceeded',
            message: parsed.error || 'Monthly quota exceeded',
            upgradeUrl: parsed.upgrade_url || '/pricing',
          });
          return;
        }
        if (parsed.rate_limited) {
          setState({ kind: 'rate-limited', message: parsed.error || 'Slow down — 3 matches per minute max' });
          return;
        }
        setState({ kind: 'error', message: parsed.error || `Matching failed (HTTP ${response.status})` });
        return;
      }

      // 2xx success path
      setState({ kind: 'results', data: parsed });
    } catch (err) {
      console.error('[FundingMatches] runMatching threw:', err);
      setState({ kind: 'error', message: 'Something went wrong. Please try again.' });
    }
  };

  const saveMatch = async (grantId: string) => {
    if (!user) return;
    setSavingId(grantId);
    try {
      // Direct PostgREST upsert (SDK query path can hang). Unique constraint
      // (user_id, grant_id) backs the on_conflict merge.
      const token = readStoredSession()?.access_token ?? SUPABASE_ANON_KEY;
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/funding_saved_matches?on_conflict=user_id,grant_id`,
        {
          method: 'POST',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates',
          },
          body: JSON.stringify({ user_id: user.id, grant_id: grantId, status: 'interested' }),
        }
      );
      if (!res.ok) throw new Error('save failed');
      toast.success('Saved to your matches');
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Could not save. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  const tier = state.kind === 'results' ? state.data.tier : null;
  const isPaid = tier === 'growth' || tier === 'pro' || tier === 'enterprise';
  const remaining = state.kind === 'results' ? state.data.matches_remaining_this_month : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Your funding matches</h1>
            <p className="text-muted-foreground mt-1">
              Personalised funding and financing matches based on your profile
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <ShinyButton onClick={runMatching} disabled={state.kind === 'loading'}>
              {state.kind === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin inline-block" />
                  Matching...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2 inline-block" />
                  Find my matches
                </>
              )}
            </ShinyButton>
            {state.kind === 'results' && remaining !== null && (
              <p className="text-xs text-muted-foreground">
                {remaining} match{remaining === 1 ? '' : 'es'} remaining this month
              </p>
            )}
          </div>
        </div>

        {/* Tier-specific quota banner */}
        {state.kind === 'idle' && (
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Ready to find your funding?</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  We will scan the verified Indigenous business funding database and rank grants by fit with your profile. Results take 5-15 seconds.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Free plan: 3 matches per month. <Link to="/pricing" className="text-primary underline">Upgrade</Link> for unlimited matching + detailed explanations.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Loading state */}
        {state.kind === 'loading' && (
          <Card>
            <CardContent className="p-12 text-center space-y-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
              <p className="text-muted-foreground">Scoring grants against your profile...</p>
            </CardContent>
          </Card>
        )}

        {/* Profile incomplete */}
        {state.kind === 'profile-incomplete' && (
          <Card className="border-yellow-500/40">
            <CardContent className="p-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Complete your profile first</h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-2">
                  We need a few more details to find relevant matches. Missing:
                </p>
                <ul className="text-sm text-foreground list-disc list-inside max-w-sm mx-auto text-left">
                  {state.missing.map((field) => (
                    <li key={field}>
                      {field === 'territory' && 'Province or territory (on your profile)'}
                      {field === 'industry' && 'Industry (on your business info)'}
                      {field === 'business_stage' && 'Business stage (on your business info)'}
                    </li>
                  ))}
                </ul>
              </div>
              <Button asChild>
                <Link to="/dashboard/profile">
                  Complete profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quota exceeded */}
        {state.kind === 'quota-exceeded' && (
          <Card className="border-primary/40">
            <CardContent className="p-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">You have used your free matches for this month</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">{state.message}</p>
              </div>
              <ShinyButton asChild>
                <Link to={state.upgradeUrl}>View plans</Link>
              </ShinyButton>
              <p className="text-xs text-muted-foreground">Your quota resets on the 1st of next month.</p>
            </CardContent>
          </Card>
        )}

        {/* Rate limited */}
        {state.kind === 'rate-limited' && (
          <Card>
            <CardContent className="p-8 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto" />
              <h2 className="text-lg font-semibold">{state.message}</h2>
              <p className="text-muted-foreground text-sm">Try again in a minute.</p>
            </CardContent>
          </Card>
        )}

        {/* Generic error */}
        {state.kind === 'error' && (
          <Card>
            <CardContent className="p-8 text-center space-y-2">
              <XCircle className="w-8 h-8 text-destructive mx-auto" />
              <h2 className="text-lg font-semibold">Matching failed</h2>
              <p className="text-muted-foreground text-sm">{state.message}</p>
              <Button variant="outline" onClick={runMatching} className="mt-4">
                Try again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {state.kind === 'results' && (
          <>
            {state.data.matches.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center space-y-4">
                  <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto" />
                  <h2 className="text-xl font-semibold">
                    {state.data.message || 'No matches found'}
                  </h2>
                  <p className="text-muted-foreground max-w-xl mx-auto">
                    Try broadening your industry or business stage on your profile, or check back after verified grants are added to the database.
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/dashboard/profile">Edit profile</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{state.data.matches.length} match{state.data.matches.length === 1 ? '' : 'es'} found</span>
                  {!isPaid && (
                    <Link to="/pricing" className="text-primary underline">
                      Upgrade for explanations and save-for-later
                    </Link>
                  )}
                </div>

                {/* Separates VERIFIED source data (the programs themselves, from
                    our grants database) from AI-GENERATED guidance (the fit score,
                    eligibility read, and explanation). Without this, an AI verdict
                    can be mistaken for a funder's decision. */}
                <div className="rounded-lg border border-border bg-muted/40 p-4 flex gap-3">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">How to read these results:</span>{' '}
                    the funding programs listed are real records from our database. The{' '}
                    <span className="font-medium text-foreground">fit score, eligibility read, and explanation are AI-generated guidance</span>{' '}
                    — not an eligibility decision. Matching uses your territory, industry and
                    business stage. It does{' '}
                    <span className="font-medium text-foreground">not</span> assess First Nations,
                    Métis or Inuit identity, community or Nation affiliation, or percentage of
                    Indigenous ownership — which is what most of these programs actually turn on.
                    Always confirm current criteria, amounts, and deadlines with the funder before
                    applying, and don&apos;t rule a program out on this page alone.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {state.data.matches.map((match) => (
                    <Card key={match.grant_id} className="flex flex-col hover:border-primary/30 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <CardTitle className="text-lg leading-snug">{match.name}</CardTitle>
                            <CardDescription className="mt-1">{match.funder}</CardDescription>
                          </div>
                          {match.fit_score !== undefined && (
                            <div className="shrink-0 text-right">
                              <div className="text-2xl font-bold text-primary">{match.fit_score}</div>
                              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">fit</div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <FundingTypeBadge fundingType={match.funding_type} isRepayable={match.is_repayable} />
                          <EligibilityBadge eligibility={match.eligibility} />
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4 flex-1 flex flex-col">
                        {match.criteria && match.criteria.length > 0 && (
                          <CriteriaList criteria={match.criteria} />
                        )}

                        {match.explanation && (
                          <p className="text-sm text-foreground/80 leading-relaxed italic bg-muted/30 border-l-2 border-primary/40 pl-3 py-2">
                            {match.explanation}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="outline">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {formatAmount(match)}
                          </Badge>
                          <Badge variant="outline">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDeadline(match)}
                          </Badge>
                        </div>

                        <div className="flex gap-2 mt-auto pt-2">
                          <Button asChild variant="outline" size="sm" className="flex-1">
                            <a href={match.application_url} target="_blank" rel="noopener noreferrer">
                              Apply
                              <ExternalLink className="w-3 h-3 ml-2" />
                            </a>
                          </Button>
                          {isPaid && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => saveMatch(match.grant_id)}
                              disabled={savingId === match.grant_id}
                            >
                              {savingId === match.grant_id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Bookmark className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {!isPaid && state.data.matches.length > 0 && (
                  <Card className="bg-primary/5 border-primary/30">
                    <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold mb-1">See why each grant fits you</h3>
                        <p className="text-sm text-muted-foreground">
                          Growth tier (from $39/mo) unlocks AI explanations, fit scores, save-for-later, and unlimited matches.
                        </p>
                      </div>
                      <ShinyButton asChild>
                        <Link to="/pricing">Upgrade</Link>
                      </ShinyButton>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FundingMatches;
