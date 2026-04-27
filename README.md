# eMerge Solutions — NetSuite Consulting Site

Static marketing site with three user experiences:

- **Classic** (`/normal.html`) — traditional pages, no chat.
- **Chat** (`/chat.html`) — persistent AI assistant in the corner of every page.
- **Full AI** (`/full-ai.html`) — embedded AI consultant that drives the whole interaction.

The AI is NetSuite-only and can:

- Answer questions about NetSuite (SuiteScript 2.1, SuiteFlow, SuiteAnalytics, ODBC, saved searches).
- Navigate between pages on command (text or voice).
- Pre-fill and submit the contact form.
- Read pages aloud (browser speech synthesis).

## Stack

- Static HTML + CSS + vanilla JS (no framework).
- Vercel serverless functions for `/api/chat` (Anthropic Claude) and `/api/contact` (Resend).
- Voice via the browser's Web Speech API (Chrome/Edge/Safari).

## Local development

```bash
npm i -g vercel
vercel dev
```

Then visit `http://localhost:3000`.

The site works without any API keys — `/api/chat` will return 503 and the
front-end falls back to a local intent matcher; `/api/contact` runs in
"development mode" and only logs.

## Production environment variables

Set these in the Vercel dashboard (Project → Settings → Environment Variables):

| Variable | Required | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | for live AI | Anthropic API key for `/api/chat`. |
| `ANTHROPIC_MODEL` | optional | Defaults to `claude-haiku-4-5-20251001`. |
| `RESEND_API_KEY` | for real email | Resend key for `/api/contact`. |
| `CONTACT_TO_EMAIL` | recommended | Where contact form submissions are delivered. |
| `CONTACT_FROM_EMAIL` | recommended | Verified Resend sender (e.g. `eMerge <hello@yourdomain.com>`). |

## Deploy

```bash
vercel link
vercel deploy --prod
```

Or push to `main` on GitHub with the Vercel GitHub integration enabled.

## File map

```
/                      → /index.html (experience picker)
/normal.html           → classic home
/full-ai.html          → embedded AI consultant
/chat.html             → enables persistent chat across navigation
/stabilization.html, /optimization.html, /rescue.html, /technical-debt.html
/contact.html          → form posts to /api/contact
/assets/style.css
/assets/ai-engine.js   → shared chat/AI/voice/action-dispatch module
/api/chat.js           → Anthropic-backed AI endpoint
/api/contact.js        → Resend-backed contact endpoint
```
