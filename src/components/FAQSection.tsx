import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { siteFaqs } from '@/data/siteFaqs';

interface FAQSectionProps {
  maxItems?: number;
}

const FAQSection = ({ maxItems }: FAQSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = siteFaqs;

  const displayedFaqs = typeof maxItems === 'number' ? faqs.slice(0, maxItems) : faqs;

  return (
    <section id="faq" className="py-20 bg-muted/30" aria-labelledby="faq-heading">
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
            {/* Not the Radix Accordion: it unmounts closed content (children
                render only while open, even with forceMount), so all 15 answers
                were absent from the prerendered HTML and from the rendered DOM
                Google indexes. This keeps every answer in the page and hides
                closed ones with the `hidden` attribute. */}
            <div className="space-y-4">
              {displayedFaqs.map((faq, index) => {
                const open = openIndex === index;
                return (
                  <div key={faq.question} className="border-b border-border/50 last:border-0">
                    <h3 className="flex">
                      <button
                        type="button"
                        id={`faq-q-${index}`}
                        aria-expanded={open}
                        aria-controls={`faq-a-${index}`}
                        onClick={() => setOpenIndex(open ? null : index)}
                        className="flex flex-1 items-center justify-between gap-4 py-4 text-left font-medium hover:text-primary transition-colors"
                      >
                        <span className="font-semibold text-foreground">{faq.question}</span>
                        <ChevronDown
                          aria-hidden="true"
                          className={cn('h-4 w-4 shrink-0 transition-transform duration-200', open && 'rotate-180')}
                        />
                      </button>
                    </h3>
                    <div
                      id={`faq-a-${index}`}
                      role="region"
                      aria-labelledby={`faq-q-${index}`}
                      hidden={!open}
                      className="pb-4 pt-2 text-sm text-muted-foreground leading-relaxed"
                    >
                      {faq.answer}
                    </div>
                  </div>
                );
              })}
            </div>
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
