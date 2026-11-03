/**
 * Explanatory articles for a programme page, keyed by /funding/<slug>.
 *
 * Per the keyword plan, the programme page is the concise owner of the
 * programme's name (terms, eligibility, official link) and the article carries
 * the how-to. Each side links to the other so neither repeats the other.
 * Guarded by src/data/__tests__/programGuides.test.ts.
 */
export interface ProgramGuide { slug: string; label: string }

export const PROGRAM_GUIDES: Record<string, ProgramGuide[]> = {
  'aboriginal-entrepreneurship-program': [
    { slug: 'aboriginal-entrepreneurship-program-how-to-apply', label: 'How to apply for the Aboriginal Entrepreneurship Program, step by step' },
    { slug: 'off-reserve-indigenous-business-funding-canada', label: 'Applying from off reserve' },
  ],
  'indigenous-entrepreneur-startup-program': [
    { slug: 'futurpreneur-indigenous-entrepreneur-startup-program', label: 'Futurpreneur IESP: eligibility and how to apply' },
  ],
};
