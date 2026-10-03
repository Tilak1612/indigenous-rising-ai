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
  checkedOn: '2026-09-28',
};

const FUTURPRENEUR_IESP: BlogSource = {
  label: 'Futurpreneur: Indigenous Entrepreneur Startup Program',
  url: 'https://futurpreneur.ca/en/offering/indigenous-entrepreneur-startup/',
  supports:
    'The loan of up to $75,000, the up-to-two-years of mentorship, the age 18-39 and 24-month eligibility criteria, and that it is open to Indigenous entrepreneurs on or off reserve.',
  checkedOn: '2026-09-28',
};

const NACCA: BlogSource = {
  label: 'National Aboriginal Capital Corporations Association (NACCA)',
  url: 'https://nacca.ca/',
  supports:
    'The size of the Indigenous Financial Institution network and where to find the institution serving your region.',
  checkedOn: '2026-09-28',
};

export const BLOG_SOURCES: Record<string, BlogSource[]> = {
  'off-reserve-indigenous-business-funding-canada': [ISC_AEP, FUTURPRENEUR_IESP, NACCA],
  'aboriginal-entrepreneurship-program-how-to-apply': [ISC_AEP, NACCA],
};
