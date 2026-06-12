import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  ArrowRight,
  Bookmark,
  Calendar,
  DollarSign,
  ExternalLink,
  Loader2,
  Sparkles,
  Trash2,
} from 'lucide-react';

type Status = 'interested' | 'applied' | 'pending' | 'awarded' | 'declined' | 'withdrawn';

interface SavedRow {
  id: string;
  grant_id: string;
  status: Status;
  notes: string | null;
  saved_at: string;
  updated_at: string;
  grants: {
    name: string;
    funder: string;
    amount_min: number | null;
    amount_max: number | null;
    amount_currency: string;
    deadline: string | null;
    is_recurring: boolean;
    application_url: string;
  } | null;
}

const STATUSES: { value: Status; label: string; color: string }[] = [
  { value: 'interested', label: 'Interested', color: 'bg-muted text-foreground' },
  { value: 'applied', label: 'Applied', color: 'bg-primary/10 text-primary border-primary/30' },
  { value: 'pending', label: 'Pending review', color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30' },
  { value: 'awarded', label: 'Awarded', color: 'bg-success/10 text-success border-success/30' },
  { value: 'declined', label: 'Declined', color: 'bg-destructive/10 text-destructive border-destructive/30' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'bg-muted text-muted-foreground' },
];

function statusMeta(status: Status) {
  return STATUSES.find((s) => s.value === status) ?? STATUSES[0];
}

function formatAmount(g: NonNullable<SavedRow['grants']>): string {
  if (!g.amount_min && !g.amount_max) return 'Amount varies';
  const fmt = (n: number) => '$' + n.toLocaleString('en-CA');
  if (g.amount_min && g.amount_max && g.amount_min !== g.amount_max) {
    return `${fmt(g.amount_min)} – ${fmt(g.amount_max)}`;
  }
  return `Up to ${fmt(g.amount_max ?? g.amount_min ?? 0)}`;
}

function formatDeadline(g: NonNullable<SavedRow['grants']>): string {
  if (g.is_recurring && !g.deadline) return 'Rolling intake';
  if (!g.deadline) return 'No deadline';
  const d = new Date(g.deadline);
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

const SavedMatches: React.FC = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<SavedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('funding_saved_matches')
        .select('id, grant_id, status, notes, saved_at, updated_at, grants (name, funder, amount_min, amount_max, amount_currency, deadline, is_recurring, application_url)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setRows((data as unknown as SavedRow[]) || []);
    } catch (err) {
      console.error('Load saved matches error:', err);
      toast.error('Could not load saved matches');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: Status) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('funding_saved_matches')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success('Status updated');
    } catch (err) {
      console.error('Update status error:', err);
      toast.error('Could not update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteRow = async (id: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('funding_saved_matches')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success('Removed from saved matches');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Could not remove');
    } finally {
      setUpdatingId(null);
    }
  };

  // Group by status for the summary bar
  const statusCounts = STATUSES.map((s) => ({
    ...s,
    count: rows.filter((r) => r.status === s.value).length,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Saved matches</h1>
            <p className="text-muted-foreground mt-1">
              Track your funding application pipeline
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/dashboard/funding/matches">
              <Sparkles className="w-4 h-4 mr-2" />
              Find more matches
            </Link>
          </Button>
        </div>

        {/* Status summary */}
        {rows.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {statusCounts.map((s) => (
              <Card key={s.value}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{s.count}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!loading && rows.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Bookmark className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">No saved matches yet</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Run matching from the Find Matches page and save the grants you are interested in. You can track each application through interested → applied → awarded.
                </p>
              </div>
              <Button asChild>
                <Link to="/dashboard/funding/matches">
                  Find my matches
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Saved rows */}
        {!loading && rows.length > 0 && (
          <div className="space-y-4">
            {rows.map((row) => {
              const g = row.grants;
              if (!g) return null;
              const meta = statusMeta(row.status);
              return (
                <Card key={row.id} className="hover:border-primary/30 transition-colors">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-snug">{g.name}</CardTitle>
                        <CardDescription className="mt-1">{g.funder}</CardDescription>
                      </div>
                      <Badge variant="outline" className={meta.color}>
                        {meta.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {formatAmount(g)}
                      </Badge>
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDeadline(g)}
                      </Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-muted-foreground block mb-1">
                          Application status
                        </label>
                        <Select
                          value={row.status}
                          onValueChange={(v) => updateStatus(row.id, v as Status)}
                          disabled={updatingId === row.id}
                        >
                          <SelectTrigger className="w-full sm:w-60">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <a href={g.application_url} target="_blank" rel="noopener noreferrer">
                            Apply
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteRow(row.id)}
                          disabled={updatingId === row.id}
                        >
                          {updatingId === row.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SavedMatches;
