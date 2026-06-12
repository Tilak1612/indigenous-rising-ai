import { Shield, Users, Globe, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';

const TrustBadges = () => {
  const badges = [
    {
      icon: Shield,
      title: 'OCAP® Certified',
      description: 'Full data sovereignty compliance',
      color: 'primary'
    },
    {
      icon: Users,
      title: 'Indigenous Led',
      description: 'By and for Indigenous peoples',
      color: 'secondary'
    },
    {
      icon: Globe,
      title: '6 Languages',
      description: 'Multi-language support',
      color: 'accent'
    },
    {
      icon: Award,
      title: 'NACCA Partner',
      description: 'Trusted by leading organizations',
      color: 'primary'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <Card
            key={badge.title}
            className="p-4 text-center hover:shadow-natural transition-all animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-sm text-foreground mb-1">{badge.title}</h3>
            <p className="text-xs text-muted-foreground">{badge.description}</p>
          </Card>
        );
      })}
    </div>
  );
};

export default TrustBadges;
