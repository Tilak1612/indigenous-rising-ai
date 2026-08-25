import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MetaTags from '@/components/MetaTags';
import { Card, CardContent } from '@/components/ui/card';
import { ShinyButton } from '@/components/ui/shiny-button';
import { supabase } from '@/lib/supabase';

type State =
  | { kind: 'loading' }
  | { kind: 'success'; alreadyConfirmed: boolean }
  | { kind: 'error'; message: string; code?: string };

const FundingAlertConfirm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    const token = searchParams.get('token')?.trim();

    if (!token) {
      setState({ kind: 'error', message: 'No confirmation token provided.' });
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('confirm-funding-alert-subscription', {
          body: { token },
        });

        if (error) {
          // Edge function returned a non-2xx status
          const errBody = (error as { context?: { body?: string } })?.context?.body;
          if (errBody) {
            try {
              const parsed = JSON.parse(errBody);
              setState({
                kind: 'error',
                message: parsed.error || 'Failed to confirm subscription',
                code: parsed.code,
              });
              return;
            } catch {
              // fall through
            }
          }
          setState({ kind: 'error', message: 'Failed to confirm subscription.' });
          return;
        }

        if (data?.success) {
          setState({ kind: 'success', alreadyConfirmed: !!data.alreadyConfirmed });
          return;
        }

        setState({ kind: 'error', message: data?.error || 'Failed to confirm subscription.', code: data?.code });
      } catch (err) {
        console.error('Confirm error:', err);
        setState({ kind: 'error', message: 'Something went wrong. Please try again.' });
      }
    })();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title="Confirm Funding Alerts Subscription | Indigenous Rising AI"
        description="Confirm your weekly Indigenous business funding alerts subscription."
      />
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <Card>
              <CardContent className="p-12 text-center space-y-6">
                {state.kind === 'loading' && (
                  <>
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                    <h1 className="text-2xl font-display font-bold text-foreground">Confirming your subscription...</h1>
                  </>
                )}

                {state.kind === 'success' && (
                  <>
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-foreground">
                      {state.alreadyConfirmed ? 'Already confirmed' : 'Subscription confirmed'}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      {state.alreadyConfirmed
                        ? "You're already on the list. Your next funding digest will arrive Friday morning."
                        : 'Welcome to Indigenous Rising AI Funding Alerts. Your first weekly digest will arrive Friday morning.'}
                    </p>
                    <ShinyButton asChild>
                      <Link to="/funding">Browse current funding opportunities</Link>
                    </ShinyButton>
                  </>
                )}

                {state.kind === 'error' && (
                  <>
                    <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-display font-bold text-foreground">
                      {state.code === 'expired_token' ? 'This link has expired' : 'Confirmation failed'}
                    </h1>
                    <p className="text-muted-foreground">
                      {state.code === 'expired_token'
                        ? 'Confirmation links are valid for 48 hours. Please subscribe again to receive a new link.'
                        : state.message}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <ShinyButton asChild>
                        <Link to="/funding/alerts">Subscribe again</Link>
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

export default FundingAlertConfirm;
