/**
 * The dated change log at /guides/funding-program-changes.
 *
 * One entry per change we saw on a funder's own page: an intake opening or
 * closing, a programme renamed, or terms that changed. Each entry links the
 * page it was read from. `date` is when the change took effect if the funder
 * states it, otherwise the day we saw it (`dateKind: 'observed'`). A month-only
 * date ('2026-06') means the funder gave the month and not the day.
 *
 * Owner: the Indigenous Rising AI team. Add an entry whenever a programme
 * re-check finds a change, newest first. Guarded by
 * src/data/__tests__/fundingChanges.test.ts.
 */
export type ChangeKind = 'closed' | 'opened' | 'renamed' | 'terms';
export type ChangeApplicant = 'individual' | 'community' | 'organizations';

export interface FundingChange {
  date: string;
  dateKind: 'effective' | 'observed';
  kind: ChangeKind;
  programme: string;
  funder: string;
  region: string;
  applicant: ChangeApplicant;
  what: string;
  url: string;
  checkedOn: string;
}

export const CHANGES_CHECKED = '2026-11-03';

export const KIND_LABELS: Record<ChangeKind, string> = {
  closed: 'Intake closed',
  opened: 'Intake open',
  renamed: 'Renamed or moved',
  terms: 'Terms changed',
};

export const APPLICANT_LABELS: Record<ChangeApplicant, string> = {
  individual: 'Entrepreneurs',
  community: 'Nations and community businesses',
  organizations: 'Not-for-profit organizations',
};

export const FUNDING_CHANGES: FundingChange[] = [
  {
    date: '2026-11-03', dateKind: 'observed', kind: 'terms',
    programme: 'Indigenous Entrepreneur Startup Program', funder: 'Futurpreneur', region: 'Canada', applicant: 'individual',
    what: 'The page now describes "collateral-free loan financing of up to $75,000" (it previously said equity-free), and adds up to $40,000 in follow-on financing in collaboration with RBC Origins. Ages 18 to 39 and the 24-month operating limit are unchanged.',
    url: 'https://futurpreneur.ca/en/offering/indigenous-entrepreneur-startup/', checkedOn: '2026-11-03',
  },
  {
    date: '2026-11-03', dateKind: 'observed', kind: 'terms',
    programme: 'Métis women entrepreneur program', funder: 'Métis Financial Corporation of BC', region: 'British Columbia', applicant: 'individual',
    what: 'MFC says it is working to relaunch its Métis women entrepreneur program under a new name, marked "Coming 2026", with a waitlist. The Sophie Morigeau program terms are still on the page.',
    url: 'https://mfcbc.ca/services/smwep-program/', checkedOn: '2026-11-03',
  },
  {
    date: '2026-11-03', dateKind: 'observed', kind: 'opened',
    programme: 'WES Ecosystem Fund, 2027 call for proposals', funder: 'Innovation, Science and Economic Development Canada', region: 'Canada', applicant: 'organizations',
    what: 'The 2027 call is open until 9 November 2026 (11:59 pm PST). It funds not-for-profit organizations that support women entrepreneurs, with project budgets of $250,000 to $6,000,000; individual entrepreneurs cannot apply.',
    url: 'https://ised-isde.canada.ca/site/ised/en/programs-and-initiatives/women-entrepreneurship-strategy/wes-ecosystem-fund', checkedOn: '2026-11-03',
  },
  {
    date: '2026-11-03', dateKind: 'observed', kind: 'closed',
    programme: 'Aboriginal Business Investment Fund (ABIF)', funder: 'Government of Alberta', region: 'Alberta', applicant: 'community',
    what: 'The 2026-27 grant intake is closed. Alberta says information on the 2027-28 intake is expected in spring 2027. ABIF funds Indigenous communities and businesses they own, not individual entrepreneurs.',
    url: 'https://www.alberta.ca/aboriginal-business-investment-fund', checkedOn: '2026-11-03',
  },
  {
    date: '2026-11-03', dateKind: 'observed', kind: 'closed',
    programme: 'Indigenous Reconciliation Initiative, Economic Stream', funder: 'Government of Alberta', region: 'Alberta', applicant: 'community',
    what: 'The 2026-27 grant intake is closed, with 2027-28 information expected in spring 2027. It funds feasibility studies and business plans for community-owned projects, up to $100,000.',
    url: 'https://www.alberta.ca/indigenous-reconciliation-initiative-economic-stream', checkedOn: '2026-11-03',
  },
  {
    date: '2026-11-03', dateKind: 'observed', kind: 'closed',
    programme: 'BC Indigenous Clean Energy Initiative (BCICEI)', funder: 'New Relationship Trust', region: 'British Columbia', applicant: 'community',
    what: 'Applications are closed; NRT says the initiative will reopen in late 2026.',
    url: 'https://newrelationshiptrust.ca/indigenous-clean-energy-initiative-bcicei/', checkedOn: '2026-11-03',
  },
  {
    date: '2026-06', dateKind: 'effective', kind: 'terms',
    programme: 'Women Entrepreneurship Loan Fund', funder: 'Innovation, Science and Economic Development Canada', region: 'Canada', applicant: 'individual',
    what: 'A further $59 million was invested in June 2026 through the renewal of the Women Entrepreneurship Strategy. Loans of up to $50,000 are delivered by NACCA, WEOC, Nventure and Evol, which ISED says are accepting applications.',
    url: 'https://ised-isde.canada.ca/site/ised/en/node/440', checkedOn: '2026-11-03',
  },
  {
    date: '2026-04-30', dateKind: 'effective', kind: 'closed',
    programme: 'First Nations Clean Energy Business Fund', funder: 'Province of British Columbia', region: 'British Columbia', applicant: 'community',
    what: 'The 2026 intake closed on 30 April 2026. The fund is for bands and Indigenous governing bodies.',
    url: 'https://www2.gov.bc.ca/gov/content/environment/natural-resource-stewardship/consulting-with-first-nations/first-nations-clean-energy-business-fund', checkedOn: '2026-11-03',
  },
  {
    date: '2025-12-01', dateKind: 'effective', kind: 'closed',
    programme: 'Indigenous Economic Development Fund: Economic Diversification and Regional Partnership grants', funder: 'Government of Ontario', region: 'Ontario', applicant: 'community',
    what: 'Both streams opened on 21 October 2025 and closed on 1 December 2025. On 3 November 2026 no IEDF stream was on Ontario’s list of open funding opportunities.',
    url: 'https://www.ontario.ca/page/funding-indigenous-economic-development', checkedOn: '2026-11-03',
  },
  {
    date: '2025-11-20', dateKind: 'effective', kind: 'closed',
    programme: 'Indigenous Community Capital Grants Program', funder: 'Government of Ontario', region: 'Ontario', applicant: 'community',
    what: 'Applications were accepted until 20 November 2025. The page had not announced a new intake when we read it.',
    url: 'https://www.ontario.ca/page/funding-indigenous-economic-development', checkedOn: '2026-11-03',
  },
  {
    date: '2025-10-01', dateKind: 'effective', kind: 'renamed',
    programme: 'Indigenous Opportunities Financing Program (formerly the Aboriginal Loan Guarantee Program)', funder: 'Building Ontario Fund', region: 'Ontario', applicant: 'community',
    what: 'Ontario renamed the Aboriginal Loan Guarantee Program and moved it from the Ontario Financing Authority to the Building Ontario Fund, which became administrator on 1 October 2025. It guarantees loans or bonds for Indigenous-owned entities buying equity in energy, resource and critical minerals projects.',
    url: 'https://buildingonfund.ca/iofp/', checkedOn: '2026-11-03',
  },
];

