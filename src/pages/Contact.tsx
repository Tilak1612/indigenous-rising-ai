import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, MapPin, Phone } from 'lucide-react';
import { contactSchema, type ContactFormData } from '@/lib/validation-schemas';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MetaTags from '@/components/MetaTags';
import Breadcrumbs from '@/components/Breadcrumbs';
import { 
  checkRateLimit, 
  recordSubmission, 
  getTimeUntilReset,
  formatTimeRemaining 
} from '@/lib/rate-limiter';

const Contact = () => {
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      full_name: '',
      email: '',
      subject: '',
      phone: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    // Client-side rate limiting: 3 submissions per hour
    const rateLimitConfig = {
      key: 'contact',
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
      const { error } = await supabase.functions.invoke('submit-contact', {
        body: data,
      });

      if (error) throw error;

      // Record successful submission for rate limiting
      recordSubmission('contact');

      toast({
        title: 'Message sent!',
        description: 'Thank you for contacting us. We\'ll get back to you soon.',
      });
      
      reset();
    } catch (error: any) {
      console.error('Contact form error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <MetaTags
        title="Contact Us | Get Support | Indigenous Rising AI"
        description="Get in touch with Indigenous Rising AI. We're here to help Indigenous entrepreneurs succeed. Email, phone, and contact form available."
        url="https://indigenousrising.ai/contact"
        ogImage="https://indigenousrising.ai/og-contact.jpg"
      />
      
      <Navigation />
      <div className="min-h-screen bg-background pt-16">
        <Breadcrumbs className="container mx-auto bg-muted border-b" />
        <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a question or need assistance? We're here to help. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <Mail className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Email</CardTitle>
            </CardHeader>
            <CardContent>
              <a href="mailto:hello@indigenousrising.ai" className="text-muted-foreground hover:text-primary transition-smooth">
                hello@indigenousrising.ai
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Phone className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Phone</CardTitle>
            </CardHeader>
            <CardContent>
              <a href="tel:+18004634436" className="text-muted-foreground hover:text-primary transition-smooth">
                1-800-INDIGENOUS (1-800-463-4436)
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MapPin className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Traditional Territory of the Anishinaabe, Toronto, ON</p>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you within 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  {...register('full_name')}
                  placeholder="John Doe"
                  disabled={isSubmitting}
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="john@example.com"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+1 (555) 123-4567"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  {...register('subject')}
                  placeholder="How can we help?"
                  disabled={isSubmitting}
                />
                {errors.subject && (
                  <p className="text-sm text-destructive">{errors.subject.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  {...register('message')}
                  placeholder="Tell us more about your inquiry..."
                  className="min-h-[150px]"
                  disabled={isSubmitting}
                />
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message.message}</p>
                )}
              </div>

              <ShinyButton type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </ShinyButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default Contact;
