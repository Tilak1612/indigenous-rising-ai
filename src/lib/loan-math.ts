/**
 * Loan repayment arithmetic for /tools/business-loan-calculator.
 *
 * Ordinary (blended principal and interest) amortization: every payment is the
 * same amount. The annual rate is treated as a nominal rate compounded at the
 * payment frequency, which is how most business term loans are quoted. A
 * lender's own terms (fees, compounding, interest-only periods, balloon
 * payments) can differ, so the page labels every result as an estimate, never
 * a quote.
 */
export type PaymentFrequency = 'monthly' | 'biweekly' | 'weekly';

export const PERIODS_PER_YEAR: Record<PaymentFrequency, number> = {
  monthly: 12,
  biweekly: 26,
  weekly: 52,
};

export const FREQUENCY_LABELS: Record<PaymentFrequency, string> = {
  monthly: 'Monthly',
  biweekly: 'Every two weeks',
  weekly: 'Weekly',
};

export interface LoanInput {
  principal: number;
  /** Annual percentage rate, e.g. 8.5 for 8.5%. */
  annualRatePct: number;
  termYears: number;
  frequency: PaymentFrequency;
}

export interface YearRow {
  year: number;
  principalPaid: number;
  interestPaid: number;
  closingBalance: number;
}

export interface LoanResult {
  payment: number;
  paymentCount: number;
  totalRepaid: number;
  totalInterest: number;
  byYear: YearRow[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Validates the inputs; returns a message for the first problem, or null. */
export function loanInputError(i: LoanInput): string | null {
  if (!Number.isFinite(i.principal) || i.principal <= 0) return 'Enter a loan amount above zero.';
  if (i.principal > 100_000_000) return 'Enter a loan amount under $100,000,000.';
  if (!Number.isFinite(i.annualRatePct) || i.annualRatePct < 0) return 'Enter an interest rate of zero or more.';
  if (i.annualRatePct > 60) return 'Enter an interest rate of 60% or less.';
  if (!Number.isFinite(i.termYears) || i.termYears <= 0) return 'Enter a term above zero years.';
  if (i.termYears > 40) return 'Enter a term of 40 years or less.';
  return null;
}

/** The level payment per period. A zero rate is straight-line principal. */
export function periodicPayment(i: LoanInput): number {
  const periods = PERIODS_PER_YEAR[i.frequency];
  const n = Math.round(i.termYears * periods);
  const r = i.annualRatePct / 100 / periods;
  if (r === 0) return i.principal / n;
  return (i.principal * r) / (1 - Math.pow(1 + r, -n));
}

export function calculateLoan(i: LoanInput): LoanResult {
  const periods = PERIODS_PER_YEAR[i.frequency];
  const n = Math.round(i.termYears * periods);
  const r = i.annualRatePct / 100 / periods;
  const payment = periodicPayment(i);

  let balance = i.principal;
  let totalInterest = 0;
  const byYear: YearRow[] = [];
  let yearPrincipal = 0;
  let yearInterest = 0;

  for (let k = 1; k <= n; k++) {
    const interest = balance * r;
    // The last payment clears whatever floating-point residue is left.
    const principalPart = k === n ? balance : payment - interest;
    balance -= principalPart;
    totalInterest += interest;
    yearPrincipal += principalPart;
    yearInterest += interest;
    if (k % periods === 0 || k === n) {
      byYear.push({
        year: Math.ceil(k / periods),
        principalPaid: round2(yearPrincipal),
        interestPaid: round2(yearInterest),
        closingBalance: round2(Math.max(0, balance)),
      });
      yearPrincipal = 0;
      yearInterest = 0;
    }
  }

  return {
    payment: round2(payment),
    paymentCount: n,
    totalRepaid: round2(i.principal + totalInterest),
    totalInterest: round2(totalInterest),
    byYear,
  };
}

export const formatCad = (n: number) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 2 }).format(n);
