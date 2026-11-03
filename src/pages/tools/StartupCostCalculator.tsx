import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Plus, Trash2 } from 'lucide-react';
import { ResourcePage, RELATED } from '@/components/resources/ResourcePage';
import { formatCad } from '@/lib/loan-math';
import {
  budgetTotals, budgetCsv, SOURCE_LABELS, type CostLine, type SourceLine, type SourceKind,
} from '@/lib/budget-math';

const ROUTE = '/tools/startup-cost-calculator';
const cell = 'min-h-[44px] w-full rounded-lg border border-input bg-background px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring';

// Starting rows are blank labels a visitor overwrites, not example prices:
// costs vary too much by place and trade for a default number to mean anything.
const START_COSTS: CostLine[] = [
  { id: 'c1', label: 'Equipment', kind: 'one_time', amount: 0, quoted: false },
  { id: 'c2', label: 'Renovation or fit-out', kind: 'one_time', amount: 0, quoted: false },
  { id: 'c3', label: 'Opening inventory', kind: 'one_time', amount: 0, quoted: false },
  { id: 'c4', label: 'Rent or lease', kind: 'monthly', amount: 0, quoted: false },
  { id: 'c5', label: 'Wages', kind: 'monthly', amount: 0, quoted: false },
];
const START_SOURCES: SourceLine[] = [
  { id: 's1', label: 'Savings', kind: 'owner_cash', amount: 0, confirmed: false },
];

let seq = 100;
const nextId = (p: string) => `${p}${seq++}`;

/**
 * Startup cost and funding gap calculator. Totals the visitor's own costs,
 * adds the months of operating costs they choose to hold as working capital,
 * and subtracts the funding they have lined up. It never assumes which costs
 * a programme will accept or what share an owner must put in.
 */
