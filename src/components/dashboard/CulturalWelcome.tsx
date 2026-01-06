import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { getString } from '@/lib/i18n';
import { Sparkles, Quote } from 'lucide-react';

const LANG_KEY = 'preferred-language';

const elderQuotes = [
  {
    quote: "We are all visitors to this time, this place. We are just passing through. Our purpose here is to observe, to learn, to grow, to love... and then we return home.",
    elder: "Australian Aboriginal Proverb",
  },
  {
    quote: "The greatest strength is gentleness.",
    elder: "Iroquois Proverb",
  },
  {
    quote: "When we show our respect for other living things, they respond with respect for us.",
    elder: "Arapaho Proverb",
  },
];

export default function CulturalWelcome() {
  const { user } = useAuth();
  const preferredLang = (() => {
    try { return localStorage.getItem(LANG_KEY) || 'en'; }
    catch { return 'en'; }
  })();

  const randomQuote = elderQuotes[Math.floor(Math.random() * elderQuotes.length)];
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
                <p className="text-sm italic text-foreground/80">"{randomQuote.quote}"</p>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Elder Wisdom — {randomQuote.elder}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
