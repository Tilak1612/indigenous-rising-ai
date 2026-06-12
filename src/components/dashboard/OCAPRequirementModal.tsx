import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Lock, 
  Eye, 
  Database,
  CheckCircle2,
  Circle,
  ExternalLink,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Requirement {
  id: string;
  title: string;
  description: string;
  status: 'complete' | 'in_progress' | 'pending';
  steps: string[];
  resources?: { title: string; url: string }[];
}

interface OCAPCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  requirements: Requirement[];
  benchmark: number; // Community benchmark percentage
}

const OCAP_DATA: Record<string, OCAPCategory> = {
  ownership: {
    id: 'ownership',
    title: 'Ownership',
    description: 'Your community owns its cultural knowledge and data. This principle establishes that a community or group owns information collectively.',
    icon: FileText,
    color: 'bg-primary/10 text-primary',
    benchmark: 85,
    requirements: [
      {
        id: 'o1',
        title: 'Data Ownership Declaration',
        description: 'Confirm ownership of all business and community data',
        status: 'complete',
        steps: [
          'Review all data collected by your business',
          'Create a data inventory document',
          'Sign the data ownership declaration form',
          'Store declaration securely with your records'
        ],
        resources: [
          { title: 'Data Ownership Template', url: '#' },
          { title: 'FNIGC Ownership Guide', url: 'https://fnigc.ca' }
        ]
      },
      {
        id: 'o2',
        title: 'Community Consent Records',
        description: 'Document consent from community members for data collection',
        status: 'complete',
        steps: [
          'Create consent forms in accessible formats',
          'Explain data use in plain language',
          'Obtain written or recorded consent',
          'Maintain secure consent records'
        ]
      }
    ]
  },
  control: {
    id: 'control',
    title: 'Control',
    description: 'Your community controls how data is collected, used, and shared. This includes control over all aspects of data management.',
    icon: Lock,
    color: 'bg-success/10 text-success',
    benchmark: 72,
    requirements: [
      {
        id: 'c1',
        title: 'Access Control Policies',
        description: 'Define who can access different types of data',
        status: 'complete',
        steps: [
          'Identify all data categories',
          'Define access levels (public, restricted, confidential)',
          'Create access control documentation',
          'Implement technical access controls'
        ]
      },
      {
        id: 'c2',
        title: 'Data Governance Framework',
        description: 'Establish rules for data management and decision-making',
        status: 'in_progress',
        steps: [
          'Form a data governance committee',
          'Draft data governance policies',
          'Define roles and responsibilities',
          'Create decision-making protocols',
          'Schedule regular governance reviews'
        ],
        resources: [
          { title: 'Governance Framework Template', url: '#' }
        ]
      }
    ]
  },
  access: {
    id: 'access',
    title: 'Access',
    description: 'Your community decides who can access data and under what conditions. This ensures the community controls external access.',
    icon: Eye,
    color: 'bg-primary/10 text-primary',
    benchmark: 58,
    requirements: [
      {
        id: 'a1',
        title: 'Community Access Portal',
        description: 'Enable community members to view their own data',
        status: 'in_progress',
        steps: [
          'Identify data community members should access',
          'Create secure login system',
          'Build user-friendly data viewing interface',
          'Test with community members',
          'Launch and communicate access procedures'
        ]
      },
      {
        id: 'a2',
        title: 'Data Request Process',
        description: 'Process for handling external data requests',
        status: 'pending',
        steps: [
          'Create data request form',
          'Define review criteria',
          'Establish approval workflow',
          'Document all requests and decisions',
          'Create appeals process'
        ],
        resources: [
          { title: 'Data Request Form Template', url: '#' },
          { title: 'Review Criteria Guide', url: '#' }
        ]
      }
    ]
  },
  possession: {
    id: 'possession',
    title: 'Possession',
    description: 'Your community physically holds and protects data. This ensures data remains within community control.',
    icon: Database,
    color: 'bg-warning/10 text-warning',
    benchmark: 65,
    requirements: [
      {
        id: 'p1',
        title: 'Local Data Storage',
        description: 'Data stored in jurisdiction with Indigenous data sovereignty',
        status: 'complete',
        steps: [
          'Audit current data storage locations',
          'Ensure servers are in appropriate jurisdiction',
          'Document storage locations',
          'Verify compliance with sovereignty requirements'
        ]
      },
      {
        id: 'p2',
        title: 'Backup & Recovery Plan',
        description: 'Secure backup systems under community control',
        status: 'in_progress',
        steps: [
          'Identify critical data for backup',
          'Choose secure backup solution',
          'Create backup schedule',
          'Test recovery procedures',
          'Document backup locations and access'
        ],
        resources: [
          { title: 'Backup Best Practices', url: '#' }
        ]
      }
    ]
  }
};

interface OCAPRequirementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: string;
  onToggleStep?: (requirementId: string, stepIndex: number) => void;
  completedSteps?: Record<string, boolean[]>;
}

export default function OCAPRequirementModal({
  open,
  onOpenChange,
  category,
  onToggleStep,
  completedSteps = {}
}: OCAPRequirementModalProps) {
  const data = OCAP_DATA[category];
  
  if (!data) return null;

  const Icon = data.icon;
  const completeCount = data.requirements.filter(r => r.status === 'complete').length;
  const score = Math.round((completeCount / data.requirements.length) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", data.color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">{data.title}</DialogTitle>
              <DialogDescription className="text-left">
                {data.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Progress & Benchmark */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Your Progress</p>
              <p className="text-2xl font-bold">{score}%</p>
              <Progress value={score} className="h-2 mt-2" />
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground">Community Benchmark</p>
              <p className="text-2xl font-bold text-primary">{data.benchmark}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                Similar businesses average
              </p>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="font-semibold">Requirements Checklist</h3>
            
            {data.requirements.map(req => (
              <div 
                key={req.id} 
                className="p-4 rounded-lg border space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    req.status === 'complete' ? "bg-success text-white" :
                    req.status === 'in_progress' ? "bg-warning text-white" :
                    "bg-muted"
                  )}>
                    {req.status === 'complete' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{req.title}</h4>
                      <Badge 
                        variant={req.status === 'complete' ? 'default' : 'secondary'}
                        className={cn(
                          req.status === 'complete' && "bg-success",
                          req.status === 'in_progress' && "bg-warning"
                        )}
                      >
                        {req.status === 'complete' ? 'Complete' : 
                         req.status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{req.description}</p>
                  </div>
                </div>

                {/* Steps Checklist */}
                <div className="ml-9 space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    Steps to Complete
                  </p>
                  <div className="space-y-2">
                    {req.steps.map((step, idx) => {
                      const stepCompleted = completedSteps[req.id]?.[idx] || req.status === 'complete';
                      
                      return (
                        <div key={idx} className="flex items-start gap-2">
                          <Checkbox 
                            checked={stepCompleted}
                            onCheckedChange={() => onToggleStep?.(req.id, idx)}
                            disabled={req.status === 'complete'}
                          />
                          <span className={cn(
                            "text-sm",
                            stepCompleted && "text-muted-foreground line-through"
                          )}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Resources */}
                {req.resources && req.resources.length > 0 && (
                  <div className="ml-9 pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Helpful Resources:</p>
                    <div className="flex flex-wrap gap-2">
                      {req.resources.map((resource, idx) => (
                        <a
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          {resource.title}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
