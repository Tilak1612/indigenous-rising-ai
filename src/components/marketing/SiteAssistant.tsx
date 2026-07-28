import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';

// Public marketing chatbot widget ("Rising AI"). Talks to the hardened
// site-assistant Supabase Edge Function. Renders answers as PLAIN TEXT (the
// function strips markdown), sends the last 8 turns for context, and shows
// code-generated follow-up chips (never model-generated, so a chip can't tee up
// a question the bot must refuse).

const FN_URL = `${SUPABASE_URL}/functions/v1/site-assistant`;

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const STARTERS = [
  'What does it cost?',
  'How does funding matching work?',
  'What is OCAP®?',
  'Is my data stored in Canada?',
];

// Follow-up chips by keyword bucket — offered only when relevant and not asked.
const CHIP_BUCKETS: { match: RegExp; chips: string[] }[] = [
  { match: /price|cost|plan|\$|free|growth|professional/i, chips: ['What’s in the free plan?', 'Can I switch plans later?'] },
  { match: /fund|grant|match|money|loan/i, chips: ['Who is eligible for funding?', 'How do I get started?'] },
  { match: /ocap|data|canada|privacy|sovereign/i, chips: ['Can I export my data?', 'Is it PIPEDA-aligned?'] },
  { match: /language|french|indigenous language/i, chips: ['What does the platform do?'] },
];

const nextChips = (lastAnswer: string, asked: Set<string>): string[] => {
  const out: string[] = [];
  for (const b of CHIP_BUCKETS) {
    if (b.match.test(lastAnswer)) for (const c of b.chips) if (!asked.has(c.toLowerCase())) out.push(c);
  }
  return out.slice(0, 3);
};

const SiteAssistant = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const asked = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const send = async (text: string) => {
    const prompt = text.trim();
    if (!prompt || sending) return;
    asked.current.add(prompt.toLowerCase());
    const history = messages.slice(-8);
    setMessages((m) => [...m, { role: 'user', content: prompt }]);
    setInput('');
    setSending(true);
    try {
      const res = await fetch(FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ prompt, history }),
      });
      const data = await res.json().catch(() => null);
      const reply =
        (data && typeof data.text === 'string' && data.text) ||
        'Sorry — I had trouble answering that. Our team can help at help@indigenousrising.ai.';
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Sorry — I could not reach the assistant just now. Please try again, or email help@indigenousrising.ai.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  const chips = messages.length === 0 ? STARTERS : lastAssistant ? nextChips(lastAssistant.content, asked.current) : [];

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Ask Rising AI about Indigenous Rising AI"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-elevated px-4 py-3 hover:opacity-90 transition-opacity"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-semibold hidden sm:inline">Ask Rising AI</span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Rising AI assistant"
          className="fixed bottom-5 right-5 z-40 w-[92vw] max-w-sm rounded-2xl border border-border bg-card shadow-elevated flex flex-col overflow-hidden"
          style={{ height: 'min(70vh, 560px)' }}
        >
          <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-primary/5">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </span>
              <div className="leading-tight">
                <p className="font-display font-bold text-sm text-foreground">Rising AI</p>
                <p className="text-[11px] text-muted-foreground">Funding, plans & getting started</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close assistant" className="p-1.5 rounded-md hover:bg-muted">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Kwe! I can answer questions about funding matching, plans, OCAP® data sovereignty, and getting
                started. What can I help with?
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`rounded-2xl px-3.5 py-2 max-w-[85%] text-sm leading-relaxed whitespace-pre-line ${
                    m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-3.5 py-2.5 bg-muted">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            {!sending && chips.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {chips.map((c) => (
                  <button
                    key={c}
                    onClick={() => send(c)}
                    className="text-xs rounded-full border border-border bg-background hover:bg-muted px-3 py-1.5 text-foreground transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border p-3 space-y-2">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask about funding, plans…"
                rows={1}
                disabled={sending}
                className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm max-h-24 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                onClick={() => send(input)}
                disabled={sending || !input.trim()}
                aria-label="Send message"
                className="h-9 w-9 flex-shrink-0 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground text-center">
              AI answers can be imperfect —{' '}
              <Link to="/contact" className="text-primary underline">
                talk to our team
              </Link>{' '}
              anytime.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default SiteAssistant;
