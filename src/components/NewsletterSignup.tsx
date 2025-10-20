import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubscribed(true);
      toast({
        title: 'Miigwech! Thank you!',
        description: 'You\'ve been subscribed to funding alerts and updates.',
      });
      setEmail('');
    }, 1000);
  };

  if (isSubscribed) {
    return (
      <Card className="p-6 bg-primary/5 border-primary/20 flex items-center justify-center gap-3">
        <CheckCircle className="w-6 h-6 text-primary" />
        <p className="font-semibold text-foreground">
          Successfully subscribed! Check your email.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Stay Connected
            </h3>
            <p className="text-sm text-muted-foreground">
              Get funding alerts & community updates
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pr-4 bg-background"
              disabled={isLoading}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full gradient-earth text-white font-bold"
            disabled={isLoading}
          >
            {isLoading ? 'Subscribing...' : 'Subscribe to Updates'}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </form>
      </div>
    </Card>
  );
};

export default NewsletterSignup;
