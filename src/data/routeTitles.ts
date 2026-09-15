/**
 * The <title> for every prerendered marketing route — one value, two readers.
 *
 * scripts/prerender.mjs writes it into the static HTML and each page component
 * sets the same string through Helmet, so the tab updates on client-side
 * navigation. They used to be separate literals and had drifted on 12 of 23
 * routes: "Frequently asked questions" vs "Frequently Asked Questions",
 * "Terms of Service | …" vs "Terms of Service - …", "Contact us" vs
 * "Contact Us | Get Support". Google indexes the rendered title, so each of
 * those pages effectively had two identities.
 *
 * Every entry is at or under 60 characters, since Google truncates around
 * there. Guarded by src/__tests__/seo-title-parity.test.ts.
 */
export const ROUTE_TITLES: Record<string, string> = {
  '/': 'Indigenous Business Funding Platform | Indigenous Rising AI',
  '/auth': 'Sign In | Indigenous Rising AI',
  '/signup': 'Create Your Account | Indigenous Rising AI',
  '/pricing': 'Pricing: Free, Growth & Nations Plans | Indigenous Rising AI',
  '/blog': 'Indigenous Business Funding Blog | Indigenous Rising AI',
  '/guides/indigenous-business-grants': 'Indigenous Business Grants & Funding in Canada',
  '/demo': 'Book a Demo | Indigenous Rising AI',
  '/contact': 'Contact Us | Indigenous Rising AI',
  '/faq': 'Frequently Asked Questions | Indigenous Rising AI',
  '/success-stories': 'Success Stories | Indigenous Rising AI',
  '/careers': 'Careers | Indigenous Rising AI',
  '/training': 'AI Training Program | Indigenous Rising AI',
  '/community': 'Community Forum | Indigenous Rising AI',
  '/compliance': 'Canadian Regulatory Alignment | Indigenous Rising AI',
  '/privacy': 'Privacy Policy | Indigenous Rising AI',
  '/terms': 'Terms of Service | Indigenous Rising AI',
  '/accessibility': 'Accessibility Statement | Indigenous Rising AI',
  '/cookies': 'Cookie Policy | Indigenous Rising AI',
  '/funding': 'Find Indigenous Business Funding | Indigenous Rising AI',
  '/funding/alerts': 'Free Weekly Funding Alerts | Indigenous Rising AI',
  '/impact': 'Community Impact Tracker | Indigenous Rising AI',
  '/plan': 'Indigenous Business Plan Builder | Indigenous Rising AI',
  '/track-request': 'Track a Data Request | Indigenous Rising AI',
  '/data-rights': 'Your Data Rights | Indigenous Rising AI',
};

/** The title for a route, or undefined for routes that are not prerendered. */
export const routeTitle = (path: string): string | undefined => ROUTE_TITLES[path];
