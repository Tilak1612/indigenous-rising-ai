/**
 * What different Indigenous lenders publish as their application documents,
 * shown on /guides/funding-document-checklist-by-lender.
 *
 * Every `items` entry is verbatim from the lender's own checklist, form or
 * page on LENDER_DOCS_CHECKED (some PDF items rejoined from column layout).
 * The matrix records only what those sources name: '-' means "not named in
 * the source we read", never "not required". Lender figures such as loan
 * maximums are deliberately left out: TRICORP's own pages disagree, and this
 * page is about documents.
 *
 * Guarded by src/data/__tests__/lenderDocuments.test.ts.
 */
export type Mark = 'Y' | 'C' | '-';

export const LENDER_DOCS_CHECKED = '2026-11-03';

export const DOC_TYPES = [
  { id: 'application', label: 'Completed, signed application form' },
  { id: 'plan', label: 'Business plan' },
  { id: 'cashflow', label: 'Cash flow or financial projections' },
  { id: 'networth', label: 'Personal net worth statement' },
  { id: 'identity', label: 'Proof of Indigenous identity' },
  { id: 'photoid', label: 'Government ID' },
  { id: 'resume', label: 'Resume' },
  { id: 'equity', label: 'Proof of your cash equity' },
  { id: 'quotes', label: 'Quotes for purchases' },
  { id: 'registration', label: 'Registration, incorporation or partnership documents' },
  { id: 'historical', label: 'Past business financial statements' },
  { id: 'credit', label: 'Credit check consent' },
] as const;

export type DocTypeId = (typeof DOC_TYPES)[number]['id'];

export interface LenderDocs {
  id: string;
  name: string;
  region: string;
  url: string;
  source: string;
  items: string[];
  marks: Record<DocTypeId, Mark>;
  caveat?: string;
}

const m = (...v: Mark[]): Record<DocTypeId, Mark> =>
  Object.fromEntries(DOC_TYPES.map((d, i) => [d.id, v[i]])) as Record<DocTypeId, Mark>;

