import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { SUPABASE_URL } from '@/lib/supabase';
import { FLAGS } from '@/lib/flags';
import {
  authHeaders, openWorkspace, setStage, listItems, addItem, updateItem,
  deleteItem, readinessPercent, WORKING_STAGES, STAGE_LABELS, stageIndex,
  type Stage, type ReadinessItem, type ItemKind, type ItemState,
  type FundingApplication,
} from '@/lib/readiness';
import { toast } from 'sonner';
import { Loader2, Check, X, HelpCircle, Plus, Trash2, FileText, ExternalLink } from 'lucide-react';

// Funding Readiness Workspace (P0-3). Seven resumable stages per
// (user, program). Stages that already had working features link out to
// them rather than duplicating: documents -> Document Library, deadlines
// -> Tasks, draft -> the grant_applications record.

const REST = `${SUPABASE_URL}/rest/v1`;

type GrantLite = {
  id: string;
  name: string;
  funder: string;
  deadline: string | null;
  application_url: string | null;
};

type VaultDoc = { id: string; name: string; category: string };

/** Which checklist kind a stage edits, if any. */
const STAGE_KIND: Partial<Record<Stage, ItemKind>> = {
  eligibility: 'eligibility',
  missing_info: 'missing_info',
  submission: 'submission',
};

const STAGE_HELP: Record<string, string> = {
  match: 'The programme you are working towards.',
  eligibility: 'Each requirement, and whether you meet it. Anything left unknown counts as not yet met.',
  documents: 'Attach files you have already uploaded — you never need to upload the same document twice.',
  missing_info: 'What you still need to find out or obtain before you can apply.',
  draft: 'Write the application itself. Saved as a draft you can return to.',
  tasks: 'Deadlines and reminders, tracked with the rest of your tasks.',
  submission: 'Final checks before you submit.',
};

const ITEM_STATE_ICON: Record<ItemState, React.ReactNode> = {
  met: <Check className="h-4 w-4" aria-hidden="true" />,
  unmet: <X className="h-4 w-4" aria-hidden="true" />,
  unknown: <HelpCircle className="h-4 w-4" aria-hidden="true" />,
};

