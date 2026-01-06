import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stage {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  current?: boolean;
}

const stages: Stage[] = [
  { id: 'ideation', name: 'Ideation', description: 'Define your business idea', completed: true },
  { id: 'planning', name: 'Planning', description: 'Create your business plan', completed: true },
  { id: 'funding', name: 'Funding', description: 'Secure initial funding', completed: false, current: true },
  { id: 'launch', name: 'Launch', description: 'Start your operations', completed: false },
  { id: 'growth', name: 'Growth', description: 'Scale your business', completed: false },
];

interface JourneyProgressProps {
  progress?: number;
  currentStage?: string;
}

export default function JourneyProgress({ progress = 40, currentStage = 'funding' }: JourneyProgressProps) {
  const completedStages = stages.filter(s => s.completed).length;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Your Business Journey</CardTitle>
            <CardDescription>Track your progress through each stage</CardDescription>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Sparkles className="h-3 w-3 mr-1" />
            {completedStages}/{stages.length} Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Stage Timeline */}
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div
                key={stage.id}
                className={cn(
                  "relative pl-10 py-2",
                  stage.current && "bg-accent rounded-lg -ml-2 pl-12 pr-4"
                )}
              >
                <div className={cn(
                  "absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center z-10",
                  stage.completed 
                    ? "bg-primary text-primary-foreground" 
                    : stage.current 
                    ? "bg-primary/20 ring-2 ring-primary" 
                    : "bg-muted"
                )}>
                  {stage.completed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn(
                      "font-medium",
                      stage.current ? "text-primary" : stage.completed ? "" : "text-muted-foreground"
                    )}>
                      {stage.name}
                      {stage.current && (
                        <Badge className="ml-2" variant="default">Current</Badge>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{stage.description}</p>
                  </div>
                  {stage.current && (
                    <Button size="sm" variant="ghost">
                      Continue <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
