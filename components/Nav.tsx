"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "/connectors", label: "Connectors" },
  { href: "/implementation", label: "Implementation" },
  { href: "/support", label: "Support" },
  { href: "/customization", label: "Customization" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-ink/70 backdrop-blur-md border-b border-white/5">
      <div className="mx-auto max-w-layout px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="relative inline-flex h-7 w-7 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-accent/30 blur-md group-hover:bg-accent/50 transition-colors" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_18px_rgba(123,108,246,0.9)]" />
          </span>
          <span className="font-mono text-sm tracking-tight text-ink-900">eMerge</span>
          <span className="font-mono text-sm text-accent">/</span>
          <span className="font-mono text-sm text-ink-600">netsuite</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-ink-700 hover:text-ink-900 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/ai"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent-soft hover:bg-accent/20 transition-colors"
          >
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-accent animate-ping" />
              <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <span className="font-mono uppercase tracking-wider">AI</span>
          </Link>
          <Link
            href="/contact"
            className="rounded-full bg-ink-900 px-4 py-1.5 text-sm font-medium text-ink hover:bg-white transition-colors"
          >
            Talk to us
          </Link>
          <button
            type="button"
            className="md:hidden rounded-md p-2 text-ink-700 hover:text-ink-900"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden border-t border-white/5"
          >
            <nav className="mx-auto max-w-layout px-6 py-4 flex flex-col gap-3">
              {links.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm text-ink-700">
                  {l.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
