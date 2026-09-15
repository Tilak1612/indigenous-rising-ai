/**
 * FAQs for the Indigenous business grants hub (/guides/indigenous-business-grants).
 *
 * Single source for both the visible Q&A on the page and the FAQPage markup
 * written into the static HTML by scripts/prerender.mjs. The two used to be
 * separate copies that had already drifted in wording, which meant the
 * structured data did not match what the page showed.
 *
 * Note (Sept 2026): FAQ rich results were retired in Google Search on
 * 2026-05-07, so this markup earns no rich result. It is kept because the Q&A
 * is genuinely useful on the page and remains machine-readable for AI answer
 * engines, which is also why the answers must stay accurate and hedged.
 */
export const grantsHubFaqs: { question: string; answer: string }[] = [
  {
    question: 'What Indigenous business grants are available in Canada?',
    answer:
      'Indigenous entrepreneurs can access a mix of federal and provincial programs, non-repayable contributions, and loans from Indigenous Financial Institutions. Availability depends on your province, community (First Nations, Métis, or Inuit), industry, and stage. The guides below break these down by region and audience.',
  },
  {
    question: 'Do I need Indian status to get Indigenous business funding?',
    answer:
      'Not always. Many programs serve Status and Non-Status First Nations, Métis, and Inuit entrepreneurs, using community membership, Métis citizenship, or Inuit beneficiary status as proof of identity rather than Indian status specifically. Always check each program’s eligibility.',
  },
  {
    question: 'Are Indigenous business grants the same as loans?',
    answer:
      'No. Grants and non-repayable contributions do not have to be paid back (subject to using funds for the approved purpose and meeting reporting requirements), while loans do. Many entrepreneurs combine both.',
  },
  {
    question: 'How do I find the grants I’m actually eligible for?',
    answer:
      'Start with the guide for your province and your community, then use Indigenous Rising AI’s funding matching to scan programs against your profile. A clear business plan makes every application stronger.',
  },
];
