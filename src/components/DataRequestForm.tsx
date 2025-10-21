import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle } from 'lucide-react';
import { z } from 'zod';

// PIPEDA-compliant validation schema
const dataRequestSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: "Full name must be at least 2 characters" })
    .max(100, { message: "Full name must be less than 100 characters" }),
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  requestType: z.enum(['access', 'correction', 'deletion', 'portability', 'withdraw-consent']),
  details: z
    .string()
    .trim()
    .min(10, { message: "Please provide at least 10 characters of detail" })
    .max(2000, { message: "Details must be less than 2000 characters" })
});

const DataRequestForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    requestType: 'access' as 'access' | 'correction' | 'deletion' | 'portability' | 'withdraw-consent',
    details: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = dataRequestSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        title: 'Validation Error',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    // In production, this would send to backend
    const requestData = {
      ...validation.data,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      pipedaCompliance: true
    };
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast({
        title: 'Request Submitted',
        description: 'We will respond within 30 days as required by PIPEDA.',
      });
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <Card className="p-8 bg-primary/5 border-primary/20">
        <div className="flex flex-col items-center text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-primary" />
          <h3 className="font-display text-2xl font-bold text-foreground">
            Request Received
          </h3>
          <p className="text-muted-foreground max-w-md">
            Your PIPEDA data request has been submitted. We will respond within 30 days 
            as required by Canadian privacy law. You will receive a confirmation email shortly.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                fullName: '',
                email: '',
                requestType: 'access',
                details: ''
              });
            }}
          >
            Submit Another Request
          </Button>
        </div>
      </Card>
    );
  }

  const requestTypes = [
    {
      value: 'access',
      label: 'Access My Data',
      description: 'Request a copy of all personal information we hold about you'
    },
    {
      value: 'correction',
      label: 'Correct My Data',
      description: 'Request corrections to inaccurate or incomplete personal information'
    },
    {
      value: 'deletion',
      label: 'Delete My Data',
      description: 'Request deletion of your personal information (subject to legal retention requirements)'
    },
    {
      value: 'portability',
      label: 'Data Portability',
      description: 'Request your data in a structured, machine-readable format'
    },
    {
      value: 'withdraw-consent',
      label: 'Withdraw Consent',
      description: 'Withdraw your consent for specific data processing activities'
    }
  ];

  return (
    <Card className="p-8 bg-card border-border">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">
              PIPEDA Data Rights Request
            </h3>
            <p className="text-muted-foreground">
              Exercise your rights under Canada's Personal Information Protection and Electronic Documents Act (PIPEDA). 
              We will respond within 30 days.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full legal name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              disabled={isLoading}
              required
              maxLength={100}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isLoading}
              required
              maxLength={255}
            />
            <p className="text-xs text-muted-foreground">
              We will use this email to verify your identity and respond to your request
            </p>
          </div>

          {/* Request Type */}
          <div className="space-y-3">
            <Label>Type of Request *</Label>
            <RadioGroup
              value={formData.requestType}
              onValueChange={(value) => setFormData({ 
                ...formData, 
                requestType: value as typeof formData.requestType 
              })}
              disabled={isLoading}
            >
              {requestTypes.map((type) => (
                <div key={type.value} className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={type.value} id={type.value} className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor={type.value} className="font-semibold cursor-pointer">
                      {type.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {type.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <Label htmlFor="details">Request Details *</Label>
            <Textarea
              id="details"
              placeholder="Please provide specific details about your request. For example, if requesting data correction, specify which information needs to be updated."
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              disabled={isLoading}
              required
              maxLength={2000}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {formData.details.length}/2000 characters
            </p>
          </div>

          {/* Identity Verification Notice */}
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Identity Verification:</strong> To protect your privacy, 
              we may request additional information to verify your identity before processing this request, 
              as permitted under PIPEDA.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full gradient-earth text-white font-bold"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? 'Submitting Request...' : 'Submit PIPEDA Request'}
          </Button>

          {/* Footer Info */}
          <div className="space-y-2 text-center">
            <p className="text-xs text-muted-foreground">
              🔒 Your request will be processed securely and confidentially
            </p>
            <p className="text-xs text-muted-foreground">
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

export default DataRequestForm;
