/**
 * The four downloadable preparation templates under /templates/*.
 *
 * Each worked example describes ONE fictional business, Riverbend Books &
 * Payroll, and says so wherever it appears. Its numbers are invented to show
 * how the sheet works. They are not benchmarks, not a typical business, and
 * not drawn from any client: there are no client stories on this site.
 *
 * The cash flow and budget sheets carry spreadsheet formulas, so the download
 * is a working model in Excel, Google Sheets or LibreOffice, not a picture of
 * one. Guarded by src/data/__tests__/resourceTemplates.test.ts.
 */
import type { RelatedLink } from '@/components/resources/ResourcePage';

export const EXAMPLE_BUSINESS = 'Riverbend Books & Payroll';
export const FICTIONAL_NOTE = `${EXAMPLE_BUSINESS} is a fictional business. Its numbers are made up to show how the template works, and are not benchmarks.`;

export interface TemplateDownload { label: string; filename: string; mime: string; build: () => string }

export interface ResourceTemplate {
  route: string;
  crumb: string;
  heading: string;
  intro: string[];
  contentsTitle: string;
  contents: string[];
  howTo: string[];
  example?: { title: string; rows: [string, string][] };
  downloads: TemplateDownload[];
  related: (keyof typeof import('@/components/resources/ResourcePage').RELATED)[];
}

const csvCell = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (rows: (string | number)[][]) => rows.map((r) => r.map(csvCell).join(',')).join('\n') + '\n';
const COLS = 'BCDEFGHIJKLM'.split('');

// ── Cash flow ──────────────────────────────────────────────────────────────
const IN_ROWS = ['Cash sales', 'Payments received from customers', 'Owner equity put in', 'Loan money received', 'Grants or contributions received'];
const OUT_ROWS = ['Inventory and supplies', 'Wages and payroll costs', 'Rent or lease', 'Utilities, phone and internet', 'Insurance', 'Marketing', 'Loan payments', 'Owner draw', 'Other costs'];

export function cashFlowCsv(values?: { opening: number; rows: Record<string, number[]> }): string {
  const header = ['Item', ...COLS.map((_, i) => `Month ${i + 1}`)];
  const out: (string | number)[][] = [header];
  // Row numbers in the sheet (1-based): header is row 1.
  const openingRow = 2;
  const firstIn = 3;
  const lastIn = firstIn + IN_ROWS.length - 1;
  const totalIn = lastIn + 1;
  const firstOut = totalIn + 1;
  const lastOut = firstOut + OUT_ROWS.length - 1;
  const totalOut = lastOut + 1;
  const net = totalOut + 1;
  const closing = net + 1;

  out.push(['Opening cash', ...COLS.map((c, i) => (i === 0 ? (values?.opening ?? '') : `=${COLS[i - 1]}${closing}`))]);
  for (const r of IN_ROWS) out.push([r, ...COLS.map((_, i) => values?.rows[r]?.[i] ?? '')]);
  out.push(['Total cash in', ...COLS.map((c) => `=SUM(${c}${firstIn}:${c}${lastIn})`)]);
  for (const r of OUT_ROWS) out.push([r, ...COLS.map((_, i) => values?.rows[r]?.[i] ?? '')]);
  out.push(['Total cash out', ...COLS.map((c) => `=SUM(${c}${firstOut}:${c}${lastOut})`)]);
  out.push(['Net cash flow', ...COLS.map((c) => `=${c}${totalIn}-${c}${totalOut}`)]);
  out.push(['Closing cash', ...COLS.map((c) => `=${c}${openingRow}+${c}${net}`)]);
  return toCsv(out);
}

