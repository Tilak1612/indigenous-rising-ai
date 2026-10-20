import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  cancelAccountDeletion,
  DELETION_GRACE_DAYS,
  formatDeletionDate,
  getDeletionRequest,
  requestAccountDeletion,
  type DeletionRequest,
} from '@/lib/accountDeletion';

interface Props {
  userId: string | null;
  /** Called after a deletion is scheduled; the caller signs the user out. */
  onRequested: () => void;
}

/**
 * Self-serve deletion with a typed confirmation and a visible grace period.
 * Nothing is destroyed on click: the account is scheduled, keeps working for
 * 30 days, and signing in again lets the user cancel from this same card.
 */
export default function AccountDeletionCard({ userId, onRequested }: Props) {
  const [pending, setPending] = useState<DeletionRequest | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    getDeletionRequest(userId)
      .then((r) => active && setPending(r))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [userId]);

  const schedule = async () => {
    if (!userId) return;
    setBusy(true);
    setError(null);
    try {
      await requestAccountDeletion(userId);
      onRequested();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!userId) return;
    setBusy(true);
    setError(null);
    try {
      await cancelAccountDeletion(userId);
      setPending(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (pending) {
    return (
      <div className="w-full space-y-3">
        <p className="font-medium">Deletion scheduled</p>
        <p className="text-sm text-muted-foreground">
          Your account and the data attached to it will be permanently deleted on{' '}
          <strong>{formatDeletionDate(pending.scheduled_for)}</strong>. Until then everything keeps
          working, and you can cancel here.
        </p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button variant="outline" onClick={cancel} disabled={busy}>
          Cancel deletion
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      <div>
        <p className="font-medium">Delete your account</p>
        <p className="text-sm text-muted-foreground">
          Deletion is scheduled {DELETION_GRACE_DAYS} days out and can be cancelled by signing in before
          then. After that your account, profile, plans, documents and saved funding are permanently
          deleted; payment records are kept as Canadian tax law requires and community posts stay with
          your name removed. Export your data first if you want a copy. Details:{' '}
          <Link to="/account-deletion" className="underline">
            account deletion
          </Link>
          .
        </p>
      </div>
      {confirming ? (
        <div className="space-y-2">
          <label htmlFor="confirm-delete" className="text-sm">
            Type <strong>DELETE</strong> to confirm
          </label>
          <Input
            id="confirm-delete"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            className="max-w-xs"
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-2">
            <Button variant="destructive" onClick={schedule} disabled={busy || typed !== 'DELETE'}>
              <Trash2 className="h-4 w-4 mr-2" />
              Schedule deletion
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(false)} disabled={busy}>
              Keep my account
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setConfirming(true)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete my account
        </Button>
      )}
    </div>
  );
}
