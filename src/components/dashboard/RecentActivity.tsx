import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  MessageCircle,
  Shield,
  DollarSign,
  BookOpen,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'plan' | 'forum' | 'compliance' | 'funding' | 'learning';
  title: string;
  description: string;
  timestamp: Date;
  link: string;
}

// Real activity tracking is not yet wired up — there is no `user_activity`
// table or write path from the various features. Until that lands, we render
// an honest empty state instead of fake seed rows that contradict the real
// state of the user's data (the previous "Edited Vision & Mission 2 hours ago"
// row was hard-coded and falsely implied saved business-plan content). When
// the activity feed table is added, replace ACTIVITIES with a useQuery call.
const ACTIVITIES: ActivityItem[] = [];

const activityConfig = {
  plan: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  forum: { icon: MessageCircle, color: 'text-success', bg: 'bg-success/10' },
  compliance: { icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  funding: { icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  learning: { icon: BookOpen, color: 'text-pink-500', bg: 'bg-pink-500/10' },
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}

export default function RecentActivity() {
  const activities = ACTIVITIES.slice(0, 5);
  const isEmpty = activities.length === 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </div>
          {!isEmpty && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/activity">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium">No activity yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Save a business plan, request a funding match, or complete an OCAP®
              requirement and your recent actions will show up here.
            </p>
            <Button size="sm" variant="outline" asChild className="mt-4">
              <Link to="/dashboard/plan">Start your business plan</Link>
            </Button>
          </div>
        ) : (
          activities.map(activity => {
            const config = activityConfig[activity.type];
            const Icon = config.icon;

            return (
              <Link
                key={activity.id}
                to={activity.link}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatRelativeTime(activity.timestamp)}
                </span>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
