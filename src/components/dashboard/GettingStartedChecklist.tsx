import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  User, 
  FileText, 
  Users, 
  Shield,
  ChevronRight,
  X,
  Rocket
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  link: string;
  icon: React.ElementType;
  checkKey: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Add your business details and territory',
    link: '/dashboard/settings',
    icon: User,
    checkKey: 'checklist-profile',
  },
  {
    id: 'plan',
    title: 'Start Your Business Plan',
    description: 'Begin documenting your vision',
    link: '/dashboard/plan',
    icon: FileText,
    checkKey: 'checklist-plan',
  },
  {
    id: 'forum',
    title: 'Join the Community',
    description: 'Introduce yourself in the forum',
    link: '/dashboard/forum',
    icon: Users,
    checkKey: 'checklist-forum',
  },
  {
    id: 'compliance',
    title: 'Review data & privacy',
    description: 'See how your data is handled under OCAP®',
    link: '/dashboard/compliance',
    icon: Shield,
    checkKey: 'checklist-compliance',
  },
];

const STORAGE_KEY = 'getting-started-dismissed';
const COMPLETED_KEY = 'getting-started-completed';

export default function GettingStartedChecklist() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(COMPLETED_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const completedCount = Object.values(completed).filter(Boolean).length;
  const progress = (completedCount / CHECKLIST_ITEMS.length) * 100;
  const allComplete = completedCount === CHECKLIST_ITEMS.length;

  const toggleComplete = (id: string) => {
    const newCompleted = { ...completed, [id]: !completed[id] };
    setCompleted(newCompleted);
    try {
      localStorage.setItem(COMPLETED_KEY, JSON.stringify(newCompleted));
    } catch (e) {
      console.error('Failed to save checklist progress');
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {
      console.error('Failed to dismiss checklist');
    }
  };

  if (dismissed) return null;

  return (
    <Card className={cn(
      "relative overflow-hidden",
      allComplete && "bg-gradient-to-br from-primary/10 via-background to-success/10 border-primary/30"
    )}>
      <button 
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss checklist"
      >
        <X className="h-4 w-4" />
      </button>

      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Getting Started</CardTitle>
          {allComplete && (
            <Badge variant="default" className="bg-success">Complete!</Badge>
          )}
        </div>
        <CardDescription>
          Complete these steps to get the most out of Indigenous Rising AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{completedCount}/{CHECKLIST_ITEMS.length} complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Checklist Items */}
        <div className="space-y-2">
          {CHECKLIST_ITEMS.map(item => {
            const isComplete = completed[item.id];
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all",
                  isComplete 
                    ? "bg-muted/30 border-muted" 
                    : "bg-background hover:bg-muted/50 border-border"
                )}
              >
                <button
                  onClick={() => toggleComplete(item.id)}
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center transition-colors",
                    isComplete 
                      ? "bg-primary text-primary-foreground" 
                      : "border-2 border-muted-foreground/30 hover:border-primary"
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Circle className="h-3 w-3 text-transparent" />
                  )}
                </button>

                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center",
                  isComplete ? "bg-muted" : "bg-primary/10"
                )}>
                  <Icon className={cn("h-4 w-4", isComplete ? "text-muted-foreground" : "text-primary")} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", isComplete && "line-through text-muted-foreground")}>
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </p>
                </div>

                {!isComplete && (
                  <Link 
                    to={item.link}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
