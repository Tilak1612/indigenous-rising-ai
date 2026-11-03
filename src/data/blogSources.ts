/**
 * Primary sources for blog posts, keyed by slug.
 *
 * A SEO audit on 2026-10-02 found zero external links across all 53 posts,
 * including the ones whose own meta descriptions promise primary-source
 * reporting ("here is what each funder's own page states"). For funding advice
 * that is both a trust problem and the main reason an answer engine will cite
 * the funder instead of us.
 *
 * Rules for adding an entry here:
 *
 *   1. Only list a source you actually opened and read for the claims the post
 *      makes. A citation that was not checked is worse than none, because it
 *      lends the post authority it has not earned.
 *   2. Link the specific page, not a homepage, wherever one exists.
 *   3. Say what the source supports, and when it was read. Funder pages change.
 *
 * Posts are NOT cited just because this file exists. A post without an entry
 * here has not had its claims re-verified, and the page does not pretend
 * otherwise. Merged onto each post in getAllPosts(), the same way seoTitle and
 * faqs are.
 */
export type BlogSource = {
  /** Who published it and what the page is. */
  label: string;
  url: string;
  /** What in the post this source supports. */
  supports: string;
  /** ISO date the page was read for this post. */
  checkedOn: string;
};

const ISC_AEP: BlogSource = {
  label: 'Indigenous Services Canada: Aboriginal Entrepreneurship Program, Access to Capital',
  url: 'https://www.sac-isc.gc.ca/eng/1375201178602/1610797286236',
  supports:
    'The $99,999 individual and $250,000 community-business ceilings, who is eligible, that eligibility varies between IFIs and MCCs, and that applications go to your local institution. The page itself was last modified 10 April 2024.',
  checkedOn: '2026-11-03',
};

const FUTURPRENEUR_IESP: BlogSource = {
  label: 'Futurpreneur: Indigenous Entrepreneur Startup Program',
  url: 'https://futurpreneur.ca/en/offering/indigenous-entrepreneur-startup/',
  supports:
    'The collateral-free loan of up to $75,000, the up to $40,000 follow-on financing with RBC Origins, the up-to-two-years of mentorship, the age 18-39 and 24-month eligibility criteria, self-identification, and that it serves entrepreneurs on or off reserve.',
  checkedOn: '2026-11-03',
};

const NACCA: BlogSource = {
  label: 'National Aboriginal Capital Corporations Association (NACCA)',
  url: 'https://nacca.ca/',
  supports:
    'The size of the Indigenous Financial Institution network (over 50 institutions, more than 54,500 business loans) and where to find the institution serving your region.',
  checkedOn: '2026-11-03',
};

const D = '2026-11-03';
const src = (label: string, url: string, supports: string): BlogSource => ({ label, url, supports, checkedOn: D });

const METIS_SOURCES: BlogSource[] = [
  ISC_AEP,
  src('Métis Financial Corporation of BC: eligibility criteria', 'https://mfcbc.ca/eligibility-criteria/', 'Accepted Métis identification, the six-month BC residency rule, 51% Métis ownership and the equity minimum.'),
  src('Métis Financial Corporation of BC: Sophie Morigeau Women\u2019s Entrepreneurship Program', 'https://mfcbc.ca/services/smwep-program/', 'The $25,000 project limit, the 30% grant applied after on-time repayment, 5% or 10% equity, the 7.5% starting rate and the 2026 relaunch notice.'),
  src('Apeetogosan (Métis) Development Inc.: business financing', 'https://www.apeetogosan.com/business-financing', 'Loan range, the Full-Time, Part-Time and Métis Women Micro-Business programmes with their grant shares and rates.'),
  src('Apeetogosan (Métis) Development Inc.: FAQs', 'https://www.apeetogosan.com/faqs', 'The $100,000 MEAP lifetime limit, the loan requirement, the 690 credit score, decision time and Alberta residency.'),
  src('Settlement Investment Corporation: application kit', 'https://settlementinvestcorp.com/appilcation-kit/', 'Settlement membership, the $100,000 loan limit, 10% equity and the head-office rule.'),
  src('Clarence Campeau Development Fund: programs', 'https://www.clarencecampeau.com/programs/', 'Loan types, programme names, grants not stand-alone, the 75% business plan share, MN-S identification and Saskatchewan residency.'),
  src('SMEDCO: programs', 'https://www.ccdf-smedco.com/programs/', 'Secured interest-bearing loans, the non-repayable MAP grant and the Métis ancestry rule.'),
  src('Louis Riel Capital Corporation: Business Grant & Loan Program', 'https://www.lrcc.mb.ca/business-grant-and-loan-program', 'MMF Citizenship Card and Manitoba residency rules, the $40,000 project threshold and 10% cash.'),
  src('Louis Riel Capital Corporation: Small Business Grant & Loan Program', 'https://www.lrcc.mb.ca/mmf-entrepreneurship-initiative', 'Up to $40,000 of loan and grant, grant shares of up to 40% (youth) and 30%, and terms up to 60 months.'),
  src('Métis Voyageur Development Fund', 'https://mvdf.ca/', 'Financing up to $1,500,000, non-repayable business plan support, the 50% Métis ownership rule, recognized Métis organizations and the Ontario location rule.'),
  src('NWT Métis-Dene Development Fund: programs', 'https://www.mddf.ca/blank-1', 'Term loans up to $100,000, EBD contributions up to $99,999 and the women\u2019s micro-loan split.'),
  FUTURPRENEUR_IESP,
];

