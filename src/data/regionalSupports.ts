/**
 * Local institutions and supports shown on five region pages:
 * /funding/yukon, /funding/northwest-territories, /funding/nunavut,
 * /funding/new-brunswick and /funding/nova-scotia.
 *
 * These pages already list the programmes in the funding catalogue. This adds
 * the institutions a reader should contact locally, each quoted verbatim from
 * its own page on REGIONAL_CHECKED. `note` is our own plain description and
 * says where an institution is open to everyone rather than Indigenous-only.
 * Nothing here is an eligibility decision; the institution makes that.
 *
 * Research: a source review of each territory and province (3 Nov 2026).
 * Left out on purpose: sources whose pages were broken, mid-edit, stale
 * (COVID-era programmes) or published no business support.
 *
 * Guarded by src/data/__tests__/regionalSupports.test.ts.
 */
export type SupportKind = 'lender' | 'programme' | 'support';

export interface RegionalSupport {
  name: string;
  url: string;
  kind: SupportKind;
  /** Who it serves, verbatim. */
  serves?: string;
  /** What it offers, verbatim, one quote per item. */
  offers: string[];
  note?: string;
}

export interface RegionalSection {
  intro: string;
  items: RegionalSupport[];
  /** Plain-language caveats for the region as a whole. */
  caveats: string[];
}

export const REGIONAL_CHECKED = '2026-11-03';

export const KIND_LABELS: Record<SupportKind, string> = {
  lender: 'Lender',
  programme: 'Programme',
  support: 'Support, not funding',
};

const CANNOR_EBD = 'https://www.cannor.gc.ca/eng/1396123434848/1396123576050';

const ULNOOWEG: RegionalSupport = {
  name: 'Ulnooweg Development Group',
  url: 'https://ulnoowegdevelopmentgroup.ca/entrepreneurship/business-funding/',
  kind: 'lender',
  serves: 'We provide financing and support services for Indigenous businesses in Atlantic Canada.',
  offers: [
    'Loan amounts available up to $25,000, at a rate of 8% over a maximum 5-year term, with a 5% cash equity recommended.',
    'Loan amounts available up to $750,000 for Individuals and $1.5million for Communities dependent on available capital, with various interest rates, over a maximum 20-year amortization.',
    'offers non-repayable business contributions to individual Indigenous entrepreneurs and community owned businesses.',
  ],
  note: 'The Indigenous Financial Institution for all of Atlantic Canada. The first two quotes are its women and youth loans and its general lending; the third is the Aboriginal Business Financing Program it administers.',
};

const ACOA: RegionalSupport = {
  name: 'Atlantic Canada Opportunities Agency (ACOA), Business Development Program',
  url: 'https://www.canada.ca/en/atlantic-canada-opportunities/services/business-development-program.html',
  kind: 'programme',
  offers: [
    'Our repayable funding is interest-free and unsecured. You could get up to 50% of the capital you need to grow your business or launch a new one.',
  ],
  note: 'A general federal programme open to Atlantic businesses, not an Indigenous-specific stream. ACOA lists it on its page for Indigenous businesses alongside its other programmes.',
};

