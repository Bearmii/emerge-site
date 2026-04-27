import Link from "next/link";
import { HeroAIPanel } from "@/components/HeroAIPanel";

export const metadata = {
  title: "Immersive AI consultant",
  description:
    "Talk to an AI that can answer NetSuite questions and surface the right connector for your stack.",
};

export default function AIPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Layered backdrop */}
      <div aria-hidden className="absolute inset-0 bg-dot-grid opacity-40" />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(123,108,246,0.35),transparent_55%)]"
      />
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-accent/15 blur-3xl animate-floatY"
      />

      {/* Minimal chrome */}
      <div className="relative z-10 px-6 lg:px-10 pt-6 pb-4 flex items-center justify-between">
        <Link
          href="/"
          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-ink-700 hover:text-ink-900 hover:bg-white/[0.08] transition-colors flex items-center gap-2"
        >
          ← Back to site
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-600">
          eMerge · NetSuite Concierge
        </span>
        <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-accent-soft">
          preview · 3D coming
        </span>
      </div>

      {/* Stage */}
      <div className="relative z-10 mx-auto max-w-2xl px-6 lg:px-10 pt-8 pb-24">
        {/* Floating orb-like accent (pre-WebGL placeholder) */}
        <div className="relative h-48 mb-10 flex items-center justify-center">
          <div className="absolute h-40 w-40 rounded-full bg-gradient-to-br from-accent via-accent-muted to-signal-data blur-2xl opacity-70 animate-floatY" />
          <div className="absolute h-24 w-24 rounded-full bg-gradient-to-br from-accent-glow via-accent to-signal-data shadow-[0_0_80px_rgba(123,108,246,0.6)]" />
          <div className="relative h-16 w-16 rounded-full bg-ink-100 border border-white/20 backdrop-blur-md flex items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_18px_rgba(123,108,246,1)] animate-pulse" />
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-display-lg font-medium tracking-ultra text-balance">
            Ask. Watch the integration map <span className="text-aurora">build itself.</span>
          </h1>
          <p className="mt-5 max-w-prose mx-auto text-ink-700 text-pretty">
            Tell me what systems you use. I'll surface the right NetSuite connectors and what we sync —
            in front of you, in real time.
          </p>
        </div>

        <HeroAIPanel />

        <p className="mt-12 text-center text-xs text-ink-500 max-w-md mx-auto">
          Full immersive experience — WebGL audio-reactive sphere, premium voice, spatial replies — ships next sprint.
          For now, this is the AI that lives in the homepage hero, lifted into focus.
        </p>
      </div>
    </main>
  );
}