/** Corrections to this site's own pages, so a reader can see what we got wrong. */
export interface SiteCorrection { date: string; what: string; page: string }

export const SITE_CORRECTIONS: SiteCorrection[] = [
  { date: '2026-11-03', page: '/blog/indigenous-business-funding-alberta-complete-guide', what: 'Removed an "Alberta Indigenous Business Investment Fund" that does not exist. The real programme is the Aboriginal Business Investment Fund, and it is open to communities only.' },
  { date: '2026-11-03', page: '/blog/indigenous-business-funding-alberta-complete-guide', what: 'Removed a PrairiesCan "Indigenous Women Entrepreneurship Program", which does not appear on PrairiesCan’s pages.' },
  { date: '2026-11-03', page: '/blog/ontario-indigenous-business-funding-programs-grants-support', what: 'Corrected the Ontario loan guarantee, which had been described as a small-business loan guarantee, to the Indigenous Opportunities Financing Program for equity in major projects.' },
  { date: '2026-11-03', page: '/blog/metis-specific-business-funding-economic-development-programs', what: 'Named SMEDCO as Saskatchewan’s Métis Capital Corporation, and replaced "Apeetogosan does not publish its loan ceilings" with its published ranges.' },
  { date: '2026-11-03', page: '/blog/bc-indigenous-business-grants-loans-complete-resource', what: 'Removed services attributed to a "BC Indian Business and Investment Council" and the claim that ANTCO serves all of BC.' },
  { date: '2026-11-03', page: '/funding/indigenous-entrepreneur-startup-program', what: 'Changed "equity-free" to "collateral-free" to match Futurpreneur’s page.' },
];

const ORDER = (d: string) => (d.length === 7 ? `${d}-01` : d);
export const sortedChanges = (list: FundingChange[] = FUNDING_CHANGES) =>
  [...list].sort((a, b) => ORDER(b.date).localeCompare(ORDER(a.date)));
