import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Target, 
  BookOpen, 
  Users, 
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

const actions: QuickAction[] = [
  {
    title: 'Continue Business Plan',
    description: 'Pick up where you left off',
    icon: FileText,
    href: '/dashboard/plan',
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Find Funding',
    description: 'Discover matching opportunities',
    icon: Target,
    href: '/dashboard/funding',
    color: 'bg-success/10 text-success',
  },
  {
    title: 'Log Impact',
    description: 'Record community impact metrics',
    icon: TrendingUp,
    href: '/dashboard/analytics',
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Start Training',
    description: 'Continue learning modules',
    icon: BookOpen,
    href: '/dashboard/certifications',
    color: 'bg-warning/10 text-warning',
  },
];

export default function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Link
              key={action.title}
              to={action.href}
              className="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent transition-all"
            >
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center mb-3", action.color)}>
                <action.icon className="h-5 w-5" />
              </div>
              <p className="font-medium text-sm group-hover:text-primary transition-colors">
                {action.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