const twelve = (n: number) => Array.from({ length: 12 }, () => n);
const ramp = (start: number, step: number) => Array.from({ length: 12 }, (_, i) => start + step * i);
export const CASH_FLOW_EXAMPLE = {
  opening: 0,
  rows: {
    'Payments received from customers': [0, 1800, 2600, 3200, 3800, 4200, 4200, 3400, 4600, 5200, 5600, 6000],
    'Owner equity put in': [6000, ...Array(11).fill(0)],
    'Loan money received': [12470, ...Array(11).fill(0)],
    'Inventory and supplies': [900, ...Array(11).fill(150)],
    // Month 1: the equipment, software, fit-out and legal lines from the budget example.
    'Other costs': [12400, ...Array(11).fill(0)],
    'Wages and payroll costs': [0, 0, 0, ...ramp(1500, 0).slice(0, 9)],
    'Rent or lease': twelve(900),
    'Utilities, phone and internet': twelve(220),
    Insurance: twelve(110),
    Marketing: [600, 300, 300, ...Array(9).fill(150)],
    'Loan payments': [0, ...twelve(305).slice(0, 11)],
    'Owner draw': [0, 0, 0, 0, 0, 0, ...Array(6).fill(800)],
  } as Record<string, number[]>,
};

// ── Project budget ─────────────────────────────────────────────────────────
const BUDGET_HEADER = ['Cost item', 'Category', 'Amount (CAD)', 'Quote from, and date', 'Eligible? (ask the funder)', 'Owner equity', 'Loan', 'Grant or contribution', 'Other source', 'Unfunded'];
export function budgetTemplateCsv(lines?: (string | number)[][]): string {
  const blank: (string | number)[][] = [
    ['', 'Equipment', '', '', '', '', '', '', ''],
    ['', 'Renovation or fit-out', '', '', '', '', '', '', ''],
    ['', 'Vehicles', '', '', '', '', '', '', ''],
    ['', 'Opening inventory', '', '', '', '', '', '', ''],
    ['', 'Professional fees', '', '', '', '', '', '', ''],
    ['', 'Working capital', '', '', '', '', '', '', ''],
    ['', 'Contingency', '', '', '', '', '', '', ''],
  ];
  const body = lines ?? blank;
  const rows: (string | number)[][] = [BUDGET_HEADER];
  body.forEach((l, i) => {
    const r = i + 2;
    rows.push([...l, `=C${r}-SUM(F${r}:I${r})`]);
  });
  const last = body.length + 1;
  rows.push(['Total', '', `=SUM(C2:C${last})`, '', '', `=SUM(F2:F${last})`, `=SUM(G2:G${last})`, `=SUM(H2:H${last})`, `=SUM(I2:I${last})`, `=SUM(J2:J${last})`]);
  return toCsv(rows);
}
export const BUDGET_EXAMPLE: (string | number)[][] = [
  ['Laptops and printer', 'Equipment', 4200, 'Quote, local supplier, 3 Oct', 'Asked, waiting', 1200, 3000, '', ''],
  ['Accounting software, first year', 'Equipment', 1100, 'Published price, 3 Oct', 'Asked, waiting', '', 1100, '', ''],
  ['Office fit-out', 'Renovation or fit-out', 5600, 'Quote, contractor, 8 Oct', 'Asked, waiting', 1800, 3800, '', ''],
  ['Opening supplies', 'Opening inventory', 900, 'Estimate', 'Asked, waiting', 900, '', '', ''],
  ['Incorporation and legal', 'Professional fees', 1500, 'Quote, lawyer, 10 Oct', 'Asked, waiting', 1500, '', '', ''],
  ['Working capital (about three months of fixed costs)', 'Working capital', 4290, 'From cash flow forecast', 'Asked, waiting', 600, 3690, '', ''],
  ['Contingency (about 5%)', 'Contingency', 880, 'Owner decision', 'Asked, waiting', '', 880, '', ''],
];

