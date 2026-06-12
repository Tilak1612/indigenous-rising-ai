import React, { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Shield, Lock, LogOut, Mail, Activity, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { readStoredSession } from '@/lib/auth-storage';
import { toast } from 'sonner';

// Security Center — honest and functional. No fabricated "security score",
// fake 2FA toggles, or invented recovery codes / audit entries. Password change
// and global sign-out go through the GoTrue auth endpoint via direct-fetch;
// recent activity reads the real owner-scoped public.audit_logs table.

const REST = `${SUPABASE_URL}/rest/v1`;
const AUTH = `${SUPABASE_URL}/auth/v1`;

const authHeaders = (json = false): Record<string, string> => {
  const token = readStoredSession()?.access_token ?? SUPABASE_ANON_KEY;
  const h: Record<string, string> = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
};

interface AuditLog {
  id: string;
  action: string;
  entity_type: string | null;
  created_at: string;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' });

export default function Security() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // password change
  const [pwOpen, setPwOpen] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [changing, setChanging] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const loadLogs = useCallback(async () => {
    if (!user) return;
    setLoadingLogs(true);
    try {
      const res = await fetch(
        `${REST}/audit_logs?select=id,action,entity_type,created_at&user_id=eq.${user.id}&order=created_at.desc&limit=20`,
        { headers: authHeaders() }
      );
      if (!res.ok) throw new Error('load failed');
      setLogs((await res.json()) as AuditLog[]);
    } catch {
      // soft-fail; show empty state
    } finally {
      setLoadingLogs(false);
    }
  }, [user]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const changePassword = async () => {
    if (newPw.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPw !== confirmPw) {
      toast.error('Passwords do not match');
      return;
    }
    setChanging(true);
    try {
      // GoTrue: update the signed-in user's password (session is the auth).
      const res = await fetch(`${AUTH}/user`, {
        method: 'PUT',
        headers: authHeaders(true),
        body: JSON.stringify({ password: newPw }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.msg || body?.error_description || 'update failed');
      }
      setNewPw(''); setConfirmPw(''); setPwOpen(false);
      toast.success('Password updated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update password');
    } finally {
      setChanging(false);
    }
  };

  const signOutEverywhere = async () => {
    setSigningOut(true);
    try {
      await fetch(`${AUTH}/logout?scope=global`, { method: 'POST', headers: authHeaders() });
      toast.success('Signed out of all sessions');
      // clear local session and return to auth
      const k = Object.keys(localStorage).find((x) => x.includes('auth-token'));
      if (k) localStorage.removeItem(k);
      window.location.href = '/auth';
    } catch {
      toast.error('Could not sign out of all sessions');
      setSigningOut(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Security Center</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account security and review recent activity.
          </p>
        </div>

        {/* Account security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Account
            </CardTitle>
            <CardDescription>Your sign-in details and account-level actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Signed in as</span>
              <span className="font-medium">{user?.email ?? '—'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Change password */}
              <Dialog open={pwOpen} onOpenChange={setPwOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full gap-2">
                    <Lock className="h-4 w-4" /> Change password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change password</DialogTitle>
                    <DialogDescription>
                      Choose a new password (at least 8 characters). You&apos;ll stay signed in on this device.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="text-sm font-medium" htmlFor="new-pw">New password</label>
                      <Input id="new-pw" type="password" className="mt-1" value={newPw}
                        onChange={(e) => setNewPw(e.target.value)} autoComplete="new-password" />
                    </div>
                    <div>
                      <label className="text-sm font-medium" htmlFor="confirm-pw">Confirm password</label>
                      <Input id="confirm-pw" type="password" className="mt-1" value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)} autoComplete="new-password" />
                    </div>
                    <Button className="w-full" onClick={changePassword} disabled={changing}>
                      {changing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      {changing ? 'Updating…' : 'Update password'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Sign out everywhere */}
              <Button variant="outline" className="w-full gap-2" onClick={signOutEverywhere} disabled={signingOut}>
                {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                Sign out of all sessions
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Signing out of all sessions ends your sign-in on every device, including this one.
            </p>
          </CardContent>
        </Card>

        {/* Recent activity (real audit_logs) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" /> Recent activity
            </CardTitle>
            <CardDescription>Security-related events recorded on your account.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingLogs ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Activity className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No activity recorded yet.</p>
                <p className="text-sm mt-1">Account events will appear here as they happen.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{log.action}</p>
                        {log.entity_type && (
                          <p className="text-xs text-muted-foreground">{log.entity_type}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{fmt(log.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
