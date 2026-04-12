import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CulturalWelcome from '@/components/dashboard/CulturalWelcome';
import StatCard from '@/components/dashboard/StatCard';
import JourneyProgress from '@/components/dashboard/JourneyProgress';
import QuickActions from '@/components/dashboard/QuickActions';
import GettingStartedChecklist from '@/components/dashboard/GettingStartedChecklist';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { useSubscription } from '@/hooks/useSubscription';
import { Target, TrendingUp, BookOpen, Users, Crown, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const QUIZ_KEY = 'quiz-choice';

const Dashboard: React.FC = () => {
  const { subscribed, product_id } = useSubscription();
  const quizChoice = (() => { try { return localStorage.getItem(QUIZ_KEY); } catch { return null; } })();

  const getProgressFromQuiz = () => {
    switch (quizChoice) {
      case 'starting': return 15;
      case 'growing': return 45;
      case 'funding': return 30;
      default: return 40;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Cultural Welcome */}
        <CulturalWelcome />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Funding Matches"
            value="3"
            icon={Target}
            trend={{ value: 12, label: 'this month' }}
            color="success"
          />
          <StatCard
            title="Impact Score"
            value="72%"
            icon={TrendingUp}
            trend={{ value: 5, label: 'from last month' }}
            color="primary"
          />
          <StatCard
            title="Active Courses"
            value="2"
            icon={BookOpen}
            color="warning"
          />
          <StatCard
            title="Network Connections"
            value="15"
            icon={Users}
            trend={{ value: 3, label: 'new this week' }}
            color="default"
          />
        </div>

        {/* Getting Started Checklist for new users */}
        <GettingStartedChecklist />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Journey & Actions */}
          <div className="lg:col-span-2 space-y-6">
            <JourneyProgress progress={getProgressFromQuiz()} />
            <QuickActions />
            <RecentActivity />
          </div>

          {/* Right Column - Upgrade */}
          <div className="space-y-6">
            {!subscribed && (
              <Card className="bg-gradient-to-br from-primary/10 via-background to-amber-500/10 border-primary/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-lg">Unlock More Features</CardTitle>
                  </div>
                  <CardDescription>
                    Upgrade to Ogichidaakwe for AI-powered funding, analytics, and more
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">AI</Badge>
                      Smart Funding Navigator
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Pro</Badge>
                      Advanced Impact Analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">New</Badge>
                      Partner Network Access
                    </li>
                  </ul>
                  <Button asChild className="w-full">
                    <Link to="/pricing">
                      Upgrade for $49/mo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
