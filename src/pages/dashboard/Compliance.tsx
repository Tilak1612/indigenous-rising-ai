import React from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    color: 'bg-blue-500/10 text-blue-600',
  },
  control: {
    title: 'Control',
    description: 'Your community controls how data is used and shared',
    icon: Lock,
    color: 'bg-green-500/10 text-green-600',
  },
  access: {
    title: 'Access',
    description: 'Your community decides who can access data',
    icon: Eye,
    color: 'bg-purple-500/10 text-purple-600',
  },
  possession: {
    title: 'Possession',
    description: 'Your community physically holds and protects data',
    icon: Database,
    color: 'bg-amber-500/10 text-amber-600',
  },
};

const statusStyles = {
  complete: { label: 'Complete', color: 'bg-green-500', icon: CheckCircle2 },
  in_progress: { label: 'In Progress', color: 'bg-amber-500', icon: AlertCircle },
  pending: { label: 'Pending', color: 'bg-muted', icon: Info },
};

export default function CompliancePage() {
  const completeCount = complianceItems.filter(i => i.status === 'complete').length;
  const totalCount = complianceItems.length;
  const complianceScore = Math.round((completeCount / totalCount) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">OCAP™ Compliance Dashboard</h1>
            <p className="text-muted-foreground">Ownership, Control, Access, and Possession principles</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Overall Score Card */}
        <Card className="bg-gradient-to-br from-primary/10 via-background to-green-500/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">OCAP™ Compliance Score</p>
                  <p className="text-4xl font-bold">{complianceScore}%</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {completeCount} of {totalCount} requirements complete
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                  Good Standing
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">Last reviewed: Today</p>
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
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compliance Checklist</CardTitle>
            <CardDescription>Track your progress across all OCAP™ requirements</CardDescription>
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
                            item.status === 'complete' && "text-green-500",
                            item.status === 'in_progress' && "text-amber-500",
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
                            item.status === 'complete' && "bg-green-500",
                            item.status === 'in_progress' && "bg-amber-500"
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
                              item.status === 'complete' && "text-green-500",
                              item.status === 'in_progress' && "text-amber-500",
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
                              item.status === 'complete' && "bg-green-500",
                              item.status === 'in_progress' && "bg-amber-500"
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
            <CardTitle className="text-lg">OCAP™ Resources</CardTitle>
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
                  <h4 className="font-medium">OCAP™ Training</h4>
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
                  <h4 className="font-medium">OCAP™ Principles</h4>
                  <p className="text-sm text-muted-foreground">Learn about data governance</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
