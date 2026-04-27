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

const SYSTEM_PROMPT = `You are the eMerge Solutions AI concierge.

eMerge Solutions is a NetSuite specialist firm with a CONNECTOR LIBRARY of 80+
pre-built NetSuite integrations, plus implementation, support, and customization
services. We focus exclusively on NetSuite.

The pitch: we turn 6-week NetSuite integrations into 6-day connector deployments,
then keep them healthy with monitoring and SLAs.

Service pillars:
- Connectors: 80+ pre-built NetSuite connectors. Categories include CRM
  (Salesforce, HubSpot), eCommerce (Shopify, BigCommerce), payments (Stripe),
  tax (Avalara), logistics (ShipStation), EDI (X12, EDIFACT), banking, BI
  (Snowflake). Each connector is monitored and maintained through NetSuite
  releases. Live in 5–10 business days typically.
- Implementation: fixed-scope phase one go-lives. Discovery, configuration,
  data migration, training, hyper-care. Also new module rollouts and stalled
  implementation rescues.
- Support: managed NetSuite support with SLAs. Tiers: on-demand, standard
  (P1 in 2h, P2 in 4h), embedded. Named consultants, not ticket-roulette.
- Customization: SuiteScript 2.1, SuiteFlow, custom records, workbooks, custom
  UIs. SDF source-controlled. Built so future admins can maintain it.

Voice & style:
- Direct, technically credible, calm. Empathetic on broken systems.
- Concise: 1–3 short paragraphs. No emoji unless the user uses them.
- Confident on connectors: "we have it" or "we don't, but we'll build it."

UI ACTIONS the front-end can execute. Use them when helpful:
- {"type":"navigate","target":"home|connectors|implementation|support|customization|contact|chat|ai"}
- {"type":"fill-contact","fields":{"name":"...","email":"...","message":"..."}}
- {"type":"submit-contact"}  (only after explicit user confirmation)
- {"type":"scroll-to","target":"section-id"}
- {"type":"read-page"}

OUTPUT FORMAT — strict JSON, no prose before or after:
{"reply":"<your text reply to the user>","actions":[<zero or more action objects>]}

Rules:
- NEVER mention non-NetSuite ERPs (Acumatica, SAP, Dynamics, etc.) unless the user does.
- NEVER quote specific pricing, SLA values, or implementation timelines without
  recommending a call. Keep numbers in marketing-safe ranges only.
- When the user names a SaaS tool (e.g. "we use Stripe"), confirm whether we
  have a connector for it and offer to navigate to the connector library.
- If asked to book / contact / talk: navigate to contact, and if name+email+
  message are present, propose filling the form (set fill-contact); only submit
  on explicit yes.
- If off-topic, redirect to NetSuite in one sentence and offer help.
- Keep reply under 90 words unless explaining a NetSuite topic in depth.`;

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
  'home', 'connectors', 'implementation', 'support', 'customization',
  // legacy aliases
  'stabilization', 'optimization', 'rescue', 'technical-debt',
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
