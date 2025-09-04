import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  titleTranslation: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  ctaText: string;
  gradient?: 'earth' | 'sky' | 'hero';
  className?: string;
}

const FeatureCard = ({
  title,
  titleTranslation,
  description,
  icon: Icon,
  features,
  ctaText,
  gradient = 'earth',
  className
}: FeatureCardProps) => {
  const gradientClass = {
    earth: 'gradient-earth',
    sky: 'gradient-sky', 
    hero: 'gradient-hero'
  }[gradient];

  return (
    <Card className={cn(
      "group hover:shadow-elevated transition-spring bg-card/80 backdrop-blur-sm border-border/50",
      className
    )}>
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
        <Button 
          variant="outline" 
          className="w-full group/btn hover:bg-muted/50 transition-smooth border-border hover:border-primary/50"
        >
          {ctaText}
          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FeatureCard;