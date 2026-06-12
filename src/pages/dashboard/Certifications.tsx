import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, BookOpen, Clock, CheckCircle2, Lock, Play, Download } from 'lucide-react';

interface Certification {
  id: string;
  title: string;
  description: string;
  modules: number;
  completedModules: number;
  duration: string;
  status: 'not_started' | 'in_progress' | 'completed';
  badge?: string;
  certificate?: boolean;
}

const certifications: Certification[] = [
  {
    id: '1',
    title: 'Indigenous Business Fundamentals',
    description: 'Learn the core principles of running a successful Indigenous-owned business.',
    modules: 8,
    completedModules: 8,
    duration: '4 hours',
    status: 'completed',
    badge: '🏆',
    certificate: true,
  },
  {
    id: '2',
    title: 'Cultural Competency in Business',
    description: 'Understanding cultural values and integrating them into business practices.',
    modules: 6,
    completedModules: 4,
    duration: '3 hours',
    status: 'in_progress',
  },
  {
    id: '3',
    title: 'OCAP® Principles Certification',
    description: 'Master the Ownership, Control, Access, and Possession principles for data sovereignty.',
    modules: 5,
    completedModules: 0,
    duration: '2.5 hours',
    status: 'not_started',
  },
  {
    id: '4',
    title: 'Funding & Grant Writing',
    description: 'Learn to identify funding opportunities and write winning grant proposals.',
    modules: 7,
    completedModules: 0,
    duration: '3.5 hours',
    status: 'not_started',
  },
  {
    id: '5',
    title: 'Indigenous Procurement',
    description: 'Navigate government and corporate Indigenous procurement programs.',
    modules: 4,
    completedModules: 0,
    duration: '2 hours',
    status: 'not_started',
  },
  {
    id: '6',
    title: 'Community Impact Leadership',
    description: 'Lead initiatives that create positive impact in your community.',
    modules: 6,
    completedModules: 0,
    duration: '3 hours',
    status: 'not_started',
  },
];

function CertificationCard({ cert }: { cert: Certification }) {
  const progress = (cert.completedModules / cert.modules) * 100;

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              {cert.status === 'completed' ? (
                <Award className="h-6 w-6 text-primary" />
              ) : (
                <BookOpen className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{cert.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{cert.duration}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{cert.modules} modules</span>
              </div>
            </div>
          </div>
          {cert.badge && <span className="text-2xl">{cert.badge}</span>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{cert.description}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{cert.completedModules}/{cert.modules} modules</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between pt-2">
          <Badge
            variant={
              cert.status === 'completed' ? 'default' :
              cert.status === 'in_progress' ? 'secondary' : 'outline'
            }
          >
            {cert.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
            {cert.status === 'completed' ? 'Completed' :
             cert.status === 'in_progress' ? 'In Progress' : 'Not Started'}
          </Badge>

          <div className="flex gap-2">
            {cert.certificate && (
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Certificate
              </Button>
            )}
            <Button size="sm">
              {cert.status === 'not_started' ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </>
              ) : cert.status === 'in_progress' ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Continue
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Review
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Certifications() {
  const completedCount = certifications.filter(c => c.status === 'completed').length;
  const inProgressCount = certifications.filter(c => c.status === 'in_progress').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Certifications</h1>
          <p className="text-muted-foreground mt-1">
            Earn credentials and enhance your business skills
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressCount}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">18h</p>
                <p className="text-sm text-muted-foreground">Total Learning</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Modules Done</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {certifications.map(cert => (
            <CertificationCard key={cert.id} cert={cert} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
