import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Crown, Building, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PricingSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  
  const handleCheckout = async (planName: string, priceId?: string) => {
    if (planName === "Maadaadiziwin") {
      if (!user) {
        toast.error("Please sign in to start with the free plan");
        navigate('/auth');
        return;
      }
      toast.success("You're already on the free plan!");
      return;
    }

    if (planName === "Gimishoomis") {
      navigate('/contact');
      toast.info("Redirecting to contact form...");
      return;
    }

    if (!user) {
      toast.error("Please sign in to subscribe");
      navigate('/auth');
      return;
    }

    if (!priceId) {
      toast.error("Price information not available");
      return;
    }

    setLoadingPlan(planName);

    try {
      const { data: sessionData, error } = await supabase.auth.getSession();
      
      if (error || !sessionData.session) {
        toast.error("Authentication error. Please sign in again.");
        navigate('/auth');
        return;
      }

      const { data, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (checkoutError) {
        console.error('Checkout error:', checkoutError);
        toast.error("Failed to create checkout session");
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success("Opening Stripe checkout...");
      } else {
        toast.error("No checkout URL received");
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      name: "Maadaadiziwin",
      nameTranslation: "Starting Out",
      description: "Perfect for new Indigenous entrepreneurs taking their first steps",
      price: "Free",
      period: "Forever",
      popular: false,
      priceId: undefined,
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
      color: 'primary'
    },
    {
      name: "Ogichidaakwe",
      nameTranslation: "Growing Strong",
      description: "Comprehensive tools for established businesses ready to scale",
      price: "$49",
      period: "per month",
      popular: true,
      priceId: "price_1SSRqgS23MQcIdnrGDAHGF4C",
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
      color: 'secondary'
    },
    {
      name: "Gimishoomis",
      nameTranslation: "Elder Wisdom",
      description: "Enterprise solutions for large organizations and communities",
      price: "Custom",
      period: "Contact us",
      popular: false,
      priceId: undefined,
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
      color: 'accent'
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
    <section id="pricing" className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-4xl mb-4 text-foreground">
            Flexible Plans for
            <span className="block italic text-primary">Every Journey Stage</span>
          </h2>
          <p className="text-foreground/60 text-lg">
            Ozhichigan • Choose the plan that matches your business journey. All plans include OCAP™ compliance and cultural competency features.
          </p>
        </div>

        {/* Pricing cards - Aura style */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, index) => (
            <div 
              key={plan.name}
              className={`bg-card p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 shadow-card hover:shadow-elevated border ${
                plan.popular 
                  ? 'border-primary/30 ring-2 ring-primary/10' 
                  : 'border-transparent hover:border-primary/20'
              } relative`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="font-display text-2xl mb-1 font-medium text-foreground">{plan.name}</h3>
                <p className="text-xs text-primary/70 italic mb-2">{plan.nameTranslation}</p>
                <p className="text-sm text-foreground/60 mb-6">{plan.description}</p>
                
                <div className="space-y-1">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="font-display text-4xl font-medium text-foreground">{plan.price}</span>
                    {plan.period !== "Contact us" && plan.period !== "Forever" && (
                      <span className="text-foreground/50">/{plan.period}</span>
                    )}
                  </div>
                  {(plan.period === "Contact us" || plan.period === "Forever") && (
                    <p className="text-sm text-foreground/50">{plan.period}</p>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground/70">{feature}</span>
                  </li>
                ))}
                
                {plan.excludedFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm opacity-50">
                    <div className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground/50 line-through">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full rounded-full font-semibold py-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                  plan.popular 
                    ? 'bg-primary text-primary-foreground hover:bg-[hsl(15,60%,55%)]' 
                    : 'bg-foreground text-background hover:bg-primary'
                }`}
                onClick={() => handleCheckout(plan.name, plan.priceId)}
                disabled={loadingPlan === plan.name}
              >
                {loadingPlan === plan.name ? "Loading..." : plan.ctaText}
              </Button>
            </div>
          ))}
        </div>

        {/* Add-ons */}
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="font-display text-2xl font-medium text-foreground mb-2">
              Additional Services
            </h3>
            <p className="text-foreground/60">
              Enhance your experience with specialized Indigenous business support services
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {addOns.map((addon) => (
              <div 
                key={addon.name}
                className="bg-card p-6 rounded-2xl border border-border/50 hover:border-primary/20 hover:shadow-elevated transition-all duration-300"
              >
                <h4 className="font-display text-lg font-medium text-foreground mb-1">{addon.name}</h4>
                <p className="text-xs text-primary/70 italic mb-2">{addon.nameTranslation}</p>
                <p className="text-sm text-foreground/60 mb-4">{addon.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{addon.price}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="rounded-full border-border hover:border-primary hover:text-primary"
                    onClick={() => {
                      const element = document.querySelector('#pricing');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Add On
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cultural commitment */}
        <div className="mt-16 text-center bg-primary/5 rounded-2xl p-8 border border-primary/10">
          <h4 className="font-display text-xl font-medium text-foreground mb-6">
            Commitment to Indigenous Values
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-foreground/60 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>20% of profits returned to Indigenous communities</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>OCAP™ principles embedded in all services</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Cultural competency training for all staff</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Indigenous leadership in product development</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;