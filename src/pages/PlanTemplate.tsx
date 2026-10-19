import { Link } from 'react-router-dom';
import { ArrowRight, Download, CheckCircle2 } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import MetaTags from '../components/MetaTags';
import Breadcrumbs from '../components/Breadcrumbs';
import { ROUTE_TITLES } from '@/data/routeTitles';
import { PLAN_TEMPLATE, templateAsText, TEMPLATE_FILENAME } from '@/data/planTemplate';

/**
 * Free Indigenous business plan template.
 *
 * The honest version of this page: the download is the SAME structure the free
 * planner walks you through, not a generic template with an Indigenous label
 * added. planTemplate.ts is guarded against drifting from the planner's STEPS.
 *
 * It promises no outcome. A plan is preparation; the institution decides.
 */
const PlanTemplate = () => {
  const download = () => {
    const blob = new Blob([templateAsText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = TEMPLATE_FILENAME;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title={ROUTE_TITLES['/indigenous-business-plan-template']}
        description="A free business plan template for Indigenous entrepreneurs in Canada — the six sections funders ask for, with the questions to answer under each. Download it, or fill it in online."
      />
      <Navigation />
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs />

          <header className="mb-10">
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Free Indigenous business plan template
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Six sections, and the questions a funder actually asks under each one. This is the
              same structure the free business plan builder walks you through — download it and
              work offline, or fill it in online and export when you are done.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={download}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                <Download className="w-4 h-4" /> Download the template
              </button>
              <Link
                to="/plan"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border-2 border-border font-semibold hover:bg-muted/50 transition-colors"
              >
                Fill it in online <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Free, no account needed to download. A plan is preparation, not an application — the
              institution you apply to decides eligibility and terms.
            </p>
          </header>

          <section className="mb-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              What goes in an Indigenous business plan
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-3xl">
              A business plan for an Indigenous Financial Institution covers the same ground as any
              other plan, with one addition that matters: what the business returns to your
              community. Most templates have nothing for that section, and Indigenous funders often
              ask about it directly.
            </p>

            <ol className="space-y-8">
              {PLAN_TEMPLATE.map((s, i) => (
                <li key={s.id} className="border-t border-border pt-6">
                  <h3 className="font-semibold text-lg text-foreground">
                    {i + 1}. {s.title}
                  </h3>
                  <p className="text-muted-foreground mt-1 mb-3">{s.purpose}</p>
                  <ul className="space-y-2">
                    {s.prompts.map((p) => (
                      <li key={p} className="flex gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>

          <section className="mb-12 rounded-2xl border border-border p-6 bg-muted/30">
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              Before you send it
            </h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>Every number traceable to a quote or a stated assumption.</li>
              <li>A realistic downside case included — funders read a lot of plans.</li>
              <li>Proof of Indigenous identity in the form your institution accepts.</li>
              <li>
                Ask the institution what else they want, and in what order. Requirements differ
                between them.
              </li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Not sure which institution serves you?{' '}
              <Link to="/guides/indigenous-business-grants" className="text-primary font-medium">
                Start with the funding guides
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PlanTemplate;
