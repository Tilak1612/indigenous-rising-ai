import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';
import { readStoredSession } from '@/lib/auth-storage';
import { DEFAULT_SAVED_STATUS } from '@/lib/funding-status';
import { toast } from 'sonner';
import { Bookmark, BookmarkCheck, Sparkles, SlidersHorizontal, Target, Loader2 } from 'lucide-react';
import FundingFiltersPanel from '@/components/funding/FundingFiltersPanel';
import FundingProgramCard from '@/components/funding/FundingProgramCard';
import { PAGE_SIZE, activeFilterCount, fetchPrograms, parseFilters, toSearchParams, type FilterState, type FundingProgram } from '@/lib/funding-catalog';

const REST = `${SUPABASE_URL}/rest/v1`;
const authHeaders = (json = false): Record<string, string> => {
  const token = readStoredSession()?.access_token ?? SUPABASE_ANON_KEY;
  const h: Record<string, string> = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
};

/**
 * Dashboard Funding Navigator: the same catalogue, filters and cards as the
 * public directory, plus Save. Browsing is a FREE feature (plans.ts lists
 * "Funding opportunity browser" on the free plan); this page used to show
 * an upgrade wall, fabricated stats ("$2.1M available", "85% avg match
 * score") and filters on values the data does not have. Saving and the
 * readiness workspace stay on Growth, as the pricing page says.
 */
export default function Funding() {
  const { user } = useAuth();
  const { subscribed } = useSubscription();
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(params), [params]);
  const [data, setData] = useState<{ rows: FundingProgram[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    fetchPrograms(filters, ac.signal)
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { if (ac.signal.aborted) return; setError((e as Error).message); setData({ rows: [], total: 0 }); setLoading(false); });
    return () => ac.abort();
  }, [filters]);

  useEffect(() => {
    if (!user) return;
    fetch(`${REST}/funding_saved_matches?select=grant_id&user_id=eq.${user.id}`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: { grant_id: string }[]) => setSavedIds(new Set(rows.map((r) => r.grant_id))))
      .catch(() => undefined);
  }, [user]);

  const toggleSaved = async (g: FundingProgram) => {
    if (!user) return;
    const nowSaved = !savedIds.has(g.id);
    setSavedIds((prev) => { const n = new Set(prev); if (nowSaved) n.add(g.id); else n.delete(g.id); return n; });
    const res = nowSaved
      ? await fetch(`${REST}/funding_saved_matches?on_conflict=user_id,grant_id`, { method: 'POST', headers: { ...authHeaders(true), Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ user_id: user.id, grant_id: g.id, status: DEFAULT_SAVED_STATUS }) })
      : await fetch(`${REST}/funding_saved_matches?user_id=eq.${user.id}&grant_id=eq.${g.id}`, { method: 'DELETE', headers: authHeaders() });
    if (!res.ok) {
      setSavedIds((prev) => { const n = new Set(prev); if (nowSaved) n.delete(g.id); else n.add(g.id); return n; });
      toast.error(nowSaved ? 'Could not save. Please try again.' : 'Could not remove. Please try again.');
      return;
    }
    toast.success(nowSaved ? 'Saved. Find it under Saved Matches.' : 'Removed from saved');
  };

  const update = (next: FilterState) => setParams(toSearchParams(next));
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Funding Navigator</h1>
            <p className="text-muted-foreground mt-1">Browse every published programme. Each card shows the kind of money, who may apply, the funder&apos;s published amount and when we last read the funder&apos;s page.</p>
          </div>
          <Button asChild>
            <Link to="/dashboard/funding/matches">
              <Sparkles className="h-4 w-4 mr-2" />
              Match me to funding
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-4"><Target className="h-6 w-6 text-primary" /><div><p className="text-2xl font-bold">{loading ? '—' : total}</p><p className="text-sm text-muted-foreground">{activeFilterCount(filters) ? 'Programmes matching your filters' : 'Programmes in the directory'}</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-4"><BookmarkCheck className="h-6 w-6 text-primary" /><div><p className="text-2xl font-bold">{savedIds.size}</p><p className="text-sm text-muted-foreground">Saved</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-4"><Bookmark className="h-6 w-6 text-primary" /><div><p className="text-sm text-foreground">{subscribed ? 'Saving and readiness checklists are on.' : 'Saving and readiness checklists are on Growth.'}</p>{!subscribed && <Link to="/pricing" className="text-sm text-primary underline">See plans</Link>}</div></CardContent></Card>
        </div>

        {/* One filter control at every width (the dashboard viewport-parity
            guard forbids hiding features by breakpoint). */}
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-6">
          <div className="mb-4 lg:mb-0">
            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full"><SlidersHorizontal className="w-4 h-4 mr-2" aria-hidden="true" />{filtersOpen ? 'Hide filters' : `Filters${activeFilterCount(filters) ? ` (${activeFilterCount(filters)})` : ''}`}</Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4"><FundingFiltersPanel value={filters} onChange={update} /></CollapsibleContent>
            </Collapsible>
          </div>
          <div>
            {loading ? (
              <div className="flex items-center justify-center h-40" role="status">
                <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
                <span className="sr-only">Loading funding programmes</span>
              </div>
            ) : error ? (
              <p className="text-sm text-destructive" role="alert">We couldn&apos;t load funding programmes. {error}</p>
            ) : total === 0 ? (
              <p className="text-sm text-muted-foreground">No programmes match those filters. Try fewer filters; national programmes apply in every province.</p>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {data!.rows.map((g) => (
                  <FundingProgramCard
                    key={g.id}
                    program={g}
                    action={
                      subscribed ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-pressed={savedIds.has(g.id)}
                          aria-label={`${savedIds.has(g.id) ? 'Unsave' : 'Save'} ${g.name}`}
                          className="h-11 w-11 p-0 self-end"
                          onClick={() => toggleSaved(g)}
                        >
                          {savedIds.has(g.id) ? <BookmarkCheck className="h-5 w-5 text-primary" aria-hidden="true" /> : <Bookmark className="h-5 w-5" aria-hidden="true" />}
                        </Button>
                      ) : null
                    }
                  />
                ))}
              </div>
            )}
            {pages > 1 && (
              <nav className="flex items-center justify-center gap-2 mt-6" aria-label="Pagination">
                {filters.page > 1 && <Button variant="outline" size="sm" onClick={() => update({ ...filters, page: filters.page - 1 })}>Previous</Button>}
                <span className="text-sm text-muted-foreground">Page {filters.page} of {pages}</span>
                {filters.page < pages && <Button variant="outline" size="sm" onClick={() => update({ ...filters, page: filters.page + 1 })}>Next</Button>}
              </nav>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
