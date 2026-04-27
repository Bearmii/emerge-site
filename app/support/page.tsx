import { ArticleShell, Callout } from "@/components/ArticleShell";

export const metadata = {
  title: "Managed NetSuite Support",
  description:
    "SLA-backed managed NetSuite support — admin, scripting, release coverage, connector monitoring. Tiers from on-demand to embedded.",
};

export default function SupportPage() {
  return (
    <ArticleShell
      kicker="Service · Support"
      title="Managed NetSuite support,"
      highlight="with SLAs."
      lede="Most NetSuite admins are over-tasked. They either hand off real work to a black-box partner who takes weeks, or they patch problems at midnight. We're the option in between: a named bench of NetSuite consultants on retainer, with response SLAs you can plan around."
    >
      <h2>What's covered</h2>
      <ul>
        <li><strong>Admin tasks</strong> — users, roles, permissions, saved searches, custom records, page layouts.</li>
        <li><strong>Scripting changes</strong> — SuiteScript 2.1 and SuiteFlow modifications, bug fixes, performance tuning.</li>
        <li><strong>Release coverage</strong> — every NetSuite release tested in your sandbox before production. Breaking changes flagged and fixed.</li>
        <li><strong>Connector monitoring</strong> — if you use our <a href="/connectors">connector library</a>, we watch the queues and fix issues before your team notices.</li>
        <li><strong>Health checks &amp; audits</strong> — quarterly review of script governance, saved-search performance, role drift.</li>
        <li><strong>Stabilization sprints</strong> — when something is bleeding, we mobilize within hours, not days.</li>
      </ul>

      <h2>Tiers</h2>
      <ul>
        <li><strong>On-demand.</strong> Pre-paid block of hours. P2 response in 1 business day. Good for mature teams who need occasional backup.</li>
        <li><strong>Standard.</strong> Monthly retainer. Named team. P1 response in 2 hours, P2 in 4 hours. Quarterly health check included.</li>
        <li><strong>Embedded.</strong> Dedicated consultant(s) effectively part of your team. Daily standup, joint backlog, you set priorities.</li>
      </ul>

      <Callout>
        <strong className="text-ink-900">Why named consultants?</strong> NetSuite is too configurable for ticket-roulette. The same person who fixed your billing flow last quarter should be the one who answers when it breaks again.
      </Callout>

      <h2>Best fit</h2>
      <ul>
        <li>Post-go-live customers who don't want to staff a full internal admin team</li>
        <li>Teams that have been burned by big-partner support response times</li>
        <li>Companies with one stretched-thin admin who needs a senior backstop</li>
      </ul>
    </ArticleShell>
  );
}