//                    app plan cash net  id  pid res  eq quo reg hist cred
export const LENDER_DOCS: LenderDocs[] = [
  {
    id: 'tricorp', name: 'TRICORP', region: 'Northern British Columbia',
    url: 'https://tricorp.ca/programs/business-development-loans/', source: 'Business development application checklist',
    items: [
      'A signed application form must be completed in full, especially the net worth section.',
      'Individual(s): A copy of status card (front & back), Nisga’a Citizen Card, Metis card, birth certificate & Driver’s License.',
      'Business plan should include 3-Year projected cash flow, income statement & balance sheet.',
      'Evidence of cash equity (copy of Bank statement with Applicant’s name, 1 pg.) must be provided prior to processing the loan.',
      'Price quotes from vendors & supplies for equipment and stock to be purchased.',
      'Band-owned business must provide a Band Council Resolution and/or Board of Director’s motion authorizing the application for the business loan.',
    ],
    marks: m('Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'C', 'Y'),
    caveat: 'The checklist file is labelled as revised in December 2020. Confirm it is current with TRICORP.',
  },
  {
    id: 'futurpreneur', name: 'Futurpreneur, Indigenous Entrepreneur Startup Program', region: 'National',
    url: 'https://futurpreneur.ca/en/offering/indigenous-entrepreneur-startup/', source: 'Programme and eligibility pages',
    items: [
      'submit your full application (including business plan and cash flow) before your 40th birthday.',
      'You agree to provide authorization for Futurpreneur to carry out a personal credit check (hard inquiry).',
      'we determine Indigenous identity through self-identification.',
    ],
    marks: m('-', 'Y', 'Y', '-', '-', '-', '-', '-', '-', '-', '-', 'Y'),
    caveat: 'Publishes no itemized checklist, so most rows are blank. Ask Futurpreneur what else it needs.',
  },
  {
    id: 'aiic', name: 'Alberta Indian Investment Corporation (SEAP grant)', region: 'Alberta',
    url: 'https://aiicbusiness.org/wp-content/uploads/2025/10/SEAP-Program-Overview.pdf', source: 'SEAP programme overview, required documents',
    items: [
      'Status Card (front and back)',
      'Proof of Alberta residency',
      'Business plan & 12-month cash flow',
      'Quotes/estimates for project costs',
      'Résumé(s) showing 12+ months of experience',
      'Financial statements (past 3 years for existing businesses)',
    ],
    marks: m('Y', 'Y', 'Y', 'Y', 'Y', '-', 'Y', 'Y', 'Y', 'C', 'C', 'Y'),
    caveat: 'These are the documents for its Status Entrepreneur Assistance Program grant. Its loan application form has no attachment checklist.',
  },
  {
    id: 'nedc', name: 'NEDC', region: 'Vancouver Island',
    url: 'https://www.nedc.info/financing-programs/how-to-apply/', source: 'How to apply page',
    items: [
      'Complete the NEDC Business Plan Workbook or equivalent',
      'Complete the Cash Flow worksheet',
      'Complete a Family Budget',
      'Have proof of heritage ready (Status card, MNBC card etc)',
      'Proof of sufficient personal funds to inject into the project/business',
      '*Note: this is a generic list and may vary project to project. Your BDO may request additional documents*',
    ],
    marks: m('Y', 'Y', 'Y', '-', 'Y', 'Y', 'Y', 'Y', '-', 'C', 'C', '-'),
  },
  {
    id: 'waubetek', name: 'Waubetek Business Development Corporation', region: 'Northeastern Ontario',
    url: 'https://www.waubetek.com/application-process', source: 'Application process page',
    items: [
      'Application;',
      'Resume;',
      'Summary of Project;',
      'Documentation of Aboriginal Ancestry, driver’s license and birth certificate;',
      'Applicant’s Cash Equity Confirmation & Documentation.',
      'Once client eligibility is established, a full consulting proposal/marketing plan/business plan/business valuation is requested.',
    ],
    marks: m('Y', 'Y', '-', '-', 'Y', 'Y', 'Y', 'Y', '-', 'C', '-', '-'),
  },
  {
    id: 'ccdf', name: 'Clarence Campeau Development Fund', region: 'Saskatchewan (Métis)',
    url: 'https://www.clarencecampeau.com/programs/', source: 'Application checklist in the funding application',
    items: [
      'All sections of the Personal Financial Statement are fully completed, signed, dated, and witnessed – for each business owner',
      'A copy of your MN-S Card is attached',
      'A detailed resume highlighting relevant skills, experience, and education - for each business owner',
      'Quotes for any costs listed on page 4 of the Funding Application',
      'Three (3) years of business financial statements are attached (required if expanding an existing business)',
    ],
    marks: m('Y', '-', '-', 'Y', 'Y', 'Y', 'Y', '-', 'Y', 'Y', 'C', 'Y'),
  },
  {
    id: 'lrcc', name: 'Louis Riel Capital Corporation', region: 'Manitoba (Red River Métis)',
    url: 'https://www.lrcc.mb.ca/business-grant-and-loan-program', source: 'Application checklist in the grant and loan application',
    items: [
      'MMF Citizenship card, or letter from MMF Central Registry Office and Genealogy documents confirming Metis Heritage. – Each Métis owner must submit.',
      'Bank/Investment Statements showing funds on hand for at least 30 days.',
      'CRA Notice of Assessments for previous 2 years. – Each owner must submit.',
      'Void Cheque for account where proposed loan payments will be deducted.',
      'Provide quotes to support the estimated project costs.',
    ],
    marks: m('Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'C', 'Y', 'Y', 'Y', 'C', 'Y'),
  },
  {
    id: 'apeetogosan', name: 'Apeetogosan (Métis) Development', region: 'Alberta (Métis)',
    url: 'https://www.apeetogosan.com/faqs', source: 'FAQ on supporting documents',
    items: [
      'Quotes or estimates for equipment, supplies, or project costs',
      'Proof of Métis Heritage',
      'Proof of your 10% cash equity',
      'Letters of interest - Letter or emails that show demand or interest for your product or service. Preferably from 3 different sources',
      'Business financial statements for the last 2 years (if applying as an existing business for expansion funding)',
    ],
    marks: m('Y', '-', '-', '-', 'Y', 'Y', 'Y', 'Y', 'Y', 'C', 'C', 'Y'),
  },
  {
    id: 'fpegf', name: 'First Peoples Economic Growth Fund', region: 'Manitoba (First Nations)',
    url: 'https://firstpeoplesfund.ca/summary-of-programs/entrepreneur-loan-program/', source: 'Checklist of required documents in the 2026 application',
    items: [
      'Business plan',
      '3 years of financial statements (existing/ acquisition)',
      'Quotes for major capital purchases',
      'Proof of minimum 5% equity for EL/JV, unless BCF Non-Repayable Contribution program selected then 10% equity required',
      'Confirmation of any other commercial financing',
    ],
    marks: m('Y', 'Y', '-', '-', 'Y', '-', '-', 'Y', 'Y', '-', 'C', 'Y'),
  },
  {
    id: 'tacc', name: 'Tale’awtxw Aboriginal Capital Corporation', region: 'Coast Salish territory, BC',
    url: 'https://www.tacc.ca/funding/', source: 'Supporting documentation checklist in the application',
    items: [
      'Evidence of Aboriginal ancestry (ie. scan or photocopy of Aboriginal ID)',
      'Evidence of sufficient personal cash equity to undertake the proposed project',
      'Proof of commitments from other financial sources',
      'Projected financial statements for 3 years',
      'Note: Failure to provide these documents with your Application will cause delays in assessing your project.',
    ],
    marks: m('Y', 'C', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', '-', 'Y', 'C', 'Y'),
    caveat: 'The application form linked from its funding page is dated 2016. Confirm it is current with TACC.',
  },
];

/** Lenders we checked that publish no document list. */
export const NO_PUBLISHED_LIST = [
  { name: 'BDC, Indigenous Entrepreneur Loan', url: 'https://www.bdc.ca/en/i-am/indigenous-entrepreneur', note: 'Its online form collects project and contact details, and a representative follows up. No document list is published.' },
  { name: 'All Nations Trust Company', url: 'https://www.antco.ca/entrepreneurs/', note: 'Its entrepreneurs page leads to booking a call. No document list is published.' },
];

export const countMarked = (id: DocTypeId, mark: Mark = 'Y') => LENDER_DOCS.filter((l) => l.marks[id] === mark).length;
