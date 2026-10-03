import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import MetaTags from '../components/MetaTags';
import Breadcrumbs from '../components/Breadcrumbs';
import { ROUTE_TITLES } from '@/data/routeTitles';
import {
  FUNDING_STATS as S,
  UNVERIFIED_REASONS,
  VERIFICATION_FINDINGS,
} from '@/data/fundingStats';

/**
 * Indigenous business funding statistics.
 *
 * The useful thing here is not the size of the directory — 17 programmes is
 * small, and aggregators carry far more. It is that every programme has a
 * verification status and a date, and that the ones we could NOT verify are
 * published alongside the ones we could, with reasons.
 *
 * Nothing on this page is extrapolated. There is no "total funding available
 * in Canada" figure, because we would have to invent it.
 */
const money = (n: number) => '$' + n.toLocaleString('en-CA');

const FundingStatistics = () => (
  <div className="min-h-screen bg-background">
    <MetaTags
      title={ROUTE_TITLES['/guides/indigenous-business-funding-statistics']}
      description="What we can and cannot verify about Indigenous business funding programs in Canada, with a per-programme verification date, the reasons some could not be checked, and our method."
    />
    <Navigation />
    <main className="pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs />

        <header className="mb-10">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Indigenous business funding: what we can verify
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Figures from our own funding directory, checked programme by programme against each
            funder&rsquo;s website on {S.asOfLabel}. The programmes we could <em>not</em> verify are
            published here too, with the reason for each.
          </p>
        </header>

        <section className="mb-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              [S.total, 'programmes published'],
              [S.verified, 'verified against the funder'],
              [S.unverified, 'could not be verified'],
              [S.withDeadline, 'with a fixed deadline'],
            ].map(([n, label]) => (
              <div key={String(label)} className="rounded-2xl border border-border p-5">
                <div className="font-display text-4xl font-bold text-primary">{n}</div>
                <div className="text-sm text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Across {S.funders} funding organisations. Figures as of {S.asOfLabel}.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            Every programme in the directory is rolling intake
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            All {S.rolling} of them. Not one has a fixed application deadline. This is the single
            most practically useful fact we hold, and it is the opposite of how most funding advice
            is written &mdash; there is no closing date to race, which removes the pressure and also
            removes the prompt. If you are waiting for a deadline to force the decision, it is not
            coming. The first phone call is the only deadline in this system, and you set it.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            Only {S.statesAmount} of {S.total} publish an amount
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl mb-4">
            Where a programme states a maximum, it ranges from {money(S.lowestCeiling)} to{' '}
            {money(S.highestCeiling)} &mdash; the top of that range being loan guarantees for
            Nation-scale investment rather than anything a single entrepreneur would apply for. The
            other {S.total - S.statesAmount} publish no figure at all.
          </p>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            That is worth knowing before you plan. Most Indigenous lending is priced per file, so a
            published ceiling is the exception. Ask the institution what a realistic range looks
            like for a business at your stage, rather than building a number from a guide.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            What we could not verify, and why
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl mb-5">
            {S.unverified} of {S.total} programmes could not be confirmed against the funder on{' '}
            {S.asOfLabel}. We publish that rather than hiding it, because a directory that looks
            complete is not the same as one that is current.
          </p>
          <ul className="space-y-4">
            {UNVERIFIED_REASONS.map((r) => (
              <li key={r.reason} className="border-t border-border pt-4">
                <h3 className="font-semibold text-foreground">
                  {r.reason} &mdash; {r.count}
                </h3>
                <p className="text-muted-foreground mt-1">{r.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            What the check found
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl mb-4">
            Checking a directory against its sources finds errors. These are ours, corrected on{' '}
            {S.asOfLabel}:
          </p>
          <ul className="space-y-3">
            {VERIFICATION_FINDINGS.map((f) => (
              <li key={f} className="text-muted-foreground leading-relaxed">
                &bull; {f}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12 rounded-2xl border border-border p-6 bg-muted/30">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">Method</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>Each programme is opened on the funder&rsquo;s own website and its terms read.</li>
            <li>
              An amount is recorded only where the funder publishes one. We do not estimate, and we
              do not carry a figure across from a similar programme.
            </li>
            <li>
              A site that blocks automated requests is recorded as unverified, not as dead. The two
              are different, and treating them the same would misrepresent live programmes.
            </li>
            <li>Each programme carries the date it was last checked, shown on its card.</li>
            <li>
              These figures describe our directory, not Canadian Indigenous funding as a whole. We
              publish no national total, because we would have to invent it.
            </li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Figures are re-checked periodically and this page is dated. Confirm current terms with
            the funder before applying &mdash; nothing here is an eligibility decision.
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/funding"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Browse the programmes <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/guides/indigenous-business-grants"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border-2 border-border font-semibold hover:bg-muted/50 transition-colors"
          >
            Funding guides
          </Link>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default FundingStatistics;
