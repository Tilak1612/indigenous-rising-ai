import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function TestSubscription() {
  const { user } = useAuth();
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [responses, setResponses] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    const getToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setToken(session?.access_token || 'No token available');
    };
    getToken();
  }, []);

  const testEdgeFunction = async (functionName: string, body?: any) => {
    setLoading(prev => ({ ...prev, [functionName]: true }));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
        body,
      });

      if (error) throw error;

      setResponses(prev => ({ ...prev, [functionName]: data }));
      toast({
        title: 'Success',
        description: `${functionName} completed successfully`,
      });

      // If create-checkout returns a URL, open it
      if (functionName === 'create-checkout' && data?.url) {
        window.open(data.url, '_blank');
      }

      // If customer-portal returns a URL, open it
      if (functionName === 'customer-portal' && data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error(`Error testing ${functionName}:`, error);
      setResponses(prev => ({ 
        ...prev, 
        [functionName]: { error: error.message || 'Unknown error' } 
      }));
      toast({
        title: 'Error',
        description: error.message || `Failed to test ${functionName}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, [functionName]: false }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Token copied to clipboard',
    });
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Subscription Testing</h1>
          <p className="text-muted-foreground">Test edge functions and view authentication details</p>
        </div>

        {/* JWT Token Display */}
        <Card>
          <CardHeader>
            <CardTitle>JWT Token</CardTitle>
            <CardDescription>Current user authentication token</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-4 bg-muted rounded-lg font-mono text-sm break-all">
                {token || 'Loading...'}
              </div>
              <Button 
                onClick={() => copyToClipboard(token)}
                variant="outline"
                size="sm"
                disabled={!token}
              >
                Copy Token
              </Button>
            </div>
            {user && (
              <div className="mt-4 text-sm text-muted-foreground">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edge Function Tests */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Edge Function Tests</h2>
          
          {/* Check Subscription */}
          <Card>
            <CardHeader>
              <CardTitle>Check Subscription</CardTitle>
              <CardDescription>Verify current subscription status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => testEdgeFunction('check-subscription')}
                disabled={loading['check-subscription']}
              >
                {loading['check-subscription'] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test check-subscription
              </Button>
              {responses['check-subscription'] && (
                <div className="p-4 bg-muted rounded-lg">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(responses['check-subscription'], null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Checkout */}
          <Card>
            <CardHeader>
              <CardTitle>Create Checkout</CardTitle>
              <CardDescription>Create a Stripe checkout session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => testEdgeFunction('create-checkout')}
                disabled={loading['create-checkout']}
              >
                {loading['create-checkout'] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test create-checkout
              </Button>
              {responses['create-checkout'] && (
                <div className="p-4 bg-muted rounded-lg">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(responses['create-checkout'], null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Portal */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Portal</CardTitle>
              <CardDescription>Open Stripe customer portal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => testEdgeFunction('customer-portal')}
                disabled={loading['customer-portal']}
              >
                {loading['customer-portal'] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test customer-portal
              </Button>
              {responses['customer-portal'] && (
                <div className="p-4 bg-muted rounded-lg">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(responses['customer-portal'], null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
