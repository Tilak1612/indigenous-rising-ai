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

const PROVINCE_NAME_TO_CODE: Record<string, string> = {
  'Alberta': 'AB', 'British Columbia': 'BC', 'Manitoba': 'MB', 'New Brunswick': 'NB',
  'Newfoundland and Labrador': 'NL', 'Nova Scotia': 'NS', 'Northwest Territories': 'NT',
  'Nunavut': 'NU', 'Ontario': 'ON', 'Prince Edward Island': 'PE', 'Quebec': 'QC',
  'Saskatchewan': 'SK', 'Yukon': 'YT',
};

interface GroundingRow {
  slug: string; name: string; funder: string; funding_type: string; is_repayable: boolean | null;
  amount_min: number | null; amount_max: number | null; deadline: string | null; intake_status: string;
  provinces: string[]; eligibility_notes: string | null; source_url: string | null; last_verified: string | null;
  applicant_types: string[] | null;
}

const fmtAmount = (r: GroundingRow) => {
  const f = (n: number) => '$' + n.toLocaleString('en-CA');
  if (!r.amount_min && !r.amount_max) return 'amount not published by the funder';
  if (r.amount_min && r.amount_max && r.amount_min !== r.amount_max) return `${f(r.amount_min)} to ${f(r.amount_max)}`;
  if (r.amount_max) return `up to ${f(r.amount_max)}`;
  return `from ${f(r.amount_min as number)}`;
};

/**
 * Builds the catalogue block for the system prompt, or an empty string when
 * nothing can be read (the assistant then falls back to its standing rule of
 * not naming programmes it cannot verify).
 */
async function loadFundingGrounding(supabaseUrl: string, userId: string | null): Promise<string> {
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!serviceKey) return '';
  try {
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    let code: string | null = null;
    if (userId) {
      const { data: profile } = await admin.from('profiles').select('territory').eq('id', userId).maybeSingle();
      const t = profile?.territory as string | null | undefined;
      if (t) code = t.length === 2 ? t.toUpperCase() : (PROVINCE_NAME_TO_CODE[t] ?? null);
    }
    let q = admin
      .from('grants')
      .select('slug,name,funder,funding_type,is_repayable,amount_min,amount_max,deadline,intake_status,provinces,eligibility_notes,source_url,last_verified,applicant_types')
      .eq('is_published', true)
      .neq('intake_status', 'closed')
      .order('last_verified', { ascending: false, nullsFirst: false })
      .limit(8);
    if (code) q = q.contains('provinces', [code]);
    const { data } = await q;
    const rows = (data ?? []) as GroundingRow[];
    if (!rows.length) return '';
    const lines = rows.map((r) => {
      const who = r.applicant_types?.length ? `; for: ${r.applicant_types.join(', ')}` : '';
      const when = r.deadline ? `deadline ${r.deadline}` : r.intake_status === 'rolling' ? 'rolling intake' : `intake ${r.intake_status}`;
      const checked = r.last_verified ? `last read ${r.last_verified}` : 'NOT yet verified';
      return `- ${r.name} (${r.funder}): ${r.funding_type}${r.is_repayable === false ? ', non-repayable' : r.is_repayable ? ', repayable' : ''}; ${fmtAmount(r)}; ${when}${who}. ${r.eligibility_notes ? 'Eligibility: ' + r.eligibility_notes.slice(0, 240) + ' ' : ''}Source: ${r.source_url ?? 'n/a'}. Details: https://www.indigenousrising.ai/funding/${r.slug} (${checked}).`;
    });
    return `\n\nVERIFIED FUNDING RECORDS (${code ? 'for ' + code : 'national'}; the only programmes you may name or quote figures for):\n${lines.join('\n')}\n\nRules for these records: quote amounts, deadlines and eligibility ONLY as written above; if a record says an amount is not published or is not yet verified, say exactly that; always give the Source URL and the Details link when you mention a programme; never say the user is eligible or will be funded — the funder decides; if the user asks about a programme not listed here, say you cannot verify it and point them to the funder's site or the Funding Navigator.`;
  } catch (e) {
    console.error('[ai-assistant] grounding failed:', e instanceof Error ? e.message : String(e));
    return '';
  }
}

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
  let userId: string | null = null;
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
    userId = user.id;
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

  // --- Funding grounding ---
  // The model may only name programmes that are in the verified catalogue.
  // Up to 8 published rows for the user's territory (plus national ones) are
  // appended to the system prompt with their source URL, what the funder
  // publishes as the amount, and the date we last read the funder's page.
  // Only the territory leaves the profile; nothing else about the user is
  // sent (same boundary as match-funding-opportunities and /privacy).
  const grounding = await loadFundingGrounding(supabaseUrl, userId);

  // --- Model call ---
  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openAiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: SYSTEM_PROMPT + grounding }, ...history],
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
