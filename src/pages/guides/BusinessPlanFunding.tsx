import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { ResourcePage, RELATED } from '@/components/resources/ResourcePage';
import { PROVINCES, fmtDate } from '@/lib/funding-catalog';
import { PLAN_SUPPORT, PLAN_HELP_ONLY, PLAN_SUPPORT_CHECKED } from '@/data/businessPlanFunding';

const ROUTE = '/guides/business-plan-funding';
const nameOf = (code: string) => PROVINCES.find((p) => p.code === code)?.name ?? code;

/**
 * Can funding pay for an Indigenous business plan? Answered only from what
 * named institutions publish, with the date read. The 75 percent figure that
 * circulates comes from two specific programmes with their own conditions,
 * and the page says it is not a general rule.
 */
export default function BusinessPlanFunding() {
  return (
    <ResourcePage
      route={ROUTE}
      crumb="Funding for a business plan"
      heading="Can funding help pay for an Indigenous business plan?"
      wide
      intro={
        <>
          <p>
            Sometimes. Several Indigenous Financial Institutions and Métis capital corporations publish support
            toward the cost of a professional business plan. Each sets its own share, cap and conditions, and
            some only offer it as part of a loan application. Others help you write the plan but do not say
            they pay for it.
          </p>
          <p>
            Below is what each institution publishes, read from its own page on {fmtDate(PLAN_SUPPORT_CHECKED)}.
            The often-repeated 75 percent figure comes from two of these programmes, each with its own
            conditions. It is not a general rule.
          </p>
        </>
      }
      related={[RELATED.planTemplate, RELATED.onePage, RELATED.lenders, RELATED.equity]}
    >
      <section className="mb-12" aria-labelledby="who-pays-heading">
        <h2 id="who-pays-heading" className="font-display text-2xl font-bold text-foreground mb-4">Institutions that publish support for the cost of a plan</h2>
        <ul className="grid md:grid-cols-2 gap-4">
          {PLAN_SUPPORT.map((p) => (
            <li key={p.institution} className="rounded-xl border border-border p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">{p.regions.map(nameOf).join(', ')}</p>
              <h3 className="font-display text-lg font-semibold text-foreground mt-1">{p.institution}</h3>
              <p className="text-sm text-muted-foreground mt-1">{p.serves}</p>
              <p className="text-sm text-foreground/90 mt-3 leading-relaxed">{p.published}</p>
              <blockquote className="mt-3 border-l-2 border-primary/40 pl-3 text-sm italic text-muted-foreground">&ldquo;{p.quote}&rdquo;</blockquote>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div><dt className="text-muted-foreground">Published share</dt><dd className="font-medium text-foreground">{p.share ?? 'Not published'}</dd></div>
                <div><dt className="text-muted-foreground">Published cap</dt><dd className="font-medium text-foreground">{p.cap ?? 'Not published'}</dd></div>
              </dl>
              {p.approvalFirst && <p className="mt-2 text-sm font-medium text-foreground">Funding must be approved before the consultant starts.</p>}
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 min-h-[44px] text-sm font-medium text-primary">
                Read the institution&apos;s page <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
              <p className="text-xs text-muted-foreground">Read on {fmtDate(p.checkedOn)}.</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12" aria-labelledby="help-heading">
        <h2 id="help-heading" className="font-display text-2xl font-bold text-foreground mb-3">Help writing the plan, without a published cost share</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          These institutions describe business planning help on their sites but do not publish that they pay
          part of a consultant&apos;s cost. Ask them directly what they offer.
        </p>
        <ul className="space-y-2">
          {PLAN_HELP_ONLY.map((h) => (
            <li key={h.institution} className="text-sm text-muted-foreground">
              <a href={h.url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary">{h.institution}</a>{' '}
              ({h.regions.map(nameOf).join(', ')}): {h.note}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12 space-y-4 text-muted-foreground leading-relaxed" aria-labelledby="pattern-heading">
        <h2 id="pattern-heading" className="font-display text-2xl font-bold text-foreground">What these programmes have in common</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong className="text-foreground">The money is usually for a professional consultant,</strong> not for your own time writing the plan.</li>
          <li><strong className="text-foreground">You may need approval before the work starts.</strong> The Manitoba fund says so explicitly. Do not sign a consultant contract until the institution has said yes in writing.</li>
          <li><strong className="text-foreground">You usually pay a share.</strong> Where a share is published, it is the institution&apos;s maximum, and some describe it as something they can consider rather than a fixed entitlement.</li>
          <li><strong className="text-foreground">Expect to supply a quote and the consultant&apos;s details.</strong> One fund recommends getting three competitive quotes.</li>
          <li><strong className="text-foreground">It is often tied to a financing application.</strong> The plan is there to support a loan or contribution request, so the institution will want to see the business idea first.</li>
        </ul>
      </section>

      <section className="mb-4 space-y-4 text-muted-foreground leading-relaxed" aria-labelledby="yourself-heading">
        <h2 id="yourself-heading" className="font-display text-2xl font-bold text-foreground">If you write it yourself</h2>
        <p>
          Many entrepreneurs write the first draft themselves and bring it to the institution. Start with the{' '}
          <Link to={RELATED.onePage.to} className="text-primary font-medium">one-page plan</Link>, then expand it using the{' '}
          <Link to={RELATED.planTemplate.to} className="text-primary font-medium">six-section template</Link> or the free{' '}
          <Link to="/plan" className="text-primary font-medium">business plan builder</Link>. A rough draft also makes a
          consultant cheaper, because they start from your thinking rather than from nothing.
        </p>
        <p>
          This list covers the institutions we have read. It is not every Indigenous lender. Use the{' '}
          <Link to={RELATED.lenders.to} className="text-primary font-medium">lender directory</Link> to find the one that serves
          your area, and ask it what planning support it offers.
        </p>
      </section>
    </ResourcePage>
  );
}
