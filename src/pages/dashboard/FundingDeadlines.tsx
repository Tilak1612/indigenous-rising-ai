import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CalendarClock, ListChecks, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';
import { readStoredSession } from '@/lib/auth-storage';
import { deriveIntake, fmtDate, type FundingProgram } from '@/lib/funding-catalog';
import OfficialLinkButton from '@/components/funding/OfficialLinkButton';

const REST = `${SUPABASE_URL}/rest/v1`;
const headers = () => ({ apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${readStoredSession()?.access_token ?? SUPABASE_ANON_KEY}` });

type SavedRow = {
  id: string; status: string; grant_id: string;
  grants: Pick<FundingProgram, 'id' | 'slug' | 'name' | 'funder' | 'deadline' | 'opens_at' | 'is_recurring' | 'recurrence_notes' | 'intake_status' | 'apply_url' | 'apply_link_type' | 'source_url' | 'application_url'> | null;
};
type TaskRow = { id: string; title: string; due_date: string | null; status: string; related_id: string | null; related_type: string | null };

/**
 * Funding deadlines: the verified closing dates of the programmes a user has
 * saved, the programmes they saved that run on rolling intake, and the
 * funding tasks they set themselves. Dates come from the catalogue row (which
 * carries the funder's source and the date it was read), never from a
 * remembered or estimated value.
 */
export default function FundingDeadlines() {
  const { user } = useAuth();
  const [saved, setSaved] = useState<SavedRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [catalogueUpcoming, setCatalogueUpcoming] = useState<FundingProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      fetch(`${REST}/funding_saved_matches?select=id,status,grant_id,grants(id,slug,name,funder,deadline,opens_at,is_recurring,recurrence_notes,intake_status,apply_url,apply_link_type,source_url,application_url)&user_id=eq.${user.id}`, { headers: headers() }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${REST}/tasks?select=id,title,due_date,status,related_id,related_type&user_id=eq.${user.id}&related_type=eq.funding_application&order=due_date.asc.nullslast`, { headers: headers() }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${REST}/grants?select=id,slug,name,funder,deadline,opens_at,is_recurring,recurrence_notes,intake_status,apply_url,apply_link_type,source_url,application_url,provinces&is_published=eq.true&deadline=gte.${today}&order=deadline.asc&limit=20`, { headers: headers() }).then((r) => (r.ok ? r.json() : [])),
    ]).then(([s, t, c]) => {
      if (!active) return;
      setSaved(s as SavedRow[]);
      setTasks(t as TaskRow[]);
      setCatalogueUpcoming(c as FundingProgram[]);
      setLoading(false);
    }).catch(() => active && setLoading(false));
    return () => { active = false; };
  }, [user]);

  const dated = useMemo(() => saved.filter((s) => s.grants?.deadline).sort((a, b) => (a.grants!.deadline! < b.grants!.deadline! ? -1 : 1)), [saved]);
  const rolling = useMemo(() => saved.filter((s) => s.grants && !s.grants.deadline), [saved]);
  const savedIds = useMemo(() => new Set(saved.map((s) => s.grant_id)), [saved]);
  const openTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'done');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Funding deadlines</h1>
          <p className="text-muted-foreground mt-1">Closing dates come from each funder&apos;s page and carry the date we read it. Rolling programmes have no closing date; apply when you are ready.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><CalendarClock className="h-5 w-5 text-primary" />Saved programmes with a closing date</CardTitle>
                <CardDescription>{dated.length ? 'Soonest first.' : 'None of your saved programmes has a fixed closing date yet.'}</CardDescription>
              </CardHeader>
              {dated.length > 0 && (
                <CardContent className="space-y-3">
                  {dated.map((s) => {
                    const g = s.grants!;
                    const intake = deriveIntake(g);
                    return (
                      <div key={s.id} className="flex flex-col md:flex-row md:items-center gap-3 rounded-lg border border-border p-3">
                        <div className="flex-1">
                          <Link to={`/funding/${g.slug}`} className="font-medium hover:underline">{g.name}</Link>
                          <p className="text-sm text-muted-foreground">{g.funder}</p>
                        </div>
                        <Badge variant="outline" className={intake.tone === 'urgent' ? 'border-destructive/40 text-destructive' : intake.tone === 'closed' ? 'text-muted-foreground' : ''}>
                          <Calendar className="w-3 h-3 mr-1" aria-hidden="true" />{intake.text}
                        </Badge>
                        <div className="md:w-56"><OfficialLinkButton program={g} /></div>
                      </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><ListChecks className="h-5 w-5 text-primary" />Your funding tasks</CardTitle>
                <CardDescription>Reminders you set yourself in Tasks &amp; Deadlines, linked to a funding application.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {openTasks.length === 0 && <p className="text-sm text-muted-foreground">No open funding tasks. <Link to="/dashboard/tasks" className="underline text-primary">Add one</Link> from the readiness checklist or the Tasks page.</p>}
                {openTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm">{t.title}</span>
                    <span className="text-xs text-muted-foreground">{t.due_date ? fmtDate(t.due_date.slice(0, 10)) : 'No date'}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {rolling.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Saved programmes on rolling intake</CardTitle>
                  <CardDescription>No fixed deadline. These accept applications continuously or in intakes the funder has not dated.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {rolling.map((s) => (
                    <Link key={s.id} to={`/funding/${s.grants!.slug}`} className="inline-block rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary/40 hover:text-primary">{s.grants!.name}</Link>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming closing dates in the directory</CardTitle>
                <CardDescription>Every published programme with a closing date on or after today, whether or not you saved it.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {catalogueUpcoming.length === 0 && <p className="text-sm text-muted-foreground">No programme in the directory has a dated intake right now; most Indigenous financing runs on rolling intake. Deadline alerts by email are on the Growth plan.</p>}
                {catalogueUpcoming.map((g) => (
                  <div key={g.id} className="flex items-center justify-between rounded-lg border border-border p-3 gap-3">
                    <div>
                      <Link to={`/funding/${g.slug}`} className="text-sm font-medium hover:underline">{g.name}</Link>
                      <p className="text-xs text-muted-foreground">{g.funder}{savedIds.has(g.id) ? ' · saved' : ''}</p>
                    </div>
                    <span className="text-xs">{deriveIntake(g).text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button asChild variant="outline"><Link to="/dashboard/funding/saved">Saved programmes</Link></Button>
              <Button asChild variant="outline"><Link to="/funding/alerts">Weekly email alerts</Link></Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
