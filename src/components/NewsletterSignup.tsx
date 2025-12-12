import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { newsletterSchema, type NewsletterFormData } from '@/lib/validation-schemas';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  checkRateLimit, 
  recordSubmission, 
  getTimeUntilReset,
  formatTimeRemaining 
} from '@/lib/rate-limiter';

const NewsletterSignup = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
      consent: false,
    },
  });

  const consent = watch('consent');

  const onSubmit = async (data: NewsletterFormData) => {
    // Client-side rate limiting: 3 submissions per hour
    const rateLimitConfig = {
      key: 'newsletter',
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
    };

    if (!checkRateLimit(rateLimitConfig)) {
      const timeRemaining = getTimeUntilReset(rateLimitConfig);
      toast({
        title: 'Too many attempts',
        description: `Please wait ${formatTimeRemaining(timeRemaining)} before trying again.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      const userAgent = navigator.userAgent;
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data: response, error } = await supabase.functions.invoke('newsletter-subscribe', {
        body: {
          email: data.email,
          userAgent,
        },
      });

      if (error) throw error;

      // Record successful submission for rate limiting
      recordSubmission('newsletter');

      setIsSubmitted(true);
      
      const requiresConfirmation = response?.requiresConfirmation;
      
      toast({
        title: 'Miigwech! Thank you!',
        description: requiresConfirmation 
          ? 'Please check your email to confirm your subscription.'
          : 'You\'ve been subscribed to funding alerts and updates.',
      });
      
      reset();
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: 'Subscription failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  if (isSubmitted) {
    return (
      <Card className="p-6 bg-primary/5 border-primary/20 flex items-center justify-center gap-3">
        <CheckCircle className="w-6 h-6 text-primary" />
        <p className="font-semibold text-foreground">
          Successfully subscribed! Check your email.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Stay Connected
            </h3>
            <p className="text-sm text-muted-foreground">
              Get funding alerts & community updates
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Input
              type="email"
              placeholder="Enter your email address"
              {...register('email')}
              className="bg-background"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-start space-x-2 py-2">
              <Checkbox
                id="newsletter-consent"
                checked={consent}
                onCheckedChange={(checked) => setValue('consent', checked as boolean)}
                disabled={isSubmitting}
                className="mt-0.5"
              />
              <Label
                htmlFor="newsletter-consent"
                className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
              >
                I consent to receive funding alerts, community updates, and promotional communications. 
                I understand my information will be handled according to our{' '}
                <Link to="/privacy" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </Link>
                {' '}and I can unsubscribe at any time.
              </Label>
            </div>
            {errors.consent && (
              <p className="text-xs text-destructive">{errors.consent.message}</p>
            )}
          </div>
          
          <ShinyButton
            type="submit"
            className="w-full"
            disabled={isSubmitting || !consent}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Subscribing...
              </>
            ) : (
              'Subscribe to Updates'
            )}
          </ShinyButton>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground text-center">
              🔒 PIPEDA Compliant • Data stored in Canada
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Questions? Contact our Privacy Officer at{' '}
              <a href="mailto:privacy@indigenousrising.ai" className="text-primary hover:underline">
                privacy@indigenousrising.ai
              </a>
            </p>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default NewsletterSignup;
