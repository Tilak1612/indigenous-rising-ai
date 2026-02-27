import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, DollarSign } from 'lucide-react';
import { getOpportunityById } from '@/lib/funding-data';
import { useAuth } from '@/hooks/useAuth';

const getDaysUntilDeadline = (deadline: string) => {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const FundingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const opportunity = id ? getOpportunityById(id) : null;
  // Track funding opportunity view
  if (opportunity) {
    import('@/utils/analytics').then(({ trackEvent }) => {
      trackEvent('funding_opportunity_viewed', { opportunity_name: opportunity.name });
    });
  }

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Funding opportunity not found</h2>
          <p className="text-muted-foreground mt-2">Please return to the funding list.</p>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Funding opportunity not found</h2>
          <p className="text-muted-foreground mt-2">It may have been removed or expired.</p>
        </div>
      </div>
    );
  }

  const daysLeft = getDaysUntilDeadline(opportunity.deadline);
  const isExpired = daysLeft < 0;

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-3xl font-black">{opportunity.name}</h1>
                <p className="text-sm text-primary/80 italic">{opportunity.industry} — {opportunity.province}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <DollarSign className="w-3 h-3 mr-1" />
                  {opportunity.amount}
                </Badge>
                <Badge variant="outline">
                  <MapPin className="w-3 h-3 mr-1" />
                  {opportunity.province}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  {!isExpired ? `${daysLeft} days left` : 'Application closed'}
                </div>
              </div>

              <div className="text-muted-foreground leading-relaxed">
                {opportunity.description}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    if (isExpired) return;
                    if (user) {
                      navigate('/dashboard/funding');
                    } else {
                      navigate(`/auth?next=/funding/${opportunity.id}`);
                    }
                  }}
                  disabled={isExpired}
                >
                  {isExpired ? 'Closed' : user ? 'Start Application' : 'Sign in to Apply'}
                </Button>

                <Button variant="ghost" onClick={() => navigate(-1)}>
                  Back
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FundingDetail;
