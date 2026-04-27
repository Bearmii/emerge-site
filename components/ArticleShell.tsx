import Link from "next/link";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function ArticleShell({
  kicker,
  title,
  highlight,
  lede,
  children,
}: {
  kicker: string;
  title: string;
  highlight?: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />

      <section className="relative overflow-hidden border-b border-white/5">
        <div aria-hidden className="absolute inset-0 bg-dot-grid opacity-50 [mask-image:radial-gradient(ellipse_at_top,black,transparent_60%)]" />
        <div aria-hidden className="absolute inset-0 bg-radial-glow" />
        <div className="relative mx-auto max-w-layout px-6 lg:px-10 pt-24 pb-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-600 mb-6">{kicker}</p>
          <h1 className="text-display-xl font-medium tracking-ultra max-w-3xl text-balance">
            {title}
            {highlight && <> <span className="text-aurora">{highlight}</span></>}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-700 text-pretty">{lede}</p>
        </div>
      </section>

      <article className="mx-auto max-w-prose px-6 lg:px-0 py-20 [&_h2]:text-display-md [&_h2]:font-medium [&_h2]:tracking-editorial [&_h2]:mt-16 [&_h2]:mb-5 [&_p]:text-ink-700 [&_p]:leading-relaxed [&_p]:my-4 [&_li]:text-ink-700 [&_li]:leading-relaxed [&_ul]:my-4 [&_ul]:pl-5 [&_ul]:space-y-2 [&_ul]:list-disc [&_ul]:marker:text-accent [&_strong]:text-ink-900 [&_a]:text-accent-soft [&_a:hover]:text-ink-900 [&_a]:transition-colors">
        {children}

        <div className="mt-16 surface-glass rounded-2xl p-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-accent-soft mb-1">Next step</p>
            <p className="text-ink-900 font-medium">Tell us what's going on with NetSuite.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/contact" className="rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-ink hover:bg-white transition-colors">
              Book a call
            </Link>
            <Link href="/ai" className="rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-medium text-accent-soft hover:bg-accent/20 transition-colors">
              Ask the AI
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </>
  );
}

export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-8 surface-glass rounded-xl p-5 border-accent/20">
      <div className="text-sm text-ink-800">{children}</div>
    </div>
  );
}
