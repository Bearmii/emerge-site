// Vercel serverless function: /api/contact
// Accepts { name, email, company?, message } and forwards to Resend if a key
// is configured. Otherwise logs and returns success (development mode).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const name = clean(body?.name, 120);
  const email = clean(body?.email, 200);
  const company = clean(body?.company, 200);
  const message = clean(body?.message, 4000);

  if (!name || !email || !message) {
    res.status(400).json({ error: 'name, email, and message are required' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'invalid email' });
    return;
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const TO = process.env.CONTACT_TO_EMAIL || 'hello@emerge-solutions.example';
  const FROM = process.env.CONTACT_FROM_EMAIL || 'eMerge Site <onboarding@resend.dev>';

  if (!RESEND_API_KEY) {
    console.log('[contact] (dev mode — no RESEND_API_KEY) submission:', { name, email, company, message });
    res.status(200).json({ ok: true, message: "Thanks — we received your message. (Development mode: no email was sent.)" });
    return;
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: `New eMerge inquiry from ${name}${company ? ` (${company})` : ''}`,
        text:
          `Name: ${name}\nEmail: ${email}\nCompany: ${company || '-'}\n\n${message}\n`,
      }),
    });
    if (!r.ok) {
      const err = await r.text();
      console.error('Resend error', r.status, err);
      res.status(502).json({ error: 'upstream email error' });
      return;
    }
    res.status(200).json({ ok: true, message: "Thanks — we'll be in touch within one business day." });
  } catch (e) {
    console.error('contact handler error', e);
    res.status(500).json({ error: 'server error' });
  }
}

function clean(v, max) {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}