const ReadinessWorkspace: React.FC = () => {
  const { grantId } = useParams<{ grantId: string }>();
  const { user } = useAuth();
  const [app, setApp] = useState<FundingApplication | null>(null);
  const [grant, setGrant] = useState<GrantLite | null>(null);
  const [items, setItems] = useState<ReadinessItem[]>([]);
  const [docs, setDocs] = useState<VaultDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user || !grantId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const workspace = await openWorkspace(user.id, grantId);
      setApp(workspace);

      const [gRes, dRes, loaded] = await Promise.all([
        fetch(
          `${REST}/grants?select=id,name,funder,deadline,application_url&id=eq.${grantId}`,
          { headers: authHeaders() },
        ),
        fetch(
          `${REST}/documents?select=id,name,category&user_id=eq.${user.id}&order=created_at.desc`,
          { headers: authHeaders() },
        ),
        listItems(workspace.id),
      ]);
      if (gRes.ok) setGrant(((await gRes.json()) as GrantLite[])[0] ?? null);
      if (dRes.ok) setDocs((await dRes.json()) as VaultDoc[]);
      setItems(loaded);
    } catch (err) {
      // Surface the failure instead of rendering an empty workspace that
      // looks like "no progress yet" — that would read as data loss.
      setLoadError(err instanceof Error ? err.message : 'Could not load this workspace');
    } finally {
      setLoading(false);
    }
  }, [user, grantId]);

  useEffect(() => { void load(); }, [load]);

  const stage: Stage = app?.stage ?? 'match';
  const kind = STAGE_KIND[stage];
  const stageItems = useMemo(
    () => (kind ? items.filter((i) => i.kind === kind) : []),
    [items, kind],
  );

  const goToStage = async (next: Stage) => {
    if (!app) return;
    setBusy(true);
    const previous = app.stage;
    setApp({ ...app, stage: next });
    try {
      await setStage(app.id, next);
    } catch {
      // Revert rather than leave the UI showing a stage the database
      // does not have — on reload the user would appear to lose progress.
      setApp({ ...app, stage: previous });
      toast.error('Could not save your progress — please try again');
    } finally {
      setBusy(false);
    }
  };

  const onAddItem = async () => {
    if (!app || !user || !kind || !newLabel.trim()) return;
    setBusy(true);
    try {
      const created = await addItem(
        app.id, user.id, kind, newLabel.trim(), stageItems.length,
      );
      setItems((prev) => [...prev, created]);
      setNewLabel('');
    } catch {
      toast.error('Could not add that item');
    } finally {
      setBusy(false);
    }
  };

  const onPatchItem = async (
    id: string,
    patch: Partial<Pick<ReadinessItem, 'state' | 'note' | 'document_id'>>,
  ) => {
    const before = items;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    try {
      await updateItem(id, patch);
    } catch {
      setItems(before);
      toast.error('Could not save that change');
    }
  };

  const onDeleteItem = async (id: string) => {
    const before = items;
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await deleteItem(id);
    } catch {
      setItems(before);
      toast.error('Could not remove that item');
    }
  };

  if (!FLAGS.readinessWorkspace) return <Navigate to="/dashboard/funding/saved" replace />;

  const percent = readinessPercent(items);
  const idx = stageIndex(stage);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          {/* inline-flex + min-h: as a bare inline link this measured 118x17
              in a browser at 375px, under the 24px WCAG 2.2 minimum. It is a
              standalone navigation control, so the inline-link exemption
              does not apply. */}
          <Link
            to="/dashboard/funding/saved"
            className="inline-flex min-h-[24px] items-center py-1 text-sm text-muted-foreground hover:underline"
          >
            ← Saved matches
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">
            {grant?.name ?? 'Funding readiness'}
          </h1>
          {grant && (
            <p className="text-muted-foreground">
              {grant.funder}
              {grant.deadline ? ` · closes ${new Date(grant.deadline).toLocaleDateString('en-CA')}` : ''}
            </p>
          )}
        </div>

        {loading && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading your workspace…
          </p>
        )}

        {loadError && !loading && (
          <Card>
            <CardContent className="space-y-3 pt-6">
              <p role="alert" className="text-destructive">
                {loadError}. Your saved progress has not been lost.
              </p>
              <Button onClick={() => void load()}>Try again</Button>
            </CardContent>
          </Card>
        )}

        {!loading && !loadError && app && (
          <>
            <nav aria-label="Readiness stages" className="flex flex-wrap gap-2">
              {WORKING_STAGES.map((s) => {
                const done = stageIndex(s) < idx;
                const current = s === stage;
                return (
                  <Button
                    key={s}
                    size="sm"
                    variant={current ? 'default' : done ? 'secondary' : 'outline'}
                    aria-current={current ? 'step' : undefined}
                    disabled={busy}
                    onClick={() => void goToStage(s)}
                  >
                    {done && <Check className="mr-1 h-3 w-3" aria-hidden="true" />}
                    {STAGE_LABELS[s]}
                  </Button>
                );
              })}
            </nav>

            <Card>
              <CardHeader>
                <CardTitle>{STAGE_LABELS[stage]}</CardTitle>
                <CardDescription>{STAGE_HELP[stage]}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground" data-testid="readiness-percent">
                  Readiness: {percent}% ({items.filter((i) => i.state === 'met').length} of {items.length} confirmed)
                </p>

                {kind && (
                  <>
                    <ul className="space-y-3">
                      {stageItems.map((item) => (
                        <li key={item.id} className="rounded-md border p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-medium">{item.label}</span>
                            <div className="flex items-center gap-1">
                              {(['met', 'unmet', 'unknown'] as ItemState[]).map((s) => (
                                <Button
                                  key={s}
                                  size="sm"
                                  variant={item.state === s ? 'default' : 'ghost'}
                                  aria-pressed={item.state === s}
                                  aria-label={`Mark ${item.label} as ${s}`}
                                  onClick={() => void onPatchItem(item.id, { state: s })}
                                >
                                  {ITEM_STATE_ICON[s]}
                                </Button>
                              ))}
                              <Button
                                size="sm"
                                variant="ghost"
                                aria-label={`Remove ${item.label}`}
                                onClick={() => void onDeleteItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </div>
                          </div>

                          {/* Re-select an existing vault document. The whole
                              point of the vault is that a second application
                              reuses a file rather than re-uploading it. */}
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Select
                              value={item.document_id ?? 'none'}
                              onValueChange={(v) =>
                                void onPatchItem(item.id, { document_id: v === 'none' ? null : v })
                              }
                            >
                              <SelectTrigger className="w-full sm:w-64" aria-label={`Attach a document to ${item.label}`}>
                                <SelectValue placeholder="Attach a document" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No document</SelectItem>
                                {docs.map((d) => (
                                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {item.document_id && (
                              <Badge variant="secondary" className="gap-1">
                                <FileText className="h-3 w-3" aria-hidden="true" />
                                Attached
                              </Badge>
                            )}
                          </div>

                          <Textarea
                            className="mt-2"
                            rows={2}
                            placeholder="Notes"
                            aria-label={`Notes for ${item.label}`}
                            defaultValue={item.note ?? ''}
                            onBlur={(e) => {
                              const note = e.target.value;
                              if (note !== (item.note ?? '')) void onPatchItem(item.id, { note });
                            }}
                          />
                        </li>
                      ))}
                    </ul>

                    <div className="flex gap-2">
                      <Input
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        placeholder={
                          stage === 'eligibility' ? 'Add a requirement'
                            : stage === 'missing_info' ? 'Add something you still need'
                            : 'Add a final check'
                        }
                        aria-label="New checklist item"
                      />
                      <Button onClick={() => void onAddItem()} disabled={busy || !newLabel.trim()}>
                        <Plus className="mr-1 h-4 w-4" aria-hidden="true" /> Add
                      </Button>
                    </div>
                  </>
                )}

                {stage === 'documents' && (
                  <p className="text-sm">
                    {docs.length} document{docs.length === 1 ? '' : 's'} in your library.{' '}
                    <Link to="/dashboard/documents" className="underline">Manage your documents</Link>
                    {' '}— attach them to eligibility items without uploading again.
                  </p>
                )}

                {stage === 'tasks' && (
                  <p className="text-sm">
                    <Link to="/dashboard/tasks" className="underline">Open your tasks</Link>
                    {' '}to add deadline reminders for this application.
                  </p>
                )}

                {stage === 'draft' && (
                  <p className="text-sm">
                    <Link to="/dashboard/plan" className="underline">Open the writing assistant</Link>
                    {' '}to draft this application.
                  </p>
                )}

                {stage === 'submission' && grant?.application_url && (
                  <p className="text-sm">
                    <a
                      href={grant.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 underline"
                    >
                      Go to the funder's application form
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReadinessWorkspace;
