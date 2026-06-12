import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { readStoredSession } from '@/lib/auth-storage';
import { toast } from 'sonner';
import { ListChecks, Plus, Loader2, Trash2, Check, RotateCcw, CalendarClock } from 'lucide-react';

// Personal Tasks & Deadlines — backed by public.tasks. All I/O is direct-fetch
// with the user's token (the supabase-js query path can hang on this project);
// owner-scoped RLS (user_id = auth.uid()) keeps everything private to the user.
// Use this to track funding deadlines, business-plan milestones, and to-dos.

const REST = `${SUPABASE_URL}/rest/v1`;

const authHeaders = (json = false): Record<string, string> => {
  const token = readStoredSession()?.access_token ?? SUPABASE_ANON_KEY;
  const h: Record<string, string> = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
};

const TASK_TYPES = [
  { value: 'task', label: 'To-do' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'milestone', label: 'Milestone' },
] as const;

const typeLabel = (v: string) => TASK_TYPES.find((t) => t.value === v)?.label ?? 'To-do';

type Task = {
  id: string;
  title: string;
  description: string | null;
  task_type: string;
  due_date: string | null;
  status: string; // 'todo' | 'done'
  created_at: string;
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // new-task form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<string>('task');
  const [dueDate, setDueDate] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${REST}/tasks?select=id,title,description,task_type,due_date,status,created_at&user_id=eq.${user.id}&order=due_date.asc.nullslast,created_at.desc`,
        { headers: authHeaders() }
      );
      if (!res.ok) throw new Error('load failed');
      setTasks((await res.json()) as Task[]);
    } catch {
      toast.error('Could not load your tasks');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const addTask = async () => {
    if (!user) return;
    const t = title.trim();
    if (!t) {
      toast.error('Give the task a title');
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`${REST}/tasks`, {
        method: 'POST',
        headers: { ...authHeaders(true), Prefer: 'return=representation' },
        body: JSON.stringify({
          user_id: user.id,
          title: t,
          description: description.trim() || null,
          task_type: taskType,
          // Treat the date-input value as a local calendar date (noon local) so
          // it doesn't shift back a day when stored as UTC in a timestamptz col.
          due_date: dueDate ? new Date(dueDate + 'T12:00:00').toISOString() : null,
          status: 'todo',
        }),
      });
      if (!res.ok) throw new Error('insert failed');
      const [created] = (await res.json()) as Task[];
      setTasks((prev) => [created, ...prev]);
      setTitle('');
      setDescription('');
      setTaskType('task');
      setDueDate('');
      toast.success('Task added');
      load(); // re-sort by due date
    } catch {
      toast.error('Could not add the task');
    } finally {
      setAdding(false);
    }
  };

  const toggleStatus = async (task: Task) => {
    const next = task.status === 'done' ? 'todo' : 'done';
    setTasks((prev) => prev.map((x) => (x.id === task.id ? { ...x, status: next } : x)));
    try {
      const res = await fetch(`${REST}/tasks?id=eq.${task.id}`, {
        method: 'PATCH',
        headers: { ...authHeaders(true), Prefer: 'return=minimal' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error('update failed');
    } catch {
      setTasks((prev) => prev.map((x) => (x.id === task.id ? { ...x, status: task.status } : x)));
      toast.error('Could not update the task');
    }
  };

  const remove = async (task: Task) => {
    const prev = tasks;
    setTasks((p) => p.filter((x) => x.id !== task.id));
    try {
      const res = await fetch(`${REST}/tasks?id=eq.${task.id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error('delete failed');
      toast.success('Task deleted');
    } catch {
      setTasks(prev);
      toast.error('Could not delete the task');
    }
  };

  const groups = useMemo(() => {
    const today = startOfToday().getTime();
    const open = tasks.filter((t) => t.status !== 'done');
    const done = tasks.filter((t) => t.status === 'done');
    const overdue = open.filter((t) => t.due_date && new Date(t.due_date).getTime() < today);
    const scheduled = open.filter((t) => t.due_date && new Date(t.due_date).getTime() >= today);
    const undated = open.filter((t) => !t.due_date);
    return { overdue, scheduled, undated, done };
  }, [tasks]);

  const openCount = groups.overdue.length + groups.scheduled.length + groups.undated.length;

  const TaskRow = ({ task }: { task: Task }) => {
    const isDone = task.status === 'done';
    const isOverdue = !isDone && task.due_date && new Date(task.due_date).getTime() < startOfToday().getTime();
    return (
      <li className="flex items-start gap-3 py-3">
        <button
          type="button"
          aria-label={isDone ? 'Mark as not done' : 'Mark as done'}
          onClick={() => toggleStatus(task)}
          className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
            isDone ? 'bg-success border-success text-white' : 'border-muted-foreground/40 hover:border-primary'
          }`}
        >
          {isDone && <Check className="h-3.5 w-3.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className={`font-medium leading-snug ${isDone ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-wrap">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Badge variant="secondary" className="font-normal">{typeLabel(task.task_type)}</Badge>
            {task.due_date && (
              <span className={`inline-flex items-center gap-1 ${isOverdue ? 'text-destructive font-medium' : ''}`}>
                <CalendarClock className="h-3 w-3" />
                {fmtDate(task.due_date)}{isOverdue ? ' · overdue' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {isDone && (
            <Button variant="ghost" size="icon" aria-label="Reopen" onClick={() => toggleStatus(task)}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => remove(task)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </li>
    );
  };

  const Section = ({ label, items }: { label: string; items: Task[] }) =>
    items.length === 0 ? null : (
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
          {label} <span className="text-muted-foreground/60">({items.length})</span>
        </h3>
        <ul className="divide-y divide-border">
          {items.map((t) => <TaskRow key={t.id} task={t} />)}
        </ul>
      </div>
    );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tasks &amp; Deadlines</h1>
          <p className="text-muted-foreground mt-1">
            Track funding deadlines, business-plan milestones, and to-dos — private to you.
          </p>
        </div>

        {/* Add task */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add a task</CardTitle>
            <CardDescription>A title is all you need. Add a due date to see it sorted by deadline.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="e.g. Submit IBDP grant application"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addTask(); } }}
            />
            <Textarea
              placeholder="Notes (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="task-type">Type</label>
                <Select value={taskType} onValueChange={setTaskType}>
                  <SelectTrigger id="task-type" className="w-full sm:w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TASK_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="task-due">Due date</label>
                <Input id="task-due" type="date" className="w-full sm:w-48" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <Button onClick={addTask} disabled={adding} className="gap-2 sm:ml-auto">
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {adding ? 'Adding…' : 'Add task'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your tasks</CardTitle>
            <CardDescription>
              {openCount} open · {groups.done.length} completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ListChecks className="h-10 w-10 text-muted-foreground/60 mb-3" />
                <p className="font-medium">No tasks yet</p>
                <p className="text-sm text-muted-foreground mt-1">Add your first deadline or to-do above.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <Section label="Overdue" items={groups.overdue} />
                <Section label="Upcoming" items={groups.scheduled} />
                <Section label="No due date" items={groups.undated} />
                <Section label="Completed" items={groups.done} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
