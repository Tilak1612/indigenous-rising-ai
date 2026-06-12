import React, { useCallback, useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { readStoredSession } from '@/lib/auth-storage';
import { toast } from 'sonner';
import { Sparkles, Send, Loader2, Bot, User as UserIcon, Info } from 'lucide-react';

// AI Assistant — chat backed by ai_chat_sessions / ai_chat_messages (direct-fetch,
// owner-scoped RLS). Replies come from the ai-assistant edge function, which
// degrades honestly when no OpenAI key is configured. Conversation history
// persists per user.

const REST = `${SUPABASE_URL}/rest/v1`;
const FN = `${SUPABASE_URL}/functions/v1/ai-assistant`;

const token = () => readStoredSession()?.access_token ?? SUPABASE_ANON_KEY;
const restHeaders = (json = false): Record<string, string> => {
  const h: Record<string, string> = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token()}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
};

type Role = 'user' | 'assistant';
interface Message {
  id?: string;
  role: Role;
  content: string;
  created_at?: string;
}

const SUGGESTIONS = [
  'What should go in my business plan?',
  'How do I prepare for a grant application?',
  'Explain OCAP® in simple terms.',
  'What documents do funders usually ask for?',
];

export default function Assistant() {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Find-or-create the user's chat session, then load its messages.
  const init = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const sres = await fetch(
        `${REST}/ai_chat_sessions?select=id&user_id=eq.${user.id}&order=updated_at.desc&limit=1`,
        { headers: restHeaders() }
      );
      let sid: string | null = null;
      if (sres.ok) {
        const rows = (await sres.json()) as { id: string }[];
        sid = rows[0]?.id ?? null;
      }
      if (!sid) {
        const cres = await fetch(`${REST}/ai_chat_sessions`, {
          method: 'POST',
          headers: { ...restHeaders(true), Prefer: 'return=representation' },
          body: JSON.stringify({ user_id: user.id, title: 'New chat' }),
        });
        if (!cres.ok) throw new Error('session create failed');
        sid = ((await cres.json()) as { id: string }[])[0].id;
      }
      setSessionId(sid);

      const mres = await fetch(
        `${REST}/ai_chat_messages?select=id,role,content,created_at&session_id=eq.${sid}&order=created_at.asc`,
        { headers: restHeaders() }
      );
      if (mres.ok) {
        const rows = (await mres.json()) as Message[];
        setMessages(rows.filter((m) => m.role === 'user' || m.role === 'assistant'));
      }
    } catch {
      toast.error('Could not load your chat history');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const persist = async (sid: string, role: Role, content: string) => {
    if (!user) return;
    try {
      await fetch(`${REST}/ai_chat_messages`, {
        method: 'POST',
        headers: { ...restHeaders(true), Prefer: 'return=minimal' },
        body: JSON.stringify({ session_id: sid, user_id: user.id, role, content }),
      });
    } catch {
      /* non-fatal: the message still shows this session */
    }
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || sending || !user) return;
    let sid = sessionId;
    if (!sid) { await init(); sid = sessionId; if (!sid) return; }

    const userMsg: Message = { role: 'user', content };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setSending(true);
    persist(sid, 'user', content);

    try {
      const res = await fetch(FN, {
        method: 'POST',
        headers: { ...restHeaders(true) },
        body: JSON.stringify({ messages: nextHistory.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok && !data?.reply) {
        throw new Error(data?.error || 'request failed');
      }
      if (data?.configured === false) setNotConfigured(true);
      const reply: string = data?.reply || data?.error || 'Sorry, I could not respond just now.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      persist(sid, 'assistant', reply);
    } catch {
      toast.error('The assistant could not respond. Please try again.');
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry — I had trouble responding. Please try again in a moment.',
      }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-9rem)]">
        <div className="mb-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" /> AI Assistant
          </h1>
          <p className="text-muted-foreground mt-1">
            Ask about funding, business planning, training, and growth. Not legal or financial advice.
          </p>
        </div>

        {notConfigured && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
            <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              The assistant isn&apos;t fully switched on yet. It will start answering once an OpenAI key is
              added to the project. Your messages are still saved here.
            </p>
          </div>
        )}

        {/* Messages */}
        <Card className="flex-1 overflow-hidden flex flex-col">
          <CardContent ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <Bot className="h-12 w-12 text-primary/60 mb-4" />
                <p className="font-medium">How can I help today?</p>
                <p className="text-sm text-muted-foreground mt-1 mb-5 max-w-sm">
                  Ask a question to get started. I can help you think through funding, plans, and next steps.
                </p>
                <div className="grid sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left text-sm rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 px-3 py-2 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={m.id ?? i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  }`}>
                    {m.role === 'user' ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`rounded-2xl px-4 py-2.5 max-w-[80%] whitespace-pre-wrap text-sm leading-relaxed ${
                    m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </CardContent>

          {/* Composer */}
          <div className="border-t border-border p-3">
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
                }}
                placeholder="Ask a question…  (Enter to send, Shift+Enter for a new line)"
                className="min-h-[44px] max-h-32 resize-none"
                disabled={sending}
              />
              <Button onClick={() => send(input)} disabled={sending || !input.trim()} size="icon" className="h-11 w-11 flex-shrink-0">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
