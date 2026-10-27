import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Bookmark, BookmarkCheck, Calendar, DollarSign, FileText, Flag, MapPin, ShieldAlert, ShieldCheck } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MetaTags from '@/components/MetaTags';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import OfficialLinkButton from '@/components/funding/OfficialLinkButton';
import FundingProgramCard from '@/components/funding/FundingProgramCard';
import { useAuth } from '@/hooks/useAuth';
import { readStoredSession } from '@/lib/auth-storage';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';
import { DEFAULT_SAVED_STATUS } from '@/lib/funding-status';
import { sourceLink } from '@/lib/funding-links';
import {
  APPLICANT_LABELS, CATEGORY_LABELS, IDENTITY_LABELS, STAGE_LABELS, deriveIntake, fetchProgramBySlug,
  fetchSimilarPrograms, fmtDate, formatAmount, fundingTypeLabel, programPageTitle, regionLabel, type FundingProgram,
} from '@/lib/funding-catalog';
import { seededPrograms } from '@/lib/funding-prerender';
import { toast } from 'sonner';

const SITE = 'Indigenous Rising AI';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-3">{title}</h2>
      {children}
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-6 space-y-1 text-muted-foreground leading-relaxed">
      {items.map((i) => <li key={i}>{i}</li>)}
    </ul>
  );
}

