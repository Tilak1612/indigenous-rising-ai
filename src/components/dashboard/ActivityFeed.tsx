import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Target, 
  BookOpen, 
  CheckCircle,
  TrendingUp,
  MessageSquare,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'plan' | 'funding' | 'learning' | 'impact' | 'community' | 'network';
  title: string;
  description: string;
  timestamp: Date;
  status?: 'completed' | 'in_progress' | 'pending';
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'funding',
    title: 'New Funding Match',
    description: 'Indigenous Business Development Program - 85% match score',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    status: 'pending',
  },
  {
    id: '2',
    type: 'learning',
    title: 'Course Progress',
    description: 'Completed Module 2 of Business Fundamentals',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: 'completed',
  },
  {
    id: '3',
    type: 'plan',
    title: 'Business Plan Updated',
    description: 'Added financial projections section',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    status: 'in_progress',
  },
  {
    id: '4',
    type: 'impact',
    title: 'Impact Logged',
    description: 'Added 3 new community jobs to tracker',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    status: 'completed',
  },
  {
    id: '5',
    type: 'community',
    title: 'Elder Wisdom Session',
    description: 'Upcoming session on Traditional Business Practices',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
    status: 'pending',
  },
];

const iconMap = {
  plan: FileText,
  funding: Target,
  learning: BookOpen,
  impact: TrendingUp,
  community: MessageSquare,
  network: Users,
};

const colorMap = {
  plan: 'bg-blue-500/10 text-blue-600',
  funding: 'bg-success/10 text-success',
  learning: 'bg-purple-500/10 text-purple-600',
  impact: 'bg-amber-500/10 text-amber-600',
  community: 'bg-pink-500/10 text-pink-600',
  network: 'bg-cyan-500/10 text-cyan-600',
};

const statusBadge = {
  completed: { label: 'Completed', variant: 'default' as const },
  in_progress: { label: 'In Progress', variant: 'secondary' as const },
  pending: { label: 'Pending', variant: 'outline' as const },
};

export default function ActivityFeed() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = iconMap[activity.type];
            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
              >
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", colorMap[activity.type])}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{activity.title}</p>
                    {activity.status && (
                      <Badge variant={statusBadge[activity.status].variant} className="text-xs">
                        {statusBadge[activity.status].label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
