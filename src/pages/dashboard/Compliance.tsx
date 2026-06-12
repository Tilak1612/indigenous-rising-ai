import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  Info,
  ExternalLink,
  FileText,
  Lock,
  Eye,
  Database,
  Download,
  Award,
  ChevronRight,
  Users,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import OCAPRequirementModal from '@/components/dashboard/OCAPRequirementModal';
import ComplianceCertificate from '@/components/dashboard/ComplianceCertificate';

interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  status: 'complete' | 'in_progress' | 'pending';
  category: 'ownership' | 'control' | 'access' | 'possession';
}

const complianceItems: ComplianceItem[] = [
  {
    id: '1',
    title: 'Data Ownership Declaration',
    description: 'Confirmed ownership of all business and community data',
    status: 'complete',
    category: 'ownership',
  },
  {
    id: '2',
    title: 'Community Consent Records',
    description: 'Documented consent from community members for data collection',
    status: 'complete',
    category: 'ownership',
  },
  {
    id: '3',
    title: 'Access Control Policies',
    description: 'Defined who can access different types of data',
    status: 'complete',
    category: 'control',
  },
  {
    id: '4',
    title: 'Data Governance Framework',
    description: 'Established rules for data management and decision-making',
    status: 'in_progress',
    category: 'control',
  },
  {
    id: '5',
    title: 'Community Access Portal',
    description: 'Enable community members to view their own data',
    status: 'in_progress',
    category: 'access',
  },
  {
    id: '6',
    title: 'Data Request Process',
    description: 'Process for handling external data requests',
    status: 'pending',
    category: 'access',
  },
  {
    id: '7',
    title: 'Local Data Storage',
    description: 'Data stored in jurisdiction with Indigenous data sovereignty',
    status: 'complete',
    category: 'possession',
  },
  {
    id: '8',
    title: 'Backup & Recovery Plan',
    description: 'Secure backup systems under community control',
    status: 'in_progress',
    category: 'possession',
  },
];

const categoryInfo = {
  ownership: {
    title: 'Ownership',
    description: 'Your community owns its cultural knowledge and data',
    icon: FileText,
    color: 'bg-primary/10 text-primary',
  },
  control: {
    title: 'Control',
    description: 'Your community controls how data is used and shared',
    icon: Lock,
    color: 'bg-success/10 text-success',
  },
  access: {
    title: 'Access',
    description: 'Your community decides who can access data',
    icon: Eye,
    color: 'bg-primary/10 text-primary',
  },
  possession: {
    title: 'Possession',
    description: 'Your community physically holds and protects data',
    icon: Database,
    color: 'bg-warning/10 text-warning',
  },
};

const statusStyles = {
  complete: { label: 'Complete', color: 'bg-success', icon: CheckCircle2 },
  in_progress: { label: 'In Progress', color: 'bg-warning', icon: AlertCircle },
  pending: { label: 'Pending', color: 'bg-muted', icon: Info },
};

