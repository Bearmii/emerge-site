"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CONNECTORS, type Connector } from "@/data/connectors";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "I use Shopify and Stripe — what do I get?",
  "We're starting a NetSuite implementation",
  "Do you have a Salesforce connector?",
  "I need EDI for a retailer onboarding",
];

export function HeroAIPanel() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [surfacedSlugs, setSurfacedSlugs] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const surfaced = useMemo<Connector[]>(
    () => surfacedSlugs.map((s) => CONNECTORS.find((c) => c.slug === s)).filter(Boolean) as Connector[],
    [surfacedSlugs],
  );

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
  }, [messages, isThinking]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setIsThinking(true);

    let reply = "";
    let connectors: string[] = [];
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (r.ok) {
        const data = await r.json();
        reply = data.reply ?? "";
        connectors = Array.isArray(data.connectors) ? data.connectors : [];
      } else {
        // 503 fallback — surface useful local result so the demo still feels alive
        const local = localFallback(trimmed);
        reply = local.reply;
        connectors = local.connectors;
      }
    } catch {
      const local = localFallback(trimmed);
      reply = local.reply;
      connectors = local.connectors;
    }

    setMessages((m) => [...m, { role: "assistant", content: reply || "..." }]);
    setSurfacedSlugs(connectors);
    setIsThinking(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="relative">
      {/* Glow halo behind the panel */}
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse_at_50%_50%,rgba(123,108,246,0.25),transparent_60%)] blur-2xl"
      />

      <div className="relative grid gap-4">
        {/* The AI panel */}
        <div className="surface-glass rounded-2xl overflow-hidden">
          {/* Status strip */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-accent animate-ping" />
                <span className="relative inline-block h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-ink-700">
                eMerge AI · NetSuite
              </span>
            </div>
            <span className="font-mono text-[11px] text-ink-500">
              {messages.length === 0 ? "ready" : `${messages.filter((m) => m.role === "assistant").length} replies`}
            </span>
          </div>

          {/* Transcript */}
          <div
            ref={transcriptRef}
            className="px-4 pt-3 pb-1 max-h-[260px] overflow-y-auto scroll-smooth"
            aria-live="polite"
          >
            {messages.length === 0 && (
              <div className="text-sm text-ink-700 leading-relaxed">
                <p className="text-aurora font-medium mb-1">Ask me anything about NetSuite.</p>
                <p>
                  Tell me what systems you use — Shopify, Salesforce, Stripe, EDI — and I'll surface the connectors,
                  estimated deploy time, and what we sync.
                </p>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm leading-relaxed mt-3 ${
                    m.role === "user" ? "text-ink-900" : "text-ink-700"
                  }`}
                >
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 mr-2">
                    {m.role === "user" ? "you" : "ai"}
                  </span>
                  {m.content}
                </motion.div>
              ))}
              {isThinking && (
                <motion.div
                  key="thinking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm mt-3 flex items-center gap-2 text-ink-600"
                >
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">ai</span>
                  <ThinkingDots />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input */}
          <form onSubmit={onSubmit} className="border-t border-white/5 p-2 flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What systems should NetSuite talk to?"
              className="flex-1 bg-transparent px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500 focus:outline-none"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-accent-muted transition-colors"
            >
              Ask →
            </button>
          </form>
        </div>

        {/* Suggestion chips when conversation is empty */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pl-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-xs text-ink-700 hover:bg-white/[0.05] hover:text-ink-900 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Materialized connector cards — the magic moment */}
        <AnimatePresence>
          {surfaced.length > 0 && (
            <motion.div
              key="surfaced"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid gap-2"
            >
              <div className="flex items-center gap-2 pl-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-accent-soft">
                  Surfaced connectors
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-accent/30 to-transparent" />
              </div>
              <div className="grid gap-2">
                {surfaced.map((c, i) => (
                  <motion.div
                    key={c.slug}
                    layout
                    initial={{ opacity: 0, scale: 0.96, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 220, damping: 22 }}
                  >
                    <ConnectorRow connector={c} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ConnectorRow({ connector: c }: { connector: Connector }) {
  return (
    <Link
      href={`/connectors`}
      className="surface-glass rounded-xl p-3 flex items-center gap-3 hover:border-accent/40 transition-colors group"
    >
      <div className="font-mono text-[10px] uppercase tracking-wider text-accent-soft px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
        {c.category}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink-900 truncate">{c.name}</span>
          <span className="font-mono text-[10px] text-ink-500">{c.direction} NetSuite</span>
        </div>
        <p className="text-xs text-ink-600 truncate mt-0.5">{c.oneLiner}</p>
      </div>
      <div className="text-right shrink-0">
        <div className="font-mono text-xs text-ink-700">{c.deployDays}d</div>
        <div className="font-mono text-[9px] uppercase tracking-wider text-ink-500">to live</div>
      </div>
    </Link>
  );
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-1 w-1 rounded-full bg-accent-soft"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

/**
 * Local fallback used when /api/chat is unavailable (no API key set).
 * Keeps the homepage demo working so the site still shows the magic moment.
 */
function localFallback(text: string): { reply: string; connectors: string[] } {
  const t = text.toLowerCase();
  const matched = CONNECTORS.filter(
    (c) => c.aliases.some((a) => t.includes(a)) || t.includes(c.name.toLowerCase()),
  ).slice(0, 4);

  if (matched.length > 0) {
    const names = matched.map((m) => m.name).join(" + ");
    const days = matched.reduce((s, c) => s + c.deployDays, 0);
    return {
      reply: `Yes — we have pre-built connectors for ${names}. Together those typically take ~${days} business days to deploy and we monitor them through every NetSuite release.`,
      connectors: matched.map((c) => c.slug),
    };
  }
  if (/implement|go.?live|new netsuite/.test(t)) {
    return {
      reply:
        "For a new NetSuite go-live we run a fixed-scope phase one — discovery, configuration, data migration, training, hyper-care. Want details?",
      connectors: [],
    };
  }
  if (/support|sla|managed/.test(t)) {
    return {
      reply: "Managed NetSuite support comes in three tiers — on-demand, standard with SLAs, and embedded. Named consultants, not ticket roulette.",
      connectors: [],
    };
  }
  if (/custom|suitescript|workflow/.test(t)) {
    return {
      reply: "We build SuiteScript 2.1, SuiteFlow, custom records and workbooks — designed so the next admin can read them.",
      connectors: [],
    };
  }
  return {
    reply: "Tell me what systems you use today — Shopify, Salesforce, Stripe, EDI — and I'll surface the relevant NetSuite connectors with deploy estimates.",
    connectors: [],
  };
}
