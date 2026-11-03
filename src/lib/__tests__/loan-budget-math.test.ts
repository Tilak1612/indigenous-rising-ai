import { describe, test, expect } from 'vitest';
import { calculateLoan, periodicPayment, loanInputError } from '../loan-math';
import { budgetTotals, budgetCsv, type CostLine, type SourceLine } from '../budget-math';

describe('loan amortization', () => {
  test('a zero-interest loan is straight-line principal with no interest', () => {
    const r = calculateLoan({ principal: 12_000, annualRatePct: 0, termYears: 1, frequency: 'monthly' });
    expect(r.payment).toBe(1000);
    expect(r.paymentCount).toBe(12);
    expect(r.totalInterest).toBe(0);
    expect(r.totalRepaid).toBe(12_000);
  });

  test('matches the standard amortization formula for an ordinary loan', () => {
    // $50,000 at 8% nominal, monthly, 5 years: textbook payment is $1,013.82.
    const r = calculateLoan({ principal: 50_000, annualRatePct: 8, termYears: 5, frequency: 'monthly' });
    expect(r.payment).toBeCloseTo(1013.82, 2);
    expect(r.paymentCount).toBe(60);
    expect(r.totalInterest).toBeCloseTo(10_829.21, 0);
    expect(r.byYear).toHaveLength(5);
    expect(r.byYear[4].closingBalance).toBe(0);
  });

  test('yearly principal adds back up to the amount borrowed', () => {
    const r = calculateLoan({ principal: 75_000, annualRatePct: 6.5, termYears: 3, frequency: 'biweekly' });
    const paid = r.byYear.reduce((s, y) => s + y.principalPaid, 0);
    expect(paid).toBeCloseTo(75_000, 0);
    expect(r.paymentCount).toBe(78);
  });

  test('more frequent payments mean a smaller payment each time', () => {
    const base = { principal: 20_000, annualRatePct: 9, termYears: 4 };
    expect(periodicPayment({ ...base, frequency: 'weekly' })).toBeLessThan(periodicPayment({ ...base, frequency: 'monthly' }));
  });

  test('rejects inputs that would produce nonsense', () => {
    expect(loanInputError({ principal: 0, annualRatePct: 5, termYears: 5, frequency: 'monthly' })).toMatch(/loan amount/);
    expect(loanInputError({ principal: 1000, annualRatePct: -1, termYears: 5, frequency: 'monthly' })).toMatch(/interest rate/);
    expect(loanInputError({ principal: 1000, annualRatePct: 5, termYears: 0, frequency: 'monthly' })).toMatch(/term/);
    expect(loanInputError({ principal: 1000, annualRatePct: 5, termYears: 5, frequency: 'monthly' })).toBeNull();
  });
});

describe('project budget and funding gap', () => {
  const costs: CostLine[] = [
    { id: 'a', label: 'Equipment', kind: 'one_time', amount: 30_000, quoted: true },
    { id: 'b', label: 'Fit-out', kind: 'one_time', amount: 10_000, quoted: false },
    { id: 'c', label: 'Rent', kind: 'monthly', amount: 2_000, quoted: false },
  ];
  const sources: SourceLine[] = [
    { id: 'x', label: 'Savings', kind: 'owner_cash', amount: 5_000, confirmed: true },
    { id: 'y', label: 'Loan', kind: 'loan', amount: 25_000, confirmed: false },
  ];

  test('working capital is monthly costs times the months chosen', () => {
    const t = budgetTotals(costs, sources, 3);
    expect(t.workingCapital).toBe(6_000);
    expect(t.projectCost).toBe(46_000);
    expect(t.gap).toBe(16_000);
    expect(t.confirmedSources).toBe(5_000);
    expect(t.unquotedOneTime).toBe(10_000);
    expect(t.ownerSharePct).toBeCloseTo((5_000 / 46_000) * 100, 5);
  });

  test('negative or blank amounts never reduce the total', () => {
    const t = budgetTotals([{ id: 'z', label: 'x', kind: 'one_time', amount: -500, quoted: false }], [], 0);
    expect(t.projectCost).toBe(0);
    expect(t.ownerSharePct).toBeNull();
  });

  test('the CSV export escapes commas and carries the gap', () => {
    const csv = budgetCsv([{ ...costs[0], label: 'Oven, commercial' }], sources, 0);
    expect(csv).toContain('"Oven, commercial"');
    expect(csv).toContain('Funding gap still to find');
    expect(csv.split('\n')[0]).toBe('Section,Item,Type,Amount (CAD),Quote or confirmation');
  });
});
