/**
 * The business plan template offered on /indigenous-business-plan-template.
 *
 * The sections here MUST stay in step with STEPS in
 * src/pages/dashboard/BusinessPlanner.tsx. The whole honesty argument for this
 * page is that the download is the same structure the free planner walks you
 * through — not a generic template with an Indigenous label on it. A guard test
 * asserts the ids and titles match, so the two cannot drift.
 *
 * The prompts are the questions a funder actually asks. They are deliberately
 * not filled-in sample answers: a plan written by someone else is not a plan a
 * lender will believe, and the IFIs this routes people to read a lot of them.
 */
export type TemplateSection = {
  id: string;
  title: string;
  /** One line on what this section is for. */
  purpose: string;
  /** The questions to answer, in the order a reader expects them. */
  prompts: string[];
};

export const PLAN_TEMPLATE: TemplateSection[] = [
  {
    id: 'vision',
    title: 'Vision & Mission',
    purpose: 'What the business is, who it serves, and why it exists.',
    prompts: [
      'What does the business do, in one sentence a stranger would understand?',
      'Who are your customers, specifically?',
      'What need are you meeting that is not being met now?',
      'Where do you want the business to be in three years?',
      'What would you not do, even if it were profitable?',
    ],
  },
  {
    id: 'market',
    title: 'Market Analysis',
    purpose: 'Evidence that customers exist and will pay.',
    prompts: [
      'Who else serves these customers today, and what do they charge?',
      'How many potential customers are within your reach, and how do you know?',
      'What do your customers pay for this now, in money or in time?',
      'What is changing in this market that creates your opening?',
      'What evidence do you already have — conversations, pre-orders, a waitlist, past sales?',
    ],
  },
  {
    id: 'products',
    title: 'Products & Services',
    purpose: 'What you sell and what makes it worth buying.',
    prompts: [
      'List each product or service and its price.',
      'What does it cost you to deliver each one?',
      'What makes yours the one they choose?',
      'What will you add in year two, and what has to be true first?',
    ],
  },
  {
    id: 'operations',
    title: 'Operations Plan',
    purpose: 'How the business actually runs, day to day.',
    prompts: [
      'Where will you operate from, and what does that cost?',
      'What equipment, licences, permits or insurance do you need before you open?',
      'Who does the work — you, employees, contractors? What does that cost?',
      'Who are your suppliers, and what happens if one falls through?',
      'What are the three things most likely to go wrong, and what is your plan for each?',
    ],
  },
  {
    id: 'financial',
    title: 'Financial Projections',
    purpose: 'The numbers, and the assumptions underneath them.',
    prompts: [
      'What are your start-up costs? Use quotes, not estimates, wherever you can.',
      'What is your monthly revenue forecast for year one, and what drives it?',
      'What are your fixed and variable monthly costs?',
      'When do you break even, and what has to be true for that to happen?',
      'How much are you asking for, what will it buy, and how will it be repaid?',
      'What does a slower-than-expected year look like? Funders read this part closely.',
    ],
  },
  {
    id: 'community',
    title: 'Community Impact',
    purpose:
      'What the business returns to your community. Most plan templates have nothing here; Indigenous funders often ask about it directly.',
    prompts: [
      'How many jobs will this create, and who is likely to hold them?',
      'How will you hire, train or mentor people from your community?',
      'Will you buy from other Indigenous businesses? Which ones?',
      'What skills or capacity stay in the community because this business exists?',
      'How does this connect to your community’s own economic priorities?',
    ],
  },
];

/** A plain-text template, ready to fill in offline. */
export function templateAsText(sections: TemplateSection[] = PLAN_TEMPLATE): string {
  const out: string[] = [
    'INDIGENOUS BUSINESS PLAN TEMPLATE',
    '=================================',
    '',
    'A working template from Indigenous Rising AI. Same structure as the free',
    'business plan builder at https://www.indigenousrising.ai/plan',
    '',
    'Answer the questions under each heading in your own words. A funder is',
    'reading for whether you understand your own business, not for polish.',
    '',
  ];
  for (const s of sections) {
    out.push(s.title, '-'.repeat(s.title.length), s.purpose, '');
    for (const p of s.prompts) out.push('  [ ] ' + p);
    out.push('', 'YOUR ANSWER:', '', '', '');
  }
  out.push(
    'BEFORE YOU SEND IT',
    '------------------',
    '  [ ] Every number traceable to a quote or a stated assumption',
    '  [ ] A realistic downside case included',
    '  [ ] Proof of Indigenous identity in the form your institution accepts',
    '  [ ] Confirmed with the institution what else they want, and in what order',
    '',
    'This template is preparation, not an application. Eligibility and terms are',
    'decided by the institution you apply to.',
    '',
  );
  return out.join('\n');
}

/** Filename for the download. */
export const TEMPLATE_FILENAME = 'indigenous-business-plan-template.txt';
