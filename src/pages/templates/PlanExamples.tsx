import { Link } from 'react-router-dom';
import { ResourcePage, RELATED } from '@/components/resources/ResourcePage';
import { PLAN_TEMPLATE } from '@/data/planTemplate';
import { PLAN_EXAMPLES, EXAMPLES_NOTE, exampleTotal } from '@/data/planExamples';
import { formatCad } from '@/lib/loan-math';

const ROUTE = '/templates/indigenous-business-plan-examples';

/**
 * Three fictional plans in the same six sections, so the reader sees what
 * changes with the kind of business: when money comes in, what costs most,
 * what can go wrong, and what the community impact section commits to.
 */
export default function PlanExamples() {
  return (
    <ResourcePage
      route={ROUTE}
      crumb="Business plan examples"
      heading="Indigenous business plan examples by business type"
      wide
      intro={
        <>
          <p>
            Three example plans, for a services business, a tourism business and a retail store, each written in
            the same six sections as the{' '}
            <Link to={RELATED.planTemplate.to} className="text-primary font-medium">free business plan template</Link>{' '}
            and the plan builder. Read them side by side to see how the same questions get different answers.
          </p>
          <p className="font-medium text-foreground">{EXAMPLES_NOTE}</p>
        </>
      }
      related={[RELATED.planTemplate, RELATED.onePage, RELATED.cashFlow, RELATED.impact]}
    >
      <section className="mb-12" aria-labelledby="compare-heading">
        <h2 id="compare-heading" className="font-display text-2xl font-bold text-foreground mb-4">What changes with the kind of business</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th scope="col" className="p-3 font-semibold text-foreground">&nbsp;</th>
                {PLAN_EXAMPLES.map((e) => (
                  <th key={e.id} scope="col" className="p-3 font-semibold text-foreground">{e.type}: {e.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-muted-foreground">
              {([
                ['When money comes in', 'revenue'],
                ['What costs most', 'biggestCost'],
                ['Main risk the plan must answer', 'mainRisk'],
                ['Community impact choice', 'impactChoice'],
              ] as const).map(([label, key]) => (
                <tr key={key}>
                  <th scope="row" className="p-3 text-left font-semibold text-foreground align-top">{label}</th>
                  {PLAN_EXAMPLES.map((e) => <td key={e.id} className="p-3 align-top">{e.differs[key]}</td>)}
                </tr>
              ))}
              <tr>
                <th scope="row" className="p-3 text-left font-semibold text-foreground align-top">Start-up cost</th>
                {PLAN_EXAMPLES.map((e) => <td key={e.id} className="p-3 align-top">{formatCad(e.startupTotal)}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {PLAN_EXAMPLES.map((e) => (
        <section key={e.id} id={e.id} className="mb-12 rounded-2xl border-2 border-border p-6" aria-labelledby={`${e.id}-heading`}>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{e.type} example</p>
          <h2 id={`${e.id}-heading`} className="font-display text-2xl font-bold text-foreground mt-1">{e.name} (fictional)</h2>
          <p className="text-muted-foreground mt-2 mb-6">{e.summary}</p>
          <dl className="space-y-5">
            {PLAN_TEMPLATE.map((s, i) => (
              <div key={s.id}>
                <dt className="font-semibold text-foreground">{i + 1}. {s.title}</dt>
                <dd className="text-muted-foreground leading-relaxed mt-1">{e.sections[s.id]}</dd>
              </div>
            ))}
          </dl>
          <h3 className="font-semibold text-foreground mt-6 mb-2">Where the start-up money comes from</h3>
          <ul className="text-muted-foreground space-y-1">
            {e.funding.map((f) => (
              <li key={f.source}>{f.source}: {formatCad(f.amount)} <span className="text-sm">({f.status})</span></li>
            ))}
            <li className="font-semibold text-foreground">Total: {formatCad(exampleTotal(e))}</li>
          </ul>
        </section>
      ))}

      <section className="space-y-4 text-muted-foreground leading-relaxed" aria-labelledby="use-heading">
        <h2 id="use-heading" className="font-display text-2xl font-bold text-foreground">How to use these examples</h2>
        <p>
          Copy the structure, not the answers. A funder reads a plan to see whether you understand your own
          customers, costs and risks, and an answer borrowed from an example shows. Each example separates what is
          already true, such as conversations held and quotes received, from what is planned, and yours should too.
        </p>
        <p>
          The funding mixes above are illustrations. Whether a contribution, a loan or your own assets count toward a
          project is set by each funder, so check the{' '}
          <Link to={RELATED.equity.to} className="text-primary font-medium">owner equity guide</Link> and ask the
          institution that serves you. When you are ready, write your own plan in the{' '}
          <Link to="/plan" className="text-primary font-medium">free plan builder</Link>, which uses the same six sections.
        </p>
      </section>
    </ResourcePage>
  );
}
