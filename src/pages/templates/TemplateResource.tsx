import { Download } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { ResourcePage, RELATED } from '@/components/resources/ResourcePage';
import { templateByRoute, FICTIONAL_NOTE, EXAMPLE_BUSINESS, type TemplateDownload } from '@/data/resourceTemplates';
import NotFound from '@/pages/NotFound';

function save(d: TemplateDownload) {
  const blob = new Blob([d.build()], { type: d.mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = d.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * One page per downloadable template, driven by src/data/resourceTemplates.ts.
 * The files are generated in the browser, so nothing is uploaded and the
 * download always matches what the page describes.
 */
export default function TemplateResource() {
  const { pathname } = useLocation();
  const t = templateByRoute(pathname.replace(/\/$/, ''));
  if (!t) return <NotFound />;

  return (
    <ResourcePage
      route={t.route}
      crumb={t.crumb}
      heading={t.heading}
      intro={t.intro.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
      related={t.related.map((k) => RELATED[k])}
    >
      <section className="mb-10 flex flex-wrap gap-3" aria-label="Downloads">
        {t.downloads.map((d, i) => (
          <button
            key={d.filename}
            type="button"
            onClick={() => save(d)}
            className={`inline-flex items-center gap-2 min-h-[44px] px-5 rounded-lg font-semibold transition-opacity ${i === 0 ? 'bg-primary text-primary-foreground hover:opacity-90' : 'border border-border text-foreground hover:border-primary/50'}`}
          >
            <Download className="w-4 h-4" aria-hidden="true" /> {d.label}
          </button>
        ))}
        <p className="basis-full text-sm text-muted-foreground">Free, no account needed. Opens in Excel, Google Sheets, LibreOffice or any text editor.</p>
      </section>

      <section className="mb-10" aria-labelledby="contents-heading">
        <h2 id="contents-heading" className="font-display text-2xl font-bold text-foreground mb-4">{t.contentsTitle}</h2>
        <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc pl-6">
          {t.contents.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </section>

      <section className="mb-10" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="font-display text-2xl font-bold text-foreground mb-4">How to use it</h2>
        <ol className="space-y-2 text-muted-foreground leading-relaxed list-decimal pl-6">
          {t.howTo.map((h) => <li key={h}>{h}</li>)}
        </ol>
      </section>

      {t.example && (
        <section className="mb-10 rounded-2xl border-2 border-border p-6" aria-labelledby="example-heading">
          <h2 id="example-heading" className="font-display text-2xl font-bold text-foreground mb-2">{t.example.title}</h2>
          <p className="text-sm font-medium text-muted-foreground mb-4">{FICTIONAL_NOTE}</p>
          <dl className="space-y-4">
            {t.example.rows.map(([label, answer]) => (
              <div key={label}>
                <dt className="font-semibold text-foreground">{label}</dt>
                <dd className="text-muted-foreground leading-relaxed">{answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {!t.example && (
        <p className="mb-10 text-sm text-muted-foreground">The worked example download is filled in for {EXAMPLE_BUSINESS}. {FICTIONAL_NOTE}</p>
      )}

      <p className="text-sm text-muted-foreground">
        A template is preparation, not an application. Each funder sets its own forms and decides eligibility,
        so check what the institution you apply to asks for.
      </p>
    </ResourcePage>
  );
}
