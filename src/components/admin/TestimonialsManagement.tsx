import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import {
  listAllTestimonials, updateTestimonial, isPublishable, type Testimonial,
} from '@/lib/testimonials';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

/**
 * Testimonial review queue.
 *
 * Two separate gates, both required before anything is public:
 *   consent  — the customer agreed, in writing, to be quoted
 *   approval — someone here checked the quote against that agreement
 *
 * The Publish control stays disabled until both hold. That is a
 * convenience, not the safeguard: RLS restricts this whole table to
 * admins, and a CHECK constraint refuses a published row without a
 * recorded approver and timestamp even with RLS bypassed.
 */

const badgeFor = (value: string) => {
  if (value === 'granted' || value === 'approved' || value === 'published') return 'default';
  if (value === 'withdrawn' || value === 'rejected') return 'destructive';
  return 'secondary';
};

const TestimonialsManagement: React.FC = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      setRows(await listAllTestimonials());
    } catch (err) {
      console.error('[TestimonialsManagement] load failed:', err);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const patch = async (row: Testimonial, next: Parameters<typeof updateTestimonial>[1]) => {
    setBusyId(row.id);
    try {
      await updateTestimonial(row.id, next, user?.id);
      await load();
      toast.success('Updated');
    } catch (err) {
      // Surfaced, never swallowed: a silent failure here would leave the
      // reviewer believing something was approved when it was not.
      toast.error(err instanceof Error ? err.message : 'Could not update');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Testimonials</CardTitle>
        <CardDescription>
          Nothing is public until consent is recorded and the quote is approved.
          Publish stays disabled until both are in place.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading…
          </p>
        )}

        {failed && !loading && (
          <div className="space-y-2">
            <p role="alert" className="text-destructive">Could not load the queue.</p>
            <Button size="sm" onClick={() => void load()}>Try again</Button>
          </div>
        )}

        {!loading && !failed && rows.length === 0 && (
          <p className="text-muted-foreground">
            No testimonials submitted yet. Nothing is shown on the public site.
          </p>
        )}

        {!loading && !failed && rows.map((row) => {
          const publishable = isPublishable(row);
          const busy = busyId === row.id;
          return (
            <div key={row.id} className="space-y-3 rounded-md border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium">{row.customer_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {[row.role, row.company, row.location].filter(Boolean).join(' · ') || '—'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant={badgeFor(row.consent_status)}>consent: {row.consent_status}</Badge>
                  <Badge variant={badgeFor(row.approval_status)}>review: {row.approval_status}</Badge>
                  <Badge variant={badgeFor(row.publish_status)}>{row.publish_status}</Badge>
                </div>
              </div>

              <blockquote className="border-l-2 pl-3 text-sm text-muted-foreground">
                &ldquo;{row.quote}&rdquo;
              </blockquote>
              {row.verified_metric && <p className="text-sm">Outcome: {row.verified_metric}</p>}
              <p className="text-xs text-muted-foreground">
                Source: {row.source || 'not recorded'}
                {row.approved_at && ` · approved ${new Date(row.approved_at).toLocaleDateString('en-CA')}`}
              </p>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" disabled={busy}
                  onClick={() => void patch(row, { consent_status: 'granted' })}>
                  Record consent
                </Button>
                <Button size="sm" variant="outline" disabled={busy}
                  onClick={() => void patch(row, { consent_status: 'withdrawn', publish_status: 'unpublished' })}>
                  Consent withdrawn
                </Button>
                <Button size="sm" variant="outline" disabled={busy}
                  onClick={() => void patch(row, { approval_status: 'approved' })}>
                  Approve quote
                </Button>
                <Button size="sm" variant="outline" disabled={busy}
                  onClick={() => void patch(row, { approval_status: 'rejected', publish_status: 'unpublished' })}>
                  Reject
                </Button>
                <Button
                  size="sm"
                  disabled={busy || !publishable || row.publish_status === 'published'}
                  title={publishable ? undefined : 'Needs recorded consent and an approved quote first'}
                  onClick={() => void patch(row, { publish_status: 'published' })}
                >
                  Publish
                </Button>
                {row.publish_status === 'published' && (
                  <Button size="sm" variant="destructive" disabled={busy}
                    onClick={() => void patch(row, { publish_status: 'unpublished' })}>
                    Unpublish
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default TestimonialsManagement;
