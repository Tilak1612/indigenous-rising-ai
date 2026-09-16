/**
 * Search-result titles for blog posts, keyed by slug.
 *
 * The on-page H1 stays the post's full `title`; this is only the <title> tag
 * (and og:title). 49 of 51 post titles ran past ~60 characters on their own —
 * before " | Indigenous Rising AI" was appended — so Google truncated nearly
 * every blog result mid-phrase. Each entry keeps the article's real subject and
 * primary query, stays at or under 60 characters, and never promises anything
 * the article does not cover.
 *
 * Years are deliberately left out: most titles said "2025", which reads as
 * stale in results from 2026 onward. Those posts are flagged for a content
 * refresh in SEO-AUDIT.md — the fix for dated content is updating it, not
 * re-dating the title.
 *
 * Guarded by src/__tests__/seo-titles.test.ts (length, uniqueness, coverage).
 */
export const blogSeoTitles: Record<string, string> = {
  'aboriginal-capital-corporations-complete-guide-canada': 'Aboriginal Capital Corporations (ACCs): A Complete Guide',
  'bc-indigenous-business-grants-loans-complete-resource': 'BC Indigenous Business Grants and Loans',
  'bookkeeping-accounting-indigenous-business-canada-2025': 'Bookkeeping for Indigenous Small Businesses in Canada',
  'economic-reconciliation-indigenous-business-funding-self-determination': 'Economic Reconciliation and Indigenous Business Funding',
  'funding-indigenous-women-entrepreneurs-grants-loans-resources': 'Funding for Indigenous Women Entrepreneurs in Canada',
  'how-to-apply-indigenous-business-funding-step-by-step': 'How to Apply for Indigenous Business Funding',
  'how-to-get-certified-indigenous-business-canada': 'How to Get Certified as an Indigenous Business in Canada',
  'how-to-write-winning-indigenous-business-plan-funding': 'How to Write an Indigenous Business Plan for Funding',
  'indigenous-agriculture-farming-grants-canada-2025': 'Indigenous Agriculture and Farming Grants in Canada',
  'indigenous-arts-crafts-business-guide-canada-2025': 'Starting an Indigenous Arts and Crafts Business',
  'indigenous-business-exporting-international-trade-canada-2025': 'Exporting Indigenous Products: A Trade Guide',
  'indigenous-business-funding-alberta-complete-guide': 'Indigenous Business Funding in Alberta',
  'indigenous-business-grants-atlantic-canada-2025': 'Indigenous Business Grants in Atlantic Canada',
  'indigenous-business-grants-manitoba-2025': 'Indigenous Business Grants and Funding in Manitoba',
  'indigenous-business-grants-quebec-autochtones-2025': 'Indigenous Business Grants in Quebec',
  'indigenous-business-grants-saskatchewan-2025': 'Indigenous Business Grants and Funding in Saskatchewan',
  'indigenous-business-marketing-digital-strategy-2025': 'Digital Marketing for Indigenous Businesses',
  'indigenous-business-mentorship-programs-canada-2025': 'Indigenous Business Mentorship Programs in Canada',
  'indigenous-business-networking-events-conferences-canada-2025': 'Indigenous Business Networking Events in Canada',
  'indigenous-business-northern-remote-communities-canada-2025': 'Running a Business in Northern and Remote Communities',
  'indigenous-business-succession-planning-guide-canada': 'Indigenous Business Succession Planning',
  'indigenous-business-tax-guide-canada-2025': 'Indigenous Business Tax: Section 87 and CRA Rules',
  'indigenous-cannabis-business-canada-2025-legal-guide': 'Indigenous Cannabis Business in Canada: Legal Guide',
  'indigenous-clean-energy-green-business-funding-opportunities': 'Indigenous Clean Energy Business Funding',
  'indigenous-community-economic-development-funding-nation-building': 'Community Economic Development Funding for Nations',
  'indigenous-construction-business-canada-2025': 'Starting an Indigenous Construction Business',
  'indigenous-cooperative-business-model-canada-2025': 'Indigenous Cooperatives: Community-Owned Businesses',
  'indigenous-ecommerce-guide-selling-online-canada-2025': 'Indigenous E-Commerce: How to Sell Online in Canada',
  'indigenous-entrepreneurs-disabilities-accessibility-business-canada': 'Indigenous Entrepreneurs with Disabilities: Support',
  'indigenous-financial-institutions-community-banking-partners': 'Indigenous Financial Institutions Explained',
  'indigenous-fisheries-aquaculture-business-canada-2025': 'Indigenous Fisheries and Aquaculture Business Guide',
  'indigenous-food-business-canada-restaurant-catering-2025': 'Starting an Indigenous Food Business in Canada',
  'indigenous-franchise-opportunities-canada-2025': 'Franchise Opportunities for Indigenous Entrepreneurs',
  'indigenous-healthcare-wellness-business-canada-2025': 'Indigenous Health and Wellness Business Guide',
  'indigenous-intellectual-property-protection-canada-2025': 'Protecting Indigenous Intellectual Property in Canada',
  'indigenous-mining-natural-resources-business-canada-2025': 'Indigenous Mining and Natural Resources Business',
  'indigenous-real-estate-development-canada-2025': 'Indigenous Real Estate Development in Canada',
  'indigenous-social-enterprise-guide-canada-2025': 'Indigenous Social Enterprise in Canada',
  'indigenous-tourism-business-funding-grants-cultural-enterprises': 'Indigenous Tourism Business Funding and Grants',
  'indigenous-veterans-business-support-canada-2025': 'Business Support for Indigenous Veterans in Canada',
  'indigenous-youth-entrepreneur-programs-funding-canada': 'Indigenous Youth Entrepreneur Programs and Funding',
  'inuit-business-support-funding-programs-inuit-nunangat': 'Inuit Business Support and Funding Programs',
  'metis-specific-business-funding-economic-development-programs': 'Métis Business Funding and Development Programs',
  'non-repayable-indigenous-business-contributions-explained': 'Non-Repayable Indigenous Business Contributions',
  'ontario-indigenous-business-funding-programs-grants-support': 'Ontario Indigenous Business Funding and Grants',
  'procurement-ready-corporate-indigenous-partnership-opportunities': 'Indigenous Procurement: Getting Partnership-Ready',
  'rural-remote-indigenous-business-funding-overcoming-distance': 'Rural and Remote Indigenous Business Funding',
  'starting-indigenous-tech-business-funding-support-2025': 'Starting an Indigenous Tech Business: Funding',
  'two-spirit-lgbtq-indigenous-entrepreneur-support-canada': 'Two-Spirit and LGBTQ+ Indigenous Entrepreneur Support',
  'ultimate-guide-indigenous-business-grants-canada-2025': 'Indigenous Business Grants in Canada: The Complete Guide',
  'understanding-isets-aboriginal-skills-development-business-training': 'ISETS Explained: Indigenous Skills and Training Funds',
};

const SITE_SUFFIX = ' | Indigenous Rising AI';
const MAX_TITLE = 60;

/**
 * The <title> for a page: the site name is appended only when the whole thing
 * still fits. Google already shows the site name above each result (from the
 * WebSite structured data), so a suffix that forces truncation costs the
 * keyword-bearing part of the title and buys nothing.
 *
 * Mirrored in scripts/prerender.mjs (which cannot import TS) — keep in sync;
 * the test compares the two.
 */
export function pageTitle(title: string): string {
  const t = String(title || '').trim();
  return (t + SITE_SUFFIX).length <= MAX_TITLE ? t + SITE_SUFFIX : t;
}
