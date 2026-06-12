import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, GraduationCap, ListChecks, ArrowRight, CalendarClock } from 'lucide-react';

// Training Calendar — honest version. We don't fabricate sessions, instructors,
// or seat counts. Live training sessions are published through the AI Training
// Program (/training); when scheduled sessions exist they will appear here.
// Until then this page surfaces the real program and the user's own deadlines.

export default function TrainingCalendar() {
  // Real, scheduled sessions would be loaded from a data source here. There are
  // none seeded — we show an honest empty state rather than placeholder events.
  const sessions: { id: string; title: string; date: string }[] = [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Training Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Live training sessions and learning milestones, in one place.
          </p>
        </div>

        {/* Real program CTA */}
        <Card>
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">AI Training Program</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Monthly live sessions on AI, data sovereignty, and practical implementation for
                Indigenous communities. Manage your enrollment and see what&apos;s included.
              </p>
            </div>
            <Button asChild className="gap-2 flex-shrink-0">
              <Link to="/training">
                View program <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming sessions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Upcoming sessions</CardTitle>
              <CardDescription>Scheduled live training sessions will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarClock className="h-10 w-10 text-muted-foreground/60 mb-3" />
                  <p className="font-medium">No sessions scheduled yet</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    When live training sessions are scheduled, you&apos;ll see the dates and
                    registration details here. Enroll in the program to be notified.
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-4 gap-2">
                    <Link to="/training">
                      <Calendar className="h-4 w-4" /> Explore the program
                    </Link>
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {sessions.map((s) => (
                    <li key={s.id} className="py-3">
                      <p className="font-medium">{s.title}</p>
                      <p className="text-sm text-muted-foreground">{s.date}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Track your own deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>Your learning goals</CardTitle>
              <CardDescription>Set your own deadlines and reminders.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <ListChecks className="h-5 w-5 text-success" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Add training milestones, course deadlines, and reminders to your personal task
                  list so nothing slips.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full gap-2">
                <Link to="/dashboard/tasks">
                  Go to Tasks &amp; Deadlines <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
