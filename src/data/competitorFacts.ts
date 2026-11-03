/**
 * Competitor facts for the comparison pages.
 *
 * Every figure was read from the competitor's own website on the checkedOn
 * date. The rule for these pages, from the plan that requested them:
 * "Differentiate database depth from matching, planning, and Canadian
 * data-residency — not invented superiority."
 *
 * So this file records where we are BEHIND as plainly as where we differ.
 * GrantCompass carries 850+ programmes to our 17. LivePlan starts at $15/mo to
 * our $49. A comparison page that hid either would be worthless to the reader
 * and would not survive contact with the competitor's own pricing page.
 *
 * A guard test asserts each competitor entry carries at least one concession.
 */
export type Comparison = {
  slug: string;
  name: string;
  url: string;
  checkedOn: string;
  /** What they are, in their own terms. */
  what: string;
  /** Facts from their site, quoted or closely paraphrased. */
  theirFacts: string[];
  /** Where they are genuinely stronger. Never empty. */
  weAreBehind: string[];
  /** Where the products actually differ. Not claims of superiority. */
  differences: { axis: string; them: string; us: string }[];
  /** Who should pick them instead. */
  chooseThemIf: string[];
};

export const COMPARISONS: Comparison[] = [
  {
    slug: 'grantcompass',
    name: 'GrantCompass',
    url: 'https://grantcompass.ca/',
    checkedOn: '28 September 2026',
    what: 'A Canadian grant discovery service with a large programme catalogue, application drafting, and tools such as an SR&ED calculator and a live tender browser.',
    theirFacts: [
      'States 850+ verified programs and 25,000+ Canadian entrepreneurs.',
      'Premium is $39/month with a 30-day money-back guarantee.',
      'Covers grants broadly across Canadian business, not Indigenous funding specifically.',
      'Also runs separate arts and United States versions.',
    ],
    weAreBehind: [
      'Their catalogue is far larger. They state 850+ programmes; our directory holds 17. If breadth of listings is what you need, they have it and we do not.',
      'They draft applications for you. We help you write a business plan; we do not draft the application.',
      'They have tools we do not, including an SR&ED calculator and a live tender browser.',
    ],
    differences: [
      {
        axis: 'Catalogue',
        them: '850+ programmes across Canadian business funding generally',
        us: '17 programmes, Indigenous-specific, each carrying the date it was last checked against the funder',
      },
      {
        axis: 'Focus',
        them: 'Canadian business grants broadly',
        us: 'Indigenous business funding only — IFIs, the Aboriginal Entrepreneurship Program, Métis capital corporations',
      },
      {
        axis: 'Business planning',
        them: 'Application drafting',
        us: 'A guided business plan with a Community Impact section, which Indigenous funders often ask for',
      },
      {
        axis: 'Data residency',
        them: 'Not stated on their site',
        us: 'Stored in Canada, exportable at any time, built around OCAP principles (alignment, not certification)',
      },
    ],
    chooseThemIf: [
      'You want the widest possible list of Canadian grants, not only Indigenous programmes.',
      'You want someone to draft the application itself.',
      'You need SR&ED or tender tooling.',
    ],
  },
  {
    slug: 'liveplan',
    name: 'LivePlan',
    url: 'https://www.liveplan.com/',
    checkedOn: '28 September 2026',
    what: 'Established business planning software with step-by-step instructions, financial forecasting, scenarios and expert help.',
    theirFacts: [
      'Standard is $20/month, or $15/month paid annually.',
      'Premium is $40/month, or $30/month paid annually, adding deeper research, scenarios and financial analysis.',
      'A LivePlan Expert add-on is $30/month.',
      'No Indigenous-specific positioning, programmes or funding context.',
    ],
    weAreBehind: [
      'They are cheaper for planning alone. LivePlan Standard is $15/month paid annually; our paid tier starts at $49/month ($39/month annual-equivalent).',
      'Their financial forecasting is more developed. They offer scenarios and deeper financial analysis; our financial section is a guided writing prompt, and projection templates are still on our roadmap.',
      'They are a mature, long-established planning product. We are not pretending otherwise.',
    ],
    differences: [
      {
        axis: 'Financial tooling',
        them: 'Forecasting, scenarios, financial analysis',
        us: 'Guided prompts for revenue, costs and assumptions. Projection templates are roadmap, not live.',
      },
      {
        axis: 'Funding context',
        them: 'General business planning',
        us: 'Written for the questions an Indigenous Financial Institution asks, alongside a directory of Indigenous programmes',
      },
      {
        axis: 'Community Impact',
        them: 'Not a section',
        us: 'A dedicated section, because Indigenous funders often ask about jobs, training and local spend directly',
      },
      {
        axis: 'Free tier',
        them: 'Paid plans only, with a trial rather than a free tier',
        us: 'Free plan builder with no credit card',
      },
    ],
    chooseThemIf: [
      'You want the strongest financial forecasting and scenario tools, and you do not need Indigenous funding context.',
      'Price is the deciding factor for planning software alone.',
      'You are not applying to an Indigenous Financial Institution.',
    ],
  },
  {
    slug: 'upmetrics',
    name: 'Upmetrics',
    url: 'https://upmetrics.co/pricing',
    checkedOn: '2 November 2026',
    what: 'Business planning software with AI writing help, 400+ sample plans, automated financial forecasting and a pitch deck builder.',
    theirFacts: [
      'Premium is US$19/month, or US$14/month billed annually.',
      'Professional is US$49/month, or US$37/month billed annually, for consultants and teams managing several companies.',
      'Forecasting covers up to 7 years on Premium and up to 10 years on Professional, with what-if scenarios and export to Excel.',
      'Integrates with QuickBooks Online and Xero, and offers a 15-day money-back guarantee.',
    ],
    weAreBehind: [
      'They are cheaper for planning alone. Upmetrics Premium is US$14/month billed annually; our paid tier starts at $49 CAD/month ($39/month annual-equivalent).',
      'Their financial forecasting is far more developed: an automated forecast builder, multi-year projections, what-if scenarios and accounting integrations. Our financial section is a guided writing prompt, and projection templates are still on our roadmap.',
      'They offer 400+ sample plans across many industries. We offer one six-section structure and one clearly fictional worked example.',
    ],
    differences: [
      {
        axis: 'Financial tooling',
        them: 'Automated forecasts up to 7 or 10 years, scenarios, QuickBooks and Xero',
        us: 'Guided prompts, plus free cash flow and budget spreadsheets. Projection templates are roadmap, not live.',
      },
      {
        axis: 'Funding context',
        them: 'General business planning and investor pitching',
        us: 'Written for the questions an Indigenous Financial Institution asks, alongside a directory of Indigenous programmes',
      },
      {
        axis: 'Free tier',
        them: 'Paid plans with a 15-day money-back guarantee; no free plan on their pricing page',
        us: 'Free plan builder with no credit card',
      },
      {
        axis: 'Currency and data location',
        them: 'Priced in US dollars; data location not stated on their pricing page',
        us: 'Priced in Canadian dollars, with data stored in Canada',
      },
    ],
    chooseThemIf: [
      'You need detailed multi-year financial forecasts or an investor pitch deck now.',
      'You want your plan connected to QuickBooks Online or Xero.',
      'You are not applying to an Indigenous Financial Institution and do not need Indigenous funding context.',
    ],
  },
  {
    slug: 'fundica',
    name: 'Fundica',
    url: 'https://www.fundica.com/',
    checkedOn: '2 November 2026',
    what: 'A funding discovery platform that financial institutions, governments and advisors offer to businesses under their own brand, with a free account for small businesses.',
    theirFacts: [
      'States 12,000+ funding programs, 800+ weekly updates and 60+ data points per program.',
      'States 90,000+ business users, with location filtering down to the six-digit postal code.',
      'Sold mainly to financial institutions, governments and advisors. Businesses can create a free account, and the sign-up form asks which organization referred them.',
      'States it is SOC 2 Type II certified and WCAG 2.0 AA, and offers a French version of its site.',
    ],
    weAreBehind: [
      'Their catalogue is far larger. They state 12,000+ programmes across private, federal, provincial and municipal funding; our directory holds 17 published Indigenous programmes.',
      'They state SOC 2 Type II certification. We do not claim any security certification.',
      'They give institutions a version branded as their own, with reporting on business activity and routing to advisors. We have not built organizational reporting or a branded version.',
    ],
    differences: [
      {
        axis: 'Catalogue',
        them: '12,000+ programmes across Canadian and US business funding generally',
        us: '17 programmes, Indigenous-specific, each carrying the date it was last checked against the funder',
      },
      {
        axis: 'Who signs up',
        them: 'Institutions, governments and advisors, who offer it to their business clients',
        us: 'Entrepreneurs sign up directly and free; Nations and organizations plans are quoted separately',
      },
      {
        axis: 'Business planning',
        them: 'Funding discovery, organizing programmes and starting applications',
        us: 'A guided business plan builder alongside the funding directory',
      },
      {
        axis: 'Data location',
        them: 'Not stated on their homepage',
        us: 'Data stored in Canada',
      },
    ],
    chooseThemIf: [
      'You need the widest catalogue of general Canadian business funding, not only Indigenous programmes.',
      'Your bank, government office or advisor already offers Fundica to you.',
      'You are an institution that wants to offer funding search to its clients under its own brand.',
    ],
  },
];

export const comparisonBySlug = (slug: string) => COMPARISONS.find((c) => c.slug === slug);
