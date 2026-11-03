import { Link } from 'react-router-dom';
import { ResourcePage, RELATED } from '@/components/resources/ResourcePage';
import {
  APPLICANT_LABELS, CHANGES_CHECKED, KIND_LABELS, SITE_CORRECTIONS, sortedChanges,
} from '@/data/fundingChanges';

const ROUTE = '/guides/funding-program-changes';

// '2026-11-03' -> '3 November 2026'; '2026-06' -> 'June 2026'. Built from parts
// so a bare ISO date does not render as the previous day in Canada.
const fmt = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d || 1);
  return d
    ? date.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
    : date.toLocaleDateString('en-CA', { year: 'numeric', month: 'long' });
};

/**
 * A dated log of programme changes, each linked to the funder page it was read
 * from, plus corrections to this site's own pages.
 */
export default function FundingChanges() {
  const changes = sortedChanges();
  return (
    <ResourcePage
      route={ROUTE}
      crumb="Funding programme changes"
      heading="Indigenous business funding updates and intake changes"
      intro={
        <>
          <p>
            Programmes open, close, change their terms and get renamed. This log records the changes we have
            seen on funders&apos; own pages, with the date and a link to the page, so you can tell whether
            something you read elsewhere is still current.
          </p>
          <p>
            Last updated {fmt(CHANGES_CHECKED)}. Where a funder states when a change took effect, that is the
            date shown; otherwise it is the day we saw it. Always confirm current terms with the funder before
            you apply.
          </p>
        </>
      }
      related={[RELATED.directory, RELATED.choosing, RELATED.lenders, RELATED.equity]}
    >
      <ol className="space-y-4 mb-12" aria-label="Programme changes, newest first">
        {changes.map((c) => (
          <li key={`${c.date}-${c.programme}`} className="rounded-xl border border-border p-5">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <time dateTime={c.date} className="font-semibold text-foreground">{fmt(c.date)}</time>
              <span className="text-muted-foreground">{c.dateKind === 'observed' ? '(seen on the funder’s page)' : '(effective date)'}</span>
              <span className="rounded-full border border-border px-2 py-0.5 text-xs">{KIND_LABELS[c.kind]}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{APPLICANT_LABELS[c.applicant]}</span>
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground mt-2">{c.programme}</h2>
            <p className="text-sm text-muted-foreground">{c.funder} · {c.region}</p>
            <p className="text-muted-foreground leading-relaxed mt-2">{c.what}</p>
            <a href={c.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center min-h-[44px] text-primary font-medium">
              Read the funder&apos;s page
            </a>
          </li>
        ))}
      </ol>

      <section className="mb-12" aria-labelledby="corrections-heading">
        <h2 id="corrections-heading" className="font-display text-2xl font-bold text-foreground mb-3">Corrections to our own pages</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          When a re-check shows we had something wrong, we fix the page and record it here.
        </p>
        <ul className="space-y-3">
          {SITE_CORRECTIONS.map((c) => (
            <li key={c.what} className="rounded-lg border border-border p-4 text-muted-foreground leading-relaxed">
              <time dateTime={c.date} className="font-semibold text-foreground">{fmt(c.date)}</time>{' '}
              <Link to={c.page} className="text-primary underline underline-offset-2">{c.page}</Link>
              <p className="mt-1">{c.what}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border p-6 bg-muted/30 text-muted-foreground leading-relaxed" aria-labelledby="report-heading">
        <h2 id="report-heading" className="font-display text-xl font-bold text-foreground mb-2">Seen a change we have not?</h2>
        <p>
          Every programme page in the <Link to="/funding" className="text-primary font-medium">funding directory</Link>{' '}
          has a &ldquo;Report a problem&rdquo; form, and you can also{' '}
          <Link to="/contact" className="text-primary font-medium">contact us</Link>. We check the funder&apos;s own
          page before adding anything here.
        </p>
      </section>
    </ResourcePage>
  );
}
