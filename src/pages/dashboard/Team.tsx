import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, UserPlus, Mail, Trash2, Loader2, Crown } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { readStoredSession } from '@/lib/auth-storage';
import { toast } from 'sonner';

// Team — honest version. We do NOT show fabricated members or claim seats/email
// we don't have. The signed-in user is the real owner; invitations are recorded
// in the owner-scoped public.team_invitations table (direct-fetch). Org-wide
// shared access is a separate feature still rolling out, stated plainly below.

const REST = `${SUPABASE_URL}/rest/v1`;

const authHeaders = (json = false): Record<string, string> => {
  const token = readStoredSession()?.access_token ?? SUPABASE_ANON_KEY;
  const h: Record<string, string> = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
};

type Role = 'admin' | 'member' | 'viewer';
type Status = 'pending' | 'accepted' | 'revoked';

interface Invitation {
  id: string;
  email: string;
  role: Role;
  status: Status;
  created_at: string;
}

const roleColors: Record<string, string> = {
  owner: 'bg-warning',
  admin: 'bg-primary',
  member: 'bg-success',
  viewer: 'bg-muted-foreground',
};

const initials = (s: string) => s.split(/[ @.]/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export default function Team() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('member');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${REST}/team_invitations?select=id,email,role,status,created_at&owner_id=eq.${user.id}&order=created_at.desc`,
        { headers: authHeaders() }
      );
      if (!res.ok) throw new Error('load failed');
      setInvites((await res.json()) as Invitation[]);
    } catch {
      toast.error('Could not load invitations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const invite = async () => {
    if (!user) return;
    const email = inviteEmail.trim().toLowerCase();
    if (!isEmail(email)) {
      toast.error('Enter a valid email address');
      return;
    }
    if (email === user.email?.toLowerCase()) {
      toast.error('That\'s you — you\'re already the owner');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${REST}/team_invitations`, {
        method: 'POST',
        headers: { ...authHeaders(true), Prefer: 'return=representation' },
        body: JSON.stringify({ owner_id: user.id, email, role: inviteRole, status: 'pending' }),
      });
      if (res.status === 409) {
        toast.error('You\'ve already invited that email');
        return;
      }
      if (!res.ok) throw new Error('insert failed');
      const [created] = (await res.json()) as Invitation[];
      setInvites((prev) => [created, ...prev]);
      setInviteEmail(''); setInviteRole('member');
      toast.success('Invitation added');
    } catch {
      toast.error('Could not add the invitation');
    } finally {
      setSubmitting(false);
    }
  };

  const revoke = async (inv: Invitation) => {
    const prev = invites;
    setInvites((p) => p.filter((i) => i.id !== inv.id));
    try {
      const res = await fetch(`${REST}/team_invitations?id=eq.${inv.id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error('delete failed');
      toast.success('Invitation removed');
    } catch {
      setInvites(prev);
      toast.error('Could not remove the invitation');
    }
  };

  const pendingCount = useMemo(() => invites.filter((i) => i.status === 'pending').length, [invites]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground mt-1">
            Invite people to your account and manage their invitations.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Owner</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending invitations</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{invites.length}</p>
                <p className="text-sm text-muted-foreground">Total invitations</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invite form */}
        <Card>
          <CardHeader>
            <CardTitle>Invite a team member</CardTitle>
            <CardDescription>
              Record an invitation by email and role. Shared access across your account is part of
              team collaboration we&apos;re rolling out — we&apos;ll keep your invitations here in the meantime.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); invite(); } }}
                />
              </div>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
                <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={invite} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Add invitation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* People */}
        <Card>
          <CardHeader>
            <CardTitle>Your team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {/* Real owner = the signed-in user */}
              <div className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {initials(user?.email ?? '?')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user?.email ?? 'You'}</p>
                      <Badge className={roleColors.owner} variant="secondary">
                        <Crown className="h-3 w-3 mr-1" /> owner
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">You</p>
                  </div>
                </div>
              </div>

              {/* Invitations */}
              {loading ? (
                <div className="py-8 flex items-center justify-center text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
                </div>
              ) : (
                invites.map((inv) => (
                  <div key={inv.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-muted text-muted-foreground">{initials(inv.email)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{inv.email}</p>
                          <Badge className={roleColors[inv.role]} variant="secondary">{inv.role}</Badge>
                          <Badge variant="outline" className="capitalize">{inv.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Invited {new Date(inv.created_at).toLocaleDateString('en-CA')}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" aria-label="Remove invitation" onClick={() => revoke(inv)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}

              {!loading && invites.length === 0 && (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No invitations yet. Add one above to start building your team.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
