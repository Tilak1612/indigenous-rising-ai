/**
 * Questions and answers for /faq.
 *
 * Single source for BOTH the visible accordion and the FAQPage structured data,
 * so the markup and the visible Q&A cannot drift apart. The same pattern as
 * grantsHubFaqs.ts.
 *
 * Why this is a data file and not an array inside the component: the FAQPage
 * schema used to be injected by the component at runtime through react-helmet,
 * so it was absent from the prerendered HTML. A SearchFit audit (2026-10-02)
 * found /faq - the richest Q&A page on the site - shipped no FAQPage schema to
 * any crawler that does not execute JavaScript, which is most AI answer
 * engines. The prerender now reads this file and emits the schema statically.
 *
 * Every answer here must be true of the product today. Anything still on the
 * roadmap is labelled as such rather than described as live.
 */
export const siteFaqs: { question: string; answer: string }[] = [
  {
    question: 'What is OCAP® and why does it matter?',
    answer: 'OCAP® stands for Ownership, Control, Access, and Possession. They are First Nations data governance principles developed and owned by the First Nations Information Governance Centre (FNIGC), affirming First Nations control over how information about them is collected, used and held. FNIGC is the authority on OCAP® and publishes its own training and materials — if you want to understand the principles properly, start there rather than with a software vendor, including us. We build around OCAP®; we are not certified against it.'
  },
  {
    question: 'Is Indigenous Rising AI only for registered Indigenous businesses?',
    answer: 'While we prioritize Indigenous-owned and operated businesses, we also support businesses that work closely with Indigenous communities, employ Indigenous peoples, or operate on Indigenous lands. Our platform is designed to respect and amplify Indigenous values in business, regardless of formal registration status.'
  },
  {
    question: 'How do I access funding opportunities?',
    answer: 'All members can browse our funding database. Free accounts get 3 AI-powered matches per month, while paid plans (Growth and up) get significantly more. Our AI analyzes your business profile, community impact goals, and eligibility criteria to match you with the most relevant funding opportunities from federal, provincial, and private sources.'
  },
  {
    question: 'Is my business data stored in Canada?',
    answer: 'Yes. Your account, business plans, documents and files are stored on Canadian servers (Supabase, ca-central-1) under Canadian jurisdiction, and we comply with PIPEDA. Some processing happens with named providers outside Canada: email delivery, payments, analytics (only if you accept analytics cookies), and AI funding matching, which sends a limited profile summary to OpenAI only when you click “Find my matches”. Your identity, community, name and contact details are never sent to the AI provider. See the privacy policy for the full list.'
  },
  {
    question: 'Can I switch plans at any time?',
    answer: "Yes! You can upgrade or downgrade your plan at any time. If you upgrade, you'll be prorated for the remainder of your billing cycle. If you downgrade, the change takes effect at the start of your next billing period."
  },
  {
    question: 'How does the AI respect traditional knowledge?',
    answer: 'Our AI is trained with input from Indigenous Elders and knowledge keepers to ensure cultural sensitivity. It never claims ownership of traditional knowledge and always prompts users for consent before using culturally significant information. The AI serves as a tool to amplify Indigenous wisdom, not replace it.'
  },
  {
    question: 'What languages are supported on the platform?',
    answer: "We currently support English, French, Anishinaabemowin (Ojibwe), ᓀᐦᐃᔭᐍᐏᐣ (Cree), ᐃᓄᒃᑎᑐᑦ (Inuktitut), and Mi'kmaw. We are continuously working with language keepers to add more Indigenous languages and improve translation accuracy."
  },
  {
    question: 'How does the 20% profit sharing work?',
    answer: '20% of our net profits are distributed to Indigenous communities through our Community Impact Fund. This includes grants for community projects, scholarships, and direct support for Indigenous entrepreneurs.'
  },
  {
    question: 'What is included in cultural services?',
    answer: 'Cultural services include Elder Knowledge Sessions, Cultural Impact Assessments, and access to our network of Indigenous business mentors who can guide you in integrating traditional values with modern business practices.'
  },
  {
    question: 'Is my data protected under OCAP® principles?',
    answer: 'Absolutely. All plans include data handling built in alignment with OCAP® principles (not a third-party certification). You maintain Ownership of your data, Control over how it is used, Access to export it anytime, and Possession on secure Indigenous-informed infrastructure.'
  },
  {
    question: 'Can I get help with grant applications?',
    answer: 'Yes! Growth and Professional members have access to grant writing templates, application review services, and can book sessions with our funding specialists who understand the unique needs of Indigenous businesses. We also offer workshops on effective grant writing throughout the year.'
  },
  {
    question: 'What makes this platform different from other business tools?',
    answer: 'Indigenous Rising AI is built BY and FOR Indigenous entrepreneurs. Unlike generic business platforms, we integrate traditional values like the Seven Generations Principle into planning tools, measure success through community impact alongside profit, and ensure all features respect OCAP® principles. Our platform understands that Indigenous business success includes cultural preservation and community wellbeing.'
  },
  {
    question: 'How do the training programs work?',
    answer: 'Our training blends modern business education with traditional Indigenous teachings. Programs are offered online and in-person, taught by both business professionals and Elders. Each course includes peer learning circles, mentorship opportunities, and practical application to your actual business. Certificates are recognized by NACCA and other Indigenous business organizations.'
  },
  {
    question: 'What if I need to cancel my subscription?',
    answer: "You can cancel anytime, no questions asked. Your data remains yours, and you can export all information before canceling. Free accounts never expire. We believe in earning your trust every month - if we're not providing value, we don't deserve your business."
  }
];