// ── Text templates ─────────────────────────────────────────────────────────
const ONE_PAGE_FIELDS: [string, string][] = [
  ['The business in one sentence', 'What you sell, to whom, and where.'],
  ['Customers', 'Who buys, specifically. Name the kinds of customers you have already spoken to.'],
  ['The need', 'What problem the customer has today, and what they do about it now.'],
  ['What you offer and the price', 'Your product or service and what you will charge.'],
  ['How customers will find you', 'The two or three ways you will reach them first.'],
  ['Who runs it', 'Your experience, and anyone else the business depends on.'],
  ['What it costs to start', 'The total project cost, and the biggest items in it.'],
  ['Where the money comes from', 'Your own contribution, loans, and any contributions you are applying for.'],
  ['How it pays its way', 'When monthly sales will cover monthly costs, including any loan payment.'],
  ['Benefit to the community', 'Jobs, training, services or local spending, if any. Say which are plans.'],
  ['The first 12 months', 'Three or four milestones, with the month you expect each one.'],
];
export const ONE_PAGE_EXAMPLE: [string, string][] = [
  ['The business in one sentence', 'Bookkeeping and payroll for small businesses and organizations within an hour of town.'],
  ['Customers', 'Owner-run shops, trades and two local non-profits that currently drive to the city for bookkeeping.'],
  ['The need', 'Payroll deadlines are missed and year-end records arrive late, which costs the customers penalties and time.'],
  ['What you offer and the price', 'Monthly bookkeeping packages and per-run payroll, priced per customer after a free first meeting.'],
  ['How customers will find you', 'Referrals from the band office and the hardware store, a listing with the local business association, and a simple website.'],
  ['Who runs it', 'The owner, who has eight years of payroll experience at a regional employer, with one part-time hire from month four.'],
  ['What it costs to start', '$18,470 in total, mostly the office fit-out, equipment and three months of fixed costs.'],
  ['Where the money comes from', '$6,000 of the owner’s savings and a $12,470 loan applied for through the local Indigenous Financial Institution.'],
  ['How it pays its way', 'The cash flow forecast shows monthly receipts covering costs and the loan payment from month five.'],
  ['Benefit to the community', 'Planned: one part-time job filled locally, and bookkeeping kept in town. These are plans, not results yet.'],
  ['The first 12 months', 'Month 1 open; month 3 ten regular clients; month 4 part-time hire; month 12 first full year-end season.'],
];

/** The six-section plan on /indigenous-business-plan-template, for the same fictional business. */
export const PLAN_EXAMPLE: Record<string, string> = {
  vision: 'Riverbend Books & Payroll keeps bookkeeping and payroll in town for small businesses and organizations within an hour of the community. Its aim is that local owners spend their evenings on their business, not on their books.',
  market: 'Owner-run shops, trades and two local non-profits currently drive to the city or do their own books. The owner spoke with six of them in October; four said they would switch, and two asked for payroll first. The nearest competing service is in the city.',
  products: 'Monthly bookkeeping packages, payroll runs and year-end preparation for an accountant. Prices are set per client after a free first meeting, because the work varies with the number of transactions and staff.',
  operations: 'A small office on the main street, open four days a week, with remote work the other days. The owner does the work at first; a part-time assistant, recruited locally, joins in month four. Records are kept in cloud accounting software with two-step sign-in.',
  financial: 'Total start-up cost is $18,470, funded by $6,000 of the owner’s savings and a $12,470 loan. The 12-month cash flow forecast shows receipts covering monthly costs and the loan payment from month five, with a planned dip in month eight.',
  community: 'Planned, not yet true: one part-time local job from month four, training toward a payroll certification, and a bookkeeping service kept in town. Measured each quarter by hours of local employment and number of local clients.',
};

const IMPACT_FIELDS: [string, string][] = [
  ['Jobs', 'How many people work in the business now, and how many you plan to hire. Keep the two separate.'],
  ['Training and skills', 'Any training, mentoring or apprenticeships the business will provide, and for whom.'],
  ['Local purchasing', 'Which suppliers are local or Indigenous-owned, and roughly what share of spending goes to them.'],
  ['Services the community gains', 'What becomes available locally that was not before, or was hard to reach.'],
  ['Community priorities', 'How the business relates to priorities your community has stated. Cite where they were stated.'],
  ['Who you spoke with', 'Leadership, councils, elders, organizations or customers you consulted, and when.'],
  ['How you will measure it', 'What you will count, how often, and who will see the results.'],
  ['What is evidence and what is a projection', 'Mark each statement above as already true, or as a plan.'],
];
export const IMPACT_EXAMPLE: [string, string][] = [
  ['Jobs', 'Now: the owner. Planned: one part-time bookkeeping assistant from month four, recruited locally.'],
  ['Training and skills', 'Planned: the assistant trains toward a payroll certification, with the course fee in the budget.'],
  ['Local purchasing', 'Office supplies and the fit-out contractor are local. The software is not.'],
  ['Services the community gains', 'Bookkeeping and payroll in town, so customers no longer drive to the city.'],
  ['Community priorities', 'Supports the local small-business growth priority in the community economic development plan, which the owner has read.'],
  ['Who you spoke with', 'The economic development officer in September and six prospective customers in October.'],
  ['How you will measure it', 'Hours of local employment and number of local clients, reported each quarter.'],
  ['What is evidence and what is a projection', 'Evidence: the conversations and supplier quotes. Projection: the hire, the training and the client numbers.'],
];

