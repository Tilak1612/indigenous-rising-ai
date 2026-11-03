import { Link } from 'react-router-dom';
import { ResourcePage, RELATED } from '@/components/resources/ResourcePage';

const ROUTE = '/guides/indigenous-funding-application-mistakes';

// The gaps a funder's checklist exists to catch. No rejection rates: none are
// published in a form we can cite, so the page states none.
const GAPS: { title: string; why: string; fix: string; link?: { to: string; label: string } }[] = [
  {
    title: 'The plan does not answer the funder’s questions',
    why: 'A plan written for yourself often skips what a lender reads first: who the customers are, why they will pay, and how the loan gets repaid.',
    fix: 'Use the six sections funders ask for, and answer each prompt plainly before adding anything else.',
    link: { to: RELATED.planTemplate.to, label: 'Business plan template' },
  },
  {
    title: 'Costs are guesses, not quotes',
    why: 'Equipment, renovation and vehicle costs without written quotes are hard for a funder to approve, and estimates tend to run low.',
    fix: 'Get quotes for the large one-time costs and mark which lines are still estimates.',
    link: { to: RELATED.budgetTemplate.to, label: 'Funding application budget template' },
  },
  {
    title: 'The money was spent before approval',
    why: 'Some programmes only count costs incurred after an agreement is signed.',
    fix: 'Ask the funder in writing before you buy, lease or hire with money you expect them to cover.',
    link: { to: RELATED.equity.to, label: 'Owner equity and matching funds' },
  },
  {
    title: 'The application went to a lender that does not serve the area',
    why: 'Most Indigenous Financial Institutions serve a defined territory. An application outside it is usually redirected, which costs weeks.',
    fix: 'Confirm the service area with the institution before preparing anything.',
    link: { to: RELATED.lenders.to, label: 'Indigenous lender directory' },
  },
  {
    title: 'The owner’s own contribution is missing or unclear',
    why: 'Many programmes expect some owner equity and ask for proof of it.',
    fix: 'Show where your share comes from, such as savings or assets, and keep the statements ready.',
  },
  {
    title: 'There is no cash flow forecast',
    why: 'A profit estimate for the year does not show whether the business can make each month’s payments.',
    fix: 'Build a 12-month forecast that includes the loan payment and the slow months.',
    link: { to: RELATED.cashFlow.to, label: 'Cash flow forecast template' },
  },
  {
    title: 'The budget and the plan tell different stories',
    why: 'If the plan describes two staff and the budget pays for four, the reviewer has to guess which is true.',
    fix: 'Check every number in the plan against the budget before you submit.',
  },
  {
    title: 'The intake was closed or the deadline had passed',
    why: 'Some programmes open for a window each year and others take applications all year. A closed intake is not a rejection, but it is a delay.',
    fix: 'Check the programme page for its current intake and confirm it with the funder.',
    link: { to: RELATED.directory.to, label: 'Funding directory' },
  },
];

/**
 * Common application gaps, written as things to check rather than reasons
 * people fail. Neutral, no invented rejection statistics, and every fix points
 * at a published funder requirement or a preparation tool on this site.
 */
export default function ApplicationGaps() {
  return (
    <ResourcePage
      route={ROUTE}
      crumb="Common application gaps"
      heading="Common gaps in Indigenous business funding applications"
      intro={
        <>
          <p>
            Most delays in a funding application come from something missing, not something wrong with the
            idea. Below are the gaps that funders&apos; own checklists are built to catch, why each one matters,
            and what to do about it before you apply.
          </p>
          <p>
            This is a preparation checklist, not a list of reasons any lender gives. Each funder publishes its
            own requirements, and the institution that serves you is the best judge of what your application
            needs.
          </p>
        </>
      }
      related={[RELATED.planTemplate, RELATED.budget, RELATED.cashFlow, RELATED.lenders]}
    >
      <ol className="space-y-5 mb-12">
        {GAPS.map((g, i) => (
          <li key={g.title} className="rounded-xl border border-border p-5">
            <h2 className="font-display text-xl font-semibold text-foreground">{i + 1}. {g.title}</h2>
            <p className="text-muted-foreground leading-relaxed mt-2"><strong className="text-foreground">Why it matters:</strong> {g.why}</p>
            <p className="text-muted-foreground leading-relaxed mt-2"><strong className="text-foreground">What to do:</strong> {g.fix}</p>
            {g.link && <Link to={g.link.to} className="inline-flex items-center min-h-[44px] text-primary font-medium mt-1">{g.link.label}</Link>}
          </li>
        ))}
      </ol>

      <section className="space-y-4 text-muted-foreground leading-relaxed" aria-labelledby="order-heading">
        <h2 id="order-heading" className="font-display text-2xl font-bold text-foreground">A sensible order</h2>
        <p>
          Contact the institution first, then write the plan, then build the budget and cash flow from the
          plan, then gather quotes and proof of your contribution. Applying in that order means each document
          is built on the one before it, and the funder can tell you early if something is out of scope. The{' '}
          <Link to="/blog/indigenous-business-funding-checklist" className="text-primary font-medium">funding checklist article</Link>{' '}
          lists the documents most applications ask for, and{' '}
          <Link to="/guides/funding-document-checklist-by-lender" className="text-primary font-medium">what different lenders ask for</Link>{' '}
          compares ten lenders&apos; own lists.
        </p>
        <p>
          If an application is declined, ask the funder what would change their answer. It is the quickest
          way to learn which gap to close before you apply again.
        </p>
      </section>
    </ResourcePage>
  );
}
