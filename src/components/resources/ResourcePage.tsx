import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MetaTags from '@/components/MetaTags';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ROUTE_TITLES } from '@/data/routeTitles';

export interface RelatedLink { to: string; label: string; note: string }

/**
 * Shell for the preparation tools, templates and guides added from the
 * keyword and page plan. One layout so each page differs only in substance.
 *
 * The breadcrumb is passed explicitly (Home, then the page) so the visible
 * trail matches the BreadcrumbList that scripts/prerender.mjs writes from the
 * route's `breadcrumb` label. /tools and /templates are namespaces with no
 * page behind them, and a derived trail would link to them.
 */
export function ResourcePage({
  route, crumb, heading, intro, children, related = [], wide = false,
}: {
  route: string;
  crumb: string;
  heading: string;
  intro: ReactNode;
  children: ReactNode;
  related?: RelatedLink[];
  wide?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background">
      <MetaTags title={ROUTE_TITLES[route]} />
      <Navigation />
      <main className="pt-24 pb-20 px-4 sm:px-6">
        <div className={`${wide ? 'max-w-6xl' : 'max-w-4xl'} mx-auto`}>
          <Breadcrumbs customItems={[{ name: 'Home', path: '/' }, { name: crumb, path: route }]} />
          <header className="mb-10 mt-6">
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">{heading}</h1>
            <div className="text-lg text-muted-foreground leading-relaxed max-w-3xl space-y-3">{intro}</div>
          </header>
          {children}
          {related.length > 0 && (
            <section className="mt-14 border-t border-border pt-8" aria-labelledby="related-heading">
              <h2 id="related-heading" className="font-display text-2xl font-bold text-foreground mb-4">Keep preparing</h2>
              <ul className="grid sm:grid-cols-2 gap-4">
                {related.map((r) => (
                  <li key={r.to}>
                    <Link to={r.to} className="group block h-full rounded-xl border border-border p-5 hover:border-primary/50 transition-colors">
                      <span className="flex items-center gap-2 font-semibold text-foreground group-hover:text-primary">
                        {r.label} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </span>
                      <span className="block text-sm text-muted-foreground mt-1">{r.note}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

/** Shared related-link targets, so labels stay consistent across pages. */
export const RELATED = {
  loanCalculator: { to: '/tools/business-loan-calculator', label: 'Business loan calculator', note: 'Estimate a payment from your own amount, rate and term.' },
  budget: { to: '/tools/startup-cost-calculator', label: 'Startup cost and funding gap calculator', note: 'Add up your costs and see what is still unfunded.' },
  lenders: { to: '/indigenous-financial-institutions-directory', label: 'Find an Indigenous lender', note: 'Lenders by province and territory, linked to their own sites.' },
  equity: { to: '/guides/indigenous-funding-equity-requirements', label: 'Owner equity and matching funds', note: 'What your own contribution is, and how the gap is worked out.' },
  gaps: { to: '/guides/indigenous-funding-application-mistakes', label: 'Common application gaps', note: 'What usually stops an application, and how to close each gap.' },
  onePage: { to: '/templates/one-page-business-plan', label: 'One-page business plan', note: 'The short version first, then expand it into a full plan.' },
  cashFlow: { to: '/templates/cash-flow-forecast', label: 'Cash flow forecast template', note: 'A 12-month spreadsheet with a worked example.' },
  budgetTemplate: { to: '/templates/funding-project-budget', label: 'Funding application budget template', note: 'Costs, quotes and funding sources in one sheet.' },
  impact: { to: '/templates/community-impact-statement', label: 'Community impact statement', note: 'Document jobs, training and local benefit honestly.' },
  planTemplate: { to: '/indigenous-business-plan-template', label: 'Business plan template', note: 'The six sections funders ask for, with a worked example.' },
  directory: { to: '/funding', label: 'Funding directory', note: 'Published programmes, each with the date it was last checked.' },
  loans: { to: '/funding/indigenous-business-loans', label: 'Indigenous business loans', note: 'Repayable programmes in the directory.' },
} satisfies Record<string, RelatedLink>;
