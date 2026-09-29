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
];

export const comparisonBySlug = (slug: string) => COMPARISONS.find((c) => c.slug === slug);
