"use client";

import { useState } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    setErrorMsg("");
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setErrorMsg(j.error || `status ${r.status}`);
        setStatus("err");
        return;
      }
      form.reset();
      setStatus("ok");
    } catch (err) {
      setStatus("err");
      setErrorMsg("network error");
    }
  }

  return (
    <>
      <Nav />

      <section className="relative overflow-hidden border-b border-white/5">
        <div aria-hidden className="absolute inset-0 bg-dot-grid opacity-50 [mask-image:radial-gradient(ellipse_at_top,black,transparent_60%)]" />
        <div aria-hidden className="absolute inset-0 bg-radial-glow" />
        <div className="relative mx-auto max-w-layout px-6 lg:px-10 pt-24 pb-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-600 mb-6">Contact</p>
          <h1 className="text-display-xl font-medium tracking-ultra max-w-3xl text-balance">
            Tell us what's going on with <span className="text-aurora">NetSuite</span>.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-700 text-pretty">
            We respond within one business day. If it's truly urgent — go-live this week, finance can't close —
            say so and we'll page someone same-day.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 lg:px-10 py-20">
        <form onSubmit={onSubmit} className="surface-glass rounded-2xl p-8 grid gap-5">
          <Field label="Name" name="name" required />
          <Field label="Email" name="email" type="email" required />
          <Field label="Company (optional)" name="company" />
          <Field
            label="How can we help?"
            name="message"
            required
            textarea
            placeholder="What's broken, slipping, or slow in NetSuite?"
          />

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-full bg-ink-900 px-5 py-3 text-sm font-medium text-ink hover:bg-white transition-colors disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send →"}
            </button>
            <AnimatePresence>
              {status === "ok" && (
                <motion.span
                  key="ok"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm text-signal-ok"
                >
                  Thanks — we'll be in touch within one business day.
                </motion.span>
              )}
              {status === "err" && (
                <motion.span
                  key="err"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-signal-warn"
                >
                  Something went wrong{errorMsg ? `: ${errorMsg}` : ""}.
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </form>

        <p className="mt-8 text-sm text-ink-600 text-center">
          Prefer to talk to an AI consultant first?{" "}
          <a href="/ai" className="text-accent-soft hover:text-ink-900 transition-colors">
            Open the immersive AI →
          </a>
        </p>
      </section>

      <Footer />
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  textarea,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  placeholder?: string;
}) {
  const id = `f-${name}`;
  const cls =
    "w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-500 focus:outline-none focus:border-accent/50 focus:bg-white/[0.05] transition-colors";
  return (
    <label htmlFor={id} className="grid gap-1.5">
      <span className="text-xs font-mono uppercase tracking-wider text-ink-600">{label}</span>
      {textarea ? (
        <textarea id={id} name={name} required={required} rows={5} placeholder={placeholder} className={cls} />
      ) : (
        <input id={id} name={name} type={type} required={required} placeholder={placeholder} className={cls} autoComplete={name === "email" ? "email" : name === "name" ? "name" : "off"} />
      )}
    </label>
  );
}
