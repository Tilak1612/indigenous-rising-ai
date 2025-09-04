import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, HandHeart, Shield, Globe, ArrowRight, Users, Target } from 'lucide-react';

const PartnershipsSection = () => {
  const mainPartners = [
    {
      name: "NACCA",
      fullName: "National Aboriginal Capital Corporations Association",
      description: "Leading network of Indigenous financial institutions across Canada, providing $3B+ in business financing to Indigenous entrepreneurs.",
      logo: "NACCA",
      benefits: [
        "Direct access to loan programs",
        "Business development services",
        "Mentorship connections",
        "Financial literacy training"
      ],
      established: "1985",
      gradient: "earth" as const
    },
    {
      name: "CCIB", 
      fullName: "Canadian Council for Indigenous Business",
      description: "National organization committed to the economic development of Indigenous peoples through business leadership and partnerships.",
      logo: "CCIB",
      benefits: [
        "Certification programs",
        "Business networking events", 
        "Corporate partnership facilitation",
        "Market access opportunities"
      ],
      established: "1992",
      gradient: "sky" as const
    },
    {
      name: "AFN",
      fullName: "Assembly of First Nations", 
      description: "National organization representing First Nations citizens across Canada, advocating for rights, title, and jurisdiction.",
      logo: "AFN",
      benefits: [
        "Policy advocacy support",
        "Government relations access",
        "Rights and title guidance",
        "National program coordination"
      ],
      established: "1982",
      gradient: "hero" as const
    }
  ];

  const techPartners = [
    {
      name: "Indigenous Data Alliance",
      type: "Data Sovereignty",
      description: "Ensuring OCAP™ principles in all AI implementations"
    },
    {
      name: "Seven Generations Institute",
      type: "Cultural Advisory", 
      description: "Traditional knowledge integration and cultural competency"
    },
    {
      name: "Indigenous Innovation Hub",
      type: "Technology Innovation",
      description: "Cutting-edge AI development with cultural respect"
    }
  ];

  const governmentPartners = [
    "Indigenous Services Canada",
    "Innovation, Science and Economic Development Canada", 
    "Women and Gender Equality Canada",
    "Canadian Northern Economic Development Agency"
  ];

  return (
    <section id="partnerships" className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center space-x-2 bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-natural">
            <HandHeart className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Wiidookodaadwin • Collaborative Strength
            </span>
          </div>
          
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Trusted Partnerships
            <span className="block gradient-earth bg-clip-text text-transparent">
              Across Turtle Island
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our platform is strengthened by strategic partnerships with leading Indigenous organizations, 
            government agencies, and technology innovators who share our commitment to Indigenous data sovereignty.
          </p>
        </div>

        {/* Main Partners */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {mainPartners.map((partner, index) => {
            const gradientClass = {
              earth: 'gradient-earth',
              sky: 'gradient-sky', 
              hero: 'gradient-hero'
            }[partner.gradient];

            return (
              <Card 
                key={partner.name}
                className="group hover:shadow-elevated transition-spring bg-card/80 backdrop-blur-sm animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="text-center space-y-4">
                  <div className={`w-20 h-20 ${gradientClass} rounded-2xl flex items-center justify-center mx-auto shadow-natural group-hover:shadow-glow transition-spring`}>
                    <Building className="w-10 h-10 text-primary-foreground" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <CardTitle className="font-display text-2xl text-foreground">
                        {partner.name}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        Est. {partner.established}
                      </Badge>
                    </div>
                    <p className="text-sm text-primary/70 font-medium">
                      {partner.fullName}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed text-center">
                    {partner.description}
                  </p>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-foreground/80">Partnership Benefits:</h4>
                    <ul className="space-y-2">
                      {partner.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start space-x-3 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button variant="outline" className="w-full group/btn">
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Technology & Cultural Partners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-card/50 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 gradient-sky rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle className="font-display text-xl text-foreground">
                  Technology & Cultural Partners
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {techPartners.map((partner, idx) => (
                <div key={idx} className="border border-border/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground">{partner.name}</h4>
                    <Badge variant="outline" className="text-xs">{partner.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{partner.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle className="font-display text-xl text-foreground">
                  Government Relations
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm mb-4">
                Working with federal departments to advance Indigenous economic reconciliation:
              </p>
              <div className="grid grid-cols-1 gap-3">
                {governmentPartners.map((partner, idx) => (
                  <div key={idx} className="flex items-center space-x-3 p-3 border border-border/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-sm text-foreground font-medium">{partner}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partnership Impact Statistics */}
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8 shadow-natural animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <h3 className="font-display text-2xl font-bold text-center text-foreground mb-8">
            Collective Partnership Impact
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2 animate-gentle-float">
              <div className="w-12 h-12 gradient-earth rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="font-display text-2xl md:text-3xl font-bold text-primary">150+</div>
              <div className="text-sm text-muted-foreground">Partner Organizations</div>
            </div>
            
            <div className="text-center space-y-2 animate-gentle-float" style={{ animationDelay: '0.5s' }}>
              <div className="w-12 h-12 gradient-sky rounded-xl flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="font-display text-2xl md:text-3xl font-bold text-accent">$50M+</div>
              <div className="text-sm text-muted-foreground">Leveraged Funding</div>
            </div>
            
            <div className="text-center space-y-2 animate-gentle-float" style={{ animationDelay: '1s' }}>
              <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center mx-auto mb-3">
                <Building className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="font-display text-2xl md:text-3xl font-bold text-secondary">750+</div>
              <div className="text-sm text-muted-foreground">Businesses Connected</div>
            </div>
            
            <div className="text-center space-y-2 animate-gentle-float" style={{ animationDelay: '1.5s' }}>
              <div className="w-12 h-12 gradient-earth rounded-xl flex items-center justify-center mx-auto mb-3">
                <HandHeart className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="font-display text-2xl md:text-3xl font-bold text-primary">25</div>
              <div className="text-sm text-muted-foreground">Years Combined Experience</div>
            </div>
          </div>
        </div>

        {/* Call to Partnership */}
        <div className="mt-16 text-center space-y-6 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <h3 className="font-display text-2xl font-bold text-foreground">
            Interested in Partnership?
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're always seeking meaningful partnerships that advance Indigenous economic sovereignty 
            while respecting cultural values and data sovereignty principles.
          </p>
          <Button variant="hero" size="lg" className="group">
            Explore Partnership Opportunities
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PartnershipsSection;