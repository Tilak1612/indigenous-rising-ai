import { ShinyButton } from '@/components/ui/shiny-button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Sparkles, Crown, Building, ArrowRight, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { readStoredSession } from '@/lib/auth-storage';
import { toast } from 'sonner';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Feature = { text: string; available: boolean };

// ── Stripe price IDs (source of truth for paid-plan checkout) ───────────────
// Keyed by plan.name; one price per billing cycle. Fill each value with the
// "price_…" ID from the Stripe dashboard (Products → the price → API ID), in
// the SAME mode (test/live) as STRIPE_SECRET_KEY in Supabase. Leave '' for any
// price you haven't created yet — the card shows "Coming soon" and the button
// no-ops gracefully instead of erroring or charging the wrong amount.
//   Ogichidaakwe (Growth):     monthly $49/mo CAD   · annual $470/yr CAD
//   Bimaadiziwin (Professional): monthly $149/mo CAD · annual $1,430/yr CAD
const STRIPE_PRICES: Record<string, { monthly: string; annual: string }> = {
  Ogichidaakwe: { monthly: 'price_1SSRqgS23MQcIdnrGDAHGF4C', annual: '' },
  Bimaadiziwin: { monthly: '', annual: '' },
};

const PAID_PLAN_NAMES = Object.keys(STRIPE_PRICES);

const PricingSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const handleAddonsClick = () => {
    if (location.pathname === '/pricing') {
      const element = document.querySelector('#addons');
      element?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    navigate('/pricing#addons');
  };

  const handleCheckout = async (planName: string) => {
    // Free plan
    if (planName === "Maadaadiziwin") {
      if (!user) {
        toast.error("Please sign in to start with the free plan");
        navigate('/auth');
        return;
      }
      toast.success("You're already on the free plan!");
      return;
    }

    // Enterprise → contact sales
    if (planName === "Gimishoomis") {
      navigate('/contact');
      toast.info("Redirecting to contact form...");
      return;
    }

    // Paid plans (Ogichidaakwe / Bimaadiziwin) — resolve the price for the
    // currently selected billing cycle from the central STRIPE_PRICES map.
    const priceId = STRIPE_PRICES[planName]?.[billingCycle];

    // No price configured yet for this plan + cycle → graceful "coming soon".
    // (Prevents charging the wrong amount when a cycle's price isn't wired.)
    if (!priceId) {
      toast.info("This plan is launching soon — we'll let you know when it's ready.");
      return;
    }

    if (!user) {
      toast.error("Please sign in to subscribe");
      navigate('/auth');
      return;
    }

    setLoadingPlan(planName);

    try {
      // Read the access token straight from localStorage rather than
      // supabase.auth.getSession() — on this project (supabase-js@2.80.0)
      // getSession() can hang forever, which would freeze the checkout button.
      const stored = readStoredSession();
      if (!stored?.access_token) {
        toast.error("Authentication error. Please sign in again.");
        navigate('/auth');
        return;
      }

      const { data, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${stored.access_token}`,
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

  const growthMonthly = 49;
  const growthAnnualMonthly = Math.round(growthMonthly * 0.8);
  const growthAnnualTotal = growthAnnualMonthly * 12;

  const proMonthly = 149;
  const proAnnualMonthly = Math.round(proMonthly * 0.8);
  const proAnnualTotal = proAnnualMonthly * 12;

  type Plan = {
    name: string;
    nameTranslation: string;
    description: string;
    monthlyPrice: string;
    annualPrice: string;
    annualTotal?: number;
    period: string;
    popular: boolean;
    priceId?: string;
    features: Feature[];
    ctaText: string;
    icon: typeof Sparkles;
    gradient: 'earth' | 'sky' | 'hero';
  };

  const plans: Plan[] = [
    {
      name: "Maadaadiziwin",
      nameTranslation: "Starting Out",
      description: "Free tools for Indigenous entrepreneurs taking their first steps",
      monthlyPrice: "Free",
      annualPrice: "Free",
      period: "Forever",
      popular: false,
      priceId: undefined,
      features: [
        { text: "Indigenous business planning assistant (auto-saved)", available: true },
        { text: "Funding opportunity browser", available: true },
        { text: "Community forum and resource library", available: true },
        { text: "OCAP® compliant data handling, stored in Canada", available: true },
        { text: "Multi-language interface (EN, FR — more rolling out)", available: true },
        { text: "Full data export at any time", available: true },
        { text: "Email support", available: true },
        { text: "3 AI funding matches per month", available: true },
        { text: "Business health score", available: false },
      ],
      ctaText: "Start Free",
      icon: Sparkles,
      gradient: "earth",
    },
    {
      name: "Ogichidaakwe",
      nameTranslation: "Growth",
      description: "For entrepreneurs ready to scale with AI-assisted tools",
      monthlyPrice: `$${growthMonthly}`,
      annualPrice: `$${growthAnnualMonthly}`,
      annualTotal: growthAnnualTotal,
      period: billingCycle === 'monthly' ? 'per month' : 'per month, billed annually',
      popular: true,
      priceId: "price_1SSRqgS23MQcIdnrGDAHGF4C",
      features: [
        { text: "Everything in Maadaadiziwin", available: true },
        { text: "Priority email support", available: true },
        { text: "Cultural competency training programs", available: true },
        { text: "Profile listing in partner directory", available: true },
        { text: "AI-powered funding navigator (unlimited matches)", available: true },
        { text: "Grant writing assistant", available: false },
        { text: "Funding deadline alerts (email + SMS)", available: false },
        { text: "Quarterly impact report PDF", available: false },
        { text: "Application checklist generator", available: false },
      ],
      ctaText: "Start Growing",
      icon: Crown,
      gradient: "sky",
    },
    {
      name: "Bimaadiziwin",
      nameTranslation: "Professional",
      description: "For established businesses and growing community ventures",
      monthlyPrice: `$${proMonthly}`,
      annualPrice: `$${proAnnualMonthly}`,
      annualTotal: proAnnualTotal,
      period: billingCycle === 'monthly' ? 'per month' : 'per month, billed annually',
      popular: false,
      priceId: undefined,
      features: [
        { text: "Everything in Ogichidaakwe", available: true },
        { text: "Multi-entity support (up to 3 businesses)", available: false },
        { text: "Quarterly business review with our team", available: false },
        { text: "IFI Connection Engine (50+ Indigenous Financial Institutions)", available: false },
        { text: "Priority phone and chat support", available: false },
        { text: "Cohort matching with peers in your stage and industry", available: false },
        { text: "Grant Success Predictor", available: false },
        { text: "7-generation planning canvas", available: false },
      ],
      ctaText: "Join Waitlist",
      icon: Briefcase,
      gradient: "sky",
    },
    {
      name: "Gimishoomis",
      nameTranslation: "Enterprise",
      description: "For Nations, Economic Development Corporations, and Band Councils",
      monthlyPrice: "Custom",
      annualPrice: "Custom",
      period: "Contact us",
      popular: false,
      priceId: undefined,
      features: [
        { text: "Everything in Bimaadiziwin", available: true },
        { text: "Unlimited business entities", available: false },
        { text: "White-label platform with your Nation's branding", available: false },
        { text: "OCAP® data governance console", available: false },
        { text: "Government reporting module (ISC, AANDC formats)", available: false },
        { text: "Custom AI training on your community's data", available: false },
        { text: "Dedicated account manager", available: false },
        { text: "On-site training programs", available: false },
        { text: "24/7 priority support", available: false },
      ],
      ctaText: "Contact Sales",
      icon: Building,
      gradient: "hero",
    },
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
            Plans for{' '}
            <span className="block gradient-earth bg-clip-text text-transparent">
              Every Stage of the Journey
            </span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            All plans include OCAP® compliance, data residency in Canada, and respect for Indigenous data sovereignty.
            We are honest about what is available today and what is coming soon — no surprises.
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

          {/* Legend for available vs coming-soon features */}
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-primary" />
              <span>Available today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Coming soon</span>
            </div>
          </div>
        </div>

        {/* Pricing cards — 4 tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
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

            // A paid plan with no Stripe price wired for the selected cycle is
            // "coming soon" — the card/button reflect that honestly.
            const isComingSoon = PAID_PLAN_NAMES.includes(plan.name) && !STRIPE_PRICES[plan.name]?.[billingCycle];

            return (
              <Card
                key={plan.name}
                className={`group relative hover:shadow-elevated transition-spring animate-fade-in-up flex flex-col ${
                  plan.popular ? 'ring-2 ring-primary/20 xl:scale-105' : ''
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

                <CardHeader className="text-center space-y-4 pb-6">
                  <div className={`w-14 h-14 ${gradientClass} rounded-2xl flex items-center justify-center mx-auto shadow-natural group-hover:shadow-glow transition-spring`}>
                    <Icon className="w-7 h-7 text-primary-foreground" />
                  </div>

                  <div className="space-y-2">
                    <CardTitle className="font-display text-xl text-foreground">
                      {plan.name}
                    </CardTitle>
                    <p className="text-sm text-primary/70 font-medium italic">
                      {plan.nameTranslation}
                    </p>
                    <CardDescription className="text-muted-foreground text-sm min-h-[40px]">
                      {plan.description}
                    </CardDescription>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline justify-center space-x-2">
                      <span className="font-display text-3xl font-bold text-foreground">
                        {displayPrice}
                      </span>
                      {plan.period !== "Contact us" && plan.period !== "Forever" && (
                        <span className="text-muted-foreground text-sm">/{billingCycle === 'annual' ? 'mo' : plan.period.replace('per ', '')}</span>
                      )}
                    </div>
                    {plan.period === "Contact us" && (
                      <p className="text-sm text-muted-foreground">{plan.period}</p>
                    )}
                    {billingCycle === 'annual' && plan.annualTotal && (
                      <p className="text-xs text-muted-foreground">
                        ${plan.annualTotal} billed annually
                      </p>
                    )}
                    {isComingSoon && (
                      <Badge variant="outline" className="mt-2 text-xs border-primary/40 text-primary">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 flex-1">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      {feature.available ? (
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-muted-foreground/60 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${feature.available ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </CardContent>

                <CardFooter className="pt-6">
                  <ShinyButton
                    className="w-full group/btn"
                    size="lg"
                    onClick={() => handleCheckout(plan.name)}
                    disabled={loadingPlan === plan.name}
                  >
                    {loadingPlan === plan.name ? "Loading..." : isComingSoon ? "Coming Soon" : plan.ctaText}
                    <ArrowRight className="w-4 h-4 ml-2 inline-block group-hover/btn:translate-x-1 transition-transform" />
                  </ShinyButton>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Comparison Table — 4 columns */}
        <Card className="mb-16 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-center">Compare Plans</CardTitle>
            <CardDescription className="text-center">
              <Clock className="w-3 h-3 inline-block mr-1" /> indicates a feature that is on the roadmap
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Feature</th>
                    <th className="text-center p-4 font-medium">Maadaadiziwin</th>
                    <th className="text-center p-4 font-medium bg-primary/5">Ogichidaakwe</th>
                    <th className="text-center p-4 font-medium">Bimaadiziwin</th>
                    <th className="text-center p-4 font-medium">Gimishoomis</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Business planning assistant', free: '✓', growth: '✓', pro: '✓', enterprise: '✓' },
                    { feature: 'Funding opportunity browser', free: '✓', growth: '✓', pro: '✓', enterprise: '✓' },
                    { feature: 'OCAP® compliant data handling', free: '✓', growth: '✓', pro: '✓', enterprise: '✓' },
                    { feature: 'Community forum + resources', free: '✓', growth: '✓', pro: '✓', enterprise: '✓' },
                    { feature: 'Multi-language interface', free: '✓', growth: '✓', pro: '✓', enterprise: '✓' },
                    { feature: 'Full data export', free: '✓', growth: '✓', pro: '✓', enterprise: '✓' },
                    { feature: 'Cultural competency training', free: '—', growth: '✓', pro: '✓', enterprise: '✓' },
                    { feature: 'Partner directory listing', free: '—', growth: '✓', pro: '✓', enterprise: '✓' },
                    { feature: 'Priority support', free: 'Email', growth: 'Email', pro: 'Phone+Chat (soon)', enterprise: '24/7 (soon)' },
                    { feature: 'AI funding matching', free: '3/mo', growth: '50/mo', pro: 'Unlimited', enterprise: 'Unlimited' },
                    { feature: 'Grant writing assistant', free: '—', growth: 'soon', pro: 'soon', enterprise: 'soon' },
                    { feature: 'Multi-entity support', free: '—', growth: '—', pro: 'soon', enterprise: 'soon' },
                    { feature: 'IFI Connection Engine', free: '—', growth: '—', pro: 'soon', enterprise: 'soon' },
                    { feature: 'OCAP® governance console', free: '—', growth: '—', pro: '—', enterprise: 'soon' },
                    { feature: 'White-label platform', free: '—', growth: '—', pro: '—', enterprise: 'soon' },
                    { feature: 'Dedicated account manager', free: '—', growth: '—', pro: '—', enterprise: 'soon' },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="text-center p-4 text-muted-foreground">{row.free}</td>
                      <td className="text-center p-4 bg-primary/5">{row.growth}</td>
                      <td className="text-center p-4 text-muted-foreground">{row.pro}</td>
                      <td className="text-center p-4 text-muted-foreground">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div id="addons" className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card/50 backdrop-blur-sm border border-border/50 p-6 shadow-natural">
            <h4 className="font-display text-xl font-semibold text-foreground mb-2">
              On the roadmap
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Grant writing assistance, IFI Connection Engine, quarterly impact reports, and
              the OCAP® governance console are in active development. AI funding matching
              is live today — try it from your dashboard.
            </p>
            <ShinyButton size="sm" onClick={handleAddonsClick}>
              Talk to us
            </ShinyButton>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border border-border/50 p-6 shadow-natural">
            <h4 className="font-display text-xl font-semibold text-foreground mb-2">
              Indigenous values built in
            </h4>
            <p className="text-sm text-muted-foreground">
              Indigenous-led, OCAP® compliant, data stored in Canada (ca-central-1), and a portion of profits returned to communities.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
