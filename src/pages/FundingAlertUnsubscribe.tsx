import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MetaTags from '@/components/MetaTags';
import { Card, CardContent } from '@/components/ui/card';
import { ShinyButton } from '@/components/ui/shiny-button';
import { supabase } from '@/lib/supabase';

const FundingAlertUnsubscribe: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token')?.trim() || '';

    // CASL: 1-click. Fire-and-forget — always show success regardless of result
    // (matches the edge function which never reveals whether the token exists).
    (async () => {
      try {
        await supabase.functions.invoke('unsubscribe-funding-alerts', {
          body: { token },
        });
      } catch (err) {
        console.error('Unsubscribe error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title="Unsubscribed from Funding Alerts | Indigenous Rising AI"
        description="You have been unsubscribed from Indigenous Rising AI funding alerts."
      />
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <Card>
              <CardContent className="p-12 text-center space-y-6">
                {loading ? (
                  <>
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                    <h1 className="text-2xl font-display font-bold text-foreground">Processing your request...</h1>
                  </>
                ) : (
                  <>
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-foreground">You have been unsubscribed</h1>
                    <p className="text-lg text-muted-foreground">
                      Sorry to see you go. You will not receive any further funding alert emails. You can resubscribe at any time.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <ShinyButton asChild>
                        <Link to="/funding/alerts">Resubscribe</Link>
                      </ShinyButton>
                      <ShinyButton asChild>
                        <Link to="/">Back to home</Link>
                      </ShinyButton>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FundingAlertUnsubscribe;
