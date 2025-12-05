import { Card, CardContent } from '@/components/ui/card';
import { Quote, Star, Users, Building, Target } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Maria Crow Feather",
      title: "Founder, Traditional Medicines Co-op",
      location: "Alberta",
      content: "Indigenous Rising AI helped us connect with $50K in funding within our first month. The cultural competency and respect for our data sovereignty made all the difference.",
      rating: 5,
      metric: "$50K",
      metricLabel: "Funding Secured"
    },
    {
      name: "James Running Bear",
      title: "CEO, Northern Sustainable Energy",
      location: "Saskatchewan", 
      content: "The AI matching system understood our community impact goals. We've created 15 new jobs and reduced our carbon footprint by 40% using their guidance.",
      rating: 5,
      metric: "15 Jobs",
      metricLabel: "Created"
    },
    {
      name: "Sarah Littlewing",
      title: "Director, Youth Skills Development",
      location: "Manitoba",
      content: "Miigwech! The training programs integrate our traditional knowledge beautifully with modern business skills. Our youth graduation rate increased by 85%.",
      rating: 5,
      metric: "85%",
      metricLabel: "Graduation Increase"
    },
    {
      name: "Robert Whitehorse",
      title: "Owner, Indigenous Tourism Collective",
      location: "British Columbia",
      content: "The platform's partnership network connected us with NACCA and helped scale our operations across three provinces. Revenue grew 300% this year.",
      rating: 5,
      metric: "300%",
      metricLabel: "Revenue Growth"
    }
  ];

  return (
    <section className="py-20 px-6 bg-primary/5" id="testimonials">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl mb-4 text-foreground">
            Words from the
            <span className="block italic text-primary">Community</span>
          </h2>
          <p className="text-foreground/60 text-lg">
            Dibaajimowinan • Real stories from Indigenous entrepreneurs across Turtle Island
          </p>
        </div>

        {/* Testimonials Grid - Aura Style */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.name}
              className="bg-card p-8 rounded-2xl shadow-card border border-border/50 hover:shadow-elevated transition-all duration-300"
            >
              {/* Quote icon */}
              <div className="text-primary mb-4">
                <Quote className="w-8 h-8 fill-current opacity-20" />
              </div>
              
              {/* Quote */}
              <blockquote className="font-display italic text-lg text-foreground/80 mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>
              
              {/* Author & Metric */}
              <div className="flex items-start justify-between pt-4 border-t border-border/50">
                <div>
                  <div className="font-bold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-foreground/60">{testimonial.title}</div>
                  <div className="text-xs text-primary font-semibold mt-1">
                    {testimonial.location}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-display text-2xl font-medium text-primary">{testimonial.metric}</div>
                  <div className="text-xs text-foreground/50 font-medium uppercase tracking-wider">{testimonial.metricLabel}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Impact statistics */}
        <div className="bg-card rounded-2xl border border-border/50 p-8 shadow-card">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <div className="font-display text-3xl font-medium text-primary">2,500+</div>
              <div className="text-sm text-foreground/60">Entrepreneurs Served</div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="font-display text-3xl font-medium text-secondary">850+</div>
              <div className="text-sm text-foreground/60">Businesses Launched</div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="font-display text-3xl font-medium text-accent">$12M+</div>
              <div className="text-sm text-foreground/60">Funding Connected</div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="font-display text-3xl font-medium text-primary">45+</div>
              <div className="text-sm text-foreground/60">Community Partners</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;