import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import MetaTags from '../components/MetaTags';
import Breadcrumbs from '../components/Breadcrumbs';
import { ROUTE_TITLES } from '@/data/routeTitles';
import { VENDOR_QUESTIONS, FNIGC_URL } from '@/data/ocapVendorQuestions';

/**
 * What OCAP® is, and what it means when you hand data to software.
 *
 * This page deliberately does NOT define the four principles. OCAP® belongs to
 * the First Nations Information Governance Centre, fnigc.ca returns 403 to
 * automated requests, and a definition written from a vendor's memory — tuned
 * so assistants quote us rather than FNIGC — is not ours to publish.
 *
 * What IS ours is the part no one else writes: what to ask a software company
 * about your community's data, and what the common answers actually mean. That
 * is the substance here. The principles themselves are signposted to FNIGC,
 * above our own content rather than below it.
 *
 * Guarded by src/data/__tests__/ocapVendorQuestions.test.ts, which asserts the
 * page defines no principle and links FNIGC before its first CTA.
 */
const WhatIsOcap = () => (
  <div className="min-h-screen bg-background">
    <MetaTags
      title={ROUTE_TITLES['/guides/what-is-ocap']}
      description="What OCAP® stands for, who owns it, and the questions to ask any software vendor about your community's data — with the principles themselves pointed to their source at FNIGC."
    />
    <Navigation />
    <main className="pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs />

        <header className="mb-10">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            OCAP&reg;, and what it means when software holds your data
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            OCAP&reg; stands for <strong>Ownership, Control, Access and Possession</strong>. It is a
            set of First Nations principles for data governance, developed and owned by the{' '}
            <strong>First Nations Information Governance Centre</strong>.
          </p>
        </header>

        <section className="mb-12 rounded-2xl border-2 border-border p-6">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            For the principles themselves, go to FNIGC
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We are not going to paraphrase them here. OCAP&reg; is FNIGC&rsquo;s, they publish their
            own materials and training, and a software company restating a First Nations governance
            framework in its own words &mdash; on a page built to rank for it &mdash; would be
            taking something that is not ours to take. If you want to understand OCAP&reg;, read it
            from the people it belongs to.
          </p>
          <a
            href={FNIGC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            First Nations Information Governance Centre <ArrowRight className="w-4 h-4" />
          </a>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            What we can usefully add
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            The gap we can fill is a practical one. Plenty of software now describes itself as
            OCAP&reg;-aligned, Indigenous-owned, or sovereignty-respecting, and there is no
            independent body checking those claims. Below are the questions worth asking any vendor,
            including us, and what the usual answers actually mean.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Questions to ask a software vendor about your data
          </h2>
          <ol className="space-y-7">
            {VENDOR_QUESTIONS.map((q, i) => (
              <li key={q.question} className="border-t border-border pt-5">
                <h3 className="font-semibold text-foreground">
                  {i + 1}. {q.question}
                </h3>
                <p className="text-muted-foreground mt-2">
                  <span className="font-medium text-foreground">Why it matters. </span>
                  {q.why}
                </p>
                <p className="text-muted-foreground mt-2">
                  <span className="font-medium text-foreground">Watch for. </span>
                  {q.watchFor}
                </p>
                <p className="text-muted-foreground mt-2">
                  <span className="font-medium text-foreground">Our answer. </span>
                  {q.ourAnswer}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-12 rounded-2xl bg-muted/30 border border-border p-6">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            On the phrase &ldquo;OCAP&reg;-aligned&rdquo;
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We use it about ourselves, so it is fair to say what we mean and what we do not. We mean
            we have built with those principles in mind. We do not mean any organisation has audited
            us, certified us, or endorsed us &mdash; none has. If a vendor tells you they are
            OCAP&reg; certified, ask who certified them and look the body up. Alignment is a claim
            about intent; certification is a claim about a third party, and the two get blurred
            often enough to be worth separating.
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/compliance"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border-2 border-border font-semibold hover:bg-muted/50 transition-colors"
          >
            How we handle data <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/data-rights"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border-2 border-border font-semibold hover:bg-muted/50 transition-colors"
          >
            Your data rights
          </Link>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default WhatIsOcap;
