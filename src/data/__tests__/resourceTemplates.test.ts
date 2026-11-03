import { describe, test, expect } from 'vitest';
import {
  RESOURCE_TEMPLATES, CASH_FLOW_EXAMPLE, BUDGET_EXAMPLE, ONE_PAGE_EXAMPLE, cashFlowCsv, budgetTemplateCsv, EXAMPLE_BUSINESS,
} from '../resourceTemplates';

const sum = (xs: (string | number)[]) => xs.reduce<number>((s, x) => s + (typeof x === 'number' ? x : 0), 0);

describe('downloadable templates', () => {
  test('every template has a blank download and builds non-empty files', () => {
    for (const t of RESOURCE_TEMPLATES) {
      expect(t.downloads.length, t.route).toBeGreaterThan(0);
      for (const d of t.downloads) expect(d.build().length, d.filename).toBeGreaterThan(200);
    }
  });

  test('worked examples are labelled fictional wherever they appear', () => {
    for (const t of RESOURCE_TEMPLATES) {
      if (t.example) expect(t.example.title).toMatch(/\(fictional\)/);
      for (const d of t.downloads.filter((x) => /example/.test(x.filename) && x.mime.startsWith('text/plain'))) {
        expect(d.build()).toMatch(/fictional business/);
      }
    }
  });

  test('the cash flow sheet chains each month to the previous closing balance', () => {
    const lines = cashFlowCsv().trim().split('\n');
    const closingRow = lines.findIndex((l) => l.startsWith('Closing cash')) + 1;
    expect(lines[1]).toContain(`=B${closingRow}`);
    expect(lines.at(-1)).toMatch(/^Closing cash,=B2\+B\d+/);
  });

  test('the budget sheet totals by formula', () => {
    expect(budgetTemplateCsv()).toMatch(/Total,,=SUM\(C2:C8\)/);
  });
});

describe('the fictional example is internally consistent', () => {
  const total = sum(BUDGET_EXAMPLE.map((r) => r[2]));
  const owner = sum(BUDGET_EXAMPLE.map((r) => r[5]));
  const loan = sum(BUDGET_EXAMPLE.map((r) => r[6]));
  const onePage = Object.fromEntries(ONE_PAGE_EXAMPLE);

  test('the one-page plan quotes the budget total, owner share and loan', () => {
    expect(onePage['What it costs to start']).toContain(`$${total.toLocaleString('en-CA')}`);
    expect(onePage['Where the money comes from']).toContain(`$${owner.toLocaleString('en-CA')}`);
    expect(onePage['Where the money comes from']).toContain(`$${loan.toLocaleString('en-CA')}`);
    expect(owner + loan).toBe(total);
  });

  test('the cash flow receives the same equity and loan, and never closes below zero', () => {
    expect(CASH_FLOW_EXAMPLE.rows['Owner equity put in'][0]).toBe(owner);
    expect(CASH_FLOW_EXAMPLE.rows['Loan money received'][0]).toBe(loan);
    let cash = CASH_FLOW_EXAMPLE.opening;
    const inRows = ['Cash sales', 'Payments received from customers', 'Owner equity put in', 'Loan money received', 'Grants or contributions received'];
    for (let m = 0; m < 12; m++) {
      for (const [k, v] of Object.entries(CASH_FLOW_EXAMPLE.rows)) cash += (inRows.includes(k) ? 1 : -1) * (v[m] ?? 0);
      expect(cash, `month ${m + 1}`).toBeGreaterThanOrEqual(0);
    }
  });

  test('the example names one business throughout', () => {
    expect(EXAMPLE_BUSINESS).toBe('Riverbend Books & Payroll');
  });
});
