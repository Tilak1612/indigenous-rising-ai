import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import MetaTags from '../components/MetaTags';
import Breadcrumbs from '../components/Breadcrumbs';
import { ROUTE_TITLES } from '@/data/routeTitles';
import { LIVE_FOR_ORGANISATIONS, ROADMAP_FOR_ORGANISATIONS } from '@/data/liveCapability';

/**
 * Tools for economic development officers.
 *
 * Describes live capability only. Roadmap items are listed under a heading that
 * calls them roadmap, matching the pattern the homepage already uses. A guard
 * test asserts no feature flagged available: false in plans.ts appears here as
 * something the platform does.
 */
const ForEconomicDevelopmentOfficers = () => (
  <div className="min-h-screen bg-background">
    <MetaTags title={ROUTE_TITLES['/for-economic-development-officers']} description="What Indigenous Rising AI does today for economic development officers supporting entrepreneurs in their Nation or region, and what is not built yet." />
    <Navigation />
    <main className="pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs />

        <header className="mb-10">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">Tools for economic development officers</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">If you support entrepreneurs in your Nation or region, here is what the platform does today and what it does not. The second list is as important as the first.</p>
        </header>

        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">What an EDO can use today</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl mb-6">Most of the value is in giving the people you support something structured to work through between your meetings, and in not having to keep a funding list current yourself.</p>
          <ul className="space-y-5">
            {LIVE_FOR_ORGANISATIONS.map((c) => (
              <li key={c.what} className="border-t border-border pt-4">
                <h3 className="font-semibold text-foreground">{c.what}</h3>
                <p className="text-muted-foreground mt-1">{c.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12 rounded-2xl border border-border p-6 bg-muted/30">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">Not built yet</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">These appear on our pricing page as part of the Nations & Organizations plan and are not built. If any of them is what you actually need, this platform does not do it yet.</p>
          <ul className="space-y-2 text-muted-foreground">
            {ROADMAP_FOR_ORGANISATIONS.map((r) => (
              <li key={r}>&bull; {r}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            We would rather you knew before a call than after one.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">Being straight about scale</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            The funding directory holds 17 programmes. That is small, and if you need a
            comprehensive national catalogue this is not it. What it does carry, which larger
            catalogues do not, is the date each programme was last checked against the funder and
            an honest note where we could not check it.
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link to="/demo" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
            Book a walkthrough <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/funding" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border-2 border-border font-semibold hover:bg-muted/50 transition-colors">
            Browse the programmes
          </Link>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default ForEconomicDevelopmentOfficers;
