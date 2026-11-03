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
  src('Wakenagun Community Futures Development Corporation', 'https://wakenagun.ca/', 'The Mushkegowuk communities it serves, from Fort Severn to Chapleau Cree.'),
  src('Two Rivers Community Development Centre: FAQs', 'https://tworivers.ca/faqs/', 'Its service area, loans up to $1,250,000, 10% cash equity, no general grants, and the referral of Métis citizens to MVDF.'),
  src('Tecumseh Community Development Corporation', 'https://www.tcdc.on.ca/', 'The ten Southern Ontario First Nations it serves and the forms of assistance it offers.'),
  src('First Nations Agriculture and Financing of Ontario', 'https://www.firstnationsag.ca/', 'Its farm and business financing and women\u2019s and youth programmes.'),
  src('Métis Voyageur Development Fund', 'https://mvdf.ca/', 'Financing up to $1,500,000, the 50% Métis ownership rule and non-repayable business plan support.'),
  ISC_AEP,
  FUTURPRENEUR_IESP,
];

const ALBERTA_SOURCES: BlogSource[] = [
  src('NACCA: Indigenous Financial Institutions listings', 'https://nacca.ca/indigenous-financial-institutions-listings', 'The four Alberta Indigenous Financial Institutions NACCA lists in its directory.'),
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

const BC_SOURCES: BlogSource[] = [
  src('Indigenous Services Canada: British Columbia region', 'https://www.sac-isc.gc.ca/eng/1100100021003/1612465942223', 'That BC is home to 202 First Nations, about a third of all First Nations in Canada.'),
  src('PacifiCan: Indigenous economic development', 'https://www.canada.ca/en/pacific-economic-development/indigenous-economic-development.html', 'Ten IFIs across BC, and that all PacifiCan programmes are open to Indigenous applicants.'),
  src('All Nations Trust Company: service area', 'https://www.antco.ca/about-us/service-area/', 'ANTCO\u2019s six service regions and that it cannot serve businesses outside them.'),
  src('All Nations Trust Company: entrepreneurs', 'https://www.antco.ca/entrepreneurs/', 'The Business Financing Program, the NRT grant figure ANTCO publishes, and the First Citizens Fund terms.'),
  src('Tale\u2019awtxw Aboriginal Capital Corporation: funding', 'https://www.tacc.ca/funding/', 'Its Coast Salish service area and contributions up to $99,999 and $250,000, only alongside equity and a loan.'),
  src('TRICORP: business development loans', 'https://tricorp.ca/programs/business-development-loans/', 'Its service area, the $100,000 loan at 8%, First Citizens Fund limits and the NRT figures it publishes.'),
  src('Nuu-chah-nulth Economic Development Corporation: financing programs', 'https://www.nedc.info/financing-programs/', 'Vancouver Island service and what it finances.'),
  src('Stó:lō Community Futures: business loans', 'https://www.stolocf.ca/business-loans.html', 'S\u2019ólh Téméxw service area, $150,000 and $500,000 loan limits, micro-loans and its 2026-2027 NRT match.'),
  src('Province of BC: Indigenous business loans', 'https://www2.gov.bc.ca/gov/content/employment-business/economic-development/funding-and-grants/indigenous-business-loans', 'Interior Indigenous Community Futures\u2019 service area and $125,000 loans.'),
  src('Burns Lake Native Development Corporation: about', 'https://www.blndc.ca/about-us', 'Its six member First Nations and services.'),
  src('Haida Gwaii Community Futures: loans', 'https://www.haidagwaiifutures.ca/loans', 'That it serves all islanders, with loans from $1,000 to $2,000,000.'),
  src('Native Fishing Association: loans and grants', 'https://shoal.ca/loans-grants/', 'Loans up to $500,000 at 8.75%, 10% cash equity, the 40% grant and the women\u2019s programme.'),
  src('Aboriginal Business and Community Development Centre: services', 'https://www.abdc.bc.ca/services', 'That it is not a lender and that its services are free.'),
  src('Métis Financial Corporation of BC: eligibility criteria', 'https://mfcbc.ca/eligibility-criteria/', 'Project range, 10% equity and BC residency.'),
  src('New Relationship Trust: equity matching for entrepreneurs', 'https://newrelationshiptrust.ca/equity-matching-entrepreneurs/', 'Up to $7,500 and $25,000, the loan condition, continuous intake and the delivery lenders.'),
  src('New Relationship Trust: BC Indigenous Clean Energy Initiative', 'https://newrelationshiptrust.ca/indigenous-clean-energy-initiative-bcicei/', 'Eligible applicants and its closed status, reopening late 2026.'),
  src('Province of BC: First Nations Clean Energy Business Fund', 'https://www2.gov.bc.ca/gov/content/environment/natural-resource-stewardship/consulting-with-first-nations/first-nations-clean-energy-business-fund', 'Eligible applicants and the 30 April 2026 deadline.'),
  src('Province of BC: First Citizens Fund business loan program', 'https://www2.gov.bc.ca/gov/content/governments/indigenous-people/economic-development/business-loan-program', 'That ANTCO delivers the programme with partner capital corporations.'),
  src('Province of BC: Indigenous business development', 'https://www2.gov.bc.ca/gov/content/governments/indigenous-people/economic-development/business-development', 'The Indigenous Business and Investment Council\u2019s strategy role.'),
  src('Indigenous Tourism BC', 'https://www.indigenousbc.com/corporate/', 'Its development programmes, market readiness funding and free training.'),
  src('BDC: Indigenous entrepreneurs', 'https://www.bdc.ca/en/i-am/indigenous-entrepreneur', 'The Indigenous Entrepreneur Loan of up to $350,000.'),
  ISC_AEP,
  FUTURPRENEUR_IESP,
];

const WOMEN_SOURCES: BlogSource[] = [
  src('NACCA: Indigenous Women Entrepreneurs program', 'https://nacca.ca/about-nacca/indigenous-women-entrepreneurs', 'That IWE is delivered through IFIs with funding, training, advisory services and microloans.'),
  src('Baffin Business Development Corporation: programs and services', 'https://www.baffinbdc.ca/programs-services/', 'IWE up to $25,000, 35% non-repayable, 65% loan at 5%, 5% contribution, eligibility.'),
  src('Dehcho Business Development Centre: IWE and IYE program', 'https://www.dcbdc.ca/iwe-iye-program', 'Up to $25,000 with 45% as a grant and the 51% ownership rule.'),
  src('Nishnawbe Aski Development Fund: Indigenous Women', 'https://www.nadf.org/indigenous-women', 'Projects up to $25,000, split 5% client, 45% grant, 50% loan.'),
  src('NWT Métis-Dene Development Fund: programs', 'https://www.mddf.ca/blank-1', 'Women\u2019s micro-loans up to $20,000, split 5% equity, 45% grant, 50% loan.'),
  src('Ulnooweg Development Group: business funding', 'https://ulnoowegdevelopmentgroup.ca/entrepreneurship/business-funding/', 'Women and youth loans up to $25,000 at 8% over up to 5 years.'),
  src('Métis Financial Corporation of BC: Sophie Morigeau Women\u2019s Entrepreneurship Program', 'https://mfcbc.ca/services/smwep-program/', 'The 30% grant applied after on-time repayment, its loss on refinancing, equity, rate and the 2026 relaunch notice.'),
  src('Apeetogosan (Métis) Development Inc.: business financing', 'https://www.apeetogosan.com/business-financing', 'The Métis Women Micro-Business Program split.'),
  src('Louis Riel Capital Corporation: Métis Women Entrepreneurship Program', 'https://www.lrcc.mb.ca/metis-women-entrepreneurship-program', 'Financing of up to $40,000 made up of a grant and a loan, with no split published.'),
  src('ISED: Women Entrepreneurship Loan Fund', 'https://ised-isde.canada.ca/site/ised/en/node/440', 'Loans up to $50,000, the delivery organizations by province, that they were accepting applications, and the June 2026 funding.'),
  src('ISED: WES Ecosystem Fund', 'https://ised-isde.canada.ca/site/ised/en/programs-and-initiatives/women-entrepreneurship-strategy/wes-ecosystem-fund', 'That it funds not-for-profit organizations and that the 2027 call closes on 9 November 2026.'),
  src('Alberta Women Entrepreneurs: loans', 'https://www.awebusiness.com/loans', 'Repayable loans of up to $150,000 for majority women-owned businesses, with no grant.'),
  src('Alberta Women Entrepreneurs: NextSteps to Success', 'https://www.awebusiness.com/nextstep', 'The planning series for Indigenous women and its cohort status.'),
  src('WeBC: business loans for women', 'https://we-bc.ca/programs-services/loans/business-loans-for-women/', 'Loans up to $150,000, Equal Access to Capital, and that WeBC does not provide grants.'),
  src('WeMB: loans', 'https://www.wemb.ca/financing/loans', 'Loans from $5,000 to $150,000 and micro-loans.'),
  src('BDC: Indigenous entrepreneurs', 'https://www.bdc.ca/en/i-am/indigenous-entrepreneur', 'The Indigenous Entrepreneur Loan of up to $350,000.'),
  src('BDC: Thrive platform', 'https://www.bdc.ca/en/bdc-capital/venture-capital/funds/thrive-platform', 'That Thrive is a venture investment platform for women-led companies, not a loan or grant.'),
  src('Pauktuutit Inuit Women of Canada: resources', 'https://pauktuutit.ca/resources', 'The Inuit Women in Business Network and its workshops.'),
  src('Les Femmes Michif Otipemisiwak: economic prosperity', 'https://metiswomen.org/priority/economic-prosperity-housing-and-education/', 'Its economic development and entrepreneurship priority.'),
  src('Native Women\u2019s Association of Canada: social and economic development', 'https://nwac.ca/academics-policy/policy-development/social-economic-development/', 'Its work on entrepreneurial development, with a focus on Northern and remote communities.'),
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
  'bc-indigenous-business-grants-loans-complete-resource': BC_SOURCES,
  'funding-indigenous-women-entrepreneurs-grants-loans-resources': WOMEN_SOURCES,
};
