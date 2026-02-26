import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle, Upload, FileText, X } from 'lucide-react';
import { dataRequestSchema, type DataRequestFormData } from '@/lib/validation-schemas';

import { Link } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  checkRateLimit, 
  recordSubmission, 
  getTimeUntilReset,
  formatTimeRemaining 
} from '@/lib/rate-limiter';

const DataRequestForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [emailError, setEmailError] = useState('');
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
    setError,
  } = useForm<DataRequestFormData>({
    resolver: zodResolver(dataRequestSchema),
    defaultValues: {
      fullName: '',
      email: '',
      requestType: 'access',
      details: '',
      phone: '',
    },
  });

  const requestType = watch('requestType');
  const details = watch('details');
  const emailValue = watch('email');

  useEffect(() => {
    if (!emailValue) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setEmailError('Please enter a valid email');
    } else {
      setEmailError('');
    }
  }, [emailValue]);

  // Debug: log validation errors during tests
  useEffect(() => {
     
    console.debug('DATA_REQUEST_ERRORS', errors);
  }, [errors]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPEG, PNG, or PDF file',
        variant: 'destructive',
      });
      return;
    }

    setUploadedFile(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
  };

  const onSubmit = async (data: DataRequestFormData) => {
    // Manual fallback validation for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      // @ts-ignore
      if (setError) {
        (setError as any)('email', { type: 'manual', message: 'Please enter a valid email' });
      }
      setEmailError('Please enter a valid email');
      return;
    }
    setEmailError('');
    // Client-side rate limiting: 3 submissions per hour
    const rateLimitConfig = {
      key: 'data-request',
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
      setUploadProgress(uploadedFile ? 30 : 0);

      const userAgent = navigator.userAgent;

      // Build form data to send file through edge function (not direct storage)
      const formData = new FormData();
      formData.append('fullName', data.fullName);
      formData.append('email', data.email);
      formData.append('requestType', data.requestType.replace('-', '_'));
      formData.append('details', data.details);
      formData.append('phone', data.phone || '');
      formData.append('verificationMethod', uploadedFile ? 'document_upload' : 'email_only');
      formData.append('userAgent', userAgent);
      if (uploadedFile) {
        formData.append('file', uploadedFile);
      }

      setUploadProgress(uploadedFile ? 60 : 0);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/submit-data-request`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
        },
        body: formData,
      });

      setUploadProgress(uploadedFile ? 90 : 0);

      const response = await res.json();
      const error = !res.ok ? new Error(response.error || 'Request failed') : null;

      if (error) throw error;
      if (response.error) throw new Error(response.error);

      setUploadProgress(100);

      // Record successful submission for rate limiting
      recordSubmission('data-request');

      setTrackingNumber(response.tracking_number);
      setIsSubmitted(true);
      
      toast({
        title: 'Request Submitted Successfully',
        description: `Your tracking number is ${response.tracking_number}. Please save it.`,
      });

      reset();
      setUploadedFile(null);
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setUploadProgress(0);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="p-8 bg-primary/5 border-primary/20">
        <div className="flex flex-col items-center text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-primary" />
          <h3 className="font-display text-2xl font-bold text-foreground">
            Request Received
          </h3>
          <div className="bg-background border-2 border-primary rounded-lg p-4 my-4">
            <p className="text-xs text-muted-foreground mb-2">Your Tracking Number</p>
            <p className="font-mono text-2xl font-bold text-primary tracking-wider">
              {trackingNumber}
            </p>
          </div>
          <p className="text-muted-foreground max-w-md">
            Your PIPEDA data request has been submitted. We will respond within 30 days 
            as required by Canadian privacy law. A confirmation email has been sent to your inbox.
          </p>
          <p className="text-sm text-foreground font-semibold">
            Please save your tracking number to check the status of your request.
          </p>
          <div className="flex gap-3 pt-4">
            <Link to="/track-request">
              <ShinyButton>
                Track My Request
              </ShinyButton>
            </Link>
            <ShinyButton
              onClick={() => {
                setIsSubmitted(false);
                setTrackingNumber('');
              }}
            >
              Submit Another Request
            </ShinyButton>
          </div>
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              placeholder="Enter your full legal name"
              {...register('fullName')}
              disabled={isSubmitting}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              {...register('email')}
              disabled={isSubmitting}
            />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
              {emailError && !errors.email && (
                <p className="text-sm text-destructive">{emailError}</p>
              )}
            <p className="text-xs text-muted-foreground">
              We will use this email to verify your identity and respond to your request
            </p>
          </div>

          <div className="space-y-3">
            <Label>Type of Request *</Label>
            <RadioGroup
              value={requestType}
              onValueChange={(value) => setValue('requestType', value as DataRequestFormData['requestType'])}
              disabled={isSubmitting}
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
            {errors.requestType && (
              <p className="text-sm text-destructive">{errors.requestType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              {...register('phone')}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              May be used for identity verification
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Request Details *</Label>
            <Textarea
              id="details"
              placeholder="Please provide specific details about your request. For example, if requesting data correction, specify which information needs to be updated."
              {...register('details')}
              disabled={isSubmitting}
              rows={5}
              className="resize-none"
            />
            {errors.details && (
              <p className="text-sm text-destructive">{errors.details.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {details.length}/2000 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verification-doc">Identity Verification Document (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              {!uploadedFile ? (
                <div className="text-center space-y-2">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                  <div>
                    <label htmlFor="verification-doc" className="cursor-pointer">
                      <span className="text-primary hover:underline font-medium">
                        Click to upload
                      </span>
                      <span className="text-muted-foreground"> or drag and drop</span>
                    </label>
                    <Input
                      id="verification-doc"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PDF, JPEG, or PNG (max 5MB) • Encrypted at rest • Auto-deleted after 90 days
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <ShinyButton
                    type="button"
                    size="sm"
                    onClick={removeFile}
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                  </ShinyButton>
                </div>
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-3">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Identity Verification:</strong> To protect your privacy, 
              we may request additional information to verify your identity before processing this request, 
              as permitted under PIPEDA.
            </p>
          </div>

          <ShinyButton
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting || uploadProgress > 0}
          >
            {isSubmitting || uploadProgress > 0 ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Submitting...'}
              </>
            ) : (
              'Submit PIPEDA Request'
            )}
          </ShinyButton>

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
