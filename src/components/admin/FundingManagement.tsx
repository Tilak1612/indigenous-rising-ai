import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, ExternalLink, Eye, EyeOff, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import {
  listAllGrants, updateGrant, setPublished, markVerified, listReviewQueue, resolveReview, listLinkChecks,
  listLinkReports, listClicks, listEvents, type AdminGrant, type GrantPatch, type ReviewItem, type LinkCheck,
  type LinkReport, type ClickRow, type VerificationEvent,
} from '@/lib/funding-admin';
import { APPLY_LINK_TYPES } from '@/lib/funding-links';
import { FUNDING_TYPE_LABELS, INTAKE_LABELS, PROVINCES, formatAmount } from '@/lib/funding-catalog';

const INTAKES = Object.keys(INTAKE_LABELS);
const STATUSES = ['unverified', 'needs_review', 'verified', 'retired'];
const METHODS = ['online', 'email', 'through_lender', 'contact', 'referral', 'unknown'];

/**
 * Funding catalogue administration. Publishing, unpublishing and marking a
 * record verified are explicit actions that write a verification event, so
 * the audit trail in the database is complete without a separate log. Field
 * edits cover the material fields a reviewer changes after reading the
 * funder's page; slugs, evidence and providers are set by research.
 */
export default function FundingManagement() {
  const { toast } = useToast();
  const [grants, setGrants] = useState<AdminGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'unpublished' | 'needs_review'>('all');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<AdminGrant | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setGrants(await listAllGrants()); } catch (e) { toast({ title: 'Could not load the catalogue', description: (e as Error).message, variant: 'destructive' }); }
    setLoading(false);
  }, [toast]);
  useEffect(() => { void load(); }, [load]);

  const rows = useMemo(() => grants.filter((g) =>
    (filter === 'all' || (filter === 'published' && g.is_published) || (filter === 'unpublished' && !g.is_published) || (filter === 'needs_review' && g.verification_status === 'needs_review')) &&
    (!q || `${g.name} ${g.funder} ${g.slug}`.toLowerCase().includes(q.toLowerCase()))), [grants, filter, q]);

  const counts = useMemo(() => ({
    published: grants.filter((g) => g.is_published).length,
    unpublished: grants.filter((g) => !g.is_published).length,
    verified: grants.filter((g) => g.verification_status === 'verified').length,
    needsReview: grants.filter((g) => g.verification_status === 'needs_review').length,
  }), [grants]);

  const togglePublish = async (g: AdminGrant) => {
    if (!g.is_published && g.verification_confidence === 'none') {
      toast({ title: 'Read the funder’s page first', description: 'This record has no evidence on file. Mark it verified, or at least edit it after reading the source, before publishing.', variant: 'destructive' });
      return;
    }
    if (!window.confirm(g.is_published ? `Unpublish "${g.name}"? It disappears from the public directory immediately.` : `Publish "${g.name}" to the public directory?`)) return;
    try { await setPublished(g.id, !g.is_published); toast({ title: g.is_published ? 'Unpublished' : 'Published' }); await load(); }
    catch (e) { toast({ title: 'Failed', description: (e as Error).message, variant: 'destructive' }); }
  };

  return (
    <Tabs defaultValue="catalogue" className="space-y-6">
      <TabsList>
        <TabsTrigger value="catalogue">Catalogue ({grants.length})</TabsTrigger>
        <TabsTrigger value="review">Review queue</TabsTrigger>
        <TabsTrigger value="links">Link checks</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="clicks">Outbound clicks</TabsTrigger>
      </TabsList>

      <TabsContent value="catalogue" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Funding programmes</CardTitle>
            <CardDescription>
              {counts.published} published · {counts.unpublished} awaiting review · {counts.verified} verified · {counts.needsReview} need review. A record becomes sendable in the weekly email only when it is published, verified and read within 90 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <Input placeholder="Search name, funder or slug" value={q} onChange={(e) => setQ(e.target.value)} className="md:max-w-sm" />
              <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                <SelectTrigger className="md:w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All records</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="unpublished">Unpublished</SelectItem>
                  <SelectItem value="needs_review">Needs review</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Reload</Button>
            </div>
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-muted-foreground border-b"><th className="py-2 pr-3">Programme</th><th className="pr-3">Type</th><th className="pr-3">Region</th><th className="pr-3">Amount</th><th className="pr-3">Intake</th><th className="pr-3">Status</th><th className="pr-3">Read</th><th></th></tr></thead>
                  <tbody>
                    {rows.map((g) => (
                      <tr key={g.id} className="border-b last:border-0 align-top">
                        <td className="py-2 pr-3"><button className="text-left font-medium hover:underline" onClick={() => setSelected(g)}>{g.name}</button><div className="text-xs text-muted-foreground">{g.funder}</div></td>
                        <td className="pr-3">{FUNDING_TYPE_LABELS[g.funding_type] ?? g.funding_type}</td>
                        <td className="pr-3">{g.provinces.length >= 13 ? 'National' : g.provinces.join(', ')}</td>
                        <td className="pr-3">{formatAmount(g)}</td>
                        <td className="pr-3">{INTAKE_LABELS[g.intake_status] ?? g.intake_status}</td>
                        <td className="pr-3"><Badge variant={g.verification_status === 'verified' ? 'default' : 'outline'}>{g.verification_status}</Badge>{g.is_published ? <Badge variant="secondary" className="ml-1">live</Badge> : null}</td>
                        <td className="pr-3 text-xs">{g.last_verified ?? '—'}<div className="text-muted-foreground">{g.verification_confidence}</div></td>
                        <td className="whitespace-nowrap">
                          <Button size="sm" variant="ghost" onClick={() => togglePublish(g)} title={g.is_published ? 'Unpublish' : 'Publish'}>{g.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        {selected && <GrantEditor grant={selected} onClose={() => setSelected(null)} onSaved={async () => { setSelected(null); await load(); }} />}
      </TabsContent>

      <TabsContent value="review"><ReviewQueue /></TabsContent>
      <TabsContent value="links"><LinkChecks /></TabsContent>
      <TabsContent value="reports"><Reports /></TabsContent>
      <TabsContent value="clicks"><Clicks /></TabsContent>
    </Tabs>
  );
}

function GrantEditor({ grant, onClose, onSaved }: { grant: AdminGrant; onClose: () => void; onSaved: () => Promise<void> }) {
  const { toast } = useToast();
  const [form, setForm] = useState<GrantPatch>({
    name: grant.name, funder: grant.funder, description: grant.description, funding_type: grant.funding_type,
    is_repayable: grant.is_repayable, amount_min: grant.amount_min, amount_max: grant.amount_max, deadline: grant.deadline,
    opens_at: grant.opens_at, is_recurring: grant.is_recurring, recurrence_notes: grant.recurrence_notes, intake_status: grant.intake_status,
    provinces: grant.provinces, eligibility_notes: grant.eligibility_notes, eligibility_exclusions: grant.eligibility_exclusions,
    source_url: grant.source_url, application_url: grant.application_url, apply_url: grant.apply_url, apply_link_type: grant.apply_link_type,
    application_method: grant.application_method, verification_status: grant.verification_status, verification_notes: grant.verification_notes,
  });
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [events, setEvents] = useState<VerificationEvent[]>([]);
  useEffect(() => { listEvents(grant.id).then(setEvents).catch(() => undefined); }, [grant.id]);
  const set = <K extends keyof GrantPatch>(k: K, v: GrantPatch[K]) => setForm((f) => ({ ...f, [k]: v }));
  const num = (v: string) => (v.trim() === '' ? null : Number.parseInt(v.replace(/[^0-9]/g, ''), 10));

  const save = async () => {
    setBusy(true);
    try {
      const patch: GrantPatch = { ...form };
      if (!patch.application_url) patch.application_url = patch.source_url ?? grant.application_url;
      await updateGrant(grant.id, patch, note || 'Edited in the admin console');
      toast({ title: 'Saved' });
      await onSaved();
    } catch (e) { toast({ title: 'Save failed', description: (e as Error).message, variant: 'destructive' }); }
    setBusy(false);
  };
  const verify = async () => {
    if (!note.trim()) { toast({ title: 'Say what you checked', description: 'A verification note is required (what page you read, what you confirmed).', variant: 'destructive' }); return; }
    setBusy(true);
    try { await markVerified(grant.id, note.trim()); toast({ title: 'Marked verified' }); await onSaved(); }
    catch (e) { toast({ title: 'Failed', description: (e as Error).message, variant: 'destructive' }); }
    setBusy(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2"><span>{grant.name}</span><Button variant="ghost" size="sm" onClick={onClose}>Close</Button></CardTitle>
        <CardDescription>/funding/{grant.slug} · created {grant.created_at.slice(0, 10)} · confidence {grant.verification_confidence}{grant.source_url && <> · <a className="underline" href={grant.source_url} target="_blank" rel="noopener noreferrer">source <ExternalLink className="inline w-3 h-3" /></a></>}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label>Name</Label><Input value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} /></div>
          <div><Label>Funder</Label><Input value={form.funder ?? ''} onChange={(e) => set('funder', e.target.value)} /></div>
          <div className="md:col-span-2"><Label>Description (original wording, not copied from the funder)</Label><Textarea rows={3} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} /></div>
          <div><Label>Funding type</Label>
            <Select value={form.funding_type ?? 'varies'} onValueChange={(v) => set('funding_type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(FUNDING_TYPE_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Repayable</Label>
            <Select value={form.is_repayable === null || form.is_repayable === undefined ? 'unknown' : form.is_repayable ? 'yes' : 'no'} onValueChange={(v) => set('is_repayable', v === 'unknown' ? null : v === 'yes')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem><SelectItem value="unknown">Not stated</SelectItem></SelectContent></Select></div>
          <div><Label>Amount min (CAD, blank = not published)</Label><Input inputMode="numeric" value={form.amount_min ?? ''} onChange={(e) => set('amount_min', num(e.target.value))} /></div>
          <div><Label>Amount max (CAD, blank = not published)</Label><Input inputMode="numeric" value={form.amount_max ?? ''} onChange={(e) => set('amount_max', num(e.target.value))} /></div>
          <div><Label>Intake status</Label>
            <Select value={form.intake_status ?? 'unknown'} onValueChange={(v) => set('intake_status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{INTAKES.map((v) => <SelectItem key={v} value={v}>{INTAKE_LABELS[v]}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Closing date (blank = none)</Label><Input type="date" value={form.deadline ?? ''} onChange={(e) => set('deadline', e.target.value || null)} /></div>
          <div><Label>Opens (blank = unknown)</Label><Input type="date" value={form.opens_at ?? ''} onChange={(e) => set('opens_at', e.target.value || null)} /></div>
          <div><Label>Rolling / recurrence notes</Label><Input value={form.recurrence_notes ?? ''} onChange={(e) => set('recurrence_notes', e.target.value || null)} /></div>
          <div className="md:col-span-2"><Label>Provinces (codes, comma separated; all 13 = national)</Label><Input value={(form.provinces ?? []).join(',')} onChange={(e) => set('provinces', e.target.value.split(',').map((s) => s.trim().toUpperCase()).filter((c) => PROVINCES.some((p) => p.code === c)))} /></div>
          <div className="md:col-span-2"><Label>Who may qualify</Label><Textarea rows={3} value={form.eligibility_notes ?? ''} onChange={(e) => set('eligibility_notes', e.target.value || null)} /></div>
          <div className="md:col-span-2"><Label>Who does not qualify</Label><Textarea rows={2} value={form.eligibility_exclusions ?? ''} onChange={(e) => set('eligibility_exclusions', e.target.value || null)} /></div>
          <div><Label>Source URL (programme page)</Label><Input value={form.source_url ?? ''} onChange={(e) => set('source_url', e.target.value || null)} /></div>
          <div><Label>Apply URL (most specific destination; blank = none)</Label><Input value={form.apply_url ?? ''} onChange={(e) => set('apply_url', e.target.value || null)} /></div>
          <div><Label>Apply link type (decides the button label)</Label>
            <Select value={form.apply_link_type ?? 'program_page'} onValueChange={(v) => set('apply_link_type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{APPLY_LINK_TYPES.map((v) => <SelectItem key={v} value={v}>{v.replace(/_/g, ' ')}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Application method</Label>
            <Select value={form.application_method ?? 'unknown'} onValueChange={(v) => set('application_method', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{METHODS.map((v) => <SelectItem key={v} value={v}>{v.replace(/_/g, ' ')}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Verification status</Label>
            <Select value={form.verification_status ?? 'unverified'} onValueChange={(v) => set('verification_status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
          <div className="md:col-span-2"><Label>Verification notes (what was checked, where, when)</Label><Textarea rows={3} value={form.verification_notes ?? ''} onChange={(e) => set('verification_notes', e.target.value || null)} /></div>
          <div className="md:col-span-2"><Label>Change note for the audit trail</Label><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Re-read the ISC page on 2026-11-02; amounts unchanged" /></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={save} disabled={busy}>{busy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}Save changes</Button>
          <Button variant="outline" onClick={verify} disabled={busy}><ShieldCheck className="w-4 h-4 mr-2" />Mark verified today</Button>
        </div>
        {grant.source_evidence.length > 0 && (
          <details className="text-sm"><summary className="cursor-pointer">Evidence on file ({grant.source_evidence.length})</summary>
            <ul className="mt-2 space-y-1">{grant.source_evidence.map((e, i) => <li key={i} className="border-l-2 pl-2 text-muted-foreground"><span className="text-xs uppercase">{e.field}</span>: &ldquo;{e.quote}&rdquo; <span className="text-xs">({e.fetched_at})</span></li>)}</ul>
          </details>
        )}
        {events.length > 0 && (
          <details className="text-sm"><summary className="cursor-pointer">History ({events.length})</summary>
            <ul className="mt-2 space-y-1">{events.map((e) => <li key={e.id} className="text-muted-foreground"><span className="text-xs">{e.created_at.slice(0, 16).replace('T', ' ')}</span> · {e.event_type} · {e.summary}</li>)}</ul>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

function ReviewQueue() {
  const { toast } = useToast();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); try { setItems(await listReviewQueue('open')); } catch (e) { toast({ title: 'Could not load', description: (e as Error).message, variant: 'destructive' }); } setLoading(false); }, [toast]);
  useEffect(() => { void load(); }, [load]);
  const act = async (id: string, status: 'resolved' | 'dismissed') => {
    const resolution = window.prompt(status === 'resolved' ? 'What was done?' : 'Why dismiss?') ?? '';
    if (!resolution.trim()) return;
    try { await resolveReview(id, status, resolution); await load(); } catch (e) { toast({ title: 'Failed', description: (e as Error).message, variant: 'destructive' }); }
  };
  return (
    <Card>
      <CardHeader><CardTitle>Review queue</CardTitle><CardDescription>Open items from research, the weekly link check and public reports. Resolve after acting on the record; dismiss with a reason.</CardDescription></CardHeader>
      <CardContent>
        {loading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : items.length === 0 ? <p className="text-sm text-muted-foreground">Nothing open.</p> : (
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.id} className="rounded-lg border p-3 flex flex-col md:flex-row md:items-center gap-2">
                <div className="flex-1 text-sm">
                  <Badge variant={i.severity === 'high' ? 'destructive' : 'outline'} className="mr-2">{i.reason.replace(/_/g, ' ')}</Badge>
                  <span className="font-medium">{i.grants?.name ?? 'Catalogue'}</span>{i.grants && !i.grants.is_published ? <span className="text-xs text-muted-foreground"> (unpublished)</span> : null}
                  <div className="text-xs text-muted-foreground">{i.created_at.slice(0, 10)} · {Object.keys(i.payload).length ? JSON.stringify(i.payload).slice(0, 160) : ''}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => act(i.id, 'resolved')}>Resolve</Button>
                  <Button size="sm" variant="ghost" onClick={() => act(i.id, 'dismissed')}>Dismiss</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function LinkChecks() {
  const [rows, setRows] = useState<LinkCheck[]>([]);
  useEffect(() => { listLinkChecks(150).then(setRows).catch(() => undefined); }, []);
  return (
    <Card>
      <CardHeader><CardTitle>Link checks</CardTitle><CardDescription>Latest results from the weekly checker. &ldquo;blocked&rdquo; means the host refused an automated request, not that the page is gone.</CardDescription></CardHeader>
      <CardContent>
        {rows.length === 0 ? <p className="text-sm text-muted-foreground">No checks recorded yet. The first run is scheduled for Monday 09:15 UTC after deployment.</p> : (
          <div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="text-left text-muted-foreground border-b"><th className="py-1 pr-2">When</th><th className="pr-2">Programme</th><th className="pr-2">Kind</th><th className="pr-2">Verdict</th><th className="pr-2">HTTP</th><th>URL</th></tr></thead>
            <tbody>{rows.map((r) => <tr key={r.id} className="border-b last:border-0"><td className="py-1 pr-2 whitespace-nowrap">{r.checked_at.slice(0, 16).replace('T', ' ')}</td><td className="pr-2">{r.grants?.name}</td><td className="pr-2">{r.kind}</td><td className="pr-2"><Badge variant={r.verdict === 'dead' ? 'destructive' : 'outline'}>{r.verdict}</Badge></td><td className="pr-2">{r.status_code ?? r.error ?? ''}</td><td className="break-all">{r.url}{r.final_url ? ` → ${r.final_url}` : ''}</td></tr>)}</tbody></table></div>
        )}
      </CardContent>
    </Card>
  );
}

function Reports() {
  const [rows, setRows] = useState<LinkReport[]>([]);
  useEffect(() => { listLinkReports(100).then(setRows).catch(() => undefined); }, []);
  return (
    <Card>
      <CardHeader><CardTitle>Public reports</CardTitle><CardDescription>&ldquo;Report a problem&rdquo; submissions from programme pages. Each also opened a review-queue item.</CardDescription></CardHeader>
      <CardContent>
        {rows.length === 0 ? <p className="text-sm text-muted-foreground">No reports.</p> : (
          <ul className="space-y-2 text-sm">{rows.map((r) => <li key={r.id} className="rounded-lg border p-3"><div className="font-medium">{r.grants?.name}</div><div className="text-xs text-muted-foreground">{r.created_at.slice(0, 16).replace('T', ' ')} · {r.url}</div>{r.message && <p className="mt-1">{r.message}</p>}</li>)}</ul>
        )}
      </CardContent>
    </Card>
  );
}

function Clicks() {
  const [rows, setRows] = useState<ClickRow[]>([]);
  useEffect(() => { listClicks(30).then(setRows).catch(() => undefined); }, []);
  const totals = useMemo(() => {
    const m = new Map<string, { name: string; apply: number; source: number }>();
    for (const r of rows) {
      const t = m.get(r.grant_id) ?? { name: r.grants?.name ?? r.grant_id, apply: 0, source: 0 };
      if (r.link_kind === 'apply') t.apply += r.clicks; else t.source += r.clicks;
      m.set(r.grant_id, t);
    }
    return [...m.values()].sort((a, b) => b.apply + b.source - (a.apply + a.source));
  }, [rows]);
  return (
    <Card>
      <CardHeader><CardTitle>Outbound clicks (last 30 days)</CardTitle><CardDescription>Aggregate counts per programme and link kind. No user is identified; a click is not an application.</CardDescription></CardHeader>
      <CardContent>
        {totals.length === 0 ? <p className="text-sm text-muted-foreground">No clicks recorded yet.</p> : (
          <table className="w-full text-sm"><thead><tr className="text-left text-muted-foreground border-b"><th className="py-1">Programme</th><th>Official link</th><th>Source link</th></tr></thead>
            <tbody>{totals.map((t) => <tr key={t.name} className="border-b last:border-0"><td className="py-1">{t.name}</td><td>{t.apply}</td><td>{t.source}</td></tr>)}</tbody></table>
        )}
      </CardContent>
    </Card>
  );
}
