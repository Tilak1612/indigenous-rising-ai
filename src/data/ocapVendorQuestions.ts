/**
 * Questions to ask a software vendor about community data.
 *
 * This is the original content on /guides/what-is-ocap. The page does NOT
 * define the OCAP® principles — they belong to the First Nations Information
 * Governance Centre and are signposted there — so this is what the page can
 * honestly contribute instead: vendor evaluation, which is squarely our
 * competence and which FNIGC's own materials would not cover.
 *
 * Every `ourAnswer` is a checkable statement about shipped configuration, and
 * where the answer is unflattering it says so. A vendor-evaluation checklist
 * whose author scores full marks on its own questions is worthless.
 */
export const FNIGC_URL = 'https://fnigc.ca/';

export type VendorQuestion = {
  question: string;
  why: string;
  watchFor: string;
  ourAnswer: string;
};

export const VENDOR_QUESTIONS: VendorQuestion[] = [
  {
    question: 'Where is the data physically stored?',
    why: 'Where data sits determines whose laws reach it. Data held in the United States is reachable under US law regardless of who owns the company.',
    watchFor: '"Cloud-based" is not an answer. Neither is "we are a Canadian company" — a Canadian company can and often does store data elsewhere. Ask for the region, not the head office.',
    ourAnswer:
      'Database, authentication and file storage run in Supabase’s Canadian region, ca-central-1. Our analytics and email providers are not Canadian, and our privacy policy is the place that should list every subprocessor — ask us if it does not yet name the one you care about.',
  },
  {
    question: 'Can I export everything, and what format?',
    why: 'Possession means little if leaving is hard. Export is the difference between holding your data and being allowed to look at it.',
    watchFor: 'Export offered only on paid tiers, only on request, or only as a PDF you cannot re-import anywhere.',
    ourAnswer:
      'Full export is on every plan including the free one, and a data request can be submitted and tracked from the site. The business plan exports as a document or as plain text.',
  },
  {
    question: 'Is my data used to train AI models?',
    why: 'This is the question most likely to be answered imprecisely. Training is not the same as processing, and a vendor may do one while denying the other.',
    watchFor:
      'Answers about "your data is secure" that never address training. Ask specifically: is it used to train models, by you or by any provider you send it to?',
    ourAnswer:
      'Our robots.txt blocks model-training crawlers including GPTBot, CCBot and Google-Extended, so our public content is not offered for training. For data you enter, ask us directly about each AI provider we send it to — that is a fair question and the answer should be in writing.',
  },
  {
    question: 'Who inside the company can see my data, and is that logged?',
    why: 'Access is one of the four principles, and in practice it means staff access, not just customer access.',
    watchFor: 'No answer, or an answer about encryption. Encryption at rest does not stop an administrator reading a record.',
    ourAnswer:
      'Row-level security is enforced on member-facing tables so accounts cannot read each other. Internal administrative access exists, as it does at every vendor; ask us who holds it before you put a community’s data in.',
  },
  {
    question: 'What happens to the data if I stop paying, or you shut down?',
    why: 'Ownership is tested at the exit, not at the sale. A vendor that is generous while you are paying and silent about what happens afterwards has not actually given you possession of anything.',
    watchFor: 'Silence, or a retention period buried in terms you have not read. Ask for it in writing.',
    ourAnswer:
      'Export is available on the free plan, so downgrading does not lock your data away. Our retention and deletion handling is described in the privacy policy and a deletion request can be submitted from the site.',
  },
  {
    question: 'Who certified your Indigenous data claims?',
    why: 'Anyone can write OCAP® on a page. Almost nobody has been assessed against anything.',
    watchFor:
      'The word "certified" with no named certifying body. If a vendor cannot name who assessed them, they were not assessed.',
    ourAnswer:
      'Nobody. We say OCAP®-aligned and we mean we built with those principles in mind. We hold no certification, no organisation has audited us, and we would rather say that plainly than let the word do work it has not earned.',
  },
];
