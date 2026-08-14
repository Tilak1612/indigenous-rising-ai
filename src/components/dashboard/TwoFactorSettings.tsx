import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldOff, Loader2, Copy, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Real two-factor authentication via Supabase GoTrue MFA (TOTP).
//
// This is genuine 2FA, not a decorative toggle: enrolling calls
// supabase.auth.mfa.enroll() to get a real TOTP secret + QR, and the factor is
// only activated after the user proves they can generate a valid code
// (challenge + verify). Nothing is faked — if enrollment fails we surface the
// actual error rather than pretending it worked.
//
// Note: TOTP must also be enabled for the project in Supabase
// (Authentication -> Multi-Factor Auth). If it is disabled, enroll() returns an
// error and we show it plainly instead of a broken-looking toggle.

interface Factor {
  id: string;
  status: string;
  friendly_name?: string;
}

type Enrolling = {
  factorId: string;
  qrSvg: string;
  secret: string;
};

export function TwoFactorSettings() {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState<Factor[]>([]);
  const [enrolling, setEnrolling] = useState<Enrolling | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      // listFactors() returns only verified factors in `totp`.
      setVerified((data?.totp ?? []) as Factor[]);
    } catch (e) {
      console.error('[2FA] listFactors failed:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const startEnrollment = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}`,
      });
      if (error) throw error;
      setEnrolling({
        factorId: data.id,
        qrSvg: data.totp.qr_code,
        secret: data.totp.secret,
      });
      setCode('');
    } catch (e) {
      // Surface the real reason (e.g. TOTP disabled for the project) — never
      // pretend enrollment succeeded.
      toast.error(e instanceof Error ? e.message : 'Could not start 2FA setup');
    } finally {
      setBusy(false);
    }
  };

  const confirmEnrollment = async () => {
    if (!enrolling) return;
    if (!/^\d{6}$/.test(code.trim())) {
      toast.error('Enter the 6-digit code from your authenticator app');
      return;
    }
    setBusy(true);
    try {
      const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({
        factorId: enrolling.factorId,
      });
      if (chErr) throw chErr;
      const { error: vErr } = await supabase.auth.mfa.verify({
        factorId: enrolling.factorId,
        challengeId: ch.id,
        code: code.trim(),
      });
      if (vErr) throw vErr;
      toast.success('Two-factor authentication is on');
      setEnrolling(null);
      setCode('');
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'That code did not verify — try again');
    } finally {
      setBusy(false);
    }
  };

  const cancelEnrollment = async () => {
    if (!enrolling) return;
    // Remove the unverified factor so repeated cancels don't pile up.
    try { await supabase.auth.mfa.unenroll({ factorId: enrolling.factorId }); } catch { /* best effort */ }
    setEnrolling(null);
    setCode('');
  };

  const disable = async (factorId: string) => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      toast.success('Two-factor authentication turned off');
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not turn off 2FA');
    } finally {
      setBusy(false);
    }
  };

  const copySecret = async () => {
    if (!enrolling) return;
    try {
      await navigator.clipboard.writeText(enrolling.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy — select the code manually');
    }
  };

  const isOn = verified.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isOn ? <ShieldCheck className="h-5 w-5 text-primary" /> : <ShieldOff className="h-5 w-5 text-muted-foreground" />}
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Add a second step at sign-in using an authenticator app (Google Authenticator, 1Password, Authy).
            </CardDescription>
          </div>
          {!loading && (
            <Badge variant={isOn ? 'default' : 'outline'} className={isOn ? 'bg-primary/10 text-primary border-primary/30 border' : ''}>
              {isOn ? 'On' : 'Off'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center text-sm text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Checking status…
          </div>
        ) : enrolling ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your authenticator app, then enter the 6-digit code it shows.
            </p>
            {/* qr_code is an SVG data-URI returned by Supabase */}
            <img
              src={enrolling.qrSvg}
              alt="QR code for setting up two-factor authentication"
              className="w-44 h-44 bg-white rounded-lg border border-border p-2"
            />
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Can&apos;t scan? Enter this key manually:</Label>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1.5 rounded font-mono break-all flex-1">
                  {enrolling.secret}
                </code>
                <Button type="button" variant="outline" size="sm" onClick={copySecret} aria-label="Copy setup key">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="totp-code" className="text-sm font-medium">6-digit code</Label>
              <Input
                id="totp-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="font-mono tracking-widest max-w-[10rem]"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={confirmEnrollment} disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Verify and turn on
              </Button>
              <Button variant="outline" onClick={cancelEnrollment} disabled={busy}>
                Cancel
              </Button>
            </div>
          </div>
        ) : isOn ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Two-factor authentication is protecting your account. You&apos;ll be asked for a code from your
              authenticator app when you sign in.
            </p>
            {verified.map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-3 p-3 border rounded-lg">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{f.friendly_name || 'Authenticator app'}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => disable(f.id)} disabled={busy}>
                  {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Turn off
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Two-factor authentication is off. Turning it on means someone who learns your password still
              can&apos;t get into your account without your phone.
            </p>
            <Button onClick={startEnrollment} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Set up two-factor authentication
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TwoFactorSettings;
