import { Link } from 'react-router-dom';
import { ResourcePage, RELATED } from '@/components/resources/ResourcePage';
import { FUNDING_PATHS, FUNDING_PATHS_CHECKED, PATH_DETAILS, INDIGENOUS_BUSINESS_NAVIGATOR } from '@/data/fundingPaths';

const ROUTE = '/guides/choosing-funding-business-or-community';

const fmtDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

/**
 * A decision guide: who is applying decides which programme family fits.
 * Quotes come from each programme's own page, and eligibility is left to the
 * funder.
 */
export default function ChoosingFunding() {
  return (
    <ResourcePage
      route={ROUTE}
      crumb="Business or community funding"
      heading="Funding for your own business, or for a community enterprise?"
      intro={
        <>
          <p>
            The first question a funder asks is who is applying. Funding for an entrepreneur and funding for a
            First Nation or Inuit community&apos;s own projects come from different programmes, with different
            applicants, contributions and routes in. Start from who you are and what the project is, then go to
            the programme family that fits.
          </p>
          <p>
            Quotes below are from each programme&apos;s own Indigenous Services Canada page, read on{' '}
            {fmtDate(FUNDING_PATHS_CHECKED)}. They describe the programme, not whether you qualify, which only the
            funder can decide.
          </p>
        </>
      }
      related={[RELATED.lenders, RELATED.equity, RELATED.directory, RELATED.budgetTemplate]}
    >
      <ol className="space-y-5 mb-12">
        {FUNDING_PATHS.map((p, i) => (
          <li key={p.id} className="rounded-xl border border-border p-5">
            <h2 className="font-display text-xl font-semibold text-foreground">{i + 1}. {p.applicant}</h2>
            <p className="text-muted-foreground mt-1"><strong className="text-foreground">Project:</strong> {p.project}</p>
            <p className="text-muted-foreground mt-1"><strong className="text-foreground">Programme family:</strong> {p.programme}</p>
            <blockquote className="mt-3 border-l-4 border-primary/40 pl-4 text-muted-foreground italic">
              &ldquo;{p.quote}&rdquo;{' '}
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="not-italic text-primary font-medium">Source</a>
            </blockquote>
            <Link to={p.next.to} className="inline-flex items-center min-h-[44px] text-primary font-medium mt-2">{p.next.label}</Link>
          </li>
        ))}
      </ol>

      <section className="space-y-4 text-muted-foreground leading-relaxed mb-12" aria-labelledby="differ-heading">
        <h2 id="differ-heading" className="font-display text-2xl font-bold text-foreground">How the two routes differ</h2>
        <p>
          <strong className="text-foreground">Entrepreneurs</strong> go through the Indigenous Financial
          Institution or Métis Capital Corporation that serves them. For the Access to Capital stream, the
          programme page says &ldquo;{PATH_DETAILS.aepNoDeadline}&rdquo; Each institution sets its own
          eligibility, and its own equity rules, which the{' '}
          <Link to={RELATED.equity.to} className="text-primary font-medium">owner equity guide</Link> quotes for
          several lenders.
        </p>
        <p>
          <strong className="text-foreground">Communities</strong> apply to Indigenous Services Canada with a
          proposal. For the Community Opportunity Readiness Program, the guidelines say{' '}
          &ldquo;{PATH_DETAILS.corpContribution}&rdquo;, and &ldquo;{PATH_DETAILS.corpStatementOfIntent}&rdquo;
          That makes a short statement of intent a sensible first step before a full application.
        </p>
        <p>
          <strong className="text-foreground">Support organizations</strong> funded through the Access to
          Business Opportunities stream run projects for many entrepreneurs, not their own commercial venture.
          The programme page says funding &ldquo;{PATH_DETAILS.aboNonCommercial}&rdquo;.
        </p>
      </section>

      <section className="rounded-2xl border border-border p-6 bg-muted/30 space-y-3 text-muted-foreground leading-relaxed" aria-labelledby="metis-heading">
        <h2 id="metis-heading" className="font-display text-2xl font-bold text-foreground">If you are Métis, or not sure where you fit</h2>
        <p>
          The two community programmes above name First Nation and Inuit communities as applicants. Métis
          entrepreneurs reach the Access to Capital stream through Métis Capital Corporations, listed by province
          in the <Link to={RELATED.lenders.to} className="text-primary font-medium">lender directory</Link>. Métis
          governments and organizations should ask Indigenous Services Canada and their own Métis institutions which
          programmes apply to them.
        </p>
        <p>
          If the project mixes both, such as a community-owned business run by an entrepreneur, ask both the
          institution and Indigenous Services Canada before you write anything. The federal{' '}
          <a href={INDIGENOUS_BUSINESS_NAVIGATOR} target="_blank" rel="noopener noreferrer" className="text-primary font-medium">Indigenous Business Navigator</a>{' '}
          service connects businesses and communities with the federal programmes that may fit.
        </p>
      </section>
    </ResourcePage>
  );
}