export default function StartupCostCalculator() {
  const [costs, setCosts] = useState<CostLine[]>(START_COSTS);
  const [sources, setSources] = useState<SourceLine[]>(START_SOURCES);
  const [months, setMonths] = useState('3');
  const t = budgetTotals(costs, sources, Number(months));

  const updateCost = (id: string, patch: Partial<CostLine>) => setCosts((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const updateSource = (id: string, patch: Partial<SourceLine>) => setSources((ss) => ss.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const download = () => {
    const blob = new Blob([budgetCsv(costs, sources, Number(months))], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'startup-budget-indigenous-rising.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ResourcePage
      route={ROUTE}
      crumb="Startup cost calculator"
      heading="Startup cost and funding gap calculator"
      wide
      intro={
        <>
          <p>
            List what it costs to open or expand the business, decide how many months of running costs you
            want to hold in reserve, then add the money you already have or expect. The difference is the
            funding gap: the amount you are asking a lender or funder to help close.
          </p>
          <p>
            Nothing is pre-filled with prices, and nothing here decides which costs a programme will pay for.
            Each funder publishes its own eligible costs, and some need approval before you spend.
          </p>
        </>
      }
      related={[RELATED.budgetTemplate, RELATED.loanCalculator, RELATED.equity, RELATED.lenders]}
    >
      <section className="mb-10" aria-labelledby="costs-heading">
        <h2 id="costs-heading" className="font-display text-2xl font-bold text-foreground mb-4">1. Costs</h2>
        <div className="space-y-3">
          {costs.map((c) => (
            <div key={c.id} className="grid grid-cols-1 sm:grid-cols-[1fr_9rem_9rem_auto_auto] gap-2 items-center rounded-xl border border-border p-3">
              <input className={cell} aria-label="Cost item" value={c.label} onChange={(e) => updateCost(c.id, { label: e.target.value })} />
              <select className={cell} aria-label={`Type of cost for ${c.label}`} value={c.kind} onChange={(e) => updateCost(c.id, { kind: e.target.value as CostLine['kind'] })}>
                <option value="one_time">One-time</option>
                <option value="monthly">Monthly</option>
              </select>
              <input className={cell} aria-label={`Amount for ${c.label}`} type="number" inputMode="decimal" min="0" step="50" value={c.amount || ''} placeholder="0" onChange={(e) => updateCost(c.id, { amount: Number(e.target.value) })} />
              <label className="flex items-center gap-2 text-sm text-muted-foreground min-h-[44px]">
                <input type="checkbox" className="h-5 w-5" checked={c.quoted} onChange={(e) => updateCost(c.id, { quoted: e.target.checked })} />
                Quote on file
              </label>
              <button type="button" aria-label={`Remove ${c.label}`} onClick={() => setCosts((cs) => cs.filter((x) => x.id !== c.id))} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-border hover:border-destructive/60">
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setCosts((cs) => [...cs, { id: nextId('c'), label: 'New cost', kind: 'one_time', amount: 0, quoted: false }])} className="mt-3 inline-flex items-center gap-2 min-h-[44px] px-4 rounded-lg border border-border text-sm font-medium hover:border-primary/50">
          <Plus className="w-4 h-4" aria-hidden="true" /> Add a cost
        </button>
        <label className="block mt-6 text-sm font-medium text-foreground max-w-xs">
          Months of monthly costs to hold as working capital
          <input className={`${cell} mt-1`} type="number" min="0" max="36" step="1" value={months} onChange={(e) => setMonths(e.target.value)} />
        </label>
      </section>

      <section className="mb-10" aria-labelledby="sources-heading">
        <h2 id="sources-heading" className="font-display text-2xl font-bold text-foreground mb-4">2. Money you have or expect</h2>
        <div className="space-y-3">
          {sources.map((s) => (
            <div key={s.id} className="grid grid-cols-1 sm:grid-cols-[1fr_14rem_9rem_auto_auto] gap-2 items-center rounded-xl border border-border p-3">
              <input className={cell} aria-label="Funding source" value={s.label} onChange={(e) => updateSource(s.id, { label: e.target.value })} />
              <select className={cell} aria-label={`Type of funding for ${s.label}`} value={s.kind} onChange={(e) => updateSource(s.id, { kind: e.target.value as SourceKind })}>
                {(Object.keys(SOURCE_LABELS) as SourceKind[]).map((k) => <option key={k} value={k}>{SOURCE_LABELS[k]}</option>)}
              </select>
              <input className={cell} aria-label={`Amount from ${s.label}`} type="number" inputMode="decimal" min="0" step="50" value={s.amount || ''} placeholder="0" onChange={(e) => updateSource(s.id, { amount: Number(e.target.value) })} />
              <label className="flex items-center gap-2 text-sm text-muted-foreground min-h-[44px]">
                <input type="checkbox" className="h-5 w-5" checked={s.confirmed} onChange={(e) => updateSource(s.id, { confirmed: e.target.checked })} />
                Confirmed
              </label>
              <button type="button" aria-label={`Remove ${s.label}`} onClick={() => setSources((ss) => ss.filter((x) => x.id !== s.id))} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-border hover:border-destructive/60">
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setSources((ss) => [...ss, { id: nextId('s'), label: 'New source', kind: 'loan', amount: 0, confirmed: false }])} className="mt-3 inline-flex items-center gap-2 min-h-[44px] px-4 rounded-lg border border-border text-sm font-medium hover:border-primary/50">
          <Plus className="w-4 h-4" aria-hidden="true" /> Add a source
        </button>
      </section>

      <section className="mb-12 rounded-2xl bg-muted/40 border border-border p-6" aria-labelledby="result-heading" aria-live="polite">
        <h2 id="result-heading" className="font-display text-2xl font-bold text-foreground mb-4">3. The result</h2>
        <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div><dt className="text-muted-foreground">One-time costs</dt><dd className="text-lg font-semibold text-foreground">{formatCad(t.oneTime)}</dd></div>
          <div><dt className="text-muted-foreground">Working capital</dt><dd className="text-lg font-semibold text-foreground">{formatCad(t.workingCapital)}</dd></div>
          <div><dt className="text-muted-foreground">Total project cost</dt><dd className="text-lg font-semibold text-foreground">{formatCad(t.projectCost)}</dd></div>
          <div><dt className="text-muted-foreground">Funding lined up</dt><dd className="text-lg font-semibold text-foreground">{formatCad(t.sources)}</dd></div>
        </dl>
        <p className="font-display text-3xl font-bold text-foreground mt-6">
          {t.gap > 0 ? `Funding gap: ${formatCad(t.gap)}` : t.projectCost > 0 ? 'No gap: your sources cover the cost' : 'Add your costs to see the gap'}
        </p>
        <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
          {t.ownerSharePct !== null && <li>Your own cash is {t.ownerSharePct.toFixed(1)}% of the project cost. Each funder sets its own expectation for this.</li>}
          {t.sources > t.confirmedSources && <li>{formatCad(t.sources - t.confirmedSources)} of your sources is not confirmed yet.</li>}
          {t.unquotedOneTime > 0 && <li>{formatCad(t.unquotedOneTime)} of one-time costs has no quote yet. Lenders usually ask for quotes on equipment and construction.</li>}
        </ul>
        <button type="button" onClick={download} className="mt-6 inline-flex items-center gap-2 min-h-[44px] px-5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90">
          <Download className="w-4 h-4" aria-hidden="true" /> Download as a spreadsheet (CSV)
        </button>
      </section>

      <section className="space-y-4 text-muted-foreground leading-relaxed" aria-labelledby="next-heading">
        <h2 id="next-heading" className="font-display text-2xl font-bold text-foreground">Reading the result</h2>
        <p>
          The gap is what you are asking for. If part of it would be a loan, run that amount through the{' '}
          <Link to={RELATED.loanCalculator.to} className="text-primary font-medium">loan calculator</Link> and then
          check the payment against your cash flow. If the gap is larger than one programme publishes as its
          maximum, you may need more than one source, and funders will want to see each one.
        </p>
        <p>
          Working capital is the money that keeps the doors open while sales build. Many first budgets leave it
          out, which is one of the{' '}
          <Link to={RELATED.gaps.to} className="text-primary font-medium">common gaps in funding applications</Link>.
          Three months is only a starting point for this calculator, not a rule any funder sets.
        </p>
        <p>
          Your budget stays in this browser tab. Nothing you type here is sent to Indigenous Rising AI or saved
          to an account.
        </p>
      </section>
    </ResourcePage>
  );
}
