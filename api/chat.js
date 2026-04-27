// Vercel serverless function: /api/chat
// Accepts { messages: [...], context: { path, title, heading } }
// Returns  { reply: string, actions: [...] }
//
// If ANTHROPIC_API_KEY is set, uses Claude as the brain. The model is asked to
// reply with strict JSON containing `reply` and `actions`. Actions are a small
// vocabulary the front-end (assets/ai-engine.js) can execute.
//
// If no key is set, returns 503 so the client falls back to its local intent
// matcher and the site still works.

const SYSTEM_PROMPT = `You are the eMerge Solutions AI consultant.

eMerge Solutions is an INDEPENDENT NetSuite consultancy. We do NOT sell licenses.
We focus exclusively on NetSuite (not Acumatica, not SAP, not other ERPs).

Our four service pillars:
- Stabilization: diagnose and fix performance issues, broken SuiteScript 2.1, failing integrations, slow saved searches.
- Optimization: tune SuiteScript 2.1, refactor SuiteFlow, automate manual ops, harden ODBC / SuiteAnalytics Connect.
- Rescue: parachute into failing NetSuite implementations, cut scope, ship a working system.
- Technical Debt: refactor brittle bundles, retire SuiteScript 1.0, simplify customizations.

Voice & style:
- Direct, technically credible, calm.
- Empathetic: a struggling NetSuite is almost always a configuration issue, not a personal failure.
- Concise: 1–3 short paragraphs at most. No emoji unless the user uses them.
- Recommend booking a consultation only when it's clearly the next useful step.

You can request UI ACTIONS the front-end will execute. Available actions:
- {"type":"navigate","target":"home|stabilization|optimization|rescue|technical-debt|contact|chat|full-ai"}
- {"type":"fill-contact","fields":{"name":"...","email":"...","message":"..."}}  (front-end will navigate to contact if needed)
- {"type":"submit-contact"}  (only when the user has clearly confirmed they want to send)
- {"type":"scroll-to","target":"section-id"}
- {"type":"read-page"}  (have the page read aloud via speech synthesis)

OUTPUT FORMAT — strict JSON, no prose before or after:
{"reply":"<your text reply to the user>","actions":[<zero or more action objects>]}

Rules:
- NEVER mention non-NetSuite ERPs unless the user does.
- NEVER promise specific outcomes, timelines, or pricing without first directing them to contact.
- If the user asks to be contacted, navigate to contact and (if they provided details) fill the form. Submit ONLY on explicit confirmation.
- If the user asks something off-topic, politely redirect to NetSuite topics in one sentence and offer help.
- Keep reply under 80 words unless explaining a NetSuite topic in depth.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'AI server not configured (missing ANTHROPIC_API_KEY)' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const context = body?.context || {};

  // Trim history (last 12 turns) and validate roles
  const trimmed = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  const ctxNote = `Current page context: path=${context.path || 'unknown'}, title=${(context.title || '').slice(0, 120)}, heading=${(context.heading || '').slice(0, 120)}.`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: SYSTEM_PROMPT + '\n\n' + ctxNote,
        messages: trimmed.length ? trimmed : [{ role: 'user', content: 'Hello' }],
      }),
    });

    if (!r.ok) {
      const err = await r.text();
      console.error('Anthropic error', r.status, err);
      res.status(502).json({ error: 'upstream error', status: r.status });
      return;
    }
    const data = await r.json();
    const text = (data?.content || []).map((b) => b.text || '').join('').trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Model didn't return JSON — try to extract a JSON block, otherwise wrap as plain reply
      const m = text.match(/\{[\s\S]*\}/);
      if (m) {
        try { parsed = JSON.parse(m[0]); } catch { parsed = null; }
      }
      if (!parsed) parsed = { reply: text, actions: [] };
    }

    if (!parsed.reply) parsed.reply = "I'm here to help with NetSuite. What's going on?";
    if (!Array.isArray(parsed.actions)) parsed.actions = [];
    parsed.actions = parsed.actions.filter(validAction).slice(0, 4);

    res.status(200).json(parsed);
  } catch (e) {
    console.error('chat handler error', e);
    res.status(500).json({ error: 'server error' });
  }
}

const PAGE_TARGETS = new Set([
  'home', 'stabilization', 'optimization', 'rescue', 'technical-debt',
  'contact', 'chat', 'full-ai', 'ai', 'index', 'services',
]);
const ACTION_TYPES = new Set([
  'navigate', 'fill-contact', 'submit-contact', 'scroll-to', 'read-page', 'suggest', 'navigate-if-needed',
]);

function validAction(a) {
  if (!a || typeof a !== 'object' || !ACTION_TYPES.has(a.type)) return false;
  if (a.type === 'navigate' && !PAGE_TARGETS.has(a.target)) return false;
  if (a.type === 'fill-contact' && (!a.fields || typeof a.fields !== 'object')) return false;
  return true;
}
