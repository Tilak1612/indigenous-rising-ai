/**
 * Published equity rules shown on /guides/indigenous-funding-equity-requirements.
 *
 * Approved by the owner on PR #275. Two comments were posted; the later and
 * narrower one is applied: "Approved rows: First Peoples Economic Growth
 * Fund, Waubetek. Publish only these." The other three rows in
 * docs/review/lender-equity-figures.md stay unpublished until approved. Each `summary` is the approved
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
];
