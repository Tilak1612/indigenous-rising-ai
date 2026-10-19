import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import MetaTags from '../components/MetaTags';
import Breadcrumbs from '../components/Breadcrumbs';
import { ROUTE_TITLES } from '@/data/routeTitles';
import { DATA_FACTS, ROADMAP_FOR_ORGANISATIONS } from '@/data/liveCapability';

/**
 * Data sovereignty posture. Describes handling, not certification.
 *
 * Describes live capability only. Roadmap items are listed under a heading that
 * calls them roadmap, matching the pattern the homepage already uses. A guard
 * test asserts no feature flagged available: false in plans.ts appears here as
 * something the platform does.
 */
const DataSovereignty = () => (
  <div className="min-h-screen bg-background">
    <MetaTags title={ROUTE_TITLES['/ocap-data-sovereignty-software']} description="Where Indigenous Rising AI stores data, how you export it, our AI model-training crawler policy, and why we describe alignment with OCAP® principles rather than any form of accreditation." />
    <Navigation />
    <main className="pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs />

        <header className="mb-10">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">Data sovereignty and how we handle your information</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">Software that asks Indigenous entrepreneurs and Nations for their business information should be able to say exactly where it goes. Here is ours, and the line we will not cross in describing it.</p>
        </header>

        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">What the platform does with your data</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl mb-6">These are configuration facts rather than promises, and each is checkable.</p>
          <ul className="space-y-5">
            {DATA_FACTS.map((c) => (
              <li key={c.what} className="border-t border-border pt-4">
                <h3 className="font-semibold text-foreground">{c.what}</h3>
                <p className="text-muted-foreground mt-1">{c.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12 rounded-2xl border border-border p-6 bg-muted/30">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">Not built yet</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">A governance console is the feature most often asked about here. It is on our pricing page under the Nations & Organizations plan and it is not built:</p>
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
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            Aligned with OCAP&reg;, not certified against it
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl mb-4">
            OCAP&reg; &mdash; Ownership, Control, Access and Possession &mdash; is a framework of
            the First Nations Information Governance Centre. We build around it. We hold no
            certification against it, no organisation has audited us for it, and we will not
            describe alignment as though it were accreditation.
          </p>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            If you want to understand OCAP&reg; itself, go to the First Nations Information
            Governance Centre rather than to a software vendor. That includes us.
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

export default DataSovereignty;
