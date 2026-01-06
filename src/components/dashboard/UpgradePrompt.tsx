import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UpgradePromptProps {
  feature: string;
  description: string;
  tier: 'paid' | 'enterprise';
  benefits?: string[];
}

export default function UpgradePrompt({ feature, description, tier, benefits = [] }: UpgradePromptProps) {
  const tierName = tier === 'enterprise' ? 'Gimishoomis' : 'Ogichidaakwe';
  const tierPrice = tier === 'enterprise' ? 'Custom Pricing' : '$49/month';

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-lg w-full mx-auto text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{feature}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Crown className="h-5 w-5 text-amber-500" />
              <span className="font-semibold">{tierName} Plan</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-primary font-medium">{tierPrice}</span>
            </div>
            
            {benefits.length > 0 && (
              <ul className="space-y-2 text-sm text-left">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Button asChild size="lg" className="w-full">
              <Link to="/pricing">
                Upgrade to {tierName}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
