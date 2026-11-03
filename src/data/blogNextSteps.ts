/**
 * "Next steps" links from blog explainers to the page that now owns each
 * intent, per the keyword and page plan: the explainer stays the explainer,
 * and the reader is sent to the verified directory, lender list, calculator or
 * template that does the job. Each target is a prerendered route, checked by
 * src/data/__tests__/blogNextSteps.test.ts.
 */
export interface NextStep { to: string; label: string }

const province = (slug: string, name: string): NextStep => ({ to: `/funding/${slug}`, label: `Programmes checked against funders in ${name}` });
const LENDERS: NextStep = { to: '/indigenous-financial-institutions-directory', label: 'Find the Indigenous lender that serves your area' };
const GAP: NextStep = { to: '/tools/startup-cost-calculator', label: 'Work out your funding gap' };
const LOAN: NextStep = { to: '/tools/business-loan-calculator', label: 'Estimate a loan payment' };
const EQUITY: NextStep = { to: '/guides/indigenous-funding-equity-requirements', label: 'Owner equity and matching funds, explained' };
const GAPS: NextStep = { to: '/guides/indigenous-funding-application-mistakes', label: 'Check your application for common gaps' };
const BUDGET: NextStep = { to: '/templates/funding-project-budget', label: 'Funding application budget template' };
const CASH: NextStep = { to: '/templates/cash-flow-forecast', label: 'Cash flow forecast template' };
const PLAN: NextStep = { to: '/indigenous-business-plan-template', label: 'Business plan template with a worked example' };
const DOCS: NextStep = { to: '/guides/funding-document-checklist-by-lender', label: 'What different lenders ask you to attach' };
const CHOOSE: NextStep = { to: '/guides/choosing-funding-business-or-community', label: 'Funding for your own business or a community enterprise?' };
const EXAMPLES: NextStep = { to: '/templates/indigenous-business-plan-examples', label: 'Business plan examples for three kinds of business' };
const ONE: NextStep = { to: '/templates/one-page-business-plan', label: 'One-page business plan template' };
const IMPACT: NextStep = { to: '/templates/community-impact-statement', label: 'Community impact statement template' };
const LOANS: NextStep = { to: '/funding/indigenous-business-loans', label: 'Compare Indigenous business loans' };

export const BLOG_NEXT_STEPS: Record<string, NextStep[]> = {
  'indigenous-business-funding-alberta-complete-guide': [province('alberta', 'Alberta'), LENDERS, GAP],
  'bc-indigenous-business-grants-loans-complete-resource': [province('british-columbia', 'British Columbia'), LENDERS, GAP],
  'ontario-indigenous-business-funding-programs-grants-support': [province('ontario', 'Ontario'), LENDERS, GAP],
  'indigenous-business-grants-manitoba-2025': [province('manitoba', 'Manitoba'), LENDERS, GAP],
  'indigenous-business-grants-saskatchewan-2025': [province('saskatchewan', 'Saskatchewan'), LENDERS, GAP],
  'indigenous-business-grants-quebec-autochtones-2025': [province('quebec', 'Quebec'), LENDERS, GAP],
  'indigenous-business-grants-atlantic-canada-2025': [
    province('nova-scotia', 'Nova Scotia'), province('new-brunswick', 'New Brunswick'),
    province('prince-edward-island', 'Prince Edward Island'), province('newfoundland-and-labrador', 'Newfoundland and Labrador'), LENDERS,
  ],
  'indigenous-business-northern-remote-communities-canada-2025': [
    province('yukon', 'Yukon'), province('northwest-territories', 'the Northwest Territories'), province('nunavut', 'Nunavut'), LENDERS,
  ],
  'inuit-business-support-funding-programs-inuit-nunangat': [province('nunavut', 'Nunavut'), province('newfoundland-and-labrador', 'Newfoundland and Labrador'), LENDERS],
  'metis-specific-business-funding-economic-development-programs': [LENDERS, EQUITY, PLAN],
  'funding-indigenous-women-entrepreneurs-grants-loans-resources': [LENDERS, GAP, PLAN],
  'indigenous-business-loans-canada': [LOANS, LOAN, LENDERS],
  'indigenous-financial-institutions-community-banking-partners': [LENDERS, LOAN, EQUITY],
  'aboriginal-capital-corporations-complete-guide-canada': [LENDERS, LOAN, LOANS],
  'indigenous-business-funding-checklist': [DOCS, GAPS, BUDGET, CASH],
  'how-to-apply-indigenous-business-funding-step-by-step': [GAPS, BUDGET, LENDERS],
  'indigenous-community-economic-development-funding-nation-building': [CHOOSE, BUDGET, { to: '/for-economic-development-officers', label: 'Tools for economic development officers' }],
  'how-to-write-winning-indigenous-business-plan-funding': [PLAN, EXAMPLES, { to: '/guides/business-plan-funding', label: 'Funding to pay for a business plan' }, ONE],
  'non-repayable-indigenous-business-contributions-explained': [EQUITY, GAP, BUDGET],
};