export default function CompliancePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const { toast } = useToast();

  const completeCount = complianceItems.filter(i => i.status === 'complete').length;
  const totalCount = complianceItems.length;
  const complianceScore = Math.round((completeCount / totalCount) * 100);
  const communityBenchmark = 68;

  // Re-assessment opens the first incomplete category in the requirement modal,
  // letting the user walk through outstanding items. When everything is complete
  // we just confirm the standing — there is nothing left to re-assess.
  const handleReassess = () => {
    const firstIncomplete = complianceItems.find(i => i.status !== 'complete');
    if (!firstIncomplete) {
      toast({
        title: 'Re-assessment complete',
        description: 'All OCAP® requirements are already marked complete.',
      });
      return;
    }
    setSelectedCategory(firstIncomplete.category);
    toast({
      title: 'Re-assessment started',
      description: `Reviewing outstanding ${categoryInfo[firstIncomplete.category].title} requirements.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">OCAP® Compliance Dashboard</h1>
            <p className="text-muted-foreground">Ownership, Control, Access, and Possession principles</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCertificate(true)}>
              <Award className="h-4 w-4 mr-2" />
              Export Certificate
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Overall Score Card */}
        <Card className="bg-gradient-to-br from-primary/10 via-background to-success/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">OCAP® Compliance Score</p>
                  <p className="text-4xl font-bold">{complianceScore}%</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {completeCount} of {totalCount} requirements complete
                  </p>
                </div>
              </div>
              <div className="text-right space-y-2">
                <Badge variant="secondary" className="bg-success/10 text-success">
                  Good Standing
                </Badge>
                <p className="text-sm text-muted-foreground">Last reviewed: Today</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground justify-end">
                  <Users className="h-4 w-4" />
                  <span>Community avg: {communityBenchmark}%</span>
                </div>
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleReassess}
                  className="mt-2"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-2" />
                  Re-assess Score
                </Button>
              </div>
            </div>
            <Progress value={complianceScore} className="mt-6 h-3" />
          </CardContent>
        </Card>

        {/* OCAP Principles Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(categoryInfo).map(([key, info]) => {
            const Icon = info.icon;
            const items = complianceItems.filter(i => i.category === key);
            const complete = items.filter(i => i.status === 'complete').length;
            const score = Math.round((complete / items.length) * 100);

            return (
              <Card key={key}>
                <CardContent className="p-5">
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center mb-3", info.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{info.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{info.description}</p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{complete}/{items.length}</span>
                      <span className="font-medium">{score}%</span>
                    </div>
                    <Progress value={score} className="h-1.5" />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-3 gap-1"
                    onClick={() => setSelectedCategory(key)}
                  >
                    View Requirements
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compliance Checklist</CardTitle>
            <CardDescription>Track your progress across all OCAP® requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="ownership">Ownership</TabsTrigger>
                <TabsTrigger value="control">Control</TabsTrigger>
                <TabsTrigger value="access">Access</TabsTrigger>
                <TabsTrigger value="possession">Possession</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <div className="space-y-3">
                  {complianceItems.map(item => {
                    const StatusIcon = statusStyles[item.status].icon;
                    const catInfo = categoryInfo[item.category];
                    const CatIcon = catInfo.icon;

                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <StatusIcon
                          className={cn(
                            "h-5 w-5",
                            item.status === 'complete' && "text-success",
                            item.status === 'in_progress' && "text-warning",
                            item.status === 'pending' && "text-muted-foreground"
                          )}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{item.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {catInfo.title}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <Badge
                          variant={item.status === 'complete' ? 'default' : 'secondary'}
                          className={cn(
                            item.status === 'complete' && "bg-success",
                            item.status === 'in_progress' && "bg-warning"
                          )}
                        >
                          {statusStyles[item.status].label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {Object.keys(categoryInfo).map(cat => (
                <TabsContent key={cat} value={cat} className="mt-4">
                  <div className="space-y-3">
                    {complianceItems.filter(i => i.category === cat).map(item => {
                      const StatusIcon = statusStyles[item.status].icon;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <StatusIcon
                            className={cn(
                              "h-5 w-5",
                              item.status === 'complete' && "text-success",
                              item.status === 'in_progress' && "text-warning",
                              item.status === 'pending' && "text-muted-foreground"
                            )}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <Badge
                            variant={item.status === 'complete' ? 'default' : 'secondary'}
                            className={cn(
                              item.status === 'complete' && "bg-success",
                              item.status === 'in_progress' && "bg-warning"
                            )}
                          >
                            {statusStyles[item.status].label}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">OCAP® Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://fnigc.ca/ocap-training/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <Shield className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h4 className="font-medium">OCAP® Training</h4>
                  <p className="text-sm text-muted-foreground">Free online certification from FNIGC</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
              <a
                href="https://fnigc.ca/what-we-do/ocap-and-information-governance/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h4 className="font-medium">OCAP® Principles</h4>
                  <p className="text-sm text-muted-foreground">Learn about data governance</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OCAP Requirement Modal */}
      <OCAPRequirementModal
        open={!!selectedCategory}
        onOpenChange={(open) => !open && setSelectedCategory(null)}
        category={selectedCategory || ''}
      />

      {/* Compliance Certificate Modal */}
      <ComplianceCertificate
        open={showCertificate}
        onOpenChange={setShowCertificate}
        score={complianceScore}
        completedRequirements={completeCount}
        totalRequirements={totalCount}
      />
    </DashboardLayout>
  );
}
