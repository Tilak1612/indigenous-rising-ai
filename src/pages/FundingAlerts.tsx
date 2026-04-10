import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Mail, Bell } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MetaTags from '@/components/MetaTags';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ShinyButton } from '@/components/ui/shiny-button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
];

const INDUSTRIES = [
  'Agriculture & Forestry',
  'Arts & Crafts',
  'Construction',
  'Consulting',
  'Education',
  'Energy & Mining',
  'Finance & Insurance',
  'Food & Beverage',
  'Healthcare',
  'Hospitality & Tourism',
  'Information Technology',
  'Manufacturing',
  'Professional Services',
  'Real Estate',
  'Retail',
  'Transportation',
  'Other',
];

const schema = z.object({
  email: z.string().email('Please enter a valid email address').max(255),
  provinces: z.array(z.string()).min(1, 'Select at least one province or territory'),
  industries: z.array(z.string()).min(1, 'Select at least one industry'),
  consent: z.boolean().refine((v) => v === true, {
    message: 'Consent is required to subscribe',
  }),
});

type FormData = z.infer<typeof schema>;

const FundingAlerts: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      provinces: [],
      industries: [],
      consent: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('subscribe-funding-alerts', {
        body: data,
      });

      if (error) throw error;

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      setSubmitted(true);
      toast.success(result?.message || 'Check your inbox to confirm your subscription.');
    } catch (err) {
      console.error('Subscribe error:', err);
      toast.error('Could not process your subscription. Please try again or email help@indigenousrising.ai.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title="Free Weekly Funding Alerts | Indigenous Rising AI"
        description="Get free weekly emails on Indigenous business funding opportunities, filtered by your province and industry. CASL-compliant double opt-in. Unsubscribe any time."
        keywords="Indigenous funding alerts, free funding newsletter, Aboriginal business grants, weekly funding email"
      />
      <Navigation />

      <main className="pt-24">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs />

          <section className="mt-8 max-w-3xl mx-auto">
            {submitted ? (
              <Card className="border-primary/40">
                <CardContent className="p-12 text-center space-y-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="text-3xl font-display font-bold text-foreground">Check your inbox</h1>
                  <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                    We just sent a confirmation email. Click the link inside to start receiving your weekly Indigenous business funding digest every Friday morning.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Did not receive it? Check your spam folder, or email{' '}
                    <a className="text-primary underline" href="mailto:help@indigenousrising.ai">
                      help@indigenousrising.ai
                    </a>
                    .
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="text-center mb-12 space-y-4">
                  <Badge variant="secondary" className="mb-2">
                    <Bell className="w-3 h-3 mr-1" />
                    Free • CASL-compliant • Unsubscribe any time
                  </Badge>
                  <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
                    Free weekly funding alerts for Indigenous entrepreneurs
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Every Friday morning, we send a short email of new Indigenous business funding opportunities filtered by your province and industry. No spam, ever.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Subscribe</CardTitle>
                    <CardDescription>
                      Tell us where you operate and what industries you work in. We will only include grants relevant to you.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          Email address <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          aria-required="true"
                          aria-invalid={!!errors.email}
                          placeholder="you@example.com"
                          {...register('email')}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive" role="alert">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      {/* Provinces */}
                      <div className="space-y-2">
                        <Label>
                          Province / Territory <span className="text-destructive">*</span>
                        </Label>
                        <p className="text-xs text-muted-foreground">Select all that apply.</p>
                        <Controller
                          control={control}
                          name="provinces"
                          render={({ field }) => (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {PROVINCES.map((p) => {
                                const checked = field.value.includes(p.code);
                                return (
                                  <label
                                    key={p.code}
                                    className={`flex items-center gap-2 rounded-md border p-3 cursor-pointer transition-colors ${
                                      checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                                    }`}
                                  >
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={(c) => {
                                        if (c) field.onChange([...field.value, p.code]);
                                        else field.onChange(field.value.filter((v) => v !== p.code));
                                      }}
                                    />
                                    <span className="text-sm">{p.name}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        />
                        {errors.provinces && (
                          <p className="text-sm text-destructive" role="alert">
                            {errors.provinces.message}
                          </p>
                        )}
                      </div>

                      {/* Industries */}
                      <div className="space-y-2">
                        <Label>
                          Industries <span className="text-destructive">*</span>
                        </Label>
                        <p className="text-xs text-muted-foreground">Select all that apply.</p>
                        <Controller
                          control={control}
                          name="industries"
                          render={({ field }) => (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {INDUSTRIES.map((i) => {
                                const checked = field.value.includes(i);
                                return (
                                  <label
                                    key={i}
                                    className={`flex items-center gap-2 rounded-md border p-3 cursor-pointer transition-colors ${
                                      checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                                    }`}
                                  >
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={(c) => {
                                        if (c) field.onChange([...field.value, i]);
                                        else field.onChange(field.value.filter((v) => v !== i));
                                      }}
                                    />
                                    <span className="text-sm">{i}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        />
                        {errors.industries && (
                          <p className="text-sm text-destructive" role="alert">
                            {errors.industries.message}
                          </p>
                        )}
                      </div>

                      {/* CASL consent */}
                      <div className="space-y-2">
                        <div className="flex items-start gap-3 rounded-md border p-4">
                          <Controller
                            control={control}
                            name="consent"
                            render={({ field }) => (
                              <Checkbox
                                id="consent"
                                checked={field.value}
                                onCheckedChange={(c) => field.onChange(Boolean(c))}
                                className="mt-1"
                                aria-required="true"
                              />
                            )}
                          />
                          <Label htmlFor="consent" className="leading-relaxed cursor-pointer">
                            I consent to receive weekly funding opportunity emails from Indigenous Rising AI. I understand I can unsubscribe at any time using the link in every email. <span className="text-destructive">*</span>
                          </Label>
                        </div>
                        {errors.consent && (
                          <p className="text-sm text-destructive" role="alert">
                            {errors.consent.message}
                          </p>
                        )}
                      </div>

                      <ShinyButton type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Subscribing...' : 'Subscribe to free funding alerts'}
                      </ShinyButton>

                      <p className="text-xs text-muted-foreground text-center">
                        Your data is stored in Canada (Supabase ca-central-1) under OCAP™ principles. We never sell or share your email.
                      </p>
                    </form>
                  </CardContent>
                </Card>

                {/* What you'll get */}
                <div className="mt-12">
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">What you will get</h2>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span>One email every Friday morning with up to 10 new or upcoming funding opportunities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span>Each grant filtered by the provinces and industries you select above</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span>Direct links to the funder's application page — no middleman</span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FundingAlerts;
