import { Card } from '@/components/ui/card';
import { Building, Users, Award, TrendingUp } from 'lucide-react';

const SocialProof = () => {
  const organizations = [
    { name: 'NACCA', fullName: 'National Aboriginal Capital Corporations Association' },
    { name: 'CCIB', fullName: 'Canadian Council for Indigenous Business' },
    { name: 'AFN', fullName: 'Assembly of First Nations' },
    { name: 'INAC', fullName: 'Indigenous Services Canada' },
    { name: 'NIEDB', fullName: 'National Indigenous Economic Development Board' },
    { name: 'CANDO', fullName: 'Council for the Advancement of Native Development Officers' },
  ];

  const stats = [
    {
      icon: Users,
      value: '2,500+',
      label: 'Active Users',
      color: 'text-primary'
    },
    {
      icon: Building,
      value: '850+',
      label: 'Businesses Launched',
      color: 'text-secondary'
    },
    {
      icon: Award,
      value: '95%',
      label: 'Success Rate',
      color: 'text-accent'
    },
    {
      icon: TrendingUp,
      value: '$12M+',
      label: 'Funding Connected',
      color: 'text-primary'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Trust Indicators */}
      <Card className="p-6 bg-card/50 backdrop-blur-sm">
        <h3 className="font-semibold text-center text-foreground mb-4">
          Trusted By Leading Indigenous Organizations
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {organizations.map((org) => (
            <div 
              key={org.name}
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-background/50 hover:bg-primary/5 transition-all cursor-default group"
              title={org.fullName}
            >
              <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                {org.name}
              </span>
              <span className="text-xs text-muted-foreground text-center mt-1 line-clamp-2">
                {org.fullName}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index}
              className="p-4 text-center hover:shadow-natural transition-all"
            >
              <Icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
              <div className="font-display text-2xl font-black text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">
                {stat.label}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SocialProof;