export default function FundingProgramPage({ slug }: { slug: string }) {
  const { user } = useAuth();
  const seed = useMemo(() => seededPrograms()?.find((p) => p.slug === slug) ?? null, [slug]);
  const [program, setProgram] = useState<FundingProgram | null | undefined>(seed ?? undefined);
  const [similar, setSimilar] = useState<FundingProgram[]>(() =>
    seed ? (seededPrograms() ?? []).filter((p) => p.slug !== slug && (p.provinces.length >= 13 || p.provinces.some((c) => seed.provinces.includes(c)))).slice(0, 4) : [],
  );
  const [saved, setSaved] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportText, setReportText] = useState('');

  useEffect(() => {
    if (seed) return;
    let active = true;
    setProgram(undefined);
    fetchProgramBySlug(slug)
      .then((g) => {
        if (!active) return;
        setProgram(g);
        if (g) fetchSimilarPrograms(g).then((s) => active && setSimilar(s)).catch(() => undefined);
      })
      .catch(() => active && setProgram(null));
    return () => { active = false; };
  }, [slug, seed]);

  useEffect(() => {
    if (!user || !program) return;
    const token = readStoredSession()?.access_token;
    if (!token) return;
    fetch(`${SUPABASE_URL}/rest/v1/funding_saved_matches?select=id&grant_id=eq.${program.id}&limit=1`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    }).then((r) => r.ok ? r.json() : []).then((rows: unknown[]) => setSaved(rows.length > 0)).catch(() => undefined);
  }, [user, program]);

  const toggleSave = async () => {
    if (!program || !user) return;
    const token = readStoredSession()?.access_token;
    if (!token) { toast.error('Please sign in again to save programmes'); return; }
    const headers = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const res = saved
      ? await fetch(`${SUPABASE_URL}/rest/v1/funding_saved_matches?user_id=eq.${user.id}&grant_id=eq.${program.id}`, { method: 'DELETE', headers })
      : await fetch(`${SUPABASE_URL}/rest/v1/funding_saved_matches?on_conflict=user_id,grant_id`, {
          method: 'POST', headers: { ...headers, Prefer: 'resolution=merge-duplicates' },
          body: JSON.stringify({ user_id: user.id, grant_id: program.id, status: DEFAULT_SAVED_STATUS }),
        });
    if (!res.ok) { toast.error('Could not update your saved programmes'); return; }
    setSaved(!saved);
    toast.success(saved ? 'Removed from saved' : 'Saved. Find it under Saved Matches in your dashboard.');
  };

  const submitReport = async () => {
    if (!program) return;
    setReporting(true);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/funding_link_reports`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ grant_id: program.id, url: program.apply_url ?? program.source_url ?? program.application_url, message: reportText.slice(0, 500) || null }),
    }).catch(() => null);
    setReporting(false);
    if (res?.ok) { toast.success('Thank you. The programme is now in our review queue.'); setReportText(''); }
    else toast.error('Could not send the report right now. Please try again later.');
  };

  if (program === undefined) {
    return <div className="min-h-screen bg-background"><Navigation /><main className="pt-32 pb-20 px-6 text-center text-muted-foreground">Loading programme…</main></div>;
  }
  if (program === null) {
    return (
      <div className="min-h-screen bg-background">
        <MetaTags title={`Programme not found | ${SITE}`} />
        <Navigation />
        <main className="pt-32 pb-20 px-6">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h1 className="font-display text-3xl font-bold text-foreground">Programme not found</h1>
            <p className="text-muted-foreground">It may have been retired or renamed. Browse the current directory instead.</p>
            <Button asChild><Link to="/funding">Browse all funding</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const g = program;
  const intake = deriveIntake(g);
  const src = sourceLink(g);
  const verified = !!g.last_verified;
  const qualifies: string[] = [];
  if (g.identity_criteria?.length) qualifies.push(`Open to ${g.identity_criteria.map((k) => IDENTITY_LABELS[k] ?? k).join(', ')} applicants${g.identity_criteria.length < 3 ? ' only' : ''}`);
  if (g.applicant_types?.length) qualifies.push(`Applicant type: ${g.applicant_types.map((k) => APPLICANT_LABELS[k] ?? k).join(', ')}`);
  if (g.ownership_min_pct != null) qualifies.push(`At least ${g.ownership_min_pct}% Indigenous ownership`);
  if (g.entrepreneur_age_min != null || g.entrepreneur_age_max != null) qualifies.push(`Entrepreneur age ${g.entrepreneur_age_min ?? ''}${g.entrepreneur_age_min != null && g.entrepreneur_age_max != null ? ' to ' : g.entrepreneur_age_min != null ? ' or older' : 'up to '}${g.entrepreneur_age_max ?? ''}`.replace(/\s+/g, ' '));
  if (g.business_age_max_months != null) qualifies.push(`Business operating for ${g.business_age_max_months} months or less`);
  if (g.revenue_max != null) qualifies.push(`Revenue under $${g.revenue_max.toLocaleString('en-CA')}`);
  if (g.business_stages.length && g.business_stages.length < 5) qualifies.push(`Business stage: ${g.business_stages.map((s) => STAGE_LABELS[s] ?? s).join(', ')}`);
  if (g.industries.length) qualifies.push(`Sector: ${g.industries.join(', ')}`);
  qualifies.push(`Region: ${regionLabel(g)}`);

  return (
    <div className="min-h-screen bg-background">
      <MetaTags title={programPageTitle(g)} />
      <Navigation />
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs customItems={[{ name: 'Home', path: '/' }, { name: 'Funding', path: '/funding' }, { name: g.name, path: `/funding/${g.slug}` }]} />

          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary">{fundingTypeLabel(g)}</Badge>
              {g.is_repayable === true && g.funding_type !== 'loan' && <Badge variant="outline">Repayable</Badge>}
              {g.is_repayable === false && g.funding_type !== 'contribution' && g.funding_type !== 'grant' && <Badge variant="outline">Non-repayable</Badge>}
              <Badge variant="outline"><Calendar className="w-3 h-3 mr-1" aria-hidden="true" />{intake.text}</Badge>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">{g.name}</h1>
            <p className="text-lg text-muted-foreground">{g.funder}</p>
          </header>

          <div className="grid md:grid-cols-[1fr_280px] gap-8">
            <div>
              <Section title="Overview">
                <p className="text-muted-foreground leading-relaxed">{g.description}</p>
                <dl className="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
                  <div className="rounded-lg border border-border p-3"><dt className="text-muted-foreground flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" aria-hidden="true" />Amount</dt><dd className="font-medium text-foreground mt-1">{formatAmount(g)}</dd></div>
                  <div className="rounded-lg border border-border p-3"><dt className="text-muted-foreground flex items-center gap-1"><MapPin className="w-3.5 h-3.5" aria-hidden="true" />Region</dt><dd className="font-medium text-foreground mt-1">{regionLabel(g)}</dd></div>
                  <div className="rounded-lg border border-border p-3"><dt className="text-muted-foreground">Type of money</dt><dd className="font-medium text-foreground mt-1">{fundingTypeLabel(g)}</dd></div>
                  <div className="rounded-lg border border-border p-3"><dt className="text-muted-foreground">Intake</dt><dd className="font-medium text-foreground mt-1">{intake.text}</dd></div>
                </dl>
                {g.program_category.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-3">Purpose: {g.program_category.map((c) => CATEGORY_LABELS[c] ?? c).join(', ')}</p>
                )}
              </Section>

              <Section title="Who may qualify">
                {g.eligibility_notes && <p className="text-muted-foreground leading-relaxed mb-3">{g.eligibility_notes}</p>}
                <List items={qualifies} />
                <p className="text-xs text-muted-foreground mt-3">These are the rules as published by the funder. Only the funder decides eligibility.</p>
              </Section>

              {g.eligibility_exclusions && (
                <Section title="Who does not qualify">
                  <p className="text-muted-foreground leading-relaxed">{g.eligibility_exclusions}</p>
                </Section>
              )}

              <Section title="Amount and terms">
                <List items={[
                  `Amount: ${formatAmount(g)}${g.amount_currency && g.amount_currency !== 'CAD' ? ` (${g.amount_currency})` : ''}`,
                  g.is_repayable === true ? 'Repayable' : g.is_repayable === false ? 'Non-repayable' : 'Repayability depends on the stream; confirm with the funder',
                  ...(g.repayment_terms ? [g.repayment_terms] : []),
                  g.matching_funds_required === true ? `Matching funds or own equity required${g.matching_funds_notes ? `: ${g.matching_funds_notes}` : ''}` : g.matching_funds_notes ? g.matching_funds_notes : 'Matching-funds requirement not stated by the funder',
                ]} />
              </Section>

              {g.eligible_expenses.length > 0 && <Section title="Eligible expenses"><List items={g.eligible_expenses} /></Section>}

              <Section title="How to apply">
                {g.application_steps.length > 0 ? (
                  <ol className="list-decimal pl-6 space-y-1 text-muted-foreground leading-relaxed">{g.application_steps.map((s) => <li key={s}>{s}</li>)}</ol>
                ) : (
                  <p className="text-muted-foreground">Application steps are on the funder&apos;s page. Use the official link on this page.</p>
                )}
              </Section>

              {g.documents_required.length > 0 && (
                <Section title="Documents usually required">
                  <List items={g.documents_required} />
                  {user && <p className="text-sm mt-3"><Link to="/dashboard/documents" className="underline text-primary">Keep these in your document library</Link> so they are ready for every application.</p>}
                </Section>
              )}

              <Section title="Deadline information">
                <p className="text-muted-foreground">{intake.text}{g.recurrence_notes && g.recurrence_notes !== intake.text ? ` · ${g.recurrence_notes}` : ''}{g.opens_at ? ` · Opened ${fmtDate(g.opens_at)}` : ''}</p>
                {g.intake_status === 'closed' && <p className="text-sm text-muted-foreground mt-2">This intake is closed. The record stays so a reopening is announced here and in the weekly alert.</p>}
              </Section>

              <Section title="Source and verification">
                <div className={`flex items-start gap-2 text-sm ${verified ? 'text-foreground' : 'text-amber-700 dark:text-amber-500'}`}>
                  {verified ? <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> : <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />}
                  <p>
                    {verified ? `Details last read from the funder's page on ${fmtDate(g.last_verified as string)}` : 'Details not yet verified against the funder’s page'}
                    {g.source_published_date ? ` · funder page dated ${fmtDate(g.source_published_date)}` : ''}
                    {g.verification_status === 'needs_review' ? ' · an automated check flagged a link on this record; a person is reviewing it' : ''}
                  </p>
                </div>
                {src && <p className="text-sm mt-2">Official source: <a href={src.url} target="_blank" rel="noopener noreferrer nofollow" className="underline break-all">{src.url}</a></p>}
                {g.source_evidence.length > 0 && (
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer text-primary">What the funder&apos;s page says (quoted)</summary>
                    <ul className="mt-2 space-y-2">
                      {g.source_evidence.map((e, i) => (
                        <li key={i} className="border-l-2 border-border pl-3 text-muted-foreground">
                          <span className="text-xs uppercase tracking-wide">{e.field.replace(/_/g, ' ')}</span>
                          <blockquote className="italic">&ldquo;{e.quote}&rdquo;</blockquote>
                          <span className="text-xs">Read {fmtDate(e.fetched_at)}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </Section>

              <Section title="Report a problem">
                <p className="text-sm text-muted-foreground mb-2">Broken link, wrong amount, programme closed? Tell us and the record goes into our review queue. No account needed.</p>
                <Textarea value={reportText} onChange={(e) => setReportText(e.target.value.slice(0, 500))} placeholder="What is wrong? (optional)" rows={2} className="max-w-lg" />
                <Button variant="outline" size="sm" className="mt-2" onClick={submitReport} disabled={reporting}>
                  <Flag className="w-3.5 h-3.5 mr-2" aria-hidden="true" />Send report
                </Button>
              </Section>
            </div>

            <aside className="md:sticky md:top-24 self-start space-y-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Go to the funder</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <OfficialLinkButton program={g} variant="default" size="default" withDescription />
                  {user ? (
                    <Button variant="outline" className="w-full" onClick={toggleSave}>
                      {saved ? <BookmarkCheck className="w-4 h-4 mr-2" aria-hidden="true" /> : <Bookmark className="w-4 h-4 mr-2" aria-hidden="true" />}
                      {saved ? 'Saved' : 'Save programme'}
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/auth?next=/funding/${g.slug}`}><Bookmark className="w-4 h-4 mr-2" aria-hidden="true" />Sign in to save</Link>
                    </Button>
                  )}
                  {user && (
                    <Button asChild variant="ghost" className="w-full">
                      <Link to="/dashboard/funding/matches">Check my fit</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
              <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" aria-hidden="true" />
                <p>Indigenous Rising AI is independent of this funder and of any government. We do not take or forward applications. Confirm current terms on the official page.</p>
              </div>
              {g.documents_required.length > 0 && user && (
                <Button asChild variant="outline" className="w-full">
                  <Link to="/dashboard/plan"><FileText className="w-4 h-4 mr-2" aria-hidden="true" />Prepare with the plan builder</Link>
                </Button>
              )}
            </aside>
          </div>

          {similar.length > 0 && (
            <section className="mt-12" aria-labelledby="similar-heading">
              <h2 id="similar-heading" className="font-display text-2xl font-semibold text-foreground mb-4">Similar programmes</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {similar.map((s) => <FundingProgramCard key={s.id} program={s} />)}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
