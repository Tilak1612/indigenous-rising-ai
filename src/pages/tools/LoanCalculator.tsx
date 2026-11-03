import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ResourcePage, RELATED } from '@/components/resources/ResourcePage';
import {
  calculateLoan, loanInputError, formatCad, FREQUENCY_LABELS, PERIODS_PER_YEAR, type PaymentFrequency,
} from '@/lib/loan-math';

const ROUTE = '/tools/business-loan-calculator';
const field = 'mt-1 block w-full min-h-[44px] rounded-lg border border-input bg-background px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring';

/**
 * Business loan calculator. Every number comes from what the visitor types:
 * no rate is suggested, no lender is implied, and the result is labelled an
 * estimate. The arithmetic lives in src/lib/loan-math.ts and is tested there,
 * including the zero-interest case.
 */
export default function LoanCalculator() {
  const [principal, setPrincipal] = useState('50000');
  const [rate, setRate] = useState('');
  const [term, setTerm] = useState('5');
  const [frequency, setFrequency] = useState<PaymentFrequency>('monthly');

  const input = { principal: Number(principal), annualRatePct: Number(rate), termYears: Number(term), frequency };
  const ready = rate.trim() !== '';
  const error = ready ? loanInputError(input) : null;
  // Cheap enough to recompute on every render: at most 2,080 payments.
  const result = ready && !error ? calculateLoan(input) : null;

  return (
    <ResourcePage
      route={ROUTE}
      crumb="Business loan calculator"
      heading="Business loan calculator"
      intro={
        <>
          <p>
            Estimate the regular payment on a business loan from three numbers you supply: the amount, the
            annual interest rate and the term. It also shows the total interest and how the balance falls
            each year.
          </p>
          <p>
            This is arithmetic, not a quote. A lender sets the real rate, fees and conditions after reviewing
            your application, and Indigenous Rising AI does not lend money or decide who qualifies.
          </p>
        </>
      }
      related={[RELATED.lenders, RELATED.budget, RELATED.equity, RELATED.loans]}
    >
      <section className="grid lg:grid-cols-2 gap-8 mb-12" aria-labelledby="calc-heading">
        <h2 id="calc-heading" className="sr-only">Calculator</h2>
        <form className="rounded-2xl border-2 border-border p-6 space-y-5" onSubmit={(e) => e.preventDefault()}>
          <label className="block text-sm font-medium text-foreground">
            Loan amount (CAD)
            <input className={field} type="number" inputMode="decimal" min="1" step="100" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Annual interest rate (%)
            <input className={field} type="number" inputMode="decimal" min="0" step="0.05" placeholder="Use the rate a lender quoted you" value={rate} onChange={(e) => setRate(e.target.value)} />
            <span className="block text-xs font-normal text-muted-foreground mt-1">We do not fill this in. Ask the lender, or try a few rates to see the range.</span>
          </label>
          <label className="block text-sm font-medium text-foreground">
            Term (years)
            <input className={field} type="number" inputMode="decimal" min="0.5" step="0.5" value={term} onChange={(e) => setTerm(e.target.value)} />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Payment frequency
            <select className={field} value={frequency} onChange={(e) => setFrequency(e.target.value as PaymentFrequency)}>
              {(Object.keys(FREQUENCY_LABELS) as PaymentFrequency[]).map((f) => (
                <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>
              ))}
            </select>
          </label>
        </form>

        <div className="rounded-2xl bg-muted/40 border border-border p-6" aria-live="polite">
          {!ready && <p className="text-muted-foreground">Enter an interest rate to see the estimate.</p>}
          {error && <p role="alert" className="text-destructive font-medium">{error}</p>}
          {result && (
            <>
              <p className="text-sm text-muted-foreground">Estimated {FREQUENCY_LABELS[frequency].toLowerCase()} payment</p>
              <p className="font-display text-4xl font-bold text-foreground mt-1">{formatCad(result.payment)}</p>
              <dl className="grid grid-cols-2 gap-4 mt-6 text-sm">
                <div><dt className="text-muted-foreground">Number of payments</dt><dd className="font-semibold text-foreground">{result.paymentCount}</dd></div>
                <div><dt className="text-muted-foreground">Total interest</dt><dd className="font-semibold text-foreground">{formatCad(result.totalInterest)}</dd></div>
                <div><dt className="text-muted-foreground">Total repaid</dt><dd className="font-semibold text-foreground">{formatCad(result.totalRepaid)}</dd></div>
                <div><dt className="text-muted-foreground">Payments a year</dt><dd className="font-semibold text-foreground">{PERIODS_PER_YEAR[frequency]}</dd></div>
              </dl>
              <div className="overflow-x-auto mt-6">
                <table className="w-full text-sm">
                  <caption className="text-left text-muted-foreground mb-2">Balance at the end of each year</caption>
                  <thead><tr className="text-left text-muted-foreground"><th className="py-1 pr-3 font-medium">Year</th><th className="py-1 pr-3 font-medium">Principal</th><th className="py-1 pr-3 font-medium">Interest</th><th className="py-1 font-medium">Balance</th></tr></thead>
                  <tbody>
                    {result.byYear.map((y) => (
                      <tr key={y.year} className="border-t border-border"><td className="py-1 pr-3">{y.year}</td><td className="py-1 pr-3">{formatCad(y.principalPaid)}</td><td className="py-1 pr-3">{formatCad(y.interestPaid)}</td><td className="py-1">{formatCad(y.closingBalance)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" onClick={() => window.print()} className="mt-6 min-h-[44px] px-4 rounded-lg border border-border text-sm font-medium hover:border-primary/50">
                Print these results
              </button>
            </>
          )}
        </div>
      </section>

      <section className="mb-12 space-y-4 text-muted-foreground leading-relaxed" aria-labelledby="how-heading">
        <h2 id="how-heading" className="font-display text-2xl font-bold text-foreground">How the estimate is worked out</h2>
        <p>
          The calculator assumes an ordinary blended loan: every payment is the same amount, and each one
          covers that period&apos;s interest first, with the rest reducing the balance. The annual rate is
          divided by the number of payments in a year, and the payment is the standard amortization amount:
          the loan amount times the periodic rate, divided by one minus one-plus-the-rate raised to the
          negative number of payments. At a zero rate, the payment is simply the amount divided by the number
          of payments.
        </p>
        <p>Real loans can differ in ways this cannot see:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>application, administration or prepayment fees;</li>
          <li>a different compounding period from the payment period;</li>
          <li>interest-only months at the start, or a payment holiday;</li>
          <li>a variable rate, or a final balloon payment;</li>
          <li>a non-repayable contribution paired with the loan, which lowers what you borrow.</li>
        </ul>
        <p>
          Indigenous Financial Institutions often combine a loan with business support, and some programmes
          pair repayable and non-repayable money. If that applies to you, borrow only the repayable part here.
          See <Link to={RELATED.equity.to} className="text-primary font-medium">how owner equity and matching funds work</Link>.
        </p>
      </section>

      <section className="mb-4 space-y-4 text-muted-foreground leading-relaxed" aria-labelledby="afford-heading">
        <h2 id="afford-heading" className="font-display text-2xl font-bold text-foreground">Can the business carry the payment?</h2>
        <p>
          A lender will compare the payment with the cash the business expects to have left each month after
          its other costs. Put the payment into a{' '}
          <Link to={RELATED.cashFlow.to} className="text-primary font-medium">12-month cash flow forecast</Link>{' '}
          and check the months when sales are slow, not only the average. If the payment only fits in a good
          month, a longer term, a smaller loan or more of your own money may be the safer plan.
        </p>
      </section>
    </ResourcePage>
  );
}
