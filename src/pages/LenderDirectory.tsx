import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { ResourcePage, RELATED } from '@/components/resources/ResourcePage';
import { PROVINCES, fmtDate } from '@/lib/funding-catalog';
import { LENDERS, LENDER_TYPE_LABELS, LENDERS_CHECKED, NACCA_LISTINGS_URL, type LenderType } from '@/data/lenders';

const ROUTE = '/indigenous-financial-institutions-directory';
const nameOf = (code: string) => PROVINCES.find((p) => p.code === code)?.name ?? code;

/**
 * Find an Indigenous lender by province or territory. The list is the subset of
 * institutions in our funding catalogue, linked to their own sites; NACCA's
 * listing is named first as the authority for the whole network. Service areas
 * are the institutions' own words, never inferred from an office address.
 */
export default function LenderDirectory() {
  const [region, setRegion] = useState('');
  const [type, setType] = useState<'' | LenderType>('');

  const visible = LENDERS.filter(
    (l) => (!region || l.regions.length === 0 || l.regions.includes(region)) && (!type || l.type === type),
  );

  return (
    <ResourcePage
      route={ROUTE}
      crumb="Indigenous lender directory"
      heading="Find an Indigenous Financial Institution by province"
      wide
      intro={
        <>
          <p>
            Indigenous Financial Institutions, Métis capital corporations and other Indigenous-led lenders make
            business loans and often deliver non-repayable contributions and business support alongside them.
            Most serve a defined territory, so the first question is which one serves where you live and work.
          </p>
          <p>
            Choose your province or territory below. Each entry links to the institution&apos;s own website, and
            where we publish one of its programmes, to that programme page.
          </p>
        </>
      }
      related={[RELATED.loanCalculator, RELATED.equity, RELATED.loans, RELATED.choosing]}
    >
      <section className="mb-8 rounded-2xl border-2 border-primary/30 bg-primary/5 p-6" aria-labelledby="authority-heading">
        <h2 id="authority-heading" className="font-display text-xl font-bold text-foreground mb-2">This is not the full list</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The National Aboriginal Capital Corporations Association (NACCA) publishes the listing of every
          Indigenous Financial Institution in its network, with contacts. Use it to confirm which institution
          serves your community, including any not shown here.
        </p>
        <a href={NACCA_LISTINGS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90">
          NACCA&apos;s Indigenous Financial Institution listings <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
        </a>
      </section>

      <form className="flex flex-col sm:flex-row gap-4 mb-6" onSubmit={(e) => e.preventDefault()} aria-label="Filter lenders">
        <label className="text-sm font-medium text-foreground">
          Province or territory
          <select className="mt-1 block min-h-[44px] w-full sm:w-64 rounded-lg border border-input bg-background px-3" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">All of Canada</option>
            {PROVINCES.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-foreground">
          Kind of lender
          <select className="mt-1 block min-h-[44px] w-full sm:w-72 rounded-lg border border-input bg-background px-3" value={type} onChange={(e) => setType(e.target.value as '' | LenderType)}>
            <option value="">All kinds</option>
            {(Object.keys(LENDER_TYPE_LABELS) as LenderType[]).map((k) => <option key={k} value={k}>{LENDER_TYPE_LABELS[k]}</option>)}
          </select>
        </label>
      </form>

      <p className="text-sm text-muted-foreground mb-4" role="status">
        {visible.length} {visible.length === 1 ? 'lender' : 'lenders'}{region ? ` serving ${nameOf(region)}, including national lenders` : ''}. Listed from our catalogue research on {fmtDate(LENDERS_CHECKED)}.
      </p>

      <ul className="grid md:grid-cols-2 gap-4 mb-12">
        {visible.map((l) => (
          <li key={l.slug} className="rounded-xl border border-border p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">{LENDER_TYPE_LABELS[l.type]}</p>
            <h3 className="font-display text-lg font-semibold text-foreground mt-1">{l.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {l.regions.length === 0 ? 'National' : `Serves: ${l.regions.map(nameOf).join(', ')}`}
            </p>
            {l.area && <p className="text-sm text-muted-foreground mt-1">{l.area}</p>}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-sm font-medium">
              <a href={l.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 min-h-[44px] text-primary">
                Official website <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
              {l.programme && (
                <Link to={`/funding/${l.programme.slug}`} className="inline-flex items-center min-h-[44px] text-foreground underline underline-offset-4">
                  {l.programme.name}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>

      <section className="space-y-4 text-muted-foreground leading-relaxed mb-4" aria-labelledby="choose-heading">
        <h2 id="choose-heading" className="font-display text-2xl font-bold text-foreground">Choosing and contacting a lender</h2>
        <p>
          Service areas overlap in some regions and are tightly defined in others. Before you prepare an
          application, call or email the institution and ask three things: whether it serves your community and
          your kind of business, which of its loans or contributions fit your project, and what it needs to see
          first. Many ask for a business plan and a project budget before a full application.
        </p>
        <p>
          Some institutions serve First Nations entrepreneurs, some serve Métis entrepreneurs, and some serve
          all Indigenous applicants in their area. Eligibility rules, including which identification is
          accepted, are set by each institution. We do not summarize them here because they change and they
          differ.
        </p>
        <p>
          If a link is broken or a lender is missing, email{' '}
          <a href="mailto:help@indigenousrising.ai" className="text-primary font-medium">help@indigenousrising.ai</a>{' '}
          and we will check it against the institution&apos;s site. For the programmes themselves, the{' '}
          <Link to="/funding" className="text-primary font-medium">funding directory</Link> shows what each funder
          publishes and when we last read it.
        </p>
      </section>
    </ResourcePage>
  );
}
