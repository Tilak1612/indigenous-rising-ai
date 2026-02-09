import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Calendar } from 'lucide-react';

import { fundingOpportunities } from '@/lib/funding-data';

const FundingSection = () => {
  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const navigate = useNavigate();
  const { user } = useAuth();

  const featuredOpportunities = fundingOpportunities
    .filter((opportunity) => getDaysUntilDeadline(opportunity.deadline) >= 0)
    .slice(0, 1);
  const displayedOpportunities = featuredOpportunities.length
    ? featuredOpportunities
    : fundingOpportunities.slice(0, 1);

  return (
    <section id="funding" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="font-display text-4xl md:text-5xl font-black text-foreground mb-4">
              Funding
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              500+ funding opportunities, updated weekly. Create a free account to see what you are eligible for.
            </p>
          </div>
          {/* Featured Opportunity */}
          {displayedOpportunities.map((opportunity) => {
            const daysLeft = getDaysUntilDeadline(opportunity.deadline);
            const isExpired = daysLeft < 0;
            const isUrgent = !isExpired && daysLeft <= 14;

            return (
              <Card key={opportunity.id} className="p-6 bg-card/50 backdrop-blur-sm shadow-natural">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-xl font-bold text-foreground mb-2">
                        {opportunity.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {opportunity.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isExpired ? (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border">Updated Weekly</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">Active</Badge>
                      )}
                      {isUrgent && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100">Closing Soon</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {opportunity.amount}
                    </Badge>
                    <Badge variant="outline">
                      <MapPin className="w-3 h-3 mr-1" />
                      {opportunity.province}
                    </Badge>
                  </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      {isExpired ? (
                        <span className="text-muted-foreground">New opportunities added weekly</span>
                      ) : (
                        <span className={isUrgent ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                          {daysLeft} days left
                        </span>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="hover:bg-primary hover:text-primary-foreground"
                      onClick={() => {
                        if (user) {
                          navigate(`/funding/${opportunity.id}`);
                        } else {
                          navigate(`/auth?next=/funding/${opportunity.id}`);
                        }
                      }}
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}

          {/* CTA */}
          <div className="text-center mt-12">
            <Button
              size="lg"
              className="gradient-earth text-white font-bold shadow-elevated"
              onClick={() => {
                navigate('/funding');
              }}
            >
              Explore Funding
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Create a free account to unlock personalized matches.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FundingSection;
