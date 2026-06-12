import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { readStoredSession } from '@/lib/auth-storage';

// Real notifications backed by the public.notifications table. All I/O is
// direct-fetch with the user's token (the supabase-js query path can hang on
// this project); owner-scoped RLS (user_id = auth.uid()) keeps reads/writes
// scoped to the signed-in user.

const REST = `${SUPABASE_URL}/rest/v1`;

const authHeaders = (json = false): Record<string, string> => {
  const token = readStoredSession()?.access_token ?? SUPABASE_ANON_KEY;
  const h: Record<string, string> = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
};

export type Notification = {
  id: string;
  type: string;
  title: string | null;
  message: string;
  read: boolean;
  created_at: string;
};

export function useNotifications(pollMs = 60000) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `${REST}/notifications?select=id,type,title,message,read,created_at&user_id=eq.${user.id}&order=created_at.desc&limit=20`,
        { headers: authHeaders() }
      );
      if (!res.ok) throw new Error('load failed');
      setNotifications((await res.json()) as Notification[]);
    } catch {
      // soft-fail: a transient fetch error shouldn't break the dashboard chrome
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
    if (!user || !pollMs) return;
    const id = window.setInterval(load, pollMs);
    return () => window.clearInterval(id);
  }, [load, user, pollMs]);

  const unreadCount = notifications.reduce((n, x) => (x.read ? n : n + 1), 0);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch(`${REST}/notifications?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...authHeaders(true), Prefer: 'return=minimal' },
        body: JSON.stringify({ read: true }),
      });
    } catch {
      /* optimistic; next poll reconciles */
    }
  }, []);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    const hadUnread = notifications.some((n) => !n.read);
    if (!hadUnread) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch(`${REST}/notifications?user_id=eq.${user.id}&read=eq.false`, {
        method: 'PATCH',
        headers: { ...authHeaders(true), Prefer: 'return=minimal' },
        body: JSON.stringify({ read: true }),
      });
    } catch {
      /* optimistic; next poll reconciles */
    }
  }, [user, notifications]);

  return { notifications, unreadCount, loading, markRead, markAllRead, reload: load };
}
