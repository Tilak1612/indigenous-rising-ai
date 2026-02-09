import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Award, Clock, ArrowRight, CheckCircle, Star, Calendar } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useNavigate } from 'react-router-dom';

const TrainingSection = () => {
  const navigate = useNavigate();
  const programs = [
    {
      title: "Indigenous Business Fundamentals",
      titleTranslation: "Gichi-Oshki-Kijiganan",
      description: "Comprehensive 8-week program covering business planning, financial management, and cultural integration strategies for Indigenous entrepreneurs.",
      duration: "8 weeks",
      format: "Online + In-Person",
      level: "Beginner",
      price: "$297",
      originalPrice: "$397",
      features: [
        "Traditional business planning methods",
        "OCAP™ data sovereignty training",
        "Elder mentorship sessions"
      ],
      testimonials: 3.2,
      enrolled: 1247,
      nextStart: "March 15, 2024",
      gradient: "earth" as const
    },
    {
      title: "Digital Marketing & Cultural Storytelling",
      titleTranslation: "Dibaajimowinan Mazina'igan",
      description: "Master digital marketing while maintaining cultural authenticity. Learn to tell your brand story in ways that honor tradition and connect with modern audiences.",
      duration: "6 weeks", 
      format: "Online",
      level: "Intermediate",
      price: "$197",
      originalPrice: "$247",
      features: [
        "Culturally authentic brand development", 
        "Community-based marketing approaches",
        "Digital storytelling techniques"
      ],
      testimonials: 4.8,
      enrolled: 892,
      nextStart: "March 22, 2024",
      gradient: "sky" as const
    },
    {
      title: "Advanced Leadership & Governance", 
      titleTranslation: "Gimishoomis Ogichidaakwe",
      description: "Executive-level program combining traditional Indigenous governance principles with modern organizational leadership for established business owners.",
      duration: "12 weeks",
      format: "Hybrid",
      level: "Advanced", 
      price: "$897",
      originalPrice: "$1197",
      features: [
        "Traditional governance integration",
        "Strategic planning with cultural values",
        "Executive coaching sessions"
      ],
      testimonials: 4.9,
      enrolled: 234,
      nextStart: "April 5, 2024",
      gradient: "hero" as const
    }
  ];


  return (
    <section id="training" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center space-x-2 bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-natural">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Gikinoo'amaage • Learning Together
            </span>
          </div>
          
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Training & Certification
            <span className="block gradient-earth bg-clip-text text-transparent">
              Programs
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Develop business skills while honoring traditional knowledge through our culturally competent 
            training programs designed by Indigenous educators and business leaders.
          </p>
        </div>

        {/* Main Programs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {programs.map((program, index) => {
            const gradientClass = {
              earth: 'gradient-earth',
              sky: 'gradient-sky',
              hero: 'gradient-hero'
            }[program.gradient];

            return (
              <Card 
                key={program.title}
                className="group hover:shadow-elevated transition-spring animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 ${gradientClass} rounded-xl flex items-center justify-center shadow-natural group-hover:shadow-glow transition-spring`}>
                      <BookOpen className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <Badge variant={program.level === 'Beginner' ? 'secondary' : program.level === 'Intermediate' ? 'default' : 'outline'}>
                      {program.level}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <CardTitle className="font-display text-xl text-foreground group-hover:text-primary transition-smooth">
                      {program.title}
                    </CardTitle>
                    <p className="text-sm text-primary/70 font-medium italic">
                      {program.titleTranslation}
                    </p>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {program.description}
                    </CardDescription>
                  </div>

                  {/* Program details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">{program.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">{program.format}</span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-display text-2xl font-bold text-foreground">
                        {program.price}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {program.originalPrice}
                      </span>
                      <Badge variant="secondary" className="text-xs">25% Off</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Next cohort: {program.nextStart}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="learn">
                      <AccordionTrigger className="text-sm">What you will learn</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2">
                          {program.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start space-x-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Social proof */}
                  <div className="pt-4 border-t border-border/50 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-foreground">{program.testimonials}</span>
                      <span className="text-xs text-muted-foreground">({program.enrolled} enrolled)</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex-col space-y-3">
                  <ShinyButton 
                    className="w-full group/btn"
                    onClick={() => navigate('/training')}
                  >
                    Explore All Programs
                    <ArrowRight className="w-4 h-4 ml-2 inline-block group-hover/btn:translate-x-1 transition-transform" />
                  </ShinyButton>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <Card className="bg-card/50 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 gradient-sky rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle className="font-display text-xl text-foreground">
                  Certifications
                </CardTitle>
              </div>
              <CardDescription>
                Explore professional credentials tailored to Indigenous business leaders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShinyButton size="sm" onClick={() => navigate('/training')}>
                View Certifications
              </ShinyButton>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle className="font-display text-xl text-foreground">
                  Events & Circles
                </CardTitle>
              </div>
              <CardDescription>
                Join upcoming learning circles and community sessions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShinyButton size="sm" onClick={() => navigate('/contact')}>
                See Events
              </ShinyButton>
            </CardContent>
          </Card>
        </div>

        {/* Training philosophy */}
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8 shadow-natural animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="text-center space-y-6">
            <h3 className="font-display text-2xl font-bold text-foreground">
              Our Training Philosophy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="w-12 h-12 gradient-earth rounded-xl flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
                <h4 className="font-semibold text-foreground">Community-Centered</h4>
                <p className="text-sm text-muted-foreground">
                  Learning happens in community, with peer support and cultural connection at the core.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 gradient-sky rounded-xl flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6 text-primary-foreground" />
                </div>
                <h4 className="font-semibold text-foreground">Elder Wisdom</h4>
                <p className="text-sm text-muted-foreground">
                  Traditional knowledge keepers share wisdom alongside modern business practices.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6 text-primary-foreground" />
                </div>
                <h4 className="font-semibold text-foreground">Practical Application</h4>
                <p className="text-sm text-muted-foreground">
                  Every lesson includes real-world application to your actual business challenges.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrainingSection;