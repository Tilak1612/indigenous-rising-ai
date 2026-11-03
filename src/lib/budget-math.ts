/**
 * Project budget and funding gap arithmetic for /tools/startup-cost-calculator.
 *
 * Everything here is the user's own numbers. Nothing assumes what a funder
 * will cover, what share of the cost an owner must contribute, or which costs
 * are eligible: those rules differ by programme and the page sends people to
 * the funder for them.
 */
export type CostKind = 'one_time' | 'monthly';
export type SourceKind = 'owner_cash' | 'loan' | 'non_repayable' | 'other';

export interface CostLine { id: string; label: string; kind: CostKind; amount: number; quoted: boolean }
export interface SourceLine { id: string; label: string; kind: SourceKind; amount: number; confirmed: boolean }

export const SOURCE_LABELS: Record<SourceKind, string> = {
  owner_cash: 'Your own cash (owner equity)',
  loan: 'Loan (repayable)',
  non_repayable: 'Grant or non-repayable contribution',
  other: 'Other (in-kind, partner, family)',
};

export interface BudgetTotals {
  oneTime: number;
  monthly: number;
  workingCapital: number;
  projectCost: number;
  sources: number;
  confirmedSources: number;
  gap: number;
  ownerCash: number;
  ownerSharePct: number | null;
  unquotedOneTime: number;
}

const clean = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

export function budgetTotals(costs: CostLine[], sources: SourceLine[], monthsOfOperatingCosts: number): BudgetTotals {
  const months = Math.max(0, Math.min(36, Math.round(clean(monthsOfOperatingCosts))));
  const oneTime = costs.filter((c) => c.kind === 'one_time').reduce((s, c) => s + clean(c.amount), 0);
  const monthly = costs.filter((c) => c.kind === 'monthly').reduce((s, c) => s + clean(c.amount), 0);
  const workingCapital = monthly * months;
  const projectCost = oneTime + workingCapital;
  const total = sources.reduce((s, x) => s + clean(x.amount), 0);
  const confirmed = sources.filter((x) => x.confirmed).reduce((s, x) => s + clean(x.amount), 0);
  const ownerCash = sources.filter((x) => x.kind === 'owner_cash').reduce((s, x) => s + clean(x.amount), 0);
  const unquotedOneTime = costs
    .filter((c) => c.kind === 'one_time' && !c.quoted)
    .reduce((s, c) => s + clean(c.amount), 0);
  return {
    oneTime,
    monthly,
    workingCapital,
    projectCost,
    sources: total,
    confirmedSources: confirmed,
    gap: projectCost - total,
    ownerCash,
    ownerSharePct: projectCost > 0 ? (ownerCash / projectCost) * 100 : null,
    unquotedOneTime,
  };
}

const csvCell = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** A spreadsheet-ready copy of the budget the user built. */
export function budgetCsv(costs: CostLine[], sources: SourceLine[], months: number): string {
  const t = budgetTotals(costs, sources, months);
  const rows: (string | number)[][] = [
    ['Section', 'Item', 'Type', 'Amount (CAD)', 'Quote or confirmation'],
    ...costs.map((c) => ['Cost', c.label, c.kind === 'one_time' ? 'One-time' : 'Monthly', c.amount, c.quoted ? 'Quote on file' : 'Estimate']),
    ['Cost', `Working capital (${months} months of monthly costs)`, 'Calculated', t.workingCapital, ''],
    ['Total', 'Total project cost', '', t.projectCost, ''],
    ...sources.map((s) => ['Source', s.label, SOURCE_LABELS[s.kind], s.amount, s.confirmed ? 'Confirmed' : 'Not yet confirmed']),
    ['Total', 'Total funding sources', '', t.sources, ''],
    ['Total', t.gap >= 0 ? 'Funding gap still to find' : 'Sources exceed cost by', '', Math.abs(t.gap), ''],
  ];
  return rows.map((r) => r.map(csvCell).join(',')).join('\n') + '\n';
}
