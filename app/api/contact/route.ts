export const runtime = "edge";

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { body = {}; }
  const name = clean(body?.name, 120);
  const email = clean(body?.email, 200);
  const company = clean(body?.company, 200);
  const message = clean(body?.message, 4000);

  if (!name || !email || !message) {
    return json({ error: "name, email, and message are required" }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "invalid email" }, 400);
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const TO = process.env.CONTACT_TO_EMAIL || "hello@emerge-solutions.example";
  const FROM = process.env.CONTACT_FROM_EMAIL || "eMerge Site <onboarding@resend.dev>";

  if (!RESEND_API_KEY) {
    console.log("[contact] dev mode submission", { name, email, company, message });
    return json({ ok: true, message: "Thanks — we received your message. (Development mode: no email was sent.)" });
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: `New eMerge inquiry from ${name}${company ? ` (${company})` : ""}`,
        text: `Name: ${name}\nEmail: ${email}\nCompany: ${company || "-"}\n\n${message}\n`,
      }),
    });
    if (!r.ok) return json({ error: "upstream email error" }, 502);
    return json({ ok: true, message: "Thanks — we'll be in touch within one business day." });
  } catch {
    return json({ error: "server error" }, 500);
  }
}

function clean(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
function json(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), {
    status,
    headers: { "content-type": "application/json" },
  });
}
