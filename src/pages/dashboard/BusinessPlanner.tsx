import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Sparkles, 
  Save, 
  Download, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Circle,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STEPS = [
  { id: 'vision', title: 'Vision & Mission', description: 'Define your business purpose' },
  { id: 'market', title: 'Market Analysis', description: 'Understand your customers' },
  { id: 'products', title: 'Products/Services', description: 'What you offer' },
  { id: 'operations', title: 'Operations Plan', description: 'How you will operate' },
  { id: 'financial', title: 'Financial Projections', description: 'Revenue and costs' },
  { id: 'community', title: 'Community Impact', description: 'Indigenous-specific considerations' },
];

const STORAGE_KEY = 'business-plan-answers';

export default function BusinessPlannerPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const saveAnswers = (newAnswers: Record<string, string>) => {
    setAnswers(newAnswers);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAnswers));
      toast.success('Progress saved');
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleAnswerChange = (stepId: string, value: string) => {
    const newAnswers = { ...answers, [stepId]: value };
    setAnswers(newAnswers);
  };

  const handleSave = () => {
    saveAnswers(answers);
  };

  const completedSteps = STEPS.filter(step => answers[step.id]?.trim().length > 0).length;
  const progress = (completedSteps / STEPS.length) * 100;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Business Planning Assistant</h1>
            <p className="text-muted-foreground">Build your Indigenous business plan step by step</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Progress
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Plan Completion</p>
                <p className="text-2xl font-bold">{Math.round(progress)}%</p>
              </div>
              <Badge variant="secondary">
                {completedSteps}/{STEPS.length} sections complete
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Steps Navigation */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Sections</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {STEPS.map((step, index) => {
                  const isComplete = answers[step.id]?.trim().length > 0;
                  const isCurrent = index === currentStep;
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(index)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                        isCurrent ? "bg-accent border-l-2 border-primary" : "hover:bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center text-xs",
                        isComplete ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        {isComplete ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium truncate", isCurrent && "text-primary")}>
                          {step.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline" className="mb-2">Step {currentStep + 1} of {STEPS.length}</Badge>
                    <CardTitle>{STEPS[currentStep].title}</CardTitle>
                    <CardDescription>{STEPS[currentStep].description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={currentStep === 0}
                      onClick={() => setCurrentStep(prev => prev - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={currentStep === STEPS.length - 1}
                      onClick={() => setCurrentStep(prev => prev + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={`Write about your ${STEPS[currentStep].title.toLowerCase()}...`}
                  className="min-h-[300px]"
                  value={answers[STEPS[currentStep].id] || ''}
                  onChange={(e) => handleAnswerChange(STEPS[currentStep].id, e.target.value)}
                />
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button variant="outline" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Suggestions
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={currentStep === 0}
                      onClick={() => setCurrentStep(prev => prev - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      disabled={currentStep === STEPS.length - 1}
                      onClick={() => setCurrentStep(prev => prev + 1)}
                    >
                      Next Section
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Tips Card */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Lightbulb className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Tips for {STEPS[currentStep].title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentStep === 0 && "Start with your 'why'. What inspired you to start this business? How does it connect to your community and culture?"}
                      {currentStep === 1 && "Consider both local community needs and broader market opportunities. Who are your ideal customers?"}
                      {currentStep === 2 && "List your main offerings. What makes them unique? How do they reflect Indigenous values?"}
                      {currentStep === 3 && "Think about location, equipment, suppliers, and partnerships needed to run your business."}
                      {currentStep === 4 && "Include startup costs, monthly expenses, and revenue projections for the first 1-3 years."}
                      {currentStep === 5 && "How will your business create jobs, preserve culture, or support community wellbeing?"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