const ONTARIO_SOURCES: BlogSource[] = [
  src('Statistics Canada: Indigenous population continues to grow (The Daily, 21 September 2022)', 'https://www150.statcan.gc.ca/n1/daily-quotidien/220921/dq220921a-eng.htm', 'Ontario\u2019s 2021 Indigenous population of 406,590, the largest of any province.'),
  src('Ontario: Funding for Indigenous economic development', 'https://www.ontario.ca/page/funding-indigenous-economic-development', 'The IEDF streams and their 2025 intake dates, the Indigenous Community Capital Grants Program and the New Relationship Fund.'),
  src('Ontario: Available funding opportunities', 'https://www.ontario.ca/page/available-funding-opportunities-ontario-government', 'That no IEDF stream was listed as open on 3 November 2026.'),
  src('Ontario Ministry of Indigenous Affairs and First Nations Economic Reconciliation: 2025-26 published plan', 'https://www.ontario.ca/page/published-plans-and-annual-reports-2025-2026-ministry-indigenous-affairs-and-first-nations-economic-reconciliation', 'That the ministry partners with Ontario\u2019s IFIs to deliver low-interest loans and grants.'),
  src('Building Ontario Fund: Indigenous Opportunities Financing Program', 'https://buildingonfund.ca/iofp/', 'The rename from the Aboriginal Loan Guarantee Program, administration from 1 October 2025, and that it is not a loan or grant programme.'),
  src('FedNor: Indigenous economic development in Northern Ontario', 'https://fednor.canada.ca/en/node/214', 'REGI and NODP, the referral to ISC Ontario, and the four Northern IFIs it names.'),
  src('FedDev Ontario: support for Indigenous businesses', 'https://feddev-ontario.canada.ca/en/node/378', 'Who FedDev\u2019s Indigenous team funds, no deadline and no form before first contact.'),
  src('NOHFC: Indigenous Workforce Development Program', 'https://nohfc.ca/public-program/indigenous-workforce-development-program/', 'The 75% and $52,500 business intern limits and that funding is limited.'),
  src('Nishnawbe Aski Development Fund', 'https://www.nadf.org/indigenous-women', 'Its Northern Ontario service area and the $25,000 women\u2019s and youth programmes split 5% client, 45% grant, 50% loan.'),
  src('Waubetek Business Development Corporation: application process', 'https://www.waubetek.com/application-process', 'The Northeast Ontario location rule and the 10% unencumbered equity contribution.'),
  src('Wakenagun Community Futures Development Corporation', 'https://wakenagun.ca/', 'The Mushkegowuk communities it serves.'),
  src('Two Rivers Community Development Centre: FAQs', 'https://tworivers.ca/faqs/', 'Its service area, loans up to $1,250,000, 10% cash equity, no general grants, and the referral of Métis citizens to MVDF.'),
  src('Tecumseh Community Development Corporation', 'https://www.tcdc.on.ca/', 'The ten Southern Ontario First Nations it serves and the forms of assistance it offers.'),
  src('First Nations Agriculture and Financing of Ontario', 'https://www.firstnationsag.ca/', 'Its farm and business financing and women\u2019s and youth programmes.'),
  src('Métis Voyageur Development Fund', 'https://mvdf.ca/', 'Financing up to $1,500,000, the 50% Métis ownership rule and non-repayable business plan support.'),
  ISC_AEP,
  FUTURPRENEUR_IESP,
];

