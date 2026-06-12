import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { getString } from '@/lib/i18n';
import { Sparkles, Quote } from 'lucide-react';

const LANG_KEY = 'preferred-language';

// Practical platform tips in our own voice. We do NOT attribute generic
// "proverbs" to Elders or to specific peoples — that would be fabricated and
// pan-Indigenous. These are honest, useful prompts for getting value here.
const tips = [
  "Your data belongs to your community. You can export everything, anytime.",
  "Start with a funding match, then build the plan to go after it.",
  "Keep grant deadlines in Tasks & Deadlines so nothing slips.",
  "Save the documents funders ask for in your Document Library.",
];

export default function CulturalWelcome() {
  const { user } = useAuth();
  const preferredLang = (() => {
    try { return localStorage.getItem(LANG_KEY) || 'en'; }
    catch { return 'en'; }
  })();

  // Rotate by the day so it's stable within a session (no hydration flicker).
  const tip = tips[new Date().getDate() % tips.length];
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Friend';

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-accent border-primary/20">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{getString(preferredLang, 'territory_ack')}</p>
            <h1 className="text-2xl font-bold">
              {getTimeGreeting()}, <span className="text-primary">{firstName}</span>
            </h1>
            <p className="text-muted-foreground">{getString(preferredLang, 'greeting')}</p>
          </div>
          
          <div className="lg:max-w-md">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border border-primary/10">
              <Quote className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-foreground/80">{tip}</p>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Tip
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
