/**
 * Institutions that publish support for the cost of a business plan, for
 * /guides/business-plan-funding.
 *
 * Every `published` line restates the institution's own page, read on
 * `checkedOn`, and `quote` is a short verbatim extract from that page. The
 * plan this guide comes from says: compare official support, approval before
 * spending, consultant costs and owner contributions, and do NOT repeat a
 * blanket 75 percent claim. Two institutions publish 75 percent, each with
 * its own conditions; the rest publish no percentage, and the page says so.
 *
 * Guarded by src/data/__tests__/businessPlanFunding.test.ts.
 */
export interface PlanSupport {
  institution: string;
  /** Province or territory codes served, from the institution's own page. */
  regions: string[];
  serves: string;
  url: string;
  checkedOn: string;
  /** What the page publishes, in our words. */
  published: string;
  /** A short verbatim extract from the page. */
  quote: string;
  /** Published share of the cost, if the page states one. */
  share?: string;
  /** Published cap, if the page states one. */
  cap?: string;
  /** True when the page states approval is needed before work starts. */
  approvalFirst?: boolean;
}

export const PLAN_SUPPORT_CHECKED = '2026-11-02';

export const PLAN_SUPPORT: PlanSupport[] = [
  {
    institution: 'First Peoples Economic Growth Fund',
    regions: ['MB'],
    serves: 'Members of a First Nation with a headquarter location in Manitoba, aged 18 and over.',
    url: 'https://firstpeoplesfund.ca/summary-of-programs/business-plan-assistance/',
    checkedOn: '2026-11-02',
    published: 'A Business Plan Assistance program that pays part of a professional consultant’s cost to research and write the plan. The applicant pays the first quarter, names the consultant and supplies a quote, and must not have owned a similar business in the past 12 months.',
    quote: 'Funding available is up to 75% of the costs to a maximum of $20,000.',
    share: 'Up to 75%; the client pays the first 25%',
    cap: '$20,000',
    approvalFirst: true,
  },
  {
    institution: 'Clarence Campeau Development Fund',
    regions: ['SK'],
    serves: 'Métis entrepreneurs and communities in Saskatchewan.',
    url: 'https://www.clarencecampeau.com/programs/',
    checkedOn: '2026-11-02',
    published: 'A Business Plan Program that lets entrepreneurs hire professional consultants to write a plan that will attract financing. The share is a maximum the fund “can consider”, not an entitlement.',
    quote: 'CCDF can consider funding up to 75% of the costs.',
    share: 'Up to 75%, at the fund’s discretion',
  },
  {
    institution: "Tale'awtxw Aboriginal Capital Corporation (TACC)",
    regions: ['BC'],
    serves: 'Aboriginal entrepreneurs in Coast Salish territory.',
    url: 'https://www.tacc.ca/funding/',
    checkedOn: '2026-11-02',
    published: 'Its Business Equity Program will consider non-repayable contributions for business plans alongside capital and other business support, subject to other financing being in place. No share for the plan itself is published.',
    quote: 'Non-repayable contributions for business plans, marketing and other related business support services will also be considered.',
  },
  {
    institution: 'Nuu-chah-nulth Economic Development Corporation (NEDC)',
    regions: ['BC'],
    serves: 'Indigenous entrepreneurs and First Nation community-owned businesses on Vancouver Island.',
    url: 'https://nedc.info/financing-programs/',
    checkedOn: '2026-11-02',
    published: 'Funds feasibility studies and business plans as part of its financing programs, with a dedicated Business Development Officer for each client. No share is published.',
    quote: 'funding feasibility studies and business plans',
  },
  {
    institution: 'Waubetek Business Development Corporation',
    regions: ['ON'],
    serves: 'Indigenous businesses in its northeastern Ontario service area.',
    url: 'https://www.waubetek.com/',
    checkedOn: '2026-11-02',
    published: 'Lists financing for marketing and business plans alongside capital costs, through its financing application. No share is published.',
    quote: 'Financing is available for Marketing and Business Plans as well as for capital costs.',
  },
  {
    institution: 'Métis Voyageur Development Fund (MVDF)',
    regions: ['ON'],
    serves: 'Ontario Métis-owned and controlled businesses.',
    url: 'https://www.mvdf.ca/',
    checkedOn: '2026-11-02',
    published: 'Offers professional help and non-repayable support for a business plan as part of a loan application, so it is tied to borrowing rather than offered on its own. No share is published.',
    quote: 'Professional assistance and non-repayable financial support for a business plan as part of your loan application.',
  },
];

/** Institutions whose pages describe help writing the plan, not money for it. */
export const PLAN_HELP_ONLY: { institution: string; regions: string[]; url: string; note: string }[] = [
  { institution: 'Louis Riel Capital Corporation', regions: ['MB'], url: 'https://lrcc.mb.ca/', note: 'Describes assisting with the development of your business plan.' },
  { institution: 'Métis Financial Corporation of BC', regions: ['BC'], url: 'https://www.mfcbc.ca/', note: 'Describes business planning support for qualified applicants.' },
  { institution: 'Apeetogosan (Métis) Development', regions: ['AB'], url: 'https://apeetogosan.com/', note: 'Lists business planning among its advisory and support services.' },
];
