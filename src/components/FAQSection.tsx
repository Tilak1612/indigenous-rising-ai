import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

interface FAQSectionProps {
  includeSchema?: boolean;
  maxItems?: number;
}

const FAQSection = ({ includeSchema = false, maxItems }: FAQSectionProps) => {
  const faqs = [
    {
      question: 'What is OCAP™ and why does it matter?',
      answer: 'OCAP™ stands for Ownership, Control, Access, and Possession. These are data governance principles that affirm First Nations control over data collection processes, and how information can be used. It ensures Indigenous communities maintain sovereignty over their own data, which is crucial for protecting cultural knowledge and maintaining self-determination in the digital age.'
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
      answer: 'Yes, absolutely. All data is stored exclusively on Canadian servers and subject to Canadian jurisdiction. We comply with PIPEDA (federal privacy law) and never transfer data outside Canada without explicit consent. This ensures your information is protected under Canadian law and Indigenous data sovereignty principles.'
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
      question: 'Is my data protected under OCAP™ principles?',
      answer: 'Absolutely. All plans include OCAP™ compliant data handling. You maintain Ownership of your data, Control over how it is used, Access to export it anytime, and Possession on secure Indigenous-informed infrastructure.'
    },
    {
      question: 'Can I get help with grant applications?',
      answer: 'Yes! Growth and Professional members have access to grant writing templates, application review services, and can book sessions with our funding specialists who understand the unique needs of Indigenous businesses. We also offer workshops on effective grant writing throughout the year.'
    },
    {
      question: 'What makes this platform different from other business tools?',
      answer: 'Indigenous Rising AI is built BY and FOR Indigenous entrepreneurs. Unlike generic business platforms, we integrate traditional values like the Seven Generations Principle into planning tools, measure success through community impact alongside profit, and ensure all features respect OCAP™ principles. Our platform understands that Indigenous business success includes cultural preservation and community wellbeing.'
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

  const displayedFaqs = typeof maxItems === 'number' ? faqs.slice(0, maxItems) : faqs;

  // Generate FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section id="faq" className="py-20 bg-muted/30" aria-labelledby="faq-heading">
      {includeSchema && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(faqSchema)}
          </script>
        </Helmet>
      )}
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 id="faq-heading" className="font-display text-4xl md:text-5xl font-black text-foreground mb-4">
              Your Questions
              <span className="block gradient-earth bg-clip-text text-transparent">
                Answered
              </span>
            </h2>
            
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <HelpCircle className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold text-primary">Frequently Asked Questions</span>
            </div>
            
            <p className="text-lg text-muted-foreground">
              Everything you need to know about Indigenous Rising AI
            </p>
          </div>

          {/* FAQ Accordion */}
          <Card className="p-8 bg-card/50 backdrop-blur-sm">
            <Accordion type="single" collapsible className="space-y-4">
              {displayedFaqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border-b border-border/50 last:border-0"
                >
                  <AccordionTrigger className="text-left hover:text-primary transition-colors">
                    <span className="font-semibold text-foreground">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          {typeof maxItems === 'number' && (
            <div className="text-center mt-8">
              <Link
                to="/faq"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-border rounded-lg font-semibold hover:bg-muted/50 transition-colors"
              >
                View All FAQs
              </Link>
            </div>
          )}

          {/* Contact CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Still have questions? We're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:help@indigenousrising.ai"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Email Us
              </a>
              <a 
                href="tel:1-800-463-4436"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-border rounded-lg font-semibold hover:bg-muted/50 transition-colors"
              >
                Call 1-800-INDIGENOUS
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
