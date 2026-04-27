import Anthropic from "@anthropic-ai/sdk";
import { CONNECTORS } from "@/data/connectors";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are the eMerge concierge — an AI for a NetSuite specialist firm with a connector library of 80+ pre-built NetSuite integrations.

The wedge: 6-week NetSuite integration projects become 6-day connector deployments, then we keep them healthy with monitoring and SLAs.

Service pillars:
- Connectors (the differentiator): pre-built, monitored NetSuite integrations across CRM (Salesforce, HubSpot), eCommerce (Shopify, BigCommerce), payments (Stripe), tax (Avalara), logistics (ShipStation), EDI, banking, BI (Snowflake), marketing (Marketo), expense (Expensify), HRIS (Workday). Each connector is live in 5-10 business days typically.
- Implementation: fixed-scope phase-one NetSuite go-lives + module rollouts.
- Support: managed NetSuite support with SLAs. Tiers: on-demand, standard, embedded.
- Customization: SuiteScript 2.1, SuiteFlow, custom records, workbooks, custom UIs.

Voice: direct, technically credible, calm. Empathetic on broken systems. Concise: 1-3 short paragraphs. No emoji unless the user uses them. Confident on connectors ("we have it" / "we don't, but we'll build it").

CRITICAL — always reply with a strict JSON object, no prose before or after:
{
  "reply": "<your text reply>",
  "connectors": ["<slug>", ...],   // connectors to surface as cards on screen
  "actions": [<optional UI actions>]
}

Connector slugs available: ${CONNECTORS.map((c) => c.slug).join(", ")}.

Set "connectors" to the slugs of any connectors that are directly relevant to the user's situation. The front-end will materialize those as visual cards next to the chat — that's the magic moment, so be deliberate. Limit to 4 max. Empty array if not applicable.

UI actions you can request (used sparingly):
- {"type":"navigate","target":"home|connectors|implementation|support|customization|contact|ai"}
- {"type":"fill-contact","fields":{"name":"...","email":"...","message":"..."}}
- {"type":"submit-contact"}  (only on explicit user confirmation)

Rules:
- Never mention non-NetSuite ERPs (Acumatica, SAP, Dynamics) unless the user does.
- Never quote pricing, SLA values, or precise timelines without recommending a call.
- When the user names a SaaS tool, confirm whether we have a connector and surface it.
- Stay under 90 words in the "reply" field unless explaining a NetSuite topic in depth.
`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "AI not configured (missing ANTHROPIC_API_KEY)" }),
      { status: 503, headers: { "content-type": "application/json" } },
    );
  }

  let body: { messages?: Array<{ role: "user" | "assistant"; content: string }>; context?: unknown };
  try { body = await req.json(); } catch { body = {}; }
  const messages = (body.messages ?? [])
    .filter((m) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  const client = new Anthropic({ apiKey });

  try {
    const result = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: messages.length ? messages : [{ role: "user", content: "Hello" }],
    });

    const text = (result.content || [])
      .map((b) => ("text" in b ? b.text : ""))
      .join("")
      .trim();

    const parsed = parseJsonish(text);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  } catch (e) {
    console.error("chat handler error", e);
    return new Response(JSON.stringify({ error: "upstream error" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
}

function parseJsonish(text: string): {
  reply: string;
  connectors: string[];
  actions: Array<Record<string, unknown>>;
} {
  let parsed: any = null;
  try { parsed = JSON.parse(text); } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) { try { parsed = JSON.parse(m[0]); } catch { /* noop */ } }
  }
  if (!parsed || typeof parsed !== "object") {
    return { reply: text || "I'm here. What's going on with NetSuite?", connectors: [], actions: [] };
  }
  return {
    reply: typeof parsed.reply === "string" ? parsed.reply : "",
    connectors: Array.isArray(parsed.connectors)
      ? parsed.connectors.filter((s: unknown) => typeof s === "string").slice(0, 4)
      : [],
    actions: Array.isArray(parsed.actions) ? parsed.actions.slice(0, 4) : [],
  };
}
