import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center space-x-2 bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-natural">
            <Quote className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Dibaajimowinan • Success Stories
            </span>
          </div>
          
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Empowering Communities
            <span className="block gradient-earth bg-clip-text text-transparent">
              Across Turtle Island
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Real stories from Indigenous entrepreneurs who have transformed their communities using our culturally respectful AI tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.name}
              className="group hover:shadow-elevated transition-spring bg-card/80 backdrop-blur-sm border-border/50 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8 space-y-6">
                {/* Rating */}
                <div className="flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-foreground leading-relaxed">
                  "{testimonial.content}"
                </blockquote>

                {/* Author info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12 gradient-earth">
                      <AvatarFallback className="text-primary-foreground font-semibold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.title}</div>
                      <div className="text-xs text-primary font-medium">{testimonial.location}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-display text-2xl font-bold text-primary">{testimonial.metric}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.metricLabel}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Impact statistics */}
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8 shadow-natural">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2 animate-gentle-float">
              <div className="w-12 h-12 gradient-earth rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="font-display text-2xl md:text-3xl font-bold text-primary">2,500+</div>
              <div className="text-sm text-muted-foreground">Entrepreneurs Served</div>
            </div>
            
            <div className="text-center space-y-2 animate-gentle-float" style={{ animationDelay: '0.5s' }}>
              <div className="w-12 h-12 gradient-sky rounded-xl flex items-center justify-center mx-auto mb-3">
                <Building className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="font-display text-2xl md:text-3xl font-bold text-accent">850+</div>
              <div className="text-sm text-muted-foreground">Businesses Launched</div>
            </div>
            
            <div className="text-center space-y-2 animate-gentle-float" style={{ animationDelay: '1s' }}>
              <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="font-display text-2xl md:text-3xl font-bold text-secondary">$12M+</div>
              <div className="text-sm text-muted-foreground">Funding Connected</div>
            </div>
            
            <div className="text-center space-y-2 animate-gentle-float" style={{ animationDelay: '1.5s' }}>
              <div className="w-12 h-12 gradient-earth rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="font-display text-2xl md:text-3xl font-bold text-primary">45+</div>
              <div className="text-sm text-muted-foreground">Community Partners</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;