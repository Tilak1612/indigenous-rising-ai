/**
 * Published equity rules shown on /guides/indigenous-funding-equity-requirements.
 *
 * Approved by the owner on PR #275 ("Approved: all lender equity rows"),
 * from docs/review/lender-equity-figures.md. Each `summary` is the approved
 * copy; each `quote` is verbatim from the lender's page on `checkedOn`. These
 * are each lender's own rules, never a rule for all lenders.
 *
 * Guarded by src/data/__tests__/lenderEquity.test.ts.
 */
export interface LenderEquityRule {
  lender: string;
  region: string;
  summary: string;
  quote: string;
  url: string;
  checkedOn: string;
}

export const LENDER_EQUITY_CHECKED = '2026-11-02';

export const LENDER_EQUITY_RULES: LenderEquityRule[] = [
  {
    lender: 'First Peoples Economic Growth Fund',
    region: 'Manitoba',
    summary: 'For its Business Contribution Fund, at least 10% of the project in cash equity from you, a commercial loan of at least 40%, and a non-repayable contribution of up to 40% of eligible costs, to $99,999 for an individual.',
    quote: 'You must have a minimum of 10% cash equity to put into the business. A minimum of a 40% commercial loan is required as part of the total financing of the business.',
    url: 'https://firstpeoplesfund.ca/summary-of-programs/business-contribution-fund/',
    checkedOn: '2026-11-02',
  },
  {
    lender: 'Waubetek Business Development Corporation',
    region: 'Northeastern Ontario',
    summary: 'A 10% unencumbered equity contribution from the applicant.',
    quote: '10% Unencumbered Equity Contribution from applicant',
    url: 'https://www.waubetek.com/',
    checkedOn: '2026-11-02',
  },
  {
    lender: 'Alberta Indian Investment Corporation',
    region: 'Alberta',
    summary: 'Your own equity as a portion of the total financing, with no percentage published.',
    quote: 'contribute their own equity as a portion of the total financing of the business',
    url: 'https://aiicbusiness.org/financial-services/',
    checkedOn: '2026-11-02',
  },
  {
    lender: "Tale'awtxw Aboriginal Capital Corporation",
    region: 'Coast Salish territory, British Columbia',
    summary: 'Its funding supplements your equity and financing and cannot be applied for on its own.',
    quote: 'All funding programs are intended to supplement the applicant equity and finance portions of a business opportunity and cannot be applied for on a standalone basis.',
    url: 'https://www.tacc.ca/funding/',
    checkedOn: '2026-11-02',
  },
  {
    lender: 'Clarence Campeau Development Fund',
    region: 'Saskatchewan (Métis)',
    summary: 'Its equity grant needs an approved loan and is not available on its own.',
    quote: 'The applicant must be approved for the loan request to be eligible for a non-repayable grant.',
    url: 'https://www.clarencecampeau.com/programs/',
    checkedOn: '2026-11-02',
  },
];
