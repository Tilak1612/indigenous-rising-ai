import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// AI Assistant — stateless LLM endpoint for the dashboard chat. The client
// persists the conversation to ai_chat_messages (owner-scoped RLS); this
// function only does the model call. It requires a signed-in user (so the
// OpenAI key can't be used anonymously) and degrades honestly: if
// OPENAI_API_KEY is not configured it returns configured:false with a clear
// message instead of erroring or fabricating a reply.

const ALLOWED_ORIGINS = [
  'https://www.indigenousrising.ai',
  'https://indigenousrising.ai',
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:5193',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://www.indigenousrising.ai';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

const SYSTEM_PROMPT = `You are the Indigenous Rising assistant — a practical business helper for Indigenous entrepreneurs and communities in Canada. You help with funding, business planning, training, and growth.

Guidelines:
- Be concise, warm, and plain-spoken. Give actionable, specific guidance.
- You are NOT a lawyer, accountant, or licensed financial advisor. For legal, tax, or investment decisions, recommend consulting a qualified professional.
- Do NOT invent funding programs, grant amounts, deadlines, eligibility rules, or endorsements. If you are not certain a program exists or its details, say so and point the user to verify on the official source (e.g., NACCA member institutions, the funder's site, or the platform's Funding Navigator).
- Respect Indigenous data sovereignty (OCAP®). Do not ask for sensitive personal or community data you don't need.
- Avoid pan-Indigenous generalizations; respect that nations and communities are distinct.
- When unsure, ask a clarifying question rather than guessing.`;

const MAX_MESSAGES = 16;        // cap history sent to the model
const MAX_CHARS_PER_MSG = 4000; // cap individual message size

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req: Request) => {
  const cors = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  // --- Auth: require a signed-in user ---
  const authHeader = req.headers.get('Authorization') || '';
  const jwt = authHeader.replace(/^Bearer\s+/i, '');
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  try {
    const supabase = createClient(supabaseUrl, anonKey);
    // Pass the JWT explicitly — getUser() with no arg reads the (empty) server
    // session, not the Authorization header, and would always 401.
    const { data: { user }, error: authErr } = await supabase.auth.getUser(jwt);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  // --- Parse + validate input ---
  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const history = incoming
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS_PER_MSG) }));

  if (history.length === 0 || history[history.length - 1].role !== 'user') {
    return new Response(JSON.stringify({ error: 'Send at least one user message' }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  // --- Honest degradation when the key isn't set ---
  const openAiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAiKey) {
    return new Response(JSON.stringify({
      configured: false,
      reply: "The AI assistant isn't switched on yet. Once an OpenAI API key is added to this project's settings, I'll be able to answer here. In the meantime, you can reach the team at help@indigenousrising.ai.",
    }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  // --- Model call ---
  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openAiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
        max_tokens: 700,
        temperature: 0.4,
      }),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      console.error('[ai-assistant] OpenAI error:', resp.status, errText);
      return new Response(JSON.stringify({
        configured: true,
        error: 'The assistant had trouble responding. Please try again in a moment.',
      }), { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content?.trim()
      || "I didn't catch that — could you rephrase?";
    return new Response(JSON.stringify({ configured: true, reply }), {
      status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[ai-assistant] fetch threw:', err);
    return new Response(JSON.stringify({
      configured: true,
      error: 'The assistant is temporarily unavailable. Please try again.',
    }), { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});