export const REGIONAL_SUPPORTS: Record<string, RegionalSection> = {
  yukon: {
    intro: 'Yukon has one Indigenous Financial Institution, däna Näye Ventures, which also delivers the federal CanNor business development contributions in the territory. Most other support is general programming that Yukon First Nations governments and businesses can also use.',
    items: [
      {
        name: 'däna Näye Ventures',
        url: 'https://www.dananaye.com/entrepreneurship-and-business-development',
        kind: 'lender',
        serves: 'däna Näye Ventures is a Yukon-based, First Nation-controlled institution that provides business development and financial services to ALL PEOPLE throughout Yukon and in the Northern British Columbia communities of Atlin, Good Hope Lake and Lower Post.',
        offers: [
          'Contributions of up $99,999 are available for individuals. Cash equity requirement must be at least 10% of total project costs.',
          'any project costs pre-committed prior to application will be ineligible for funding.',
        ],
        note: 'Delivers CanNor’s Entrepreneurship and Business Development contributions to Indigenous citizens in Yukon, and runs its own loan funds and micro-loans for all residents of its lending territory.',
      },
      {
        name: 'Yukon First Nations Implementation Fund Trust',
        url: 'https://www.dananaye.com/yukon-first-nations-implementation-fund-trust',
        kind: 'programme',
        serves: 'Yukon First Nations, Yukon First Nation Beneficiaries (as defined under chapter 28 of the UFA) and the Yukon First Nation controlled entities may apply',
        offers: ['The Fund makes investments between $5,000 and $100,000 in Yukon First Nation businesses.'],
        note: 'Tied to the Umbrella Final Agreement, so specific to Yukon First Nations.',
      },
      {
        name: 'Government of Yukon, Economic Development Fund',
        url: 'https://yukon.ca/edf',
        kind: 'programme',
        serves: 'supports projects and initiatives that provide long-term, sustainable economic benefits to Yukoners and Yukon communities.',
        offers: ['tier 1 up to $30,000; tier 2 between $30,001 and $100,000; and tier 3 between $100,001 and $500,000.'],
        note: 'A general territorial fund, not Indigenous-specific. Its eligible applicants include Yukon First Nations governments and Yukon First Nations development entities.',
      },
      {
        name: 'Yukon First Nation Chamber of Commerce',
        url: 'https://www.yfncc.ca/services',
        kind: 'support',
        serves: 'YFNCC helps Yukon First Nation businesses, development corporations, trusts, and economic entities become more visible, prepared, connected, and positioned for opportunity.',
        offers: ['Funding and program navigation', 'Bid-readiness support'],
      },
    ],
    caveats: [
      'CanNor’s call for new 2026–27 projects closed on November 17, 2025; its page says so. Ask CanNor or däna Näye Ventures what is open now.',
    ],
  },
  'northwest-territories': {
    intro: 'The Northwest Territories has several regional lenders, each serving its own area, and the NWT Métis-Dene Development Fund delivers CanNor’s business development contributions across the territory. Some regional lenders serve every resident, not only Indigenous applicants.',
    items: [
      {
        name: 'NWT Métis-Dene Development Fund',
        url: 'https://www.mddf.ca/blank-1',
        kind: 'lender',
        serves: 'an Indigenous Financial Institution focused on assisting Indigenous entrepreneurs to start or expand their business in the NWT.',
        offers: [
          'Funding of up to $99,999 is available to Indigenous entrepreneurs for expansion, capital acquisition, and marketing.',
          'start-up or expansion of an existing business for a maximum of $100,000 and up to five years.',
        ],
        note: 'The CanNor Entrepreneurship and Business Development delivery partner for the NWT. The first quote is that non-repayable contribution; the second is its term loans.',
      },
      {
        name: 'Dehcho Business Development Centre',
        url: 'https://www.dcbdc.ca/small-business-loan-financing',
        kind: 'lender',
        serves: 'a non-profit organization established to provide business and economic development throughout the Dehcho region',
        offers: [
          'Can finance up to $200,000 of a project’s cost',
          'Be resident in the Deh Cho region (as defined by ITI) for at least one year',
        ],
        note: 'Also offers micro-loans for Indigenous women and youth in the Dehcho region, with part of the loan as a grant.',
      },
      {
        name: 'Akaitcho Business Development Corporation',
        url: 'https://akaitchobdc.com/financing/',
        kind: 'lender',
        serves: 'All residents of N’Dilo, Dettah, and Yellowknife are eligible to apply for a business loan at Akaitcho Business Development Corporation, regardless of ethnicity.',
        offers: ['an Investment Fund that is used to provide repayable loans to eligible businesses to a maximum of $200,000 per business.'],
        note: 'Open to all residents of its area, not only Indigenous applicants.',
      },
      {
        name: 'Thebacha Business Development Services',
        url: 'https://www.thebacha.ca/financial-support',
        kind: 'lender',
        serves: 'Supporting East South Slave Region Since 2001',
        offers: ['Small Business Loans', 'Up to $125,000'],
        note: 'A Community Futures organization in Fort Smith. Indigenous-owned businesses are among the groups it serves, so it is not Indigenous-only.',
      },
      {
        name: 'Prosper NWT (formerly BDIC)',
        url: 'https://prospernwt.ca/business-loans',
        kind: 'lender',
        offers: ['term loans of up to $5 million per business enterprise (including related entities)'],
        note: 'A Government of the Northwest Territories agency for all NWT businesses, not Indigenous-specific.',
      },
      {
        name: 'GNWT Support for Entrepreneurs and Economic Development (SEED)',
        url: 'https://www.iti.gov.nt.ca/en/services/support-entrepreneurs-and-economic-development-seed',
        kind: 'programme',
        offers: ['up to $25,000 in support can be provided in four categories', 'Funding is available from April 1 to March 31st annually.'],
        note: 'A general territorial programme, not Indigenous-specific. Its micro-business stream includes tools and equipment for the traditional economy.',
      },
    ],
    caveats: [
      'The Sahtu Business Development Centre in Norman Wells is listed in NACCA’s directory, but we found no website for it, so its terms are not shown here. Contact it through NACCA’s listing.',
      'We found no published business funding programme from the Inuvialuit or Gwich’in organizations we checked. That does not mean none exists; ask them directly.',
      'CanNor’s call for new 2026–27 projects closed on November 17, 2025; its page says so.',
    ],
  },
  nunavut: {
    intro: 'Nunavut has Inuit-owned and regional lenders at very different deal sizes, plus business programmes run by the regional Inuit associations. Several require registration as an Inuit Firm with Nunavut Tunngavik Incorporated, so check that first. CanNor’s business development contributions are delivered by a different organization in each region.',
    items: [
      {
        name: 'Atuqtuarvik Corporation',
        url: 'https://atuqtuarvik.com/en/application-and-funding-information',
        kind: 'lender',
        offers: ['Atuqtuarvik Corporation provides loans and equity investments to Inuit-owned businesses between the range of $150,000 and $3,000,000.'],
        note: 'Inuit-owned. Its documentation list includes verification of Inuit Firm status.',
      },
      {
        name: 'Kakivak Association (Qikiqtani region)',
        url: 'https://www.kakivak.ca/inuit-businesses/funding-programs-inuit-businesses/',
        kind: 'lender',
        serves: 'a community economic development organization serving Inuit by providing programs and services to enhance the strengths of communities in the Qikiqtani Region.',
        offers: ['Up to $50,000 in secured term loans with a fixed interest rate of 8.5%', 'Maximum of $25,000 in total grants per business'],
        note: 'CanNor’s business development delivery partner for the Qikiqtaaluk region.',
      },
      {
        name: 'Kivalliq Inuit Association, Business Development Fund',
        url: 'https://kivalliqinuit.ca/programs/economic-and-business-development/business-development-fund-bdf/',
        kind: 'programme',
        offers: ['available to Inuit entrepreneurs and Inuit owned businesses that demonstrate need for financial assistance. A lifetime maximum of $25,000 is available in each of the five (5) categories'],
        note: 'CanNor names the Kivalliq Inuit Association as its business development delivery partner for the Kivalliq region.',
      },
      {
        name: 'Kitikmeot Inuit Association, Kitikmeot Business Assistance Program',
        url: 'https://kitia.ca/program/kitikmeot-business-assistance-program/',
        kind: 'programme',
        offers: ['to assist Inuit entrepreneurs to participate in the regional and local economies by providing up to $25,000 in contribution funding.', 'a minimum of 10% equity toward total project costs'],
        note: 'For Kitikmeot Inuit beneficiaries and Inuit-owned businesses registered with Nunavut Tunngavik Incorporated.',
      },
      {
        name: 'Baffin Business Development Corporation',
        url: 'https://www.baffinbdc.ca/programs-services/',
        kind: 'lender',
        serves: 'dedicated to facilitating the progress and expansion of businesses in the Qikiqtani region.',
        offers: ['repayable loans and loan guarantees of up to $250,000'],
        note: 'Serves Inuit businesses and the wider business community. Its micro-loan fund for Indigenous women is open to Inuit, First Nations and Métis women.',
      },
      {
        name: 'Kitikmeot Community Futures Inc.',
        url: 'https://kcfi.ca/our-services/term-loans/',
        kind: 'lender',
        serves: 'contributes to the social and economic well being of the Kitikmeot Region which includes Cambridge Bay, Kugluktuk, Gjoa Haven, Kugaaruk, Taloyoak, Bay Chimo and Bathurst Inlet.',
        offers: ['Loans up to $450,000'],
        note: 'CanNor’s business development delivery partner for the Kitikmeot region. Not Inuit-only.',
      },
      {
        name: 'Kivalliq Business Development Centre',
        url: 'https://www.kivalliqbdc.ca/programs-services/',
        kind: 'lender',
        serves: 'serves the Kivalliq Communities of Arviat, Whale Cove, Rankin Inlet, Baker Lake, Chesterfield Inlet, Coral Harbour, and Naujaat.',
        offers: ['We provide loans to businesses who, for whatever reason, may not be able to get a loan from a bank or credit union.'],
        note: 'Publishes no loan maximum. Not Inuit-only.',
      },
      {
        name: 'Nunavut Business Credit Corporation',
        url: 'https://www.nbcc.nu.ca/',
        kind: 'lender',
        offers: ['We provide financing solutions to small and medium business enterprises in Nunavut who require between $150,000 and $5 million in loans or guarantees.'],
        note: 'A Government of Nunavut agency for all Nunavut businesses, not Inuit-specific.',
      },
      {
        name: 'Nunavut Tunngavik Incorporated, Inuit Firm Registry',
        url: 'https://tunngavik.com/programs-services/inuit-firm-registry-database',
        kind: 'support',
        offers: ['With its main purpose to implement Article 24 under the Nunavut Agreement'],
        note: 'Not funding, but Atuqtuarvik and the Kitikmeot programme ask for Inuit Firm registration, so register before you apply.',
      },
    ],
    caveats: [
      'CanNor’s call for new 2026–27 projects closed on November 17, 2025; its page says so.',
      'Older COVID-era relief programmes still appear on some of these sites. They are not shown here; ask the organization what is open now.',
    ],
  },
  'new-brunswick': {
    intro: 'New Brunswick has no Indigenous Financial Institution of its own in NACCA’s directory; financing comes from Ulnooweg, which serves all of Atlantic Canada. The support that is specific to New Brunswick comes mainly from JEDI and the province’s Indigenous agriculture programme.',
    items: [
      {
        name: 'Joint Economic Development Initiative (JEDI), Aboriginal Development Fund',
        url: 'https://jedinb.ca/jedi-aboriginal-development-fund',
        kind: 'programme',
        serves: 'JEDI serves Indigenous Peoples across New Brunswick and works closely with partners in the public and private sector.',
        offers: [
          'Business/Entrepreneurship Development (Individually Owned Business) — Successful applicants can expect a maximum contribution of up to 50% of total planning costs not to exceed $8,000.',
          'Community Economic Development (Community Owned Business) — The JADF will provide a maximum contribution of up to 50% of total planning costs not to exceed $16,000.',
          'Please note that this project has limited funding and applications will be assessed on a first-come, first-serve basis.',
        ],
        note: 'JEDI also runs an Indigenous business incubator and accelerator and a free entrepreneur toolkit. The fund pays planning costs back after you incur them.',
      },
      {
        name: 'New Brunswick Indigenous Agriculture Development Program',
        url: 'https://www2.gnb.ca/content/dam/gnb/Departments/10/pdf/Agriculture/AgriculturePrograms-ProgrammeAgriculture/program-guidelines-lignes-directrices-du-programme/iadp-program-guidelines.pdf',
        kind: 'programme',
        serves: 'open to any Indigenous individual, community or government, including a band or tribal council, government of a self-governing First Nation, Indigenous for-profit or not-for-profit corporation, association, cooperative or institution, or other Indigenous business, partnership or joint ventures in the Province of New Brunswick.',
        offers: ['Funds are available under the Sustainable Canadian Agricultural Partnership to support First Nations communities, indigenous individuals or organizations who are interested in participating the New Brunswick agricultural industry, including local foods.'],
        note: 'Agriculture and local food only. The guidelines publish no dollar amount.',
      },
      ULNOOWEG,
      ACOA,
    ],
    caveats: [
      'Ulnooweg’s contact page lists offices in Nova Scotia and Newfoundland, not New Brunswick. Call its toll-free line to reach someone who serves New Brunswick.',
      'The provincial Department of Indigenous Affairs grant is for social, cultural and educational projects, not business funding, so it is not listed here.',
    ],
  },
  'nova-scotia': {
    intro: 'Ulnooweg, the Indigenous Financial Institution for Atlantic Canada, has its main office in Millbrook, Nova Scotia. The other Nova Scotia supports are narrower: each serves a particular group, such as unemployed applicants or college students, so check who each one is for.',
    items: [
      ULNOOWEG,
      {
        name: 'Mi’kmaq Employment Training Secretariat (METS), Self Employment Assistance',
        url: 'https://www.mets.ca/programs',
        kind: 'programme',
        serves: 'A not-for-profit organization funded by Service Canada to offer employment and training programming to all 13 First Nation Communities in Nova Scotia and the Mi’kmaq Native Friendship Centre.',
        offers: ['The Self-Employment Assistance program has been designed to assist unemployed Indigenous people to create their own business providing their concept is viable and acceptable.'],
        note: 'For unemployed Indigenous people. No amounts are published.',
      },
      {
        name: 'NSCC Entrepreneur in the Making, Mi’kmaq and Indigenous Cohort',
        url: 'https://www.nscc.ca/student-experience/student-supports/entrepreneurship/eitm/eitm-mikmaq-indigenous.asp',
        kind: 'programme',
        offers: ['One-time funding of up to $3,500 (includes $3,000 seed funding and a $500 travel/cost-of-living stipend)', 'Be an NSCC graduate or a current student in good academic standing'],
        note: 'For NSCC students and graduates. The page lists programme dates of March 2 to April 27, 2026, so ask NSCC whether a new cohort is open.',
      },
      {
        name: 'Invest Nova Scotia, Supplier Diversity Certification Program',
        url: 'https://investnovascotia.ca/incentives-programs-services/supplier-diversity-certification-program',
        kind: 'programme',
        offers: ['reimburses 100% of the certification fee paid by the business to obtain a first-time certification, up to $1,000 (excluding taxes) per certification, with a maximum total of $3,000 (excluding taxes) per company (for three new certifications).', 'Applications for SDCP will be accepted from April 14, 2026, to February 26, 2027.'],
        note: 'Open to Indigenous-owned businesses among other diverse-owned businesses, not Indigenous-specific.',
      },
      ACOA,
    ],
    caveats: [
      'The provincial Office of L’nu Affairs publishes no business programme, so it is not listed here.',
    ],
  },
};

export const CANNOR_EBD_URL = CANNOR_EBD;
