/**
 * Questions and answers for the preparation tools, templates and guides.
 *
 * One source, two readers: ResourcePage renders them as a visible FAQ, and
 * scripts/prerender.mjs emits the same text as FAQPage JSON-LD in the static
 * HTML, so the schema always matches what a visitor can read. Every answer
 * restates something the page itself says. None adds a fact the page does not
 * carry, and none states a funder's rule. Guarded by
 * src/data/__tests__/resourceFaqs.test.ts.
 */
export interface ResourceFaq { question: string; answer: string }

export const RESOURCE_FAQS: Record<string, ResourceFaq[]> = {
  '/tools/business-loan-calculator': [
    { question: 'Is the loan calculator result a quote from a lender?', answer: 'No. It is arithmetic from the amount, rate and term you enter. A lender sets the real rate, fees and conditions after reviewing your application, and Indigenous Rising AI does not lend money or decide who qualifies.' },
    { question: 'Why does the calculator not suggest an interest rate?', answer: 'Rates depend on the lender, the business and the loan, so any default rate would be a guess presented as a fact. Use the rate a lender quoted you, or try a few rates to see the range.' },
    { question: 'How is the payment worked out?', answer: 'It assumes an ordinary blended loan where every payment is the same amount. The annual rate is divided by the number of payments in a year, and the payment is the standard amortization amount. At a zero rate the payment is the amount divided by the number of payments.' },
    { question: 'What can make a real loan payment different from the estimate?', answer: 'Fees, a different compounding period, interest-only months, a variable rate, a final balloon payment, or a non-repayable contribution paired with the loan that lowers what you borrow.' },
  ],
  '/tools/startup-cost-calculator': [
    { question: 'What is a funding gap?', answer: 'It is the total project cost, including the working capital you choose to hold, minus the money you already have or expect. It is the amount you are asking a lender or funder to help close.' },
    { question: 'Does the calculator know which costs a funder will pay for?', answer: 'No. Nothing in it decides which costs are eligible. Each funder publishes its own eligible costs, and some only count costs incurred after they approve your application.' },
    { question: 'How many months of working capital should I include?', answer: 'The calculator starts at three months only as a starting point. It is not a rule any funder sets, so ask the institution you are applying to what it expects.' },
    { question: 'Is my budget saved or sent anywhere?', answer: 'No. The budget stays in your browser tab and is not sent to Indigenous Rising AI or saved to an account. You can download it as a spreadsheet.' },
  ],
  '/indigenous-financial-institutions-directory': [
    { question: 'Is this the full list of Indigenous Financial Institutions?', answer: 'No. It lists the institutions in our funding catalogue. The National Aboriginal Capital Corporations Association (NACCA) publishes the listing of every Indigenous Financial Institution in its network, and the page links to it first.' },
    { question: 'How do I know which lender serves my community?', answer: 'Filter by province or territory, then contact the institution and ask whether it serves your community and your kind of business. Service areas overlap in some regions and are tightly defined in others.' },
    { question: 'Who can borrow from these institutions?', answer: 'Some serve First Nations entrepreneurs, some serve Métis entrepreneurs, and some serve all Indigenous applicants in their area. Eligibility, including which identification is accepted, is set by each institution.' },
    { question: 'What should I ask a lender before preparing an application?', answer: 'Whether it serves your community and business, which of its loans or contributions fit your project, and what it needs to see first. Many ask for a business plan and a project budget.' },
  ],
  '/guides/indigenous-funding-equity-requirements': [
    { question: 'What is owner equity in a funding application?', answer: 'Your own contribution to the project, usually cash and sometimes assets you already own and put into the business. Whether in-kind or borrowed money counts is a question for each funder.' },
    { question: 'What is a non-repayable contribution?', answer: 'Money you do not pay back if you meet the agreement’s conditions. It is often a share of eligible costs, often capped, and often conditional on a loan or owner equity covering the rest.' },
    { question: 'Can I spend money on the project before the funder approves it?', answer: 'Some programmes only count costs incurred after an agreement is signed. If you must commit early, ask the funder in writing whether that cost can still be included.' },
    { question: 'How much of the project must I pay for myself?', answer: 'It depends on the lender. For example, the First Peoples Economic Growth Fund in Manitoba asks for at least 10% cash equity for its Business Contribution Fund, and Waubetek in northeastern Ontario asks for a 10% unencumbered equity contribution. Other lenders publish no percentage, so ask the institution that serves you.' },
  ],
  '/guides/indigenous-funding-application-mistakes': [
    { question: 'Why do Indigenous business funding applications get delayed?', answer: 'Usually because something is missing rather than wrong with the idea: a plan that skips the funder’s questions, costs without quotes, no cash flow forecast, or an application sent to a lender that does not serve the area.' },
    { question: 'In what order should I prepare a funding application?', answer: 'Contact the institution first, then write the plan, then build the budget and cash flow from the plan, then gather quotes and proof of your own contribution.' },
    { question: 'What should I do if my application is declined?', answer: 'Ask the funder what would change their answer. It is the quickest way to learn which gap to close before you apply again.' },
  ],
  '/guides/business-plan-funding': [
    { question: 'Will a funder pay 75 percent of my business plan?', answer: 'Not as a general rule. Two institutions publish up to 75 percent: the First Peoples Economic Growth Fund in Manitoba, capped at $20,000, and the Clarence Campeau Development Fund in Saskatchewan, which says it can consider that share. Other institutions publish no percentage.' },
    { question: 'Can I hire the consultant before the funding is approved?', answer: 'Wait for written approval. The Manitoba fund states that funding must be approved before the consultant starts, and other institutions may only count costs they approved first.' },
    { question: 'Does business plan funding pay for my own time?', answer: 'The programmes listed pay toward a professional consultant’s work, not the owner’s own time. Ask the institution what it counts before you plan around it.' },
  ],
  '/templates/one-page-business-plan': [
    { question: 'What is a one-page business plan for?', answer: 'It is the short version of your business in eleven answers. It is what you bring to a first conversation with a lender or an economic development officer, and the outline you expand into a full plan later.' },
    { question: 'Is the worked example a real business?', answer: 'No. Riverbend Books & Payroll is a fictional business. Its numbers are made up to show how the template works and are not benchmarks.' },
    { question: 'Do I need an account to download the template?', answer: 'No. The template and the worked example are free and download without an account. The files are made in your browser.' },
  ],
  '/templates/cash-flow-forecast': [
    { question: 'Why do lenders ask for a cash flow forecast?', answer: 'A business can be profitable over a year and still run out of cash in a single month. The forecast shows the money coming in and going out each month, including the loan payment.' },
    { question: 'Does the template calculate the totals for me?', answer: 'Yes. The spreadsheet has the totals, net cash flow and closing cash built in as formulas, and each month opens with the previous month’s closing cash. It opens in Excel, Google Sheets or LibreOffice.' },
    { question: 'What should I do if a month closes below zero?', answer: 'Plan for it before you apply: hold more working capital, reduce the loan payment, or lower costs in that month.' },
  ],
  '/templates/funding-project-budget': [
    { question: 'What goes in a funding application budget?', answer: 'Every cost of the project, the quote each amount comes from, whether the funder counts it as eligible, and which source pays for it: owner equity, a loan, a grant or contribution, or something else.' },
    { question: 'Do I need quotes for every cost?', answer: 'Attach quotes for equipment, renovation and vehicles, and mark anything else as an estimate. Ask the funder which lines need quotes.' },
    { question: 'Should the budget include a contingency?', answer: 'A small contingency line is common. Its size is your decision unless the funder sets one.' },
  ],
  '/templates/community-impact-statement': [
    { question: 'What is a community impact statement?', answer: 'The part of a business plan that explains how the business will benefit the community, in a form a reviewer can check: what is true now, what is planned, and how you will measure it.' },
    { question: 'How do I write about community priorities?', answer: 'Only describe priorities your community has stated, say where they were stated, and speak with the people the statement is about before you write about them.' },
    { question: 'Should I separate projections from evidence?', answer: 'Yes. Mark every line as already true or as a plan. A reviewer trusts a short, honest statement more than a long list of hopes.' },
  ],
  '/templates/indigenous-business-plan-examples': [
    { question: 'Are these real business plans?', answer: 'No. All three businesses are fictional. Their names, numbers and conversations are made up to show how the six-section plan works, and are not benchmarks for what a business like yours will cost or earn.' },
    { question: 'Why does the tourism example hold money back after the season?', answer: 'Its revenue arrives in four months, but loan payments continue all year. The plan sets aside a reserve from the season to make the payments in the months with no trips.' },
    { question: 'Can I copy an example into my own plan?', answer: 'Copy the structure, not the answers. A funder reads a plan to see whether you understand your own customers, costs and risks, so write each section from your own evidence.' },
  ],
  '/guides/indigenous-business-data-sovereignty-questions': [
    { question: 'Does Indigenous Rising send my information to an AI company?', answer: 'Only when you use an AI feature. Funding matching and the member assistant send limited information to OpenAI, and the public Ask Agent sends your chat messages to Anthropic. Funding matching does not send your name, contact details, identity or community; the assistants send what you type in the chat. Neither provider uses this data to train its models.' },
    { question: 'Is my data processed in Canada?', answer: 'Your account, business plans, documents and files are stored in Canada. AI requests are processed on each provider\u2019s servers, which may be outside Canada.' },
    { question: 'What should I not type into an AI tool?', answer: 'Anything you would not want processed outside the tool\u2019s own systems, such as personal health or financial account details, and any community information your community has not agreed to share.' },
  ],
  '/guides/funding-program-changes': [
    { question: 'Is the Aboriginal Business Investment Fund open?', answer: 'Not on 3 November 2026. Alberta says the 2026-27 intake is closed and that information on the 2027-28 intake is expected in spring 2027. It funds Indigenous communities and the businesses they own, not individual entrepreneurs.' },
    { question: 'What happened to the Ontario Aboriginal Loan Guarantee Program?', answer: 'Ontario renamed it the Indigenous Opportunities Financing Program and moved it to the Building Ontario Fund, which became administrator on 1 October 2025. It backs loans or bonds that Indigenous-owned entities use to buy equity in energy, resource and critical minerals projects, and is not a loan or grant itself.' },
    { question: 'How do I know if a funding programme is still open?', answer: 'Check the funder\u2019s own page on the day you apply. This log shows the date each change was seen or took effect, and every programme in our directory shows when it was last checked against the funder.' },
  ],
  '/guides/choosing-funding-business-or-community': [
    { question: 'Where does an individual Indigenous entrepreneur apply for the Aboriginal Entrepreneurship Program?', answer: 'Through the Indigenous Financial Institution or Métis Capital Corporation that serves them. The programme page says individual Indigenous entrepreneurs may receive up to $99,999 and eligible Indigenous community businesses up to $250,000, and that there is no deadline to apply.' },
    { question: 'Who can apply to the Community Opportunity Readiness Program?', answer: 'Its guidelines name First Nation and Inuit communities and their governments, including tribal councils, located in the provinces. They also ask the applicant to contribute at least 10% in cash.' },
    { question: 'Can a Métis community apply to these community programmes?', answer: 'The two community programmes on this page name First Nation and Inuit communities as applicants. Métis entrepreneurs reach the Access to Capital stream through Métis Capital Corporations, and Métis governments should ask Indigenous Services Canada which programmes apply to them.' },
  ],
  '/guides/funding-document-checklist-by-lender': [
    { question: 'What documents do Indigenous lenders usually ask for?', answer: 'Most of the lists we read name a completed application, proof of Indigenous identity in the form the lender accepts, proof of your own cash equity, a resume, a business plan and quotes for purchases. Existing businesses are also asked for past financial statements.' },
    { question: 'Do all lenders ask for a status card?', answer: 'No. The kind of proof depends on whom the lender serves: some ask for a status card, Métis lenders ask for a Métis citizenship card, and Futurpreneur uses self-identification. Ask the lender which documents it accepts.' },
    { question: 'Does a blank cell mean the lender does not need that document?', answer: 'No. A blank cell means the document is not named in the source we read. Every lender can ask for more, so confirm the full list with the institution that serves you.' },
  ],
};
