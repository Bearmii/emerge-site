import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { HeroAIPanel } from "@/components/HeroAIPanel";
import { CONNECTORS } from "@/data/connectors";

export default function HomePage() {
  return (
    <>
      <Nav />

      {/* ───────────────── HERO ───────────────── */}
      <section className="relative overflow-hidden">
        {/* dot grid + radial accent glow */}
        <div aria-hidden className="absolute inset-0 bg-dot-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div aria-hidden className="absolute inset-0 bg-radial-glow" />

        <div className="relative mx-auto max-w-layout px-6 lg:px-10 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="grid gap-12 lg:gap-20 lg:grid-cols-[1.05fr_0.95fr] items-center">
            {/* Left: editorial copy */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 mb-8">
                <span className="relative inline-flex h-1.5 w-1.5">
                  <span className="absolute inset-0 rounded-full bg-accent animate-ping" />
                  <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-700">
                  NetSuite specialists · 80+ connectors
                </span>
              </div>

              <h1 className="text-display-2xl font-medium text-balance">
                <span className="text-ink-900">NetSuite</span>
                <br />
                <span className="text-ink-900">integration,</span>
                <br />
                <span className="text-aurora">in days.</span>
              </h1>

              <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-700 text-pretty">
                A library of pre-built connectors for the SaaS your team already uses —
                Salesforce, Shopify, Stripe, EDI, banking, BI. Deployed in a week, monitored
                forever, and an AI consultant that finds the right one in front of you.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link
                  href="/connectors"
                  className="rounded-full bg-ink-900 px-5 py-3 text-sm font-medium text-ink hover:bg-white transition-colors"
                >
                  Browse the connector library →
                </Link>
                <Link
                  href="/ai"
                  className="rounded-full border border-accent/40 bg-accent/10 px-5 py-3 text-sm font-medium text-accent-soft hover:bg-accent/20 transition-colors"
                >
                  Open immersive AI →
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-500">
                <Stat value="80+" label="connectors" />
                <Stat value="450M" label="records / month" />
                <Stat value="99.95%" label="uptime SLA" />
                <Stat value="6 days" label="median deploy" />
              </div>
            </div>

            {/* Right: live AI panel — the hero IS the AI */}
            <div>
              <HeroAIPanel />
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── LOGO STRIP ───────────────── */}
      <section className="border-y border-white/5 bg-white/[0.01]">
        <div className="mx-auto max-w-layout px-6 lg:px-10 py-8 flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-600">
            NetSuite ↔
          </span>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-ink-700">
            {["Salesforce", "HubSpot", "Shopify", "Stripe", "Avalara", "ShipStation", "EDI", "Snowflake"].map(
              (n) => (
                <span key={n} className="font-medium tracking-tight">
                  {n}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ───────────────── HOW IT WORKS ───────────────── */}
      <Section
        eyebrow="How it works"
        title="Three steps. Then your data flows."
      >
        <div className="grid gap-px bg-white/5 rounded-2xl overflow-hidden md:grid-cols-3">
          {[
            {
              n: "01",
              title: "Pick a connector",
              body: "Browse the library or talk to the AI. Each has a fixed scope, fixed price, and live demo.",
            },
            {
              n: "02",
              title: "Deploy in days",
              body: "We configure, test, and cut over. Most connectors are live in 5–10 business days.",
            },
            {
              n: "03",
              title: "We keep it alive",
              body: "Monitoring, NetSuite release coverage, and an SLA. We fix it before your team notices.",
            },
          ].map((s) => (
            <div key={s.n} className="bg-ink p-8 lg:p-10 flex flex-col gap-3 group">
              <div className="font-mono text-[11px] tracking-[0.2em] text-accent-soft">{s.n}</div>
              <h3 className="text-2xl font-medium tracking-editorial text-ink-900">{s.title}</h3>
              <p className="text-sm leading-relaxed text-ink-700">{s.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ───────────────── SERVICE GRID ───────────────── */}
      <Section
        eyebrow="Services"
        title="Four ways we plug in."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <ServiceCard
            href="/connectors"
            tag="Differentiator"
            title="Connectors"
            body="Pre-built, monitored NetSuite integrations. CRM, eCommerce, payments, tax, logistics, EDI, banking, BI. Deployed in days, not months."
            stat={`${CONNECTORS.length}+ in library`}
            accent
          />
          <ServiceCard
            href="/implementation"
            tag="Project"
            title="Implementation"
            body="Fixed-scope phase-one go-lives. Discovery, configuration, data migration, training, hyper-care. Module rollouts and rescues, too."
            stat="10–12 weeks typical"
          />
          <ServiceCard
            href="/support"
            tag="Ongoing"
            title="Support"
            body="Managed NetSuite support with SLAs. Named consultants, release coverage, connector monitoring, quarterly health checks."
            stat="P1 in 2 hours"
          />
          <ServiceCard
            href="/customization"
            tag="Build"
            title="Customization"
            body="SuiteScript 2.1, SuiteFlow, custom records, workbooks, custom UIs. Source-controlled with SDF — readable in two years."
            stat="SDF + CI/CD"
          />
        </div>
      </Section>

      {/* ───────────────── PROOF ───────────────── */}
      <section className="relative overflow-hidden border-y border-white/5">
        <div aria-hidden className="absolute inset-0 bg-radial-glow opacity-50" />
        <div className="relative mx-auto max-w-layout px-6 lg:px-10 py-24 grid gap-12 lg:grid-cols-[1.4fr_1fr] items-center">
          <blockquote className="text-display-md font-medium tracking-editorial text-ink-900 max-w-3xl text-balance">
            <span className="text-accent-soft">“</span>
            We had a 4-month Shopify-to-NetSuite project on the backlog. eMerge had us live in 9 days.
            The connector pays for itself every Monday morning.
            <span className="text-accent-soft">”</span>
          </blockquote>
          <div className="flex flex-col gap-6">
            <Metric value="450M" label="records synced per month" />
            <Metric value="99.95%" label="connector uptime SLA" />
            <Metric value="9 days" label="median deploy time" />
          </div>
        </div>
      </section>

      {/* ───────────────── FINAL CTA ───────────────── */}
      <section className="mx-auto max-w-layout px-6 lg:px-10 py-32 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-600 mb-6">Get started</p>
        <h2 className="text-display-lg font-medium tracking-editorial text-balance max-w-3xl mx-auto">
          Stop building integrations.<br />
          <span className="text-aurora">Start using them.</span>
        </h2>
        <p className="mt-6 max-w-xl mx-auto text-ink-700">
          Pick a connector, book a call, or let our AI walk you through it.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/connectors"
            className="rounded-full bg-ink-900 px-5 py-3 text-sm font-medium text-ink hover:bg-white transition-colors"
          >
            Browse connectors
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-ink-900 hover:bg-white/[0.04] transition-colors"
          >
            Book a call
          </Link>
          <Link
            href="/ai"
            className="rounded-full border border-accent/40 bg-accent/10 px-5 py-3 text-sm font-medium text-accent-soft hover:bg-accent/20 transition-colors"
          >
            Try the immersive AI →
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}

/* ────────── Local primitives ────────── */

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-layout px-6 lg:px-10 py-24">
      <div className="flex items-end justify-between mb-10 gap-6 flex-wrap">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-600 mb-3">
            {eyebrow}
          </p>
          <h2 className="text-display-lg font-medium tracking-editorial text-balance max-w-2xl">
            {title}
          </h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function ServiceCard({
  href,
  tag,
  title,
  body,
  stat,
  accent,
}: {
  href: string;
  tag: string;
  title: string;
  body: string;
  stat: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative group rounded-2xl border bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-colors overflow-hidden ${
        accent ? "border-accent/30" : "border-white/8"
      }`}
    >
      {accent && (
        <div
          aria-hidden
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-accent/15 blur-3xl"
        />
      )}
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded ${
              accent
                ? "text-accent-soft bg-accent/10 border border-accent/20"
                : "text-ink-600 bg-white/5 border border-white/10"
            }`}
          >
            {tag}
          </span>
          <span className="font-mono text-xs text-ink-600">{stat}</span>
        </div>
        <h3 className="text-2xl font-medium tracking-editorial text-ink-900 mb-3">{title}</h3>
        <p className="text-sm leading-relaxed text-ink-700 max-w-md">{body}</p>
        <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-800 group-hover:text-accent-soft transition-colors">
          Learn more
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-mono text-ink-900 font-medium">{value}</span>
      <span className="text-ink-500">{label}</span>
    </span>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-l border-accent/40 pl-5">
      <div className="font-mono text-3xl text-ink-900 font-medium">{value}</div>
      <div className="text-sm text-ink-600 mt-1">{label}</div>
    </div>
  );
}
