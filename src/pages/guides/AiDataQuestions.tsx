import { Link } from 'react-router-dom';
import { ResourcePage, RELATED } from '@/components/resources/ResourcePage';
import {
  AI_DATA_CHECKED, AI_QUESTIONS, COMMUNITY_QUESTIONS, ITK_NISR_URL, OUR_AI_FEATURES, OUR_ANSWERS,
} from '@/data/aiDataQuestions';

const ROUTE = '/guides/indigenous-business-data-sovereignty-questions';

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
};

/**
 * A practical checklist for AI tools specifically. The OCAP® explainer at
 * /guides/what-is-ocap covers principles and general vendor questions; this
 * page covers what happens to what you type, and answers it for this site.
 */
export default function AiDataQuestions() {
  return (
    <ResourcePage
      route={ROUTE}
      crumb="AI data questions"
      heading="Questions to ask before using AI for an Indigenous business"
      intro={
        <>
          <p>
            When you type business information into an AI tool, it is often sent to another company to process.
            That can be fine, but it should be a decision, not a surprise. These are the questions to ask any
            AI tool before you share information about your business, and above all before you share anything
            about your community.
          </p>
          <p>
            For the principles behind them, read our explainer on{' '}
            <Link to="/guides/what-is-ocap" className="text-primary font-medium">OCAP® and general vendor questions</Link>.
            At the end of this page we answer every question for Indigenous Rising itself, as of {fmtDate(AI_DATA_CHECKED)}.
          </p>
        </>
      }
      related={[RELATED.directory, RELATED.planTemplate, RELATED.choosing, RELATED.changes]}
    >
      <section className="mb-12" aria-labelledby="ask-heading">
        <h2 id="ask-heading" className="font-display text-2xl font-bold text-foreground mb-4">Questions to ask any AI tool</h2>
        <ol className="space-y-4">
          {AI_QUESTIONS.map((q, i) => (
            <li key={q.question} className="rounded-xl border border-border p-5">
              <h3 className="font-display text-lg font-semibold text-foreground">{i + 1}. {q.question}</h3>
              <p className="text-muted-foreground mt-1 leading-relaxed">{q.why}</p>
              <p className="text-sm mt-2"><strong className="text-foreground">A good answer:</strong> <span className="text-muted-foreground">{q.goodAnswer}</span></p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-12" aria-labelledby="community-heading">
        <h2 id="community-heading" className="font-display text-2xl font-bold text-foreground mb-4">Questions to settle inside your community</h2>
        <ul className="space-y-3">
          {COMMUNITY_QUESTIONS.map((q) => (
            <li key={q.question} className="rounded-lg border border-border p-4">
              <p className="font-semibold text-foreground">{q.question}</p>
              <p className="text-muted-foreground mt-1">{q.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12 space-y-3 text-muted-foreground leading-relaxed" aria-labelledby="distinct-heading">
        <h2 id="distinct-heading" className="font-display text-2xl font-bold text-foreground">First Nations, Inuit and Métis governance are distinct</h2>
        <p>
          There is no single Indigenous data standard. OCAP® is a First Nations framework, a registered trademark of
          the First Nations Information Governance Centre; our{' '}
          <Link to="/guides/what-is-ocap" className="text-primary font-medium">OCAP® explainer</Link> points to their materials.
        </p>
        <p>
          For Inuit, Inuit Tapiriit Kanatami&apos;s{' '}
          <a href={ITK_NISR_URL} target="_blank" rel="noopener noreferrer" className="text-primary font-medium">National Inuit Strategy on Research</a>{' '}
          (2018) sets out areas for partnership and action with governments and research institutions. It is written
          for research rather than for business software, so ask your regional Inuit organization how it applies to you.
        </p>
        <p>
          For Métis, ask your Métis government about its own approach. We do not summarize frameworks we have not read
          from their own source.
        </p>
      </section>

      <section className="mb-6" aria-labelledby="ours-heading">
        <h2 id="ours-heading" className="font-display text-2xl font-bold text-foreground mb-2">How Indigenous Rising answers these questions</h2>
        <p className="text-muted-foreground mb-4">
          This matches our <Link to="/privacy" className="text-primary font-medium">privacy policy</Link>. We use two AI
          providers, for three features:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                {['Feature', 'Who uses it', 'Provider', 'What is sent', 'What we keep'].map((h) => (
                  <th key={h} scope="col" className="text-left font-semibold border-b border-border p-2 align-bottom">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {OUR_AI_FEATURES.map((f) => (
                <tr key={f.feature} className="border-b border-border/60 align-top">
                  <td className="p-2 font-semibold text-foreground">{f.feature}</td>
                  <td className="p-2 text-muted-foreground">{f.who}</td>
                  <td className="p-2 text-muted-foreground">{f.provider}</td>
                  <td className="p-2 text-muted-foreground">{f.sends}</td>
                  <td className="p-2 text-muted-foreground">{f.kept}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ul className="space-y-2 mb-12 text-muted-foreground leading-relaxed list-disc pl-6">
        <li><strong className="text-foreground">Processing and storage:</strong> {OUR_ANSWERS.processing}</li>
        <li><strong className="text-foreground">Training:</strong> {OUR_ANSWERS.training}</li>
        <li><strong className="text-foreground">Retention:</strong> {OUR_ANSWERS.retention}</li>
        <li>
          <strong className="text-foreground">Export and deletion:</strong> {OUR_ANSWERS.export}{' '}
          <Link to="/data-rights" className="text-primary font-medium">Your data rights</Link> ·{' '}
          <Link to="/account-deletion" className="text-primary font-medium">Delete your account</Link>
        </li>
        <li><strong className="text-foreground">What not to enter:</strong> {OUR_ANSWERS.avoid}</li>
      </ul>
    </ResourcePage>
  );
}
