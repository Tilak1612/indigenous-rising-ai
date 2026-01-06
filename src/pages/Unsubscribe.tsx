import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui/card';
import { ShinyButton } from '@/components/ui/shiny-button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribeToken = searchParams.get('token');
    
    if (!unsubscribeToken) {
      setStatus('error');
      setMessage('Invalid unsubscribe link. Please use the link from your email.');
      return;
    }

    const handleUnsubscribe = async () => {
      try {
        // Call the secure edge function for unsubscribe
        const { data, error } = await supabase.functions.invoke('newsletter-unsubscribe', {
          body: { token: unsubscribeToken }
        });

        if (error) {
          throw new Error(error.message || 'Failed to unsubscribe');
        }

        if (data?.success) {
          setStatus('success');
          setMessage(data.message);
        } else if (data?.error) {
          throw new Error(data.error);
        } else {
          throw new Error('Unexpected response from server');
        }
      } catch (error: any) {
        console.error('Unsubscribe error:', error);
        setStatus('error');
        setMessage('Failed to unsubscribe. Please try again or contact support.');
      }
    };

    handleUnsubscribe();
  }, [searchParams]);

  return (
    <>
      <Helmet>
        <title>Unsubscribe - Indigenous Rising AI</title>
        <meta name="description" content="Unsubscribe from Indigenous Rising AI newsletter communications." />
        <meta name="robots" content="noindex, nofollow" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://indigenousrising.ai/unsubscribe" />
        <meta property="og:title" content="Unsubscribe - Indigenous Rising AI" />
        <meta property="og:description" content="Manage your newsletter preferences." />
        <meta property="og:image" content="https://indigenousrising.ai/og-home.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://indigenousrising.ai/unsubscribe" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        <Navigation />
        
        <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
          <Card className="max-w-lg w-full p-8 space-y-6">
            {status === 'loading' && (
              <div className="text-center space-y-4">
                <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Processing your request...
                </h1>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Unsubscribed
                </h1>
                <p className="text-muted-foreground">{message}</p>
                <div className="pt-4">
                  <Link to="/">
                    <ShinyButton>
                      Return to Homepage
                    </ShinyButton>
                  </Link>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center space-y-4">
                <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Error
                </h1>
                <p className="text-muted-foreground">{message}</p>
                <div className="pt-4 space-y-3">
                  <Link to="/">
                    <ShinyButton className="w-full">
                      Return to Homepage
                    </ShinyButton>
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Need help? Contact us at{' '}
                    <a 
                      href="mailto:privacy@indigenousrising.ai" 
                      className="text-primary hover:underline"
                    >
                      privacy@indigenousrising.ai
                    </a>
                  </p>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                This action complies with CASL (Canada's Anti-Spam Legislation) and PIPEDA requirements.
                Your personal information will be retained according to our{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Unsubscribe;
