import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShinyButton } from '@/components/ui/shiny-button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import UpgradeModal from '@/components/UpgradeModal';

interface FeatureCardProps {
  title: string;
  titleTranslation?: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  ctaText?: string;
  gradient?: 'earth' | 'sky' | 'hero';
  className?: string;
  to?: string;
  onClick?: () => void;
  premium?: boolean;
}

const FeatureCard = ({
  title,
  titleTranslation,
  description,
  icon: Icon,
  features,
  ctaText = 'Learn more',
  gradient = 'earth',
  className,
  to,
  onClick,
  premium = false,
}: FeatureCardProps) => {
  const gradientClass = {
    earth: 'gradient-earth',
    sky: 'gradient-sky', 
    hero: 'gradient-hero'
  }[gradient];

  const { user } = useAuth();
  const { subscribed } = useSubscription();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (to) {
      navigate(to);
      return;
    }
  };

  return (
    <Card className={cn(
      "group hover:shadow-elevated transition-spring bg-card/80 backdrop-blur-sm border-border/50",
      className
    )}>
      {premium && (
        <div className="absolute top-3 right-3 z-10">
          <div className="px-2 py-1 rounded-md bg-amber-600 text-white text-xs font-semibold">Premium</div>
        </div>
      )}
      <CardHeader className="space-y-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shadow-natural group-hover:shadow-glow transition-spring",
          gradientClass
        )}>
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
        
        <div className="space-y-2">
          <CardTitle className="font-display text-xl text-foreground group-hover:text-primary transition-smooth">
            {title}
          </CardTitle>
          <p className="text-sm text-primary/70 font-medium italic">
            {titleTranslation}
          </p>
          <CardDescription className="text-muted-foreground leading-relaxed">
            {description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <h4 className="font-semibold text-sm text-foreground/80 mb-3">Key Features:</h4>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span className="leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        {premium ? (
          (!user || !subscribed) ? (
            <UpgradeModal triggerText={ctaText} triggerSize="sm" details={`${title} is available for Ogichidaakwe subscribers.`} />
          ) : (
            <ShinyButton size="sm" className="w-full group/btn" onClick={handleCTA}>
              {ctaText}
              <ArrowRight className="w-4 h-4 ml-2 inline-block group-hover/btn:translate-x-1 transition-transform" />
            </ShinyButton>
          )
        ) : to ? (
          <ShinyButton asChild size="sm" className="w-full group/btn">
            <Link to={to} className="flex items-center justify-center">
              {ctaText}
              <ArrowRight className="w-4 h-4 ml-2 inline-block group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </ShinyButton>
        ) : (
          <ShinyButton size="sm" className="w-full group/btn" onClick={handleCTA}>
            {ctaText}
            <ArrowRight className="w-4 h-4 ml-2 inline-block group-hover/btn:translate-x-1 transition-transform" />
          </ShinyButton>
        )}
      </CardFooter>
    </Card>
  );
};

export default FeatureCard;