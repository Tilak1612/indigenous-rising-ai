import { ExternalLink } from 'lucide-react';
import { KIND_LABELS, REGIONAL_CHECKED, type RegionalSection } from '@/data/regionalSupports';

const fmtDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

/**
 * Local lenders and supports for a region, quoted from each organization's
 * own page. Static and dated, so it renders into the prerendered HTML even
 * when the programme catalogue has not loaded.
 */
export function LocalSupports({ regionName, section }: { regionName: string; section: RegionalSection }) {
  return (
    <section className="mb-10" aria-labelledby="local-heading">
      <h2 id="local-heading" className="font-display text-2xl font-semibold text-foreground mb-2">Local lenders and supports in {regionName}</h2>
      <p className="text-muted-foreground leading-relaxed max-w-3xl mb-2">{section.intro}</p>
      <p className="text-sm text-muted-foreground mb-5">
        Quoted from each organization&apos;s own page on {fmtDate(REGIONAL_CHECKED)}. Each one decides who qualifies, so contact it before you prepare an application.
      </p>
      <ul className="grid md:grid-cols-2 gap-4">
        {section.items.map((it) => (
          <li key={it.name} className="rounded-xl border border-border p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{KIND_LABELS[it.kind]}</p>
            <h3 className="font-semibold text-foreground mt-1">{it.name}</h3>
            {it.serves && <p className="text-sm text-muted-foreground mt-2">&ldquo;{it.serves}&rdquo;</p>}
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {it.offers.map((q) => <li key={q}>&ldquo;{q}&rdquo;</li>)}
            </ul>
            {it.note && <p className="text-sm text-foreground mt-2">{it.note}</p>}
            <a href={it.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-1 text-sm font-medium text-primary">
              Official page <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
      {section.caveats.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm text-muted-foreground list-disc pl-5">
          {section.caveats.map((c) => <li key={c}>{c}</li>)}
        </ul>
      )}
    </section>
  );
}
