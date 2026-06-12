// Real, downloadable starter templates. These are genuine, useful documents
// authored as plain text/markdown/CSV — no fabricated download counts, ratings,
// or "PRO" gating. Content is generic business scaffolding (no fabricated
// claims, certifications, or cultural content requiring community review).

export interface BusinessTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  filename: string;
  mime: string;
  content: string;
}

const businessPlan = `# Business Plan

## 1. Executive summary
- Business name and location
- What you do, in one or two sentences
- The opportunity and why now
- What you are asking for (funding, partnership, etc.)

## 2. Business description
- Legal structure and ownership
- Products or services
- Stage (idea, startup, operating, expanding)

## 3. Market
- Who your customers are
- Size of the opportunity (with your sources)
- Competitors and how you are different

## 4. Operations
- How the product/service is delivered
- Key suppliers, tools, and facilities
- Team and roles

## 5. Marketing and sales
- How customers find you
- Pricing
- Sales process

## 6. Financials
- Startup costs
- Revenue model
- 12-month cash-flow outlook (see the Financial Projections template)
- Funding required and how it will be used

## 7. Milestones
- Next 3 months
- Next 12 months
- How you will measure success
`;

const grantWorksheet = `# Grant Application Worksheet

Use this to prepare before you start an application. Keep answers short and specific.

## About the grant
- Program name:
- Funder:
- Deadline:
- Maximum amount:
- Eligibility requirements (list each, and how you meet it):

## Your request
- Amount requested:
- What the funds will pay for (itemized):
- Total project budget:
- Other funding sources (confirmed and pending):

## The project
- Problem or opportunity (2-3 sentences):
- What you will do:
- Who benefits, and how many:
- Timeline (start, key milestones, end):
- How you will measure results:

## Capacity
- Why your team can deliver this:
- Relevant past work:
- Partners and their roles:

## Attachments checklist
- [ ] Budget
- [ ] Quotes/estimates
- [ ] Letters of support
- [ ] Financial statements
- [ ] Business registration
`;

const financialProjections = `Month,Revenue,Cost of goods,Wages,Rent,Marketing,Other expenses,Net
1,0,0,0,0,0,0,0
2,0,0,0,0,0,0,0
3,0,0,0,0,0,0,0
4,0,0,0,0,0,0,0
5,0,0,0,0,0,0,0
6,0,0,0,0,0,0,0
7,0,0,0,0,0,0,0
8,0,0,0,0,0,0,0
9,0,0,0,0,0,0,0
10,0,0,0,0,0,0,0
11,0,0,0,0,0,0,0
12,0,0,0,0,0,0,0
`;

const invoice = `Field,Value
Invoice number,
Invoice date,
Due date,
,
From (business name),
Address,
Email,
,
Bill to (client),
Client address,
,
Description,Amount
Item 1,
Item 2,
Item 3,
,
Subtotal,
Tax,
Total due,
,
Payment instructions,
`;

const impactReport = `# Community Impact Report

## Overview
- Reporting period:
- Prepared for (funder/stakeholder):
- One-paragraph summary of the period:

## What we set out to do
- Goals for this period:

## What we did
- Activities and reach:
- Jobs / training / programs (numbers you can verify):

## Outcomes
- Results, with how each was measured:
- Stories shared with permission:

## Finances
- Funding received and from whom:
- How funds were used:

## Next period
- Priorities:
- What support you need:
`;

const dataChecklist = `# Data Practices Checklist

A practical checklist for handling community and customer data responsibly,
aligned with the OCAP(R) principles (Ownership, Control, Access, Possession).
This is a working aid, not a certification or legal advice.

## Ownership
- [ ] It is clear who owns each dataset you hold
- [ ] Community/customer data is treated as belonging to them, not to you

## Control
- [ ] You collect consent before gathering personal data
- [ ] People can change or withdraw consent
- [ ] Access to data is limited to those who need it

## Access
- [ ] People can see what data you hold about them
- [ ] People can export their data on request
- [ ] Requests are handled within a defined timeframe

## Possession
- [ ] You know where your data is physically stored
- [ ] Backups and third-party processors are documented
- [ ] You can retrieve or delete data when asked

## Review
- [ ] Review this checklist on a set schedule
- [ ] Record who is responsible for each item
`;

export const TEMPLATES: BusinessTemplate[] = [
  {
    id: 'business-plan',
    title: 'Business plan outline',
    description: 'A structured outline covering every section funders expect to see.',
    category: 'Business Planning',
    filename: 'business-plan-outline.md',
    mime: 'text/markdown',
    content: businessPlan,
  },
  {
    id: 'grant-worksheet',
    title: 'Grant application worksheet',
    description: 'Prepare your answers before you start an application.',
    category: 'Funding',
    filename: 'grant-application-worksheet.md',
    mime: 'text/markdown',
    content: grantWorksheet,
  },
  {
    id: 'financial-projections',
    title: 'Financial projections (12 months)',
    description: 'A starter spreadsheet for a 12-month cash-flow outlook.',
    category: 'Finance',
    filename: 'financial-projections.csv',
    mime: 'text/csv',
    content: financialProjections,
  },
  {
    id: 'invoice',
    title: 'Invoice template',
    description: 'A simple, professional invoice you can fill in and send.',
    category: 'Finance',
    filename: 'invoice-template.csv',
    mime: 'text/csv',
    content: invoice,
  },
  {
    id: 'impact-report',
    title: 'Community impact report',
    description: 'Document and share your impact with funders and stakeholders.',
    category: 'Impact',
    filename: 'impact-report-outline.md',
    mime: 'text/markdown',
    content: impactReport,
  },
  {
    id: 'data-checklist',
    title: 'Data practices checklist',
    description: 'A working checklist for responsible data handling, aligned with OCAP(R).',
    category: 'Compliance',
    filename: 'data-practices-checklist.md',
    mime: 'text/markdown',
    content: dataChecklist,
  },
];

export const TEMPLATE_CATEGORIES = [
  'All',
  ...Array.from(new Set(TEMPLATES.map((t) => t.category))),
];
