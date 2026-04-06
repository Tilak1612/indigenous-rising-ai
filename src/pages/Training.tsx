import { useState } from 'react';
import { trackEvent } from '@/utils/analytics';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  BookOpen, 
  Video, 
  Users, 
  Award, 
  Calendar,
  CheckCircle2,
  Loader2,
  Lock,
  Sparkles
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MetaTags from '@/components/MetaTags';
import Breadcrumbs from '@/components/Breadcrumbs';

const Training = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscribed, subscription_end, loading, refreshSubscription } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleSubscribe = async () => {
    trackEvent('training_enrollment_start', { training_type: 'premium_training' });
    if (!user) {
      toast.error('Please log in to subscribe to the training program');
      navigate('/auth');
      return;
    }

    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
        // Refresh subscription status after a delay
        setTimeout(refreshSubscription, 3000);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to create checkout session');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Portal error:', error);
      toast.error(error.message || 'Failed to open customer portal');
    } finally {
      setPortalLoading(false);
    }
  };

  const features = [
    {
      icon: Video,
      title: 'Live Workshops',
      description: 'Monthly live sessions with AI experts and Indigenous leaders',
    },
    {
      icon: BookOpen,
      title: 'Resource Library',
      description: 'Access to comprehensive learning materials and guides',
    },
    {
      icon: Users,
      title: 'Community Forum',
      description: 'Connect with other learners and share experiences',
    },
    {
      icon: Award,
      title: 'Certificates',
      description: 'Earn certificates of completion for finished modules',
    },
  ];

  const trainingModules = [
    {
      title: 'Introduction to AI Ethics',
      duration: '2 hours',
      lessons: 8,
      locked: !subscribed,
    },
    {
      title: 'Indigenous Data Sovereignty',
      duration: '3 hours',
      lessons: 12,
      locked: !subscribed,
    },
    {
      title: 'Building AI Solutions',
      duration: '4 hours',
      lessons: 15,
      locked: !subscribed,
    },
    {
      title: 'Community Implementation',
      duration: '2.5 hours',
      lessons: 10,
      locked: !subscribed,
    },
  ];

  return (
    <>
      <MetaTags
        title="AI Training Program | Indigenous Rising AI"
        description="Join our comprehensive AI training program designed for Indigenous communities. Learn AI ethics, data sovereignty, and practical implementation."
        url="https://indigenousrising.ai/training"
      />

      <Navigation />
      <div className="pt-16">
        <Breadcrumbs className="container mx-auto bg-muted border-b" />
      </div>

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <Badge className="mb-4" variant="secondary">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Training Program
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Empower Your Community with AI Knowledge
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Comprehensive monthly training designed specifically for Indigenous communities
              </p>
            </div>

            {/* Subscription Status Card */}
            {user && (
              <Card className="max-w-2xl mx-auto mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Checking subscription status...
                      </>
                    ) : subscribed ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        Active Subscription
                      </>
                    ) : (
                      'Start Your Training Journey'
                    )}
                  </CardTitle>
                  {subscribed && subscription_end && (
                    <CardDescription>
                      Your subscription renews on {new Date(subscription_end).toLocaleDateString()}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscribed ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        You have full access to all training materials, workshops, and community resources.
                      </p>
                      <div className="flex gap-3">
                        <Button onClick={handleManageSubscription} disabled={portalLoading} variant="outline">
                          {portalLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Manage Subscription
                        </Button>
                        <Button onClick={() => refreshSubscription()} variant="ghost" size="sm">
                          Refresh Status
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">$29</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Get unlimited access to all training content, live workshops, and community support.
                      </p>
                      <Button 
                        onClick={handleSubscribe} 
                        disabled={checkoutLoading}
                        size="lg"
                        className="w-full"
                      >
                        {checkoutLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Subscribe to Training Program
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {!user && (
              <Card className="max-w-2xl mx-auto mb-8 border-primary/20">
                <CardContent className="pt-6 text-center">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Login Required</h3>
                  <p className="text-muted-foreground mb-4">
                    Please log in to subscribe to the training program
                  </p>
                  <Button onClick={() => navigate('/auth')}>
                    Log In / Sign Up
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">What's Included</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index}>
                  <CardHeader>
                    <feature.icon className="w-10 h-10 mb-2 text-primary" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Separator />

        {/* Training Modules */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">Training Modules</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {trainingModules.map((module, index) => (
                <Card key={index} className={module.locked ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {module.locked && <Lock className="w-4 h-4" />}
                          {module.title}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          <div className="flex gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {module.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {module.lessons} lessons
                            </span>
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {module.locked ? (
                      <p className="text-sm text-muted-foreground">
                        Subscribe to unlock this module
                      </p>
                    ) : (
                      <Button variant="outline" className="w-full">
                        Start Learning
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Training;
