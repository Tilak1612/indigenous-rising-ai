import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui/card';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Shield, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface RequestStatus {
  tracking_number: string;
  request_type: string;
  status: string;
  submitted_at: string;
  completed_at: string | null;
}

const TrackRequest = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requestInfo, setRequestInfo] = useState<RequestStatus | null>(null);
  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'in_progress':
        return <Clock className="w-6 h-6 text-blue-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatRequestType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trackingNumber || trackingNumber.length !== 12) {
      toast({
        title: 'Invalid tracking number',
        description: 'Please enter a valid 12-character tracking number.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setRequestInfo(null);

    try {
      const { data, error } = await supabase.functions.invoke('submit-data-request', {
        body: { trackingNumber },
        method: 'POST',
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setRequestInfo(data.request);
    } catch (error: any) {
      console.error('Tracking error:', error);
      toast({
        title: 'Request not found',
        description: 'Unable to find a request with that tracking number.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Track Data Request - Indigenous Rising AI</title>
        <meta name="description" content="Track your PIPEDA data rights request status using your tracking number." />
        <meta name="robots" content="noindex, nofollow" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.indigenousrising.ai/track-request" />
        <meta property="og:title" content="Track Your Data Request" />
        <meta property="og:description" content="Check the status of your PIPEDA data rights request." />
        <meta property="og:image" content="https://www.indigenousrising.ai/og-data-rights.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://www.indigenousrising.ai/track-request" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        <Navigation />

        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Shield className="w-10 h-10 text-primary" />
                <h1 className="font-display text-4xl font-bold text-foreground">
                  Track Your Request
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Enter your tracking number to check the status of your PIPEDA data rights request
              </p>
            </div>

            {/* Tracking Form */}
            <Card className="p-8">
              <form onSubmit={handleTrack} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="tracking" className="text-sm font-medium text-foreground">
                    Tracking Number
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="tracking"
                      type="text"
                      placeholder="Enter 12-character tracking number"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                      maxLength={12}
                      className="font-mono text-lg"
                      disabled={isLoading}
                      required
                    />
                    <ShinyButton
                      type="submit"
                      disabled={isLoading || trackingNumber.length !== 12}
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Tracking...
                        </>
                      ) : (
                        <>
                          <Search className="w-5 h-5 mr-2 inline-block" />
                          Track
                        </>
                      )}
                    </ShinyButton>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your tracking number was provided when you submitted your request
                  </p>
                </div>
              </form>
            </Card>

            {/* Request Status */}
            {isLoading ? (
              <Card className="p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
                <div className="grid gap-4">
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              </Card>
            ) : requestInfo ? (
              <Card className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      Request Status
                    </h2>
                    <p className="text-sm text-muted-foreground font-mono">
                      {requestInfo.tracking_number}
                    </p>
                  </div>
                  {getStatusIcon(requestInfo.status)}
                </div>

                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                    <Badge className={getStatusColor(requestInfo.status)}>
                      {requestInfo.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Request Type</span>
                    <span className="font-semibold text-foreground">
                      {formatRequestType(requestInfo.request_type)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Submitted</span>
                    <span className="text-sm text-foreground">
                      {formatDate(requestInfo.submitted_at)}
                    </span>
                  </div>

                  {requestInfo.completed_at && (
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground">Completed</span>
                      <span className="text-sm text-foreground">
                        {formatDate(requestInfo.completed_at)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <h3 className="font-semibold text-foreground">What happens next?</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {requestInfo.status === 'pending' && (
                      <>
                        <li>• Your request is being reviewed by our Privacy Officer</li>
                        <li>• We will verify your identity and request details</li>
                        <li>• You'll receive an email update within 24-48 hours</li>
                      </>
                    )}
                    {requestInfo.status === 'in_progress' && (
                      <>
                        <li>• Your request is currently being processed</li>
                        <li>• Our team is working on fulfilling your request</li>
                        <li>• We'll notify you when it's completed</li>
                      </>
                    )}
                    {requestInfo.status === 'completed' && (
                      <>
                        <li>• Your request has been completed successfully</li>
                        <li>• Check your email for detailed information</li>
                        <li>• Contact us if you have any questions</li>
                      </>
                    )}
                    {requestInfo.status === 'rejected' && (
                      <>
                        <li>• Your request could not be processed</li>
                        <li>• You should have received an email with the reason</li>
                        <li>• You have the right to file a complaint with the Privacy Commissioner</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    Questions about your request? Contact our Privacy Officer at{' '}
                    <a href="mailto:privacy@indigenousrising.ai" className="text-primary hover:underline">
                      privacy@indigenousrising.ai
                    </a>
                  </p>
                </div>
              </Card>
            ) : null}

            {/* Information Card */}
            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="font-semibold text-foreground mb-3">
                PIPEDA Compliance Timeline
              </h3>
              <p className="text-sm text-muted-foreground">
                Under PIPEDA, we are required to respond to your request within 30 days of receiving it.
                In some cases, we may extend this period by an additional 30 days with written notice
                explaining the reason for the extension.
              </p>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TrackRequest;
