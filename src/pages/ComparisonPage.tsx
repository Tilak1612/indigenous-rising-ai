import { useLocation, Link, Navigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import MetaTags from '../components/MetaTags';
import Breadcrumbs from '../components/Breadcrumbs';
import { comparisonBySlug } from '@/data/competitorFacts';

/**
 * Honest comparison pages.
 *
 * The brief that asked for these said it plainly: differentiate on axis, "not
 * invented superiority". So the page leads with where the competitor is
 * stronger, states their facts from their own site with the date they were
 * checked, and ends by telling the reader when to choose them instead.
 *
 * That is not modesty. A comparison page that claims to win on every axis is
 * one the reader can disprove in a single click to the competitor's pricing
 * page, and it takes the rest of the site's credibility with it.
 */
const ComparisonPage = () => {
  // Routes are static ("/grantcompass-alternative"), not parameterised, so the
  // competitor is derived from the path rather than a route param. An earlier
  // version read the param hook here, which is always empty on a static route
  // and would have redirected every visitor straight back to the hub.
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\//, '').replace(/-alternative\/?$/, '');
  const c = comparisonBySlug(slug);
  if (!c) return <Navigate to="/guides/indigenous-business-grants" replace />;

  const title = `${c.name} alternative for Indigenous entrepreneurs`;

  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title={`${c.name} Alternative for Indigenous Entrepreneurs`}
        description={`An honest comparison of Indigenous Rising AI and ${c.name}, including where ${c.name} is stronger. Facts checked against their site on ${c.checkedOn}.`}
      />
      <Navigation />
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs />

          <header className="mb-10">
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {c.what} We have written this the way we would want one written about us: their facts
              from their own site, where they beat us stated first, and who should pick them
              instead at the end.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Checked against{' '}
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="underline">
                {c.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>{' '}
              on {c.checkedOn}. Their pricing and features change — confirm on their site.
            </p>
          </header>

          <section className="mb-12 rounded-2xl border-2 border-border p-6">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Where {c.name} is stronger
            </h2>
            <ul className="space-y-3">
              {c.weAreBehind.map((w) => (
                <li key={w} className="text-muted-foreground leading-relaxed">
                  &bull; {w}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              What {c.name} states about itself
            </h2>
            <ul className="space-y-2">
              {c.theirFacts.map((f) => (
                <li key={f} className="text-muted-foreground leading-relaxed">
                  &bull; {f}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Where the two actually differ
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-3 pr-4 font-semibold text-foreground">&nbsp;</th>
                    <th className="py-3 pr-4 font-semibold text-foreground">{c.name}</th>
                    <th className="py-3 font-semibold text-foreground">Indigenous Rising AI</th>
                  </tr>
                </thead>
                <tbody>
                  {c.differences.map((d) => (
                    <tr key={d.axis} className="border-b border-border align-top">
                      <td className="py-4 pr-4 font-medium text-foreground">{d.axis}</td>
                      <td className="py-4 pr-4 text-muted-foreground">{d.them}</td>
                      <td className="py-4 text-muted-foreground">{d.us}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-12 rounded-2xl bg-muted/30 border border-border p-6">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Choose {c.name} if
            </h2>
            <ul className="space-y-2">
              {c.chooseThemIf.map((x) => (
                <li key={x} className="text-muted-foreground leading-relaxed">
                  &bull; {x}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              Choose us if you are applying to an Indigenous funder
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl">
              That is the case we can make. Our directory is small and we say so &mdash; 17
              programmes, each carrying the date it was last checked against the funder&rsquo;s own
              page. The business plan is written around what an Indigenous Financial Institution
              asks for, including a Community Impact section most planning tools do not have. Your
              data is stored in Canada and you can export it at any time. Starting is free and does
              not need a card.
            </p>
          </section>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/plan"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Try the plan builder free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/funding"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border-2 border-border font-semibold hover:bg-muted/50 transition-colors"
            >
              Browse the programmes
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ComparisonPage;
