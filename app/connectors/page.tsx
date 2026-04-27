import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CONNECTORS, type Connector } from "@/data/connectors";

export const metadata = {
  title: "Connector library — NetSuite integrations deployed in days",
  description:
    "80+ pre-built NetSuite connectors. CRM, eCommerce, payments, tax, logistics, EDI, banking and BI. Each is monitored and maintained.",
};

export default function ConnectorsPage() {
  const byCategory = CONNECTORS.reduce<Record<string, Connector[]>>((acc, c) => {
    (acc[c.category] ||= []).push(c);
    return acc;
  }, {});

  const categories = Object.entries(byCategory);

  return (
    <>
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div aria-hidden className="absolute inset-0 bg-dot-grid opacity-50 [mask-image:radial-gradient(ellipse_at_top,black,transparent_60%)]" />
        <div aria-hidden className="absolute inset-0 bg-radial-glow" />
        <div className="relative mx-auto max-w-layout px-6 lg:px-10 pt-24 pb-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-600 mb-6">
            Service · Connectors
          </p>
          <h1 className="text-display-xl font-medium tracking-ultra max-w-3xl text-balance">
            The NetSuite <span className="text-aurora">connector library</span>.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-700 text-pretty">
            Pre-built, monitored, and maintained. Each connector ships with field mapping,
            error handling, and a status dashboard. We deploy them in days and keep them healthy
            through every NetSuite release.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-layout px-6 lg:px-10 py-20">
        <div className="grid gap-16">
          {categories.map(([category, items]) => (
            <div key={category}>
              <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-white/5">
                <h2 className="text-display-md font-medium tracking-editorial">{category}</h2>
                <span className="font-mono text-xs text-ink-500">
                  {items.length} {items.length === 1 ? "connector" : "connectors"}
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((c) => (
                  <ConnectorCard key={c.slug} connector={c} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-layout px-6 lg:px-10 py-24 text-center">
        <h2 className="text-display-md font-medium tracking-editorial max-w-2xl mx-auto text-balance">
          Don't see yours? <span className="text-aurora">We'll build it.</span>
        </h2>
        <p className="mt-6 max-w-xl mx-auto text-ink-700">
          Custom connectors take 2–6 weeks depending on the API surface. Most enter the library afterward.
        </p>
        <div className="mt-10 flex justify-center gap-3 flex-wrap">
          <Link href="/contact" className="rounded-full bg-ink-900 px-5 py-3 text-sm font-medium text-ink hover:bg-white transition-colors">
            Request a connector
          </Link>
          <Link href="/ai" className="rounded-full border border-accent/40 bg-accent/10 px-5 py-3 text-sm font-medium text-accent-soft hover:bg-accent/20 transition-colors">
            Ask the AI
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}

function ConnectorCard({ connector: c }: { connector: Connector }) {
  return (
    <div className="surface-glass rounded-xl p-5 group hover:border-accent/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-accent-soft px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
            {c.direction === "↔" ? "bi-directional" : "one-way"}
          </span>
        </div>
        <div className="text-right">
          <div className="font-mono text-xs text-ink-700">{c.deployDays} days</div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-ink-500">to live</div>
        </div>
      </div>
      <h3 className="text-xl font-medium tracking-editorial text-ink-900 mb-1">
        {c.name} <span className="font-mono text-sm text-ink-500">{c.direction} NetSuite</span>
      </h3>
      <p className="text-sm leading-relaxed text-ink-700 mb-4">{c.oneLiner}</p>
      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
        {c.fields.map((f) => (
          <span
            key={f}
            className="font-mono text-[10px] text-ink-600 bg-white/[0.03] border border-white/5 rounded px-1.5 py-0.5"
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