const ALBERTA_SOURCES: BlogSource[] = [
  src('NACCA: Indigenous Financial Institutions listings', 'https://nacca.ca/indigenous-financial-institutions-listings', 'The four Alberta IFIs NACCA lists.'),
  src('Alberta Indian Investment Corporation: financial services', 'https://aiicbusiness.org/financial-services/', 'Who AIIC lends to, the Status and one-year Alberta residency rule, own equity, loan terms and excluded ventures.'),
  src('Alberta Indian Investment Corporation: SEAP grant', 'https://aiicbusiness.org/grants/', 'The SEAP grant up to $99,999, the 30% and 40% shares, about 10% cash equity and that the grant is not stand-alone.'),
  src('Indigenous Business Corporation', 'https://www.ibcorp.ca/', 'Its Treaty 6, 7 and 8 service area and development lending to First Nations businesses and individuals.'),
  src('Community Futures Treaty Seven: lending services', 'https://t7edc.com/business-development/lending-services/', 'Business plan development and loan financing for Treaty 7 members.'),
  src('Apeetogosan (Métis) Development Inc.: business financing', 'https://www.apeetogosan.com/business-financing', 'Loan range, 10% owner equity and the Full-Time, Part-Time and Métis Women Micro-Business programmes.'),
  src('Apeetogosan (Métis) Development Inc.: FAQs', 'https://www.apeetogosan.com/faqs', 'The $100,000 MEAP lifetime limit, the loan requirement and the 690 credit score.'),
  src('Settlement Investment Corporation: application kit', 'https://settlementinvestcorp.com/appilcation-kit/', 'Settlement membership, the $100,000 limit and 10% equity or 115% collateral.'),
  src('Government of Alberta: Aboriginal Business Investment Fund', 'https://www.alberta.ca/aboriginal-business-investment-fund', 'Community-only eligibility, the $150,000 to $750,000 grant range, the 51% community ownership rule and the closed 2026-27 intake.'),
  src('Government of Alberta: Indigenous Reconciliation Initiative, Economic Stream', 'https://www.alberta.ca/indigenous-reconciliation-initiative-economic-stream', 'Up to $100,000 for community feasibility studies and business plans, and the closed 2026-27 intake.'),
  src('Alberta Indigenous Opportunities Corporation: loan guarantees', 'https://theaioc.com/indigenous-groups/loan-guarantees/', 'The $20 million to $250 million range and that it is not available to private Indigenous-owned businesses.'),
  src('PrairiesCan: Alberta Indigenous Clean Energy Initiative', 'https://www.canada.ca/en/prairies-economic-development/services/funding/alberta-indigenous-clean-energy-initiative.html', 'Eligible community applicants and that no forms are needed to start.'),
  src('ATB Financial: Indigenous relations', 'https://www.atb.com/company/community/inclusion-reconciliation/indigenous-relations/', 'ATB\u2019s Indigenous Financial Services team and contact address.'),
  src('Metis Settlements General Council: economic development', 'https://www.msgc.ca/economic-development', 'Its economic development contact; no funding programme is published.'),
  src('BDC: Indigenous entrepreneurs', 'https://www.bdc.ca/en/i-am/indigenous-entrepreneur', 'The Indigenous Entrepreneur Loan of up to $350,000.'),
  ISC_AEP,
  FUTURPRENEUR_IESP,
];

export const BLOG_SOURCES: Record<string, BlogSource[]> = {
  'off-reserve-indigenous-business-funding-canada': [ISC_AEP, FUTURPRENEUR_IESP, NACCA],
  'aboriginal-entrepreneurship-program-how-to-apply': [ISC_AEP, NACCA],
  'indigenous-business-funding-checklist': [ISC_AEP, FUTURPRENEUR_IESP, NACCA],
  'futurpreneur-indigenous-entrepreneur-startup-program': [FUTURPRENEUR_IESP, ISC_AEP],
  'metis-specific-business-funding-economic-development-programs': METIS_SOURCES,
  'ontario-indigenous-business-funding-programs-grants-support': ONTARIO_SOURCES,
  'indigenous-business-funding-alberta-complete-guide': ALBERTA_SOURCES,
};
