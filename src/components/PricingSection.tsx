import { ShinyButton } from '@/components/ui/shiny-button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Crown, Building, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PricingSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const handleCheckout = async (planName: string, priceId?: string) => {
    // Handle free plan
    if (planName === "Maadaadiziwin") {
      if (!user) {
        toast.error("Please sign in to start with the free plan");
        navigate('/auth');
        return;
      }
      toast.success("You're already on the free plan!");
      return;
    }

    // Handle enterprise plan (contact sales)
    if (planName === "Gimishoomis") {
      navigate('/contact');
      toast.info("Redirecting to contact form...");
      return;
    }

    // Handle paid plans
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
        // Open Stripe checkout in new tab
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

  const monthlyPrice = 49;
  const annualPrice = Math.round(monthlyPrice * 12 * 0.8); // 20% discount
  const annualMonthlyEquivalent = Math.round(annualPrice / 12);
  const annualSavings = (monthlyPrice * 12) - annualPrice;

  const plans = [
    {
      name: "Maadaadiziwin",
      nameTranslation: "Starting Out",
      description: "Perfect for new Indigenous entrepreneurs taking their first steps",
      monthlyPrice: "Free",
      annualPrice: "Free",
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
      icon: Sparkles,
      gradient: "earth" as const
    },
    {
      name: "Ogichidaakwe",
      nameTranslation: "Growing Strong",
      description: "Comprehensive tools for established businesses ready to scale",
      monthlyPrice: `$${monthlyPrice}`,
      annualPrice: `$${annualMonthlyEquivalent}`,
      annualTotal: annualPrice,
      period: billingCycle === 'monthly' ? 'per month' : 'per month, billed annually',
      popular: true,
      priceId: "price_1SSRqgS23MQcIdnrGDAHGF4C", // $49/month monthly subscription
      annualPriceId: "price_annual_placeholder", // Would need actual annual price ID
      features: [
        "Everything in Maadaadiziwin",
        "AI-powered funding navigator",
        "Advanced impact analytics",
        "Partnership network access",
        "Cultural competency certification",
        "Priority email & chat support",
        "Training program discounts (20%)",
        "Custom business model templates",
        "Multi-language support (8 languages)"
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
      monthlyPrice: "Custom",
      annualPrice: "Custom",
      period: "Contact us",
      popular: false,
      priceId: undefined, // No price ID for enterprise - redirects to contact
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

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'monthly' | 'annual')}>
              <TabsList className="grid w-[300px] grid-cols-2">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="annual" className="relative">
                  Annual
                  <Badge className="absolute -top-3 -right-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
                    Save 20%
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {billingCycle === 'annual' && (
            <p className="text-sm text-primary font-medium animate-fade-in">
              Save ${annualSavings} per year with annual billing
            </p>
          )}
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

            const displayPrice = billingCycle === 'annual' && plan.annualPrice !== 'Custom' && plan.annualPrice !== 'Free' 
              ? plan.annualPrice 
              : plan.monthlyPrice;

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
                        {displayPrice}
                      </span>
                      {plan.period !== "Contact us" && plan.period !== "Forever" && (
                        <span className="text-muted-foreground">/{billingCycle === 'annual' ? 'mo' : plan.period.replace('per ', '')}</span>
                      )}
                    </div>
                    {plan.period === "Contact us" && (
                      <p className="text-sm text-muted-foreground">{plan.period}</p>
                    )}
                    {billingCycle === 'annual' && plan.annualTotal && (
                      <p className="text-sm text-muted-foreground">
                        ${plan.annualTotal}/year billed annually
                      </p>
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
                  <ShinyButton 
                    className="w-full group/btn"
                    size="lg"
                    onClick={() => handleCheckout(
                      plan.name, 
                      billingCycle === 'annual' && plan.annualPriceId ? plan.annualPriceId : plan.priceId
                    )}
                    disabled={loadingPlan === plan.name}
                  >
                    {loadingPlan === plan.name ? "Loading..." : plan.ctaText}
                    <ArrowRight className="w-4 h-4 ml-2 inline-block group-hover/btn:translate-x-1 transition-transform" />
                  </ShinyButton>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Comparison Table */}
        <Card className="mb-16 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-center">Compare Plans</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Feature</th>
                    <th className="text-center p-4 font-medium">Maadaadiziwin</th>
                    <th className="text-center p-4 font-medium bg-primary/5">Ogichidaakwe</th>
                    <th className="text-center p-4 font-medium">Gimishoomis</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Business Planning Tools', free: 'Basic', pro: 'Advanced', enterprise: 'Custom' },
                    { feature: 'AI Funding Navigator', free: '❌', pro: '✓', enterprise: '✓' },
                    { feature: 'Impact Analytics', free: '❌', pro: '✓', enterprise: 'Advanced' },
                    { feature: 'Partner Network', free: '❌', pro: '✓', enterprise: '✓' },
                    { feature: 'Languages Supported', free: '3', pro: '8', enterprise: '20+' },
                    { feature: 'Support', free: 'Email', pro: 'Priority', enterprise: '24/7 Dedicated' },
                    { feature: 'API Access', free: '❌', pro: '✓', enterprise: 'Unlimited' },
                    { feature: 'Team Members', free: '1', pro: '5', enterprise: 'Unlimited' },
                    { feature: 'White-label Options', free: '❌', pro: '❌', enterprise: '✓' },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="text-center p-4 text-muted-foreground">{row.free}</td>
                      <td className="text-center p-4 bg-primary/5">{row.pro}</td>
                      <td className="text-center p-4 text-muted-foreground">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card/50 backdrop-blur-sm border border-border/50 p-6 shadow-natural">
            <h4 className="font-display text-xl font-semibold text-foreground mb-2">
              Add-ons Available
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Elder sessions, impact reporting, and expanded language support.
            </p>
            <ShinyButton size="sm" onClick={() => navigate('/pricing')}>
              View Add-ons
            </ShinyButton>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border border-border/50 p-6 shadow-natural">
            <h4 className="font-display text-xl font-semibold text-foreground mb-2">
              Indigenous Values Built In
            </h4>
            <p className="text-sm text-muted-foreground">
              Indigenous-led, OCAP™ compliant, and 20% of profits returned to communities.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
