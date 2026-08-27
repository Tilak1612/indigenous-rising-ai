import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { SUPABASE_URL } from '@/lib/supabase';
import { FLAGS } from '@/lib/flags';
import {
  authHeaders, listApplications, STAGE_LABELS, WORKING_STAGES, stageIndex,
  type FundingApplication,
} from '@/lib/readiness';
import { Loader2 } from 'lucide-react';

// Dashboard listing of every in-progress application and the stage each
// one is at, so work in flight is visible without opening each workspace.

const REST = `${SUPABASE_URL}/rest/v1`;

type Row = FundingApplication & { grantName: string; funder: string };

const InProgressApplications: React.FC = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    // The early return below happens after hooks run, so without this the
    // flag-off build still issues a request for data it never renders.
    if (!user || !FLAGS.readinessWorkspace) return;
    setLoading(true);
    setFailed(false);
    try {
      const apps = await listApplications(user.id);
      if (!apps.length) { setRows([]); return; }
      // One request for the names rather than one per application.
      const ids = apps.map((a) => a.grant_id).join(',');
      const res = await fetch(
        `${REST}/grants?select=id,name,funder&id=in.(${ids})`,
        { headers: authHeaders() },
      );
      const grants = res.ok ? ((await res.json()) as { id: string; name: string; funder: string }[]) : [];
      const byId = new Map(grants.map((g) => [g.id, g]));
      setRows(apps.map((a) => ({
        ...a,
        grantName: byId.get(a.grant_id)?.name ?? 'Funding programme',
        funder: byId.get(a.grant_id)?.funder ?? '',
      })));
    } catch {
      // An empty list and a failed load look identical to the user, and
      // "you have no applications" is the more alarming of the two.
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  if (!FLAGS.readinessWorkspace) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications in progress</CardTitle>
        <CardDescription>Pick up where you left off.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading…
          </p>
        )}

        {failed && !loading && (
          <div className="space-y-2">
            <p role="alert" className="text-destructive">
              Could not load your applications. Nothing has been lost.
            </p>
            <Button size="sm" onClick={() => void load()}>Try again</Button>
          </div>
        )}

        {!loading && !failed && rows.length === 0 && (
          <p className="text-muted-foreground">
            No applications started yet. Open a saved match to begin.
          </p>
        )}

        {!loading && !failed && rows.length > 0 && (
          <ul className="space-y-3">
            {rows.map((r) => {
              const step = stageIndex(r.stage) + 1;
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.grantName}</p>
                    {r.funder && <p className="truncate text-sm text-muted-foreground">{r.funder}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={r.stage === 'submitted' ? 'default' : 'secondary'}>
                      {r.stage === 'submitted'
                        ? 'Submitted'
                        : `${STAGE_LABELS[r.stage]} · step ${step} of ${WORKING_STAGES.length}`}
                    </Badge>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/dashboard/funding/readiness/${r.grant_id}`}>
                        Continue
                      </Link>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default InProgressApplications;
