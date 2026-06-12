import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Headphones, Plus, MessageSquare, Clock, CheckCircle2, AlertCircle, Search, Loader2, Mail } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { readStoredSession } from '@/lib/auth-storage';
import { toast } from 'sonner';

// Support Center — backed by public.support_tickets via direct-fetch (the
// supabase-js query path can hang on this project). Owner-scoped RLS keeps each
// user's tickets private. Users create, view, and close their own tickets.

const REST = `${SUPABASE_URL}/rest/v1`;

const authHeaders = (json = false): Record<string, string> => {
  const token = readStoredSession()?.access_token ?? SUPABASE_ANON_KEY;
  const h: Record<string, string> = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
};

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<TicketStatus, string> = {
  open: 'bg-primary',
  in_progress: 'bg-warning',
  resolved: 'bg-success',
  closed: 'bg-muted-foreground',
};

const priorityColors: Record<TicketPriority, string> = {
  low: 'text-muted-foreground',
  medium: 'text-primary',
  high: 'text-warning',
  urgent: 'text-destructive',
};

const shortId = (id: string) => `TKT-${id.slice(0, 8).toUpperCase()}`;
const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-CA');

export default function Support() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // new-ticket form
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${REST}/support_tickets?select=id,subject,description,status,priority,created_at,updated_at&user_id=eq.${user.id}&order=created_at.desc`,
        { headers: authHeaders() }
      );
      if (!res.ok) throw new Error('load failed');
      setTickets((await res.json()) as Ticket[]);
    } catch {
      toast.error('Could not load your tickets');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!user) return;
    const s = subject.trim();
    const d = description.trim();
    if (!s || !d) {
      toast.error('Add a subject and description');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${REST}/support_tickets`, {
        method: 'POST',
        headers: { ...authHeaders(true), Prefer: 'return=representation' },
        body: JSON.stringify({ user_id: user.id, subject: s, description: d, priority, status: 'open' }),
      });
      if (!res.ok) throw new Error('insert failed');
      const [created] = (await res.json()) as Ticket[];
      setTickets((prev) => [created, ...prev]);
      setSubject(''); setDescription(''); setPriority('medium');
      setOpen(false);
      toast.success('Ticket submitted — we\'ll follow up by email');
    } catch {
      toast.error('Could not submit the ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const closeTicket = async (ticket: Ticket) => {
    setTickets((prev) => prev.map((t) => (t.id === ticket.id ? { ...t, status: 'closed' } : t)));
    try {
      const res = await fetch(`${REST}/support_tickets?id=eq.${ticket.id}`, {
        method: 'PATCH',
        headers: { ...authHeaders(true), Prefer: 'return=minimal' },
        body: JSON.stringify({ status: 'closed' }),
      });
      if (!res.ok) throw new Error('update failed');
    } catch {
      setTickets((prev) => prev.map((t) => (t.id === ticket.id ? { ...t, status: ticket.status } : t)));
      toast.error('Could not close the ticket');
    }
  };

  const counts = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
  }), [tickets]);

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">Support Center</h1>
            <p className="text-muted-foreground mt-1">
              Submit a request and track its status. We respond by email.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New ticket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create support ticket</DialogTitle>
                <DialogDescription>
                  Describe your issue and we&apos;ll get back to you by email as soon as we can.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium" htmlFor="t-subject">Subject</label>
                  <Input id="t-subject" placeholder="Brief description of your issue" className="mt-1"
                    value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="t-priority">Priority</label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                    <SelectTrigger id="t-priority" className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="t-desc">Description</label>
                  <Textarea id="t-desc" placeholder="Please provide details about your issue..." className="mt-1 min-h-32"
                    value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <Button className="w-full" onClick={submit} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {submitting ? 'Submitting…' : 'Submit ticket'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats — literal Tailwind classes so the JIT generates them */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: Headphones, iconWrap: 'bg-primary/10', iconColor: 'text-primary', value: counts.total, label: 'Total tickets' },
            { icon: MessageSquare, iconWrap: 'bg-primary/10', iconColor: 'text-primary', value: counts.open, label: 'Open' },
            { icon: Clock, iconWrap: 'bg-warning/10', iconColor: 'text-warning', value: counts.inProgress, label: 'In progress' },
            { icon: CheckCircle2, iconWrap: 'bg-success/10', iconColor: 'text-success', value: counts.resolved, label: 'Resolved' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${s.iconWrap}`}>
                    <Icon className={`h-6 w-6 ${s.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Direct contact (honest — email, no unverified phone/24-7 claims) */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-semibold text-lg">Prefer email?</h3>
              <p className="text-muted-foreground">Reach our team directly and we&apos;ll respond as soon as we can.</p>
            </div>
            <Button asChild variant="outline">
              <a href="mailto:help@indigenousrising.ai">
                <Mail className="h-4 w-4 mr-2" />
                help@indigenousrising.ai
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search tickets..." value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <Card>
          <CardHeader>
            <CardTitle>Your tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`h-3 w-3 rounded-full flex-shrink-0 ${statusColors[ticket.status]}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{shortId(ticket.id)}</span>
                          <h4 className="font-medium truncate">{ticket.subject}</h4>
                          <AlertCircle className={`h-4 w-4 flex-shrink-0 ${priorityColors[ticket.priority]}`} />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{ticket.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>Created: {fmt(ticket.created_at)}</span>
                          <span>Updated: {fmt(ticket.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={statusColors[ticket.status]}>{ticket.status.replace('_', ' ')}</Badge>
                      {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
                        <Button variant="ghost" size="sm" onClick={() => closeTicket(ticket)}>Close</Button>
                      )}
                    </div>
                  </div>
                ))}

                {filteredTickets.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    <Headphones className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{tickets.length === 0 ? 'No tickets yet — create one above.' : 'No tickets match your filters.'}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
