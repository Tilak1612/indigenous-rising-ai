/**
 * Decision paths on /guides/choosing-funding-business-or-community.
 *
 * Who is applying decides which programme family fits, so each path starts
 * from the applicant, not the programme. Every `quote` is verbatim from the
 * programme's own Indigenous Services Canada page on `checkedOn`. Paths name
 * programme families only; eligibility is decided by the funder, never here.
 *
 * Guarded by src/data/__tests__/fundingPaths.test.ts.
 */
export interface FundingPath {
  id: string;
  applicant: string;
  project: string;
  programme: string;
  quote: string;
  url: string;
  /** Where on this site to go next. */
  next: { to: string; label: string };
  checkedOn: string;
}

export const FUNDING_PATHS_CHECKED = '2026-11-03';

export const FUNDING_PATHS: FundingPath[] = [
  {
    id: 'entrepreneur',
    applicant: 'You, or a business you own',
    project: 'Starting, expanding or buying a business',
    programme: 'Aboriginal Entrepreneurship Program, Access to Capital stream, delivered by Indigenous Financial Institutions and Métis Capital Corporations',
    quote: 'Individual Indigenous entrepreneurs may receive up to $99,999 in funding assistance and eligible Indigenous community businesses may receive up to $250,000.',
    url: 'https://www.sac-isc.gc.ca/eng/1375201178602/1610797286236',
    next: { to: '/indigenous-financial-institutions-directory', label: 'Find the lender that serves you' },
    checkedOn: '2026-11-03',
  },
  {
    id: 'community-opportunity',
    applicant: 'A First Nation or Inuit community, its government, or a business it owns',
    project: 'Getting ready for, or taking part in, a specific economic opportunity',
    programme: 'Community Opportunity Readiness Program (CORP)',
    quote: 'Eligible recipients are First Nation and Inuit communities and their governments, including tribal councils, located in the provinces.',
    url: 'https://www.sac-isc.gc.ca/eng/1100100033417/1613659339457',
    next: { to: '/blog/indigenous-community-economic-development-funding-nation-building', label: 'Community economic development funding' },
    checkedOn: '2026-11-03',
  },
  {
    id: 'community-capacity',
    applicant: 'A First Nation or Inuit community',
    project: 'Running its own economic development function, such as staff and planning',
    programme: 'Lands and Economic Development Services Program (LEDSP), operational and project-based funding',
    quote: 'The program, administered by Indigenous Services Canada (ISC) offers different types of funding to help First Nations and Inuit communities',
    url: 'https://www.sac-isc.gc.ca/eng/1100100033423/1591891942557',
    next: { to: '/for-economic-development-officers', label: 'Tools for economic development officers' },
    checkedOn: '2026-11-03',
  },
  {
    id: 'support-organization',
    applicant: 'An Indigenous organization that supports entrepreneurs',
    project: 'A regional or national project to support entrepreneurship, not a commercial venture',
    programme: 'Aboriginal Entrepreneurship Program, Access to Business Opportunities stream',
    quote: 'We may reimburse up to 100% of costs for eligible activities, up to a maximum of $500,000 per recipient per year.',
    url: 'https://www.sac-isc.gc.ca/eng/1582037564226/1610797399865',
    next: { to: '/for-funders', label: 'For funders and support organizations' },
    checkedOn: '2026-11-03',
  },
];

/** Details quoted on the page beside the paths, from the same pages. */
export const PATH_DETAILS = {
  corpContribution: 'the applicant must contribute a minimum 10% cash contribution for all types of projects',
  corpStatementOfIntent: 'Applicants may submit a brief Statement of Intent prior to submitting a full application.',
  aepNoDeadline: 'There is no deadline to apply.',
  aboNonCommercial: 'Funding may be provided to Indigenous for-profit organizations and entities solely in support of activities that are non-commercial in nature and not intended to generate profit',
} as const;

export const INDIGENOUS_BUSINESS_NAVIGATOR = 'https://www.sac-isc.gc.ca/eng/1676307496843/1676307534313';
