/**
 * What the platform actually does today, for the role and sovereignty pages.
 *
 * These three pages exist because the keyword plan asked for them, and they are
 * the highest-risk pages on the site: role landing pages for economic
 * development officers and funders, and a page about data-sovereignty software.
 * All three sit next to Nations-tier features that are NOT BUILT - the OCAP
 * governance console, the government reporting module, white-label, multi-
 * entity, custom AI training on community data.
 *
 * /plan was found selling "sector-specific templates" and an "AI Copilot" that
 * do not exist. These pages are the same trap at higher stakes, because they
 * target Nations and funders rather than individuals.
 *
 * So the safety here is mechanical rather than editorial: a guard test reads
 * every `available: false` feature string out of plans.ts and asserts that none
 * of them appears on any of these three pages. If someone later builds the
 * governance console and flips the flag, the guard stops objecting on its own.
 *
 * Everything below is drawn from features flagged available: true.
 */
export type Capability = { what: string; detail: string };

/** Live today. Every item traces to an available: true feature or to shipped code. */
export const LIVE_FOR_ORGANISATIONS: Capability[] = [
  {
    what: 'A funding directory with verification dates',
    detail:
      'Every programme carries the date it was last checked against the funder’s own page, and the ones we could not verify say so. The directory is small — see the statistics page for exactly how small and how current.',
  },
  {
    what: 'A guided business plan for the people you support',
    detail:
      'Six sections, auto-saved, with prompts written for Indigenous business context and a Community Impact section covering jobs, training and local spend. Exports as a document or as plain text for funder portals.',
  },
  {
    what: 'Funding matches from a business profile',
    detail:
      'Three matches a month on the free plan, fifty on Growth. Matches are decision support, not an eligibility determination.',
  },
  {
    what: 'Funding deadline alerts by email',
    detail:
      'Double opt-in, with a working unsubscribe. Worth knowing: every programme currently in the directory is rolling intake, so today these alert on changes rather than closing dates.',
  },
  {
    what: 'Application readiness checklists',
    detail: 'Available on Growth and above.',
  },
  {
    what: 'Cultural competency training programs',
    detail: 'Available on Growth and above, with on-site training on the Nations plan.',
  },
  {
    what: 'A dedicated account manager and 24/7 support',
    detail: 'On the Nations & Organizations plan, alongside quarterly business reviews.',
  },
];

/** Named on the pricing page as not yet available. Stated as roadmap, never as live. */
export const ROADMAP_FOR_ORGANISATIONS: string[] = [
  'An OCAP® data governance console',
  'A government reporting module in ISC and AANDC formats',
  'A white-label platform carrying your Nation’s branding',
  'Support for multiple business entities under one account',
  'Custom AI training on your community’s data',
  'Quarterly impact reports',
  'A French interface',
];

/** Data-handling facts, each traceable to shipped configuration. */
export const DATA_FACTS: Capability[] = [
  {
    what: 'Stored in Canada',
    detail:
      'The database, authentication and storage run in Supabase’s Canadian region (ca-central-1).',
  },
  {
    what: 'Exportable at any time',
    detail:
      'Full data export is on every plan including the free one, and a data request can be submitted and tracked from the site.',
  },
  {
    what: 'Closed to AI model-training crawlers',
    detail:
      'robots.txt blocks GPTBot, CCBot and Google-Extended among others, so this content is not offered up for model training. Answer-engine crawlers that cite sources are allowed, because being findable and being training data are different things.',
  },
  {
    what: 'Built around OCAP® principles — alignment, not certification',
    detail:
      'OCAP® — Ownership, Control, Access and Possession — is a framework of the First Nations Information Governance Centre. We build around it. We are not certified by anyone against it, and we do not claim to be.',
  },
];
