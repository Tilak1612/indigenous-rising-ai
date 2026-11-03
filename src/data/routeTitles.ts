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
  '/guides/indigenous-business-funding-statistics': 'Indigenous Business Funding: What We Verify',
  '/grantcompass-alternative': 'GrantCompass Alternative for Indigenous Business',
  '/liveplan-alternative': 'LivePlan Alternative for Indigenous Entrepreneurs',
  '/upmetrics-alternative': 'Upmetrics Alternative for Indigenous Entrepreneurs',
  '/fundica-alternative': 'Fundica Alternative for Indigenous Business Funding',
  '/for-economic-development-officers': 'Tools for Indigenous Economic Development Officers',
  '/for-funders': 'For Funders and Indigenous Support Organizations',
  '/ocap-data-sovereignty-software': 'Indigenous Data Sovereignty and How We Handle Data',
  '/account-deletion': 'Delete Your Account | Indigenous Rising AI',
  '/guides/what-is-ocap': 'What is OCAP®? Principles and Vendor Questions',
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
  '/funding/alberta': 'Indigenous Business Funding in Alberta',
  '/funding/british-columbia': 'Indigenous Business Funding in British Columbia',
  '/funding/manitoba': 'Indigenous Business Funding in Manitoba',
  '/funding/new-brunswick': 'Indigenous Business Funding in New Brunswick',
  '/funding/newfoundland-and-labrador': 'Indigenous Business Funding in Newfoundland & Labrador',
  '/funding/nova-scotia': 'Indigenous Business Funding in Nova Scotia',
  '/funding/northwest-territories': 'Indigenous Business Funding in the Northwest Territories',
  '/funding/nunavut': 'Indigenous Business Funding in Nunavut',
  '/funding/ontario': 'Indigenous Business Funding in Ontario',
  '/funding/prince-edward-island': 'Indigenous Business Funding in Prince Edward Island',
  '/funding/quebec': 'Indigenous Business Funding in Quebec',
  '/funding/saskatchewan': 'Indigenous Business Funding in Saskatchewan',
  '/funding/yukon': 'Indigenous Business Funding in Yukon',
  '/funding/indigenous-business-loans': 'Indigenous Business Loans in Canada: Compare Lenders',
  '/funding/indigenous-business-grants': 'Indigenous Business Grants and Contributions in Canada',
  '/impact': 'Community Impact Tracker | Indigenous Rising AI',
  '/indigenous-business-plan-template': 'Free Indigenous Business Plan Template and Example',
  '/plan': 'Indigenous Business Plan Builder | Indigenous Rising AI',
  '/track-request': 'Track a Data Request | Indigenous Rising AI',
  '/data-rights': 'Your Data Rights | Indigenous Rising AI',
  // Preparation tools, templates and guides from the keyword and page plan.
  '/tools/business-loan-calculator': 'Business Loan Calculator for Indigenous Entrepreneurs',
  '/tools/startup-cost-calculator': 'Startup Cost Calculator and Funding Gap Budget',
  '/indigenous-financial-institutions-directory': 'Find an Indigenous Financial Institution by Province',
  '/guides/indigenous-funding-equity-requirements': 'Owner Equity and Matching Funds for Indigenous Funding',
  '/guides/indigenous-funding-application-mistakes': 'Common Indigenous Business Funding Application Gaps',
  '/templates/one-page-business-plan': 'One-Page Business Plan for Indigenous Entrepreneurs',
  '/templates/cash-flow-forecast': 'Cash Flow Forecast Template for a Funding Application',
  '/templates/funding-project-budget': 'Funding Application Budget Template and Example',
  '/fr/financement-entreprise-autochtone': 'Financement pour entreprises autochtones au Canada',
  '/fr/plan-affaires-entreprise-autochtone': 'Plan d’affaires pour entreprise autochtone : modèle gratuit',
  '/guides/business-plan-funding': 'Funding to Pay for an Indigenous Business Plan',
  '/templates/community-impact-statement': 'Community Impact Statement Template for a Business Plan',
  '/templates/indigenous-business-plan-examples': 'Indigenous Business Plan Examples by Business Type',
  '/guides/choosing-funding-business-or-community': 'Funding for an Individual Business or a Community Enterprise',
  '/guides/funding-program-changes': 'Indigenous Business Funding Updates and Intake Changes',
  '/guides/funding-document-checklist-by-lender': 'Business Funding Documents: What Indigenous Lenders Ask For',
};

/** The title for a route, or undefined for routes that are not prerendered. */
export const routeTitle = (path: string): string | undefined => ROUTE_TITLES[path];
