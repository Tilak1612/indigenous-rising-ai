import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, MapPin, Phone } from 'lucide-react';
import { contactSchema, type ContactFormData } from '@/lib/validation-schemas';

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
    try {
      const { error } = await supabase.functions.invoke('submit-contact', {
        body: data,
      });

      if (error) throw error;

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
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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
              <p className="text-muted-foreground">info@example.com</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Phone className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Phone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">+1 (555) 123-4567</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MapPin className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">123 Main St, City, Country</p>
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

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
