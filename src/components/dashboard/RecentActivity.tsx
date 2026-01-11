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
  Clock
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

// Sample recent activities - in real app, would fetch from API
const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    type: 'plan',
    title: 'Edited Vision & Mission',
    description: 'Updated business plan section',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    link: '/dashboard/plan',
  },
  {
    id: '2',
    type: 'forum',
    title: 'Replied to discussion',
    description: 'Tips for First-Time Grant Applications',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    link: '/dashboard/forum',
  },
  {
    id: '3',
    type: 'compliance',
    title: 'Compliance check completed',
    description: 'OCAP™ score: 50%',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    link: '/dashboard/compliance',
  },
  {
    id: '4',
    type: 'funding',
    title: 'New funding match',
    description: 'Indigenous Business Development Program - 85% match',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    link: '/dashboard/funding',
  },
  {
    id: '5',
    type: 'learning',
    title: 'Completed module',
    description: 'Business Fundamentals - Module 2',
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
    link: '/dashboard/resources',
  },
];

const activityConfig = {
  plan: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  forum: { icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
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
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/activity">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {RECENT_ACTIVITIES.slice(0, 5).map(activity => {
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
        })}
      </CardContent>
    </Card>
  );
}
