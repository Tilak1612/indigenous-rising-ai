import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import MetaTags from '../components/MetaTags';
import Breadcrumbs from '../components/Breadcrumbs';
import { ROUTE_TITLES } from '@/data/routeTitles';
import { LIVE_FOR_ORGANISATIONS, ROADMAP_FOR_ORGANISATIONS } from '@/data/liveCapability';

/**
 * Platform for funders and support organizations.
 *
 * Describes live capability only. Roadmap items are listed under a heading that
 * calls them roadmap, matching the pattern the homepage already uses. A guard
 * test asserts no feature flagged available: false in plans.ts appears here as
 * something the platform does.
 */
const ForFunders = () => (
  <div className="min-h-screen bg-background">
    <MetaTags title={ROUTE_TITLES['/for-funders']} description="What Indigenous Rising AI does today for funders and Indigenous business support organizations, and the reporting capability that is not built yet." />
    <Navigation />
    <main className="pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs />

        <header className="mb-10">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">For funders and support organizations</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">If you fund or support Indigenous businesses, the useful thing here is applicant readiness, not reporting. We want to be clear about that up front.</p>
        </header>

        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">What is live today</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl mb-6">Applicants arrive having worked through a plan structured around what an Indigenous Financial Institution asks for, including community impact. That is the part that helps your assessors.</p>
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
          <p className="text-muted-foreground leading-relaxed mb-4">Reporting is the obvious thing a funder would want, and it is not built. These are listed on our pricing page under the Nations & Organizations plan as things we intend to build, not things you can use:</p>
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
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">What we do not do</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            We do not administer funding, assess eligibility, or make decisions on anyone&rsquo;s
            behalf. Matches shown to entrepreneurs are decision support and say so. If you need a
            grants management system that receives and adjudicates applications, that is a
            different product and we are not it.
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

export default ForFunders;
