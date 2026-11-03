import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { ResourcePage, RELATED } from '@/components/resources/ResourcePage';
import { LENDER_EQUITY_RULES, LENDER_EQUITY_CHECKED } from '@/data/lenderEquity';
import { fmtDate } from '@/lib/funding-catalog';

const ROUTE = '/guides/indigenous-funding-equity-requirements';

// Made-up numbers that show the arithmetic only. They are labelled as such on
// the page and deliberately round, so no one mistakes them for a programme's
// published ratio. Real ratios come from each funder.
const EXAMPLE = { cost: 100_000, owner: 10_000, contribution: 30_000 };
const loan = EXAMPLE.cost - EXAMPLE.owner - EXAMPLE.contribution;
const cad = (n: number) => `$${n.toLocaleString('en-CA')}`;

/**
 * Owner equity and matching funds, explained without asserting any lender's
 * ratio. The plan this page comes from asks for lender-specific examples only
 * after human review, so until then the page teaches the terms and the
 * arithmetic and sends people to each funder for its own rule.
 */
export default function EquityRequirements() {
  return (
    <ResourcePage
      route={ROUTE}
      crumb="Owner equity and matching funds"
      heading="Owner equity and matching funds for Indigenous business funding"
      intro={
        <>
          <p>
            Many Indigenous business programmes expect the owner to put some of their own money into the
            project, and many pair a non-repayable contribution with a loan. This guide explains the terms
            funders use, how the pieces add up to the total project cost, and what to ask before you spend
            anything.
          </p>
          <p>
            Every funder sets its own rules. Nothing here is one lender&apos;s requirement applied to all of
            them, and nothing here promises funding.
          </p>
        </>
      }
      related={[RELATED.budget, RELATED.budgetTemplate, RELATED.lenders, RELATED.gaps]}
    >
      <section className="mb-12" aria-labelledby="terms-heading">
        <h2 id="terms-heading" className="font-display text-2xl font-bold text-foreground mb-4">The four terms</h2>
        <dl className="space-y-5">
          <div>
            <dt className="font-semibold text-foreground">Eligible project cost</dt>
            <dd className="text-muted-foreground leading-relaxed mt-1">The costs a funder agrees to count toward the project, such as equipment, renovation or working capital. A cost you consider part of the project may not be eligible, and some funders only count costs incurred after they approve the application.</dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">Owner equity</dt>
            <dd className="text-muted-foreground leading-relaxed mt-1">Your own contribution: usually cash, sometimes assets you already own and put into the business. Lenders look at it as a sign that you share the risk. Whether in-kind or borrowed money counts as equity is a question for each funder.</dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">Non-repayable contribution</dt>
            <dd className="text-muted-foreground leading-relaxed mt-1">Money you do not pay back if you meet the agreement&apos;s conditions. It is often a share of eligible costs, often capped, and often conditional on a loan or owner equity covering the rest. Some programmes call it a grant, some a contribution.</dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">Funding gap</dt>
            <dd className="text-muted-foreground leading-relaxed mt-1">What is left after your equity and any confirmed money. It is usually the part a loan is asked to cover, and the number your application has to justify.</dd>
          </div>
        </dl>
      </section>

      <section className="mb-12 rounded-2xl border-2 border-border p-6" aria-labelledby="example-heading">
        <h2 id="example-heading" className="font-display text-2xl font-bold text-foreground mb-2">How the pieces add up</h2>
        <p className="text-sm font-medium text-muted-foreground mb-4">Illustrative arithmetic only. These numbers are made up and are not any programme&apos;s published ratio.</p>
        <table className="w-full text-sm mb-4">
          <tbody>
            <tr className="border-b border-border"><th scope="row" className="text-left py-2 font-medium text-foreground">Eligible project cost</th><td className="py-2 text-right">{cad(EXAMPLE.cost)}</td></tr>
            <tr className="border-b border-border"><th scope="row" className="text-left py-2 font-medium text-foreground">Owner equity (cash)</th><td className="py-2 text-right">{cad(EXAMPLE.owner)}</td></tr>
            <tr className="border-b border-border"><th scope="row" className="text-left py-2 font-medium text-foreground">Non-repayable contribution</th><td className="py-2 text-right">{cad(EXAMPLE.contribution)}</td></tr>
            <tr><th scope="row" className="text-left py-2 font-semibold text-foreground">Loan needed to close the gap</th><td className="py-2 text-right font-semibold">{cad(loan)}</td></tr>
          </tbody>
        </table>
        <p className="text-muted-foreground leading-relaxed">
          If the funder&apos;s rule were different, for example a larger owner share or a lower cap on the
          contribution, the loan line would change. That is why you work the numbers out with the real rule
          from the funder, not from an example. Try your own figures in the{' '}
          <Link to={RELATED.budget.to} className="text-primary font-medium">funding gap calculator</Link>.
        </p>
      </section>

      <section className="mb-12" aria-labelledby="published-heading">
        <h2 id="published-heading" className="font-display text-2xl font-bold text-foreground mb-2">What some lenders actually publish</h2>
        <p className="text-sm text-muted-foreground mb-4">Read from each lender&apos;s own page on {fmtDate(LENDER_EQUITY_CHECKED)}.</p>
        <ul className="space-y-4">
          {LENDER_EQUITY_RULES.map((r) => (
            <li key={r.lender} className="rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground">{r.lender} <span className="font-normal text-muted-foreground">({r.region})</span></h3>
              <p className="text-muted-foreground leading-relaxed mt-1">{r.summary}</p>
              <blockquote className="mt-2 border-l-2 border-primary/40 pl-3 text-sm italic text-muted-foreground">&ldquo;{r.quote}&rdquo;</blockquote>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 min-h-[44px] text-sm font-medium text-primary">
                Read the lender&apos;s page <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          These are each lender&apos;s own rules on the date shown. Other lenders set different ones, so confirm
          with the institution that serves you.
        </p>
      </section>

      <section className="mb-12 space-y-4 text-muted-foreground leading-relaxed" aria-labelledby="timing-heading">
        <h2 id="timing-heading" className="font-display text-2xl font-bold text-foreground">Spending before approval</h2>
        <p>
          A common and costly mistake is buying equipment or signing a lease before the funder approves the
          application, then finding the cost cannot be counted. Some programmes only reimburse costs incurred
          after an agreement is signed. If you must commit early, ask the funder in writing whether that cost
          can still be included.
        </p>
      </section>

      <section className="mb-12 space-y-4 text-muted-foreground leading-relaxed" aria-labelledby="ask-heading">
        <h2 id="ask-heading" className="font-display text-2xl font-bold text-foreground">Questions to ask the funder</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>What share of the project must be my own money, and does that have to be cash?</li>
          <li>Which of my costs are eligible, and from what date?</li>
          <li>Is the contribution paired with a loan, and must both be approved together?</li>
          <li>Is there a cap on the contribution, and is it per person, per business or per project?</li>
          <li>Can money from another programme count toward my share?</li>
          <li>What proof of equity do you need, such as bank statements?</li>
        </ol>
      </section>

      <section className="space-y-4 text-muted-foreground leading-relaxed" aria-labelledby="where-heading">
        <h2 id="where-heading" className="font-display text-2xl font-bold text-foreground">Where to get the real numbers</h2>
        <p>
          The Aboriginal Entrepreneurship Program is delivered through Indigenous Financial Institutions, so the
          institution that serves your area is usually the right first call. Use the{' '}
          <Link to={RELATED.lenders.to} className="text-primary font-medium">lender directory</Link> to find it, and see the{' '}
          <Link to="/funding/aboriginal-entrepreneurship-program" className="text-primary font-medium">Aboriginal Entrepreneurship Program page</Link>{' '}
          for what Indigenous Services Canada publishes about it. For loans, the{' '}
          <Link to={RELATED.loans.to} className="text-primary font-medium">loans page</Link> shows each lender&apos;s published amounts and the date
          we last checked them.
        </p>
      </section>
    </ResourcePage>
  );
}
