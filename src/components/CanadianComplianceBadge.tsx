import { Shield, CheckCircle, MapPin, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const CanadianComplianceBadge = () => {
  const compliances = [
    {
      icon: Shield,
      title: 'PIPEDA',
      fullName: 'Personal Information Protection and Electronic Documents Act',
      description: 'Federal privacy law compliance for personal data handling',
      color: 'text-primary'
    },
    {
      icon: CheckCircle,
      title: 'AODA',
      fullName: 'Accessibility for Ontarians with Disabilities Act',
      description: 'WCAG 2.1 Level AA compliant for accessibility',
      color: 'text-secondary'
    },
    {
      icon: Globe,
      title: 'CASL',
      fullName: 'Canadian Anti-Spam Legislation',
      description: 'Compliant electronic messaging and consent management',
      color: 'text-accent'
    },
    {
      icon: MapPin,
      title: 'Data Residency',
      fullName: 'Canadian Data Storage',
      description: 'All data stored within Canadian borders',
      color: 'text-primary'
    }
  ];

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="text-center mb-6">
        <h3 className="font-display text-xl font-bold text-foreground mb-2">
          🍁 Canadian Compliance Certified
        </h3>
        <p className="text-sm text-muted-foreground">
          Meeting the highest standards of Canadian regulatory requirements
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <TooltipProvider>
          {compliances.map((compliance) => {
            const Icon = compliance.icon;
            return (
              <Tooltip key={compliance.title}>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center p-4 rounded-xl bg-background/50 hover:bg-primary/5 transition-all cursor-help border border-border/50 hover:border-primary/30">
                    <Icon className={`w-8 h-8 mb-2 ${compliance.color}`} />
                    <span className="font-bold text-sm text-foreground">{compliance.title}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-background border-border">
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">{compliance.fullName}</p>
                    <p className="text-sm text-muted-foreground">{compliance.description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm space-y-1">
            <p className="font-semibold text-foreground">Indigenous Data Sovereignty (OCAP™)</p>
            <p className="text-muted-foreground">
              We uphold the principles of Ownership, Control, Access, and Possession, 
              ensuring Indigenous communities maintain sovereignty over their data.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CanadianComplianceBadge;
