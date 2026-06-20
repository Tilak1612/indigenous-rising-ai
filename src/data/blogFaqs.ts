/**
 * FAQ Q&A keyed by blog slug. Merged onto the matching post (see blogPosts.ts)
 * so it renders as a visible FAQ block AND emits FAQPage schema (featured-snippet
 * + AI-extraction lever). Answers are accurate, general guidance grounded in each
 * article's content — they reference only real programs the articles already name
 * and avoid inventing specific amounts/deadlines.
 */
export const blogFaqs: Record<string, { question: string; answer: string }[]> = {
  'ultimate-guide-indigenous-business-grants-canada-2025': [
    { question: 'Do I need Indian status to apply for Indigenous business grants in Canada?', answer: "Not always. Many programs serve Status and Non-Status First Nations, Métis, and Inuit entrepreneurs. Some require proof of Indigenous identity through community membership, Métis citizenship, or Inuit beneficiary status rather than Indian status specifically. Always check each program's eligibility criteria." },
    { question: 'Can I apply to more than one Indigenous funding program at the same time?', answer: 'Yes. Layering multiple funding sources — for example a federal contribution alongside a loan from an Indigenous Financial Institution — is a common strategy. Be transparent in each application about the other funding you are seeking.' },
    { question: 'Are Indigenous business grants the same as loans?', answer: "No. Grants and non-repayable contributions don't have to be paid back, while loans do. Many Indigenous entrepreneurs use a mix — a non-repayable contribution plus an Indigenous Financial Institution loan — to fund a business." },
    { question: 'How long does Indigenous business funding take to approve?', answer: 'Timelines vary widely — from roughly 4–6 weeks for smaller loans to 6–12 months for larger contributions and government programs. Apply early, well before you need the funds.' },
  ],
  'how-to-apply-indigenous-business-funding-step-by-step': [
    { question: 'What documents do I need to apply for Indigenous business funding?', answer: 'Most programs ask for a business plan, financial projections, proof of Indigenous identity (such as status, Métis citizenship, or Inuit beneficiary documentation), and basic business registration details. Gathering these before you start makes applications much faster.' },
    { question: 'Do I need a business plan to get Indigenous business funding?', answer: 'In almost all cases, yes. A clear business plan with financial projections is the single most important document — it shows funders your business is viable and that you understand your market, costs, and revenue.' },
    { question: 'What happens if my funding application is declined?', answer: "A decline isn't the end. Ask for feedback, strengthen the weak areas (often the financial projections or market research), and reapply or apply to a different program. Many successful applicants were turned down at least once." },
    { question: 'Can I get help preparing my application?', answer: 'Yes. Indigenous Financial Institutions, NACCA members, and business support organizations offer free or low-cost help with business plans and applications. Indigenous Rising AI can also help you build a plan and match to programs.' },
  ],
  'indigenous-business-funding-alberta-complete-guide': [
    { question: 'What funding is available for Indigenous businesses in Alberta?', answer: "Alberta entrepreneurs can access provincial supports such as the Alberta Indigenous Business Investment Fund (AIBIF) and ATB Financial's Indigenous banking services, alongside federal programs and loans from Indigenous Financial Institutions serving the province." },
    { question: 'Is there Métis-specific business funding in Alberta?', answer: 'Yes. Métis entrepreneurs in Alberta can access Métis-specific economic development and financing programs in addition to the broader provincial and federal options available to all Indigenous business owners.' },
    { question: 'Do Alberta Indigenous business grants have to be repaid?', answer: 'It depends on the program. Some are non-repayable contributions, while others — including most Indigenous Financial Institution products — are loans. Many entrepreneurs combine both.' },
    { question: 'Can I access federal Indigenous business programs from Alberta?', answer: 'Yes. Federal programs are available to eligible Indigenous entrepreneurs across Canada, including Alberta, and can be combined with provincial and Indigenous Financial Institution funding.' },
  ],
  'bc-indigenous-business-grants-loans-complete-resource': [
    { question: 'Where can Indigenous entrepreneurs in BC get business funding?', answer: 'BC entrepreneurs can work with the All Nations Trust Company, the BC Indigenous Business and Investment Council (BCIBIC), provincial programs, and federal funding — plus loans from Indigenous Financial Institutions serving British Columbia.' },
    { question: 'What is the All Nations Trust Company?', answer: 'All Nations Trust Company is an Indigenous Financial Institution serving BC that provides business loans and financing to First Nations, Métis, and Inuit entrepreneurs in the province.' },
    { question: 'Are there grants for BC Indigenous businesses, or only loans?', answer: 'Both. BC entrepreneurs can access non-repayable grants and contributions through provincial and federal programs, as well as loans through Indigenous Financial Institutions.' },
    { question: 'Can BC Indigenous businesses get federal funding too?', answer: 'Yes. Federal Indigenous business programs are open to eligible BC entrepreneurs and are often combined with provincial and Indigenous Financial Institution support.' },
  ],
  'ontario-indigenous-business-funding-programs-grants-support': [
    { question: 'What Indigenous business funding is available in Ontario?', answer: 'Ontario entrepreneurs can access the Aboriginal Loan Guarantee Program, FedNor Indigenous business funding, Métis Nation of Ontario economic development supports, and urban Indigenous business programs, plus federal funding and Indigenous Financial Institution loans.' },
    { question: 'Is there funding for Métis entrepreneurs in Ontario?', answer: 'Yes. The Métis Nation of Ontario offers economic development supports for Métis entrepreneurs, in addition to the provincial and federal programs available to all Indigenous business owners.' },
    { question: 'What is the Aboriginal Loan Guarantee Program?', answer: 'It is an Ontario program that helps Indigenous communities and businesses access financing by guaranteeing loans, which makes it easier to fund larger projects.' },
    { question: 'Can urban Indigenous entrepreneurs in Ontario get support?', answer: 'Yes. Ontario has business supports aimed specifically at urban Indigenous entrepreneurs, alongside on-reserve and community-based programs.' },
  ],
  'non-repayable-indigenous-business-contributions-explained': [
    { question: 'What is a non-repayable contribution?', answer: "A non-repayable contribution is funding you don't have to pay back, provided you use it for the approved purpose and meet the program's reporting requirements. It is different from a loan, which must be repaid." },
    { question: 'Are non-repayable Indigenous business contributions really "free money"?', answer: 'Not exactly. While you do not repay them, they come with eligibility rules, approved-use restrictions, and reporting obligations. Think of them as earned funding for a well-planned, eligible project.' },
    { question: 'Can I combine a non-repayable contribution with a loan?', answer: 'Yes. Many Indigenous entrepreneurs pair a non-repayable contribution with an Indigenous Financial Institution loan to fully fund a project — the contribution reduces how much you need to borrow.' },
    { question: "Do I have to repay a contribution if my business doesn't succeed?", answer: 'Generally no, as long as you used the funds for the approved purpose and met the reporting requirements. Misusing funds, however, can trigger repayment, so always follow your agreement’s terms.' },
  ],
  'funding-indigenous-women-entrepreneurs-grants-loans-resources': [
    { question: 'Is there business funding specifically for Indigenous women entrepreneurs?', answer: 'Yes. Indigenous women can access funding aimed at women entrepreneurs as well as Indigenous-specific programs, and can often combine the two. Indigenous Financial Institutions and women’s enterprise organizations are good starting points.' },
    { question: 'Can Indigenous women apply to both women-focused and Indigenous-focused programs?', answer: 'Yes. Layering a women-entrepreneur program with an Indigenous business program is a common and accepted strategy, as long as you are transparent in each application.' },
    { question: 'Do Indigenous women entrepreneurs need status to qualify?', answer: 'It depends on the program. Many serve Status and Non-Status First Nations, Métis, and Inuit women, using community membership or citizenship as proof of identity rather than Indian status specifically.' },
    { question: 'Where do Indigenous women entrepreneurs start looking for funding?', answer: 'Start with Indigenous Financial Institutions, NACCA members, women’s enterprise centres, and federal or provincial Indigenous business programs. A solid business plan makes every application stronger.' },
  ],
  'metis-specific-business-funding-economic-development-programs': [
    { question: 'What business funding is available specifically for Métis entrepreneurs?', answer: 'Métis entrepreneurs can access Métis-specific economic development programs and financing through provincial Métis governments and Métis capital corporations, in addition to the broader Indigenous and mainstream business programs.' },
    { question: 'Do I need to be a citizen of a Métis Nation to qualify for Métis funding?', answer: 'Usually yes. Métis-specific programs typically require proof of Métis citizenship through a recognized Métis Nation registry rather than Indian status.' },
    { question: 'Can Métis entrepreneurs also use general Indigenous business funding?', answer: 'Yes. Métis entrepreneurs are eligible for many First Nations, Métis, and Inuit programs and can combine them with Métis-specific supports.' },
    { question: 'Where do Métis entrepreneurs find financing?', answer: 'Provincial Métis governments, Métis capital corporations, Indigenous Financial Institutions, and federal Indigenous business programs are the main sources of Métis business financing.' },
  ],
  'inuit-business-support-funding-programs-inuit-nunangat': [
    { question: 'What business funding is available for Inuit entrepreneurs?', answer: 'Inuit entrepreneurs can access Inuit-specific programs across Inuit Nunangat (the four Inuit regions) along with federal Indigenous business funding and loans from Indigenous Financial Institutions serving the North.' },
    { question: 'Is there funding designed for remote and Northern Inuit businesses?', answer: 'Yes. Several programs specifically address the realities of operating in remote and Northern communities, including higher costs for infrastructure, transportation, and connectivity.' },
    { question: 'Do Inuit entrepreneurs qualify for general Indigenous business programs?', answer: 'Yes. Inuit are one of the three recognized Indigenous peoples in Canada, so Inuit entrepreneurs are eligible for First Nations, Métis, and Inuit programs as well as Inuit-specific supports.' },
    { question: 'How do I prove Inuit identity for funding applications?', answer: 'Programs typically ask for Inuit beneficiary status under a land-claim agreement or membership in an Inuit organization, rather than Indian status.' },
  ],
  'indigenous-youth-entrepreneur-programs-funding-canada': [
    { question: 'What funding is available for young Indigenous entrepreneurs?', answer: "Young Indigenous entrepreneurs (often ages 18–39) can access Futurpreneur Canada's Indigenous program, youth-specific grants, mentorship, and the broader Indigenous business funding programs." },
    { question: "What is Futurpreneur Canada's Indigenous program?", answer: 'It is a program that combines startup financing with mentorship for young entrepreneurs, including a stream tailored to Indigenous youth.' },
    { question: 'Is there an age limit for Indigenous youth business funding?', answer: 'Youth-specific programs usually target entrepreneurs roughly 18–39, but Indigenous entrepreneurs outside that range can still access the many programs that have no age limit.' },
    { question: 'Do young Indigenous entrepreneurs get mentorship as well as money?', answer: 'Often yes. Many youth programs pair funding with mentorship and business coaching, which is especially valuable for first-time founders.' },
  ],
  'how-to-get-certified-indigenous-business-canada': [
    { question: 'What is the difference between the Indigenous Business Directory and CCIB certification?', answer: "The Indigenous Business Directory (IBD) is a free federal registration run by Indigenous Services Canada that makes you eligible for federal set-aside contracts. Certified Indigenous Business (CIB) is a paid, membership-based credential from the Canadian Council for Indigenous Business, recognized mainly by corporate buyers. Many businesses do both because they serve different customers." },
    { question: 'What are the requirements to register as an Indigenous business in Canada?', answer: 'To list in the federal Indigenous Business Directory, a business must be at least 51% owned and controlled by Indigenous people, with owners who are First Nations, Inuit, or Métis and ordinarily resident in Canada. There are no restrictions on the size, location, or type of business.' },
    { question: 'How much does it cost to get certified as an Indigenous business?', answer: 'Registering in the federal Indigenous Business Directory is free. CCIB Certified Indigenous Business status is membership-based and has fees that vary—check the current pricing with CCIB before applying.' },
    { question: 'What is the federal 5% Indigenous procurement target?', answer: 'Since 2021, federal departments and agencies are required to award a minimum of 5% of the total value of their contracts to Indigenous businesses. It was phased in over three years, with all federal organizations expected to meet the target by the 2024-25 fiscal year.' },
    { question: 'Do I need Indian Status to certify my business?', answer: 'Not necessarily. Programs serve First Nations, Inuit, and Métis owners, and accepted proof of Indigenous heritage can include documents such as an Indian Status card or valid identification from an accepted Indigenous organization. Confirm the documents each program accepts before you apply, as requirements can change.' },
    { question: 'Does being listed or certified guarantee I will win government contracts?', answer: "No. Registration and certification confirm your eligibility and credibility, but you still have to find opportunities and submit competitive bids. Treat certification as the start of a procurement pipeline, not a guarantee of work." },
  ],
};
