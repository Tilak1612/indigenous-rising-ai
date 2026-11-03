/**
 * Content for /guides/indigenous-business-data-sovereignty-questions.
 *
 * The AI-specific companion to /guides/what-is-ocap, which carries the general
 * vendor questions. Everything under "how we answer" matches the privacy
 * policy wording the owner approved on 3 November 2026
 * (docs/review/privacy-ai-processors.md) and the edge functions it describes:
 * supabase/functions/match-funding-opportunities, ai-assistant and
 * site-assistant. If a feature or provider changes, change the policy, this
 * file and the site FAQ together. Guarded by
 * src/data/__tests__/aiDataQuestions.test.ts.
 */
export const AI_DATA_CHECKED = '2026-11-03';

export interface AiQuestion { question: string; why: string; goodAnswer: string }

export const AI_QUESTIONS: AiQuestion[] = [
  {
    question: 'When I type into this tool, does it leave your systems?',
    why: 'Most AI features send what you type to another company that runs the model. The tool you see and the company that reads your words can be different.',
    goodAnswer: 'A plain yes or no for each feature, with the provider named.',
  },
  {
    question: 'Exactly what is sent, and what is not?',
    why: 'A feature may need your business description but not your name. Ask for the list of fields, not a reassurance.',
    goodAnswer: 'A field-by-field list, and a clear statement of what is never sent.',
  },
  {
    question: 'Where is it processed, and is that different from where it is stored?',
    why: 'A vendor can store your records in Canada and still send each AI request to servers in another country. Both answers matter.',
    goodAnswer: 'Separate answers for storage and for AI processing, with the country or region named.',
  },
  {
    question: 'Is anything I enter used to train a model?',
    why: 'Training means your words can shape what the model says to other people. Processing to answer you is not the same thing.',
    goodAnswer: 'A direct answer for the vendor and for every AI provider it uses.',
  },
  {
    question: 'How long does each provider keep it?',
    why: 'Deleting your account with the vendor does not by itself delete copies a provider holds.',
    goodAnswer: 'A retention period for each provider, or a link to the provider’s own terms.',
  },
  {
    question: 'Is my conversation saved, and who can see it?',
    why: 'Some assistants keep chats so you can come back to them; others keep nothing. Either can be fine if you know which.',
    goodAnswer: 'Where the chat is kept, who can read it, and how to delete it.',
  },
  {
    question: 'Can I export and delete everything?',
    why: 'Possession means being able to take your data with you and to remove it when you leave.',
    goodAnswer: 'Self-serve export on every plan and a deletion route you can use without asking twice.',
  },
];

export interface CommunityQuestion { question: string; note: string }

export const COMMUNITY_QUESTIONS: CommunityQuestion[] = [
  { question: 'Who decides what community or Nation information can go into an AI tool?', note: 'If the answer is unclear, settle it before anyone types community information into a tool.' },
  { question: 'Does sharing need a council decision, a band council resolution or a data-sharing agreement?', note: 'Practice differs between Nations and organizations. Ask whoever holds that authority for yours.' },
  { question: 'How is the decision recorded, and who can review it later?', note: 'A written record lets the next person know what was agreed and why.' },
];

/** What each AI feature on Indigenous Rising sends, matching the privacy policy. */
export interface AiFeature { feature: string; who: string; provider: string; sends: string; kept: string }

export const OUR_AI_FEATURES: AiFeature[] = [
  {
    feature: 'Funding matching',
    who: 'Signed-in members, when they click “Find my matches”',
    provider: 'OpenAI',
    sends: 'Territory, industry, business stage, business description and funding purpose. Not your name, email or phone number.',
    kept: 'Match results are kept in our database, stored in Canada.',
  },
  {
    feature: 'Member assistant',
    who: 'Signed-in members, in the dashboard',
    provider: 'OpenAI',
    sends: 'Your recent messages in that conversation, and published funding programmes for your territory.',
    kept: 'The conversation is kept in your account; only you can see it.',
  },
  {
    feature: 'Ask Agent',
    who: 'Anyone on our public pages',
    provider: 'Anthropic',
    sends: 'Your message and the earlier messages in that chat. Account, billing and legal questions get a set reply and are not sent.',
    kept: 'We do not store these chats.',
  },
];

export const OUR_ANSWERS = {
  processing: 'These AI requests are processed on each provider’s servers, which may be outside Canada. Your account, business plans, documents and files remain stored in Canada.',
  training: 'Neither provider uses data sent through its API to train its models.',
  retention: 'How long each provider keeps it is set by the provider; our privacy policy links OpenAI’s and Anthropic’s own terms.',
  export: 'Every plan, including the free one, can export its data from Settings, and you can delete your account yourself, with a 30-day grace period in which signing back in cancels it.',
  avoid: 'Please do not enter information you would not want processed outside our own systems, such as personal health or financial account details.',
};

/** Distinct governance for First Nations, Inuit and Métis: link only what we have read. */
export const ITK_NISR_URL = 'https://itk.ca/national-strategy-on-research-launched/';
