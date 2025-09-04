import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Crown, Building, ArrowRight } from 'lucide-react';

const PricingSection = () => {
  const plans = [
    {
      name: "Maadaadiziwin",
      nameTranslation: "Starting Out",
      description: "Perfect for new Indigenous entrepreneurs taking their first steps",
      price: "Free",
      period: "Forever",
      popular: false,
      features: [
        "Basic business planning tools",
        "Community resource directory",
        "OCAP™ compliant data handling",
        "Multi-language support (3 languages)",
        "Email support",
        "Community forum access"
      ],
      excludedFeatures: [
        "AI-powered funding matching",
        "Advanced analytics dashboard",
        "Priority support",
        "Custom integrations"
      ],
      ctaText: "Start Free",
      icon: Sparkles,
      gradient: "earth" as const
    },
    {
      name: "Ogichidaakwe",
      nameTranslation: "Growing Strong",
      description: "Comprehensive tools for established businesses ready to scale",
      price: "$49",
      period: "per month",
      popular: true,
      features: [
        "Everything in Maadaadiziwin",
        "AI-powered funding navigator",
        "Advanced impact analytics",
        "Partnership network access",
        "Cultural competency certification",
        "Priority email & chat support",
        "Training program discounts (20%)",
        "Custom business model templates",
        "Multi-language support (8 languages)",
        "API access for integrations"
      ],
      excludedFeatures: [
        "Dedicated account manager",
        "White-label solutions"
      ],
      ctaText: "Start Growing",
      icon: Crown,
      gradient: "sky" as const
    },
    {
      name: "Gimishoomis",
      nameTranslation: "Elder Wisdom",
      description: "Enterprise solutions for large organizations and communities",
      price: "Custom",
      period: "Contact us",
      popular: false,
      features: [
        "Everything in Ogichidaakwe",
        "Dedicated account manager",
        "White-label platform options",
        "Custom AI model training",
        "Advanced security & compliance",
        "Unlimited user seats",
        "24/7 priority support",
        "Custom integration development",
        "On-site training programs",
        "Community impact consulting",
        "Data sovereignty consulting",
        "Government partnership facilitation"
      ],
      excludedFeatures: [],
      ctaText: "Contact Sales",
      icon: Building,
      gradient: "hero" as const
    }
  ];

  const addOns = [
    {
      name: "Elder Knowledge Sessions",
      nameTranslation: "Gichi-manidoo Gikinoo'amaage",
      description: "Monthly virtual sessions with Indigenous business elders",
      price: "$25/month"
    },
    {
      name: "Cultural Impact Assessment",
      nameTranslation: "Aaniin Biidaasige",
      description: "Quarterly comprehensive community impact reports",
      price: "$150/quarter"
    },
    {
      name: "Advanced Language Pack",
      nameTranslation: "Gichi-Anishinaabemowin",
      description: "Support for 20+ Indigenous languages",
      price: "$20/month"
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center space-x-2 bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-natural">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Ozhichigan • Investment in Growth
            </span>
          </div>
          
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Flexible Plans for
            <span className="block gradient-earth bg-clip-text text-transparent">
              Every Journey Stage
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Choose the plan that matches your business journey. All plans include OCAP™ compliance, cultural competency features, and respect for Indigenous data sovereignty.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const gradientClass = {
              earth: 'gradient-earth',
              sky: 'gradient-sky',
              hero: 'gradient-hero'
            }[plan.gradient];

            return (
              <Card 
                key={plan.name}
                className={`group relative hover:shadow-elevated transition-spring animate-fade-in-up ${
                  plan.popular ? 'ring-2 ring-primary/20 scale-105' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.popular && (
                  <Badge 
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 gradient-earth text-primary-foreground"
                  >
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center space-y-4 pb-8">
                  <div className={`w-16 h-16 ${gradientClass} rounded-2xl flex items-center justify-center mx-auto shadow-natural group-hover:shadow-glow transition-spring`}>
                    <Icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  
                  <div className="space-y-2">
                    <CardTitle className="font-display text-2xl text-foreground">
                      {plan.name}
                    </CardTitle>
                    <p className="text-sm text-primary/70 font-medium italic">
                      {plan.nameTranslation}
                    </p>
                    <CardDescription className="text-muted-foreground">
                      {plan.description}
                    </CardDescription>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-center space-x-2">
                      <span className="font-display text-4xl font-bold text-foreground">
                        {plan.price}
                      </span>
                      {plan.period !== "Contact us" && (
                        <span className="text-muted-foreground">/{plan.period}</span>
                      )}
                    </div>
                    {plan.period === "Contact us" && (
                      <p className="text-sm text-muted-foreground">{plan.period}</p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.excludedFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-3 opacity-50">
                        <div className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground line-through">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-6">
                  <Button 
                    variant={plan.popular ? "hero" : "outline"} 
                    className="w-full group/btn"
                    size="lg"
                  >
                    {plan.ctaText}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Add-ons */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h3 className="font-display text-2xl font-bold text-foreground">
              Additional Services
            </h3>
            <p className="text-muted-foreground">
              Enhance your experience with specialized Indigenous business support services
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {addOns.map((addon, index) => (
              <Card 
                key={addon.name}
                className="hover:shadow-elevated transition-spring animate-fade-in-up"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">{addon.name}</CardTitle>
                  <p className="text-sm text-primary/70 italic">{addon.nameTranslation}</p>
                  <CardDescription className="text-muted-foreground">
                    {addon.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{addon.price}</span>
                  <Button variant="outline" size="sm">Add On</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Cultural commitment */}
        <div className="mt-16 text-center bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8 shadow-natural">
          <h4 className="font-display text-xl font-semibold text-foreground mb-4">
            Commitment to Indigenous Values
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Check className="w-4 h-4 text-primary" />
                <span>20% of profits returned to Indigenous communities</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Check className="w-4 h-4 text-primary" />
                <span>OCAP™ principles embedded in all services</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Cultural competency training for all staff</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Indigenous leadership in product development</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;