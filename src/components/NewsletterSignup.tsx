import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { z } from 'zod';

// PIPEDA-compliant email validation schema
const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" })
});

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const validation = emailSchema.safeParse({ email });
    if (!validation.success) {
      toast({
        title: 'Invalid email',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    // PIPEDA: Explicit consent required
    if (!consent) {
      toast({
        title: 'Consent required',
        description: 'Please agree to receive communications to subscribe.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Get client IP and user agent for CASL compliance
      const userAgent = navigator.userAgent;
      
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('newsletter-subscribe', {
        body: {
          email: validation.data.email,
          userAgent,
        },
      });

      if (error) throw error;

      setIsSubscribed(true);
      
      const requiresConfirmation = data?.requiresConfirmation;
      
      toast({
        title: 'Miigwech! Thank you!',
        description: requiresConfirmation 
          ? 'Please check your email to confirm your subscription.'
          : 'You\'ve been subscribed to funding alerts and updates.',
      });
      
      setEmail('');
      setConsent(false);
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: 'Subscription failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
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

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pr-4 bg-background"
              disabled={isLoading}
              required
            />
          </div>
          
          {/* PIPEDA: Explicit consent requirement */}
          <div className="flex items-start space-x-2 py-2">
            <Checkbox
              id="newsletter-consent"
              checked={consent}
              onCheckedChange={(checked) => setConsent(checked as boolean)}
              disabled={isLoading}
              className="mt-0.5"
            />
            <label
              htmlFor="newsletter-consent"
              className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
            >
              I consent to receive funding alerts, community updates, and promotional communications. 
              I understand my information will be handled according to our{' '}
              <Link to="/privacy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>
              {' '}and I can unsubscribe at any time.
            </label>
          </div>
          
          <Button
            type="submit"
            className="w-full gradient-earth text-white font-bold"
            disabled={isLoading || !consent}
          >
            {isLoading ? 'Subscribing...' : 'Subscribe to Updates'}
          </Button>
          
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
