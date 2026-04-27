import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/5 mt-32">
      <div className="mx-auto max-w-layout px-6 lg:px-10 py-16 grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_14px_rgba(123,108,246,0.9)]" />
            <span className="font-mono text-sm tracking-tight">eMerge</span>
          </div>
          <p className="text-sm text-ink-600 max-w-sm leading-relaxed">
            NetSuite specialists with a library of pre-built connectors. We make NetSuite play nicely with the rest of your stack.
          </p>
        </div>
        <FooterCol title="Services">
          <FooterLink href="/connectors">Connectors</FooterLink>
          <FooterLink href="/implementation">Implementation</FooterLink>
          <FooterLink href="/support">Support</FooterLink>
          <FooterLink href="/customization">Customization</FooterLink>
        </FooterCol>
        <FooterCol title="Engage">
          <FooterLink href="/ai">AI consultant</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
        </FooterCol>
        <FooterCol title="Company">
          <span className="text-sm text-ink-600">NetSuite-only · Vendor-independent</span>
        </FooterCol>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-layout px-6 lg:px-10 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-ink-500">
          <span>© 2026 eMerge Solutions</span>
          <span className="font-mono">v2 · built with Next.js + Three.js</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-mono uppercase tracking-wider text-ink-500 mb-1">{title}</span>
      {children}
    </div>
  );
}
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm text-ink-700 hover:text-ink-900 transition-colors">
      {children}
    </Link>
  );
}
