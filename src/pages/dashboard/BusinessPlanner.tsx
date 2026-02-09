import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Sparkles, 
  Save, 
  Download, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Lightbulb,
  FileDown,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AutoSaveIndicator } from '@/components/dashboard/AutoSaveIndicator';
import { RichTextToolbar } from '@/components/dashboard/RichTextToolbar';
import { VersionHistory } from '@/components/dashboard/VersionHistory';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STEPS = [
  { id: 'vision', title: 'Vision & Mission', description: 'Define your business purpose' },
  { id: 'market', title: 'Market Analysis', description: 'Understand your customers' },
  { id: 'products', title: 'Products/Services', description: 'What you offer' },
  { id: 'operations', title: 'Operations Plan', description: 'How you will operate' },
  { id: 'financial', title: 'Financial Projections', description: 'Revenue and costs' },
  { id: 'community', title: 'Community Impact', description: 'Indigenous-specific considerations' },
];

const STORAGE_KEY = 'business-plan-answers';
const VERSIONS_KEY = 'business-plan-versions';
const AUTO_SAVE_DELAY = 2000;

interface Version {
  id: string;
  timestamp: Date;
  summary: string;
  data: Record<string, string>;
}

// Mock active collaborators
const activeCollaborators = [
  { name: 'Sarah C.', color: 'bg-blue-500' },
];

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
  const [versions, setVersions] = useState<Version[]>(() => {
    try {
      const saved = localStorage.getItem(VERSIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((v: any) => ({ ...v, timestamp: new Date(v.timestamp) }));
      }
      return [];
    } catch {
      return [];
    }
  });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save logic
  const saveAnswers = useCallback(async (newAnswers: Record<string, string>, createVersion = false) => {
    setIsSaving(true);
    setHasError(false);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAnswers));
      
      if (createVersion) {
        const completedSections = STEPS.filter(step => newAnswers[step.id]?.trim().length > 0);
        const newVersion: Version = {
          id: Date.now().toString(),
          timestamp: new Date(),
          summary: `${completedSections.length} sections completed`,
          data: { ...newAnswers },
        };
        const updatedVersions = [newVersion, ...versions].slice(0, 10);
        setVersions(updatedVersions);
        localStorage.setItem(VERSIONS_KEY, JSON.stringify(updatedVersions));
      }
      
      setLastSaved(new Date());
    } catch {
      setHasError(true);
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  }, [versions]);

  // Auto-save on content change
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (Object.keys(answers).length > 0) {
        saveAnswers(answers, false);
      }
    }, AUTO_SAVE_DELAY);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [answers, saveAnswers]);

  const handleAnswerChange = (stepId: string, value: string) => {
    const newAnswers = { ...answers, [stepId]: value };
    setAnswers(newAnswers);
  };

  const handleManualSave = () => {
    saveAnswers(answers, true);
    toast.success('Progress saved with version');
  };

  const handleFormat = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      handleAnswerChange(STEPS[currentStep].id, editorRef.current.innerHTML);
    }
  };

  const handleRestoreVersion = (version: Version) => {
    setAnswers(version.data);
    toast.success('Version restored');
  };

  const handlePreviewVersion = (version: Version) => {
    toast.info('Preview feature coming soon');
  };

  const handleExport = (format: 'pdf' | 'word' | 'grant') => {
    toast.success(`Exporting as ${format.toUpperCase()}...`);
    // Implement actual export logic here
  };

  const completedSteps = STEPS.filter(step => answers[step.id]?.trim().length > 0).length;
  const progress = (completedSteps / STEPS.length) * 100;
  const currentAnswer = answers[STEPS[currentStep].id] || '';

  // Update editor content when step changes
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== currentAnswer) {
      editor.innerHTML = currentAnswer;
    }
  }, [currentStep, currentAnswer]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Business Planning Assistant</h1>
            <p className="text-muted-foreground">Build your Indigenous business plan step by step</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Active Collaborators */}
            {activeCollaborators.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="flex -space-x-2">
                  {activeCollaborators.map((collab, idx) => (
                    <div 
                      key={idx}
                      className={cn("h-6 w-6 rounded-full flex items-center justify-center text-xs text-white", collab.color)}
                      title={`${collab.name} is viewing`}
                    >
                      {collab.name[0]}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">viewing</span>
              </div>
            )}
            
            <AutoSaveIndicator 
              lastSaved={lastSaved} 
              isSaving={isSaving} 
              hasError={hasError}
            />
            
            <VersionHistory 
              versions={versions}
              onRestore={handleRestoreVersion}
              onPreview={handlePreviewVersion}
            />
            
            <Button variant="outline" onClick={handleManualSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('word')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as Word
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('grant')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Grant Application Format
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                {/* Rich Text Toolbar */}
                <RichTextToolbar onFormat={handleFormat} />
                
                {/* Rich Text Editor */}
                <div
                  ref={editorRef}
                  contentEditable
                  className="min-h-[300px] p-4 border rounded-b-lg focus:outline-none focus:ring-2 focus:ring-ring prose prose-sm max-w-none dark:prose-invert"
                  onInput={handleEditorInput}
                  data-placeholder={`Write about your ${STEPS[currentStep].title.toLowerCase()}...`}
                  suppressContentEditableWarning
                />

                {/* AI Inline Suggestions */}
                <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-sm text-muted-foreground flex-1">
                    Need help? Click AI Suggestions for personalized content ideas for this section.
                  </p>
                  <Button size="sm" variant="outline" className="shrink-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Suggestions
                  </Button>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {answers[STEPS[currentStep].id]?.length || 0} characters
                  </div>
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