function textTemplate(title: string, fields: [string, string][], example?: [string, string][]): string {
  const lines = [title, '='.repeat(title.length), ''];
  if (example) lines.push(`WORKED EXAMPLE. ${FICTIONAL_NOTE}`, '');
  for (const [i, [label, prompt]] of fields.entries()) {
    lines.push(`${i + 1}. ${label}`, `   ${prompt}`, '');
    lines.push(example ? `   ${example[i][1]}` : '   ', '', '');
  }
  lines.push('From Indigenous Rising AI: https://www.indigenousrising.ai', 'A plan is preparation, not an application. Each funder decides eligibility.');
  return lines.join('\n') + '\n';
}

export const RESOURCE_TEMPLATES: ResourceTemplate[] = [
  {
    route: '/templates/one-page-business-plan',
    crumb: 'One-page business plan',
    heading: 'One-page business plan template for Indigenous entrepreneurs',
    intro: [
      'A one-page plan is the short version of your business: eleven answers that fit on a single sheet. It is what you bring to a first conversation with a lender or an economic development officer, and the outline you expand into a full plan later.',
      'Write it before the full plan. If an answer will not fit in two sentences, that is usually the part of the business that needs more thought.',
    ],
    contentsTitle: 'The eleven boxes',
    contents: ONE_PAGE_FIELDS.map(([l, p]) => `${l}: ${p}`),
    howTo: [
      'Answer every box, even with a rough answer. A blank box is the first question a lender will ask.',
      'Use real numbers where you have them, and mark estimates as estimates.',
      'Show it to the institution you plan to apply to and ask what they would want expanded.',
      'Move each answer into the matching section of the full plan when you are ready.',
    ],
    example: { title: `Worked example: ${EXAMPLE_BUSINESS} (fictional)`, rows: ONE_PAGE_EXAMPLE },
    downloads: [
      { label: 'Download the blank one-page plan', filename: 'one-page-business-plan.txt', mime: 'text/plain;charset=utf-8', build: () => textTemplate('One-page business plan', ONE_PAGE_FIELDS) },
      { label: 'Download the worked example', filename: 'one-page-business-plan-example.txt', mime: 'text/plain;charset=utf-8', build: () => textTemplate('One-page business plan', ONE_PAGE_FIELDS, ONE_PAGE_EXAMPLE) },
    ],
    related: ['planTemplate', 'cashFlow', 'budget', 'impact'],
  },
  {
    route: '/templates/cash-flow-forecast',
    crumb: 'Cash flow forecast template',
    heading: 'Cash flow forecast template for a funding application',
    intro: [
      'A cash flow forecast shows the money coming in and going out of the business each month for the first year. Lenders ask for it because a business can be profitable over a year and still run out of cash in month three.',
      'This template is a working spreadsheet with the totals already built in. Enter your monthly amounts, and each month opens with the cash the previous month closed with.',
    ],
    contentsTitle: 'What is in the sheet',
    contents: [
      'Twelve monthly columns, starting with your opening cash.',
      `Cash in: ${IN_ROWS.join(', ').toLowerCase()}.`,
      `Cash out: ${OUT_ROWS.join(', ').toLowerCase()}.`,
      'Totals, net cash flow and closing cash for each month, calculated by formula.',
    ],
    howTo: [
      'Record money when it actually arrives or leaves, not when you send an invoice.',
      'Put in the slow months honestly. A lender would rather see a dip you planned for than one you did not.',
      'Include the loan payment from the month it starts. The loan calculator gives you the amount.',
      'Any month that closes below zero needs a plan: more working capital, a smaller loan payment, or lower costs.',
    ],
    downloads: [
      { label: 'Download the blank forecast (CSV)', filename: 'cash-flow-forecast-template.csv', mime: 'text/csv;charset=utf-8', build: () => cashFlowCsv() },
      { label: 'Download the worked example (CSV)', filename: 'cash-flow-forecast-example.csv', mime: 'text/csv;charset=utf-8', build: () => cashFlowCsv(CASH_FLOW_EXAMPLE) },
    ],
    related: ['loanCalculator', 'budgetTemplate', 'onePage', 'gaps'],
  },
  {
    route: '/templates/funding-project-budget',
    crumb: 'Funding application budget template',
    heading: 'Funding application budget template and example',
    intro: [
      'A project budget lists every cost of the project and shows which source pays for each one: your own money, a loan, a grant or contribution, or something else. Funders read it alongside the plan to check that the two agree.',
      'The spreadsheet works out what is still unfunded on each line and in total, and has a column for where each quote came from.',
    ],
    contentsTitle: 'The columns',
    contents: [
      'Cost item and category.',
      'Amount, and the quote it comes from with its date.',
      'Whether the funder counts it as eligible, which you confirm with them.',
      'One column per source: owner equity, loan, grant or contribution, and other.',
      'Unfunded, calculated for each line and in total.',
    ],
    howTo: [
      'Start from your plan: every cost the plan mentions belongs on a line here.',
      'Attach quotes for equipment, renovation and vehicles. Mark anything else as an estimate.',
      'Ask the funder which lines are eligible and from what date before you assign their money to them.',
      'A small contingency line is common. Its size is your decision unless the funder sets one.',
    ],
    downloads: [
      { label: 'Download the blank budget (CSV)', filename: 'funding-project-budget-template.csv', mime: 'text/csv;charset=utf-8', build: () => budgetTemplateCsv() },
      { label: 'Download the worked example (CSV)', filename: 'funding-project-budget-example.csv', mime: 'text/csv;charset=utf-8', build: () => budgetTemplateCsv(BUDGET_EXAMPLE) },
    ],
    related: ['budget', 'equity', 'cashFlow', 'lenders'],
  },
  {
    route: '/templates/community-impact-statement',
    crumb: 'Community impact statement',
    heading: 'Community impact statement template for a business plan',
    intro: [
      'Many Indigenous business programmes ask how the business will benefit the community. A community impact statement answers that question in a form a reviewer can check: what is true now, what is planned, and how you will know.',
      'Keep the evidence and the projections apart. A reviewer trusts a short, honest statement more than a long list of hopes.',
    ],
    contentsTitle: 'The eight prompts',
    contents: IMPACT_FIELDS.map(([l, p]) => `${l}: ${p}`),
    howTo: [
      'Only describe community priorities that your community has stated, and say where.',
      'Speak with the people the statement is about before you write about them.',
      'Mark every line as evidence or as a plan.',
      'Choose two or three things to measure that you can actually count.',
    ],
    example: { title: `Worked example: ${EXAMPLE_BUSINESS} (fictional)`, rows: IMPACT_EXAMPLE },
    downloads: [
      { label: 'Download the blank statement', filename: 'community-impact-statement.txt', mime: 'text/plain;charset=utf-8', build: () => textTemplate('Community impact statement', IMPACT_FIELDS) },
      { label: 'Download the worked example', filename: 'community-impact-statement-example.txt', mime: 'text/plain;charset=utf-8', build: () => textTemplate('Community impact statement', IMPACT_FIELDS, IMPACT_EXAMPLE) },
    ],
    related: ['planTemplate', 'onePage', 'gaps', 'directory'],
  },
];

export const templateByRoute = (route: string) => RESOURCE_TEMPLATES.find((t) => t.route === route);
