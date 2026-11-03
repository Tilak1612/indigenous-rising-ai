import { Link } from 'react-router-dom';
import { ResourcePage, RELATED } from '@/components/resources/ResourcePage';
import { DOC_TYPES, LENDER_DOCS, LENDER_DOCS_CHECKED, NO_PUBLISHED_LIST, countMarked, type Mark } from '@/data/lenderDocuments';

const ROUTE = '/guides/funding-document-checklist-by-lender';

const fmtDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

const MARK_TEXT: Record<Mark, { short: string; label: string }> = {
  Y: { short: 'Yes', label: 'Named in the lender’s list' },
  C: { short: 'If it applies', label: 'Named for some applicants only, such as existing or incorporated businesses' },
  '-': { short: '–', label: 'Not named in the source we read. Ask the lender.' },
};

/**
 * A source-checked matrix of what ten Indigenous lenders publish as their
 * application documents, plus each lender's own wording. Blank cells mean
 * "not named in the source", never "not required".
 */
export default function LenderDocuments() {
  return (
    <ResourcePage
      route={ROUTE}
      crumb="Documents lenders ask for"
      heading="Business funding documents: what different Indigenous lenders ask for"
      wide
      intro={
        <>
          <p>
            Before you write a single page, it helps to know what the lender will ask you to attach. Below is what
            ten Indigenous lenders and programmes publish in their own checklists and application forms, read on{' '}
            {fmtDate(LENDER_DOCS_CHECKED)}, compared side by side and quoted in their own words.
          </p>
          <p>
            A blank cell means the document is not named in the source we read, not that the lender will not want it.
            Every lender can ask for more, so confirm the list with the institution that serves you.
          </p>
        </>
      }
      related={[RELATED.planTemplate, RELATED.cashFlow, RELATED.budgetTemplate, RELATED.lenders]}
    >
      <section className="mb-12 space-y-3 text-muted-foreground leading-relaxed" aria-labelledby="patterns-heading">
        <h2 id="patterns-heading" className="font-display text-2xl font-bold text-foreground">What most lenders have in common</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            {countMarked('identity')} of the {LENDER_DOCS.length} ask for proof of Indigenous identity. The kind depends on
            whom the lender serves: a status card, a Métis citizenship card, or another document the lender names.
            Futurpreneur uses self-identification instead.
          </li>
          <li>
            {countMarked('equity')} name proof of your own cash equity, usually a recent bank statement.
          </li>
          <li>
            Past business financial statements are asked for only from businesses that already operate, are expanding or
            are being bought, usually for two or three years.
          </li>
          <li>
            Some lenders want a separate personal net worth statement for each owner. Others include it as a section of
            the main form.
          </li>
        </ul>
      </section>

      <section className="mb-12" aria-labelledby="matrix-heading">
        <h2 id="matrix-heading" className="font-display text-2xl font-bold text-foreground mb-2">Side by side</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {(['Y', 'C', '-'] as const).map((k) => `${MARK_TEXT[k].short}: ${MARK_TEXT[k].label}`).join(' · ')}
        </p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <caption className="sr-only">Documents named by each lender</caption>
            <thead className="bg-muted/50 text-left">
              <tr>
                <th scope="col" className="p-3 font-semibold text-foreground min-w-[12rem]">Document</th>
                {LENDER_DOCS.map((l) => (
                  <th key={l.id} scope="col" className="p-3 font-semibold text-foreground align-bottom min-w-[7rem]">
                    <a href={`#${l.id}`} className="hover:text-primary">{l.name.split(',')[0].split(' (')[0]}</a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {DOC_TYPES.map((d) => (
                <tr key={d.id}>
                  <th scope="row" className="p-3 text-left font-medium text-foreground">{d.label}</th>
                  {LENDER_DOCS.map((l) => (
                    <td key={l.id} className={`p-3 ${l.marks[d.id] === 'Y' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      <span title={MARK_TEXT[l.marks[d.id]].label}>{MARK_TEXT[l.marks[d.id]].short}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12" aria-labelledby="wording-heading">
        <h2 id="wording-heading" className="font-display text-2xl font-bold text-foreground mb-4">In each lender&apos;s own words</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {LENDER_DOCS.map((l) => (
            <article key={l.id} id={l.id} className="rounded-xl border border-border p-5 scroll-mt-24">
              <h3 className="font-semibold text-foreground">{l.name}</h3>
              <p className="text-sm text-muted-foreground">{l.region} · {l.source}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {l.items.map((q) => <li key={q}>&ldquo;{q}&rdquo;</li>)}
              </ul>
              {l.caveat && <p className="text-sm text-foreground mt-3">{l.caveat}</p>}
              <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-sm font-medium text-primary">Lender&apos;s page</a>
            </article>
          ))}
        </div>
        <h3 className="font-semibold text-foreground mt-8 mb-2">Lenders that publish no list</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {NO_PUBLISHED_LIST.map((n) => (
            <li key={n.name}>
              <a href={n.url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary">{n.name}</a>: {n.note}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4 text-muted-foreground leading-relaxed" aria-labelledby="pack-heading">
        <h2 id="pack-heading" className="font-display text-2xl font-bold text-foreground">Building your document pack</h2>
        <p>
          Start with what nearly every list shares: identification and proof of Indigenous identity in the form your
          lender accepts, a bank statement showing your own contribution, a resume, and quotes for what you plan to buy.
          Then write the plan and the numbers. The{' '}
          <Link to={RELATED.planTemplate.to} className="text-primary font-medium">business plan template</Link>,{' '}
          <Link to={RELATED.cashFlow.to} className="text-primary font-medium">cash flow forecast</Link> and{' '}
          <Link to={RELATED.budgetTemplate.to} className="text-primary font-medium">project budget</Link> cover the
          three most common written documents.
        </p>
        <p>
          If your business already operates, gather two or three years of financial statements and tax assessments
          early, as they take the longest to collect. The{' '}
          <Link to={RELATED.gaps.to} className="text-primary font-medium">common application gaps</Link> guide explains
          why missing documents are the usual cause of delay.
        </p>
      </section>
    </ResourcePage>
  );
}
