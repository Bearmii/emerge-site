import { ArticleShell, Callout } from "@/components/ArticleShell";

export const metadata = {
  title: "NetSuite Customization",
  description:
    "SuiteScript 2.1, SuiteFlow, custom records and SuiteAnalytics workbooks. Source-controlled with SDF.",
};

export default function CustomizationPage() {
  return (
    <ArticleShell
      kicker="Service · Customization"
      title="SuiteScript and SuiteFlow"
      highlight="your future admin can read."
      lede="Customizations rot when nobody understands them. We build NetSuite extensions that solve real business needs and that the admin reading them in 2028 can still maintain. No clever tricks, no magic, no orphaned bundles."
    >
      <h2>What we build</h2>
      <ul>
        <li><strong>SuiteScript 2.1.</strong> User events, scheduled, map/reduce, RESTlets, Suitelets. Async/await, modular code, written tests.</li>
        <li><strong>SuiteFlow.</strong> Workflows that don't fight scripts. Clear state, documented transitions, no silent loops.</li>
        <li><strong>Custom records &amp; data models.</strong> Only when native objects don't fit. Modeled for query performance from day one.</li>
        <li><strong>Custom UIs.</strong> Suitelets and SuiteApps where standard NetSuite UI hurts adoption.</li>
        <li><strong>SuiteAnalytics workbooks.</strong> Replacements for slow saved searches; pivot tables and charts users actually open.</li>
        <li><strong>SDF &amp; CI/CD.</strong> Source-controlled customizations with sandbox-to-production pipelines, not "click around to deploy."</li>
      </ul>

      <h2>Our defaults</h2>
      <ul>
        <li><strong>Native first.</strong> If standard NetSuite can do it, we use standard NetSuite.</li>
        <li><strong>Document the WHY, not the WHAT.</strong> Code says what; comments and tickets say why.</li>
        <li><strong>Kill SuiteScript 1.0 on contact.</strong> Every engagement retires at least one 1.0 script. The platform is moving on; so should your code.</li>
        <li><strong>Sandbox-tested before production.</strong> Always. No exceptions. No "small one-line changes."</li>
      </ul>

      <Callout>
        <strong className="text-ink-900">Already drowning in custom?</strong> Start with a Customization Inventory — fixed fee, two weeks. Every script, workflow, and bundle catalogued, scored for risk and value, with a written remediation roadmap. <a href="/contact">Request the inventory.</a>
      </Callout>

      <h2>Best fit</h2>
      <ul>
        <li>Customers with a specific custom feature need (a vendor onboarding flow, a custom commission engine, a portal)</li>
        <li>Teams inheriting messy customizations from a previous partner</li>
        <li>Companies still running SuiteScript 1.0 who want a path to 2.1 without a rewrite-the-world project</li>
      </ul>
    </ArticleShell>
  );
}
