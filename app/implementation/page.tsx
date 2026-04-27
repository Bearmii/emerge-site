import { ArticleShell, Callout } from "@/components/ArticleShell";

export const metadata = {
  title: "NetSuite Implementation",
  description:
    "Fixed-scope phase-one NetSuite go-lives — discovery, configuration, data migration, training, hyper-care.",
};

export default function ImplementationPage() {
  return (
    <ArticleShell
      kicker="Service · Implementation"
      title="NetSuite go-lives"
      highlight="that go live."
      lede="Most NetSuite implementations slip because scope drifts and decisions stall. We deliver fixed-scope phase ones — clean configuration, real cutover, no rolling deadlines — and then expand from a working base."
    >
      <h2>What's included</h2>
      <ul>
        <li><strong>Discovery.</strong> Process mapping for order-to-cash, procure-to-pay, record-to-report. Decisions documented, not assumed.</li>
        <li><strong>Configuration.</strong> Native NetSuite first. Customizations only when native doesn't fit, and only after we've justified them.</li>
        <li><strong>Data migration.</strong> Master data, open transactions, balances. Reconciled to legacy, sandbox-tested before production load.</li>
        <li><strong>Integrations.</strong> Pulled from our <a href="/connectors">connector library</a> when available. Custom-built only when there's no fit.</li>
        <li><strong>Training.</strong> Role-based, recorded, with quick-reference guides your team will actually use.</li>
        <li><strong>Hyper-care.</strong> Two weeks of dedicated post-go-live support with daily standups.</li>
      </ul>

      <h2>How a phase-one engagement runs</h2>
      <ul>
        <li><strong>Weeks 1–2.</strong> Discovery, fit-gap, fixed-scope SOW. Stop here for a fee — no commitment to phase two yet.</li>
        <li><strong>Weeks 3–8.</strong> Configuration, integrations, data migration. Weekly demos. UAT runs in parallel, not at the end.</li>
        <li><strong>Weeks 9–10.</strong> Cutover plan, training, dress rehearsal. Go-live on a date you control.</li>
        <li><strong>Weeks 11–12.</strong> Hyper-care. Then transition to <a href="/support">managed support</a> or self-sufficiency.</li>
      </ul>

      <Callout>
        <strong className="text-ink-900">Rescue, too.</strong> If your current NetSuite implementation is slipping, we can step in as an independent technical lead — not necessarily replacing your partner, but stabilizing the project. <a href="/contact">Tell us the situation.</a>
      </Callout>

      <h2>Best fit</h2>
      <ul>
        <li>Mid-market companies (50–2,000 employees) doing a first NetSuite go-live</li>
        <li>Existing customers rolling out a new module — Advanced Manufacturing, SuiteCommerce, OneWorld, Fixed Assets</li>
        <li>Implementations that have stalled and need a credible path to go-live</li>
      </ul>
    </ArticleShell>
  );
}
