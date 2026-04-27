export type ConnectorCategory =
  | "CRM"
  | "eCommerce"
  | "Payments"
  | "Tax"
  | "Logistics"
  | "EDI"
  | "Banking"
  | "BI"
  | "Marketing"
  | "Expense"
  | "HRIS";

export type Connector = {
  slug: string;
  name: string;
  category: ConnectorCategory;
  /** One-line value prop. */
  oneLiner: string;
  /** What we sync — used in the data-flow diagram. */
  fields: string[];
  /** Estimated days to live. */
  deployDays: number;
  /** Direction of data flow. */
  direction: "→" | "↔";
  /** Counterpart system in the flow. */
  counterpart: string;
  /** Aliases the AI matches against (lowercase). */
  aliases: string[];
};

export const CONNECTORS: Connector[] = [
  {
    slug: "salesforce",
    name: "Salesforce",
    category: "CRM",
    oneLiner: "Bi-directional sync of accounts, opportunities, orders and invoices.",
    fields: ["Account", "Contact", "Opportunity", "Order", "Invoice"],
    deployDays: 8,
    direction: "↔",
    counterpart: "Salesforce",
    aliases: ["salesforce", "sfdc", "sf"],
  },
  {
    slug: "hubspot",
    name: "HubSpot",
    category: "CRM",
    oneLiner: "Closed-won deals create NetSuite customers and orders. Revenue back to HubSpot.",
    fields: ["Company", "Deal", "Customer", "SalesOrder", "Revenue"],
    deployDays: 7,
    direction: "↔",
    counterpart: "HubSpot",
    aliases: ["hubspot", "hs"],
  },
  {
    slug: "shopify",
    name: "Shopify",
    category: "eCommerce",
    oneLiner: "Real-time order, customer, and fulfillment sync. Multi-store consolidation.",
    fields: ["Order", "Customer", "Item", "Fulfillment", "Refund"],
    deployDays: 6,
    direction: "→",
    counterpart: "Shopify",
    aliases: ["shopify", "shop"],
  },
  {
    slug: "bigcommerce",
    name: "BigCommerce",
    category: "eCommerce",
    oneLiner: "Order capture, inventory pushback, customer dedup, multi-channel SKU mapping.",
    fields: ["Order", "Customer", "Inventory", "Channel"],
    deployDays: 7,
    direction: "→",
    counterpart: "BigCommerce",
    aliases: ["bigcommerce", "bc"],
  },
  {
    slug: "stripe",
    name: "Stripe",
    category: "Payments",
    oneLiner: "Charges, refunds, payouts and reconciliations posted to the right GL accounts.",
    fields: ["Charge", "Refund", "Payout", "Dispute", "GL"],
    deployDays: 5,
    direction: "→",
    counterpart: "Stripe",
    aliases: ["stripe"],
  },
  {
    slug: "avalara",
    name: "Avalara AvaTax",
    category: "Tax",
    oneLiner: "Real-time tax on sales orders + address validation + returns filing.",
    fields: ["Address", "Tax", "Return", "Exemption"],
    deployDays: 6,
    direction: "→",
    counterpart: "Avalara",
    aliases: ["avalara", "avatax", "tax"],
  },
  {
    slug: "shipstation",
    name: "ShipStation",
    category: "Logistics",
    oneLiner: "Push fulfillments, pull tracking. Multi-warehouse routing, rate shopping.",
    fields: ["Fulfillment", "Tracking", "Carrier", "Rate"],
    deployDays: 5,
    direction: "↔",
    counterpart: "ShipStation",
    aliases: ["shipstation", "shipping"],
  },
  {
    slug: "edi",
    name: "EDI (X12, EDIFACT)",
    category: "EDI",
    oneLiner: "850, 810, 856, 855, 940. AS2 and SFTP. Trading partner onboarding included.",
    fields: ["850 PO", "856 ASN", "810 Invoice", "855 ACK", "940 Shipping"],
    deployDays: 14,
    direction: "↔",
    counterpart: "EDI Partner",
    aliases: ["edi", "x12", "edifact", "850", "810", "856"],
  },
  {
    slug: "banking",
    name: "Banking & Payments",
    category: "Banking",
    oneLiner: "Bank feed reconciliation, ACH origination, wire confirmations.",
    fields: ["Statement", "ACH", "Wire", "Reconciliation"],
    deployDays: 9,
    direction: "↔",
    counterpart: "Bank API",
    aliases: ["bank", "banking", "ach", "plaid", "wire"],
  },
  {
    slug: "snowflake",
    name: "Snowflake",
    category: "BI",
    oneLiner: "Daily or near-real-time replication of NetSuite data into Snowflake schemas.",
    fields: ["Transactions", "Items", "Customers", "Saved Searches"],
    deployDays: 8,
    direction: "→",
    counterpart: "Snowflake",
    aliases: ["snowflake", "data warehouse", "warehouse", "bi"],
  },
  {
    slug: "marketo",
    name: "Marketo",
    category: "Marketing",
    oneLiner: "Lead-to-cash visibility. Marketo leads sync to NetSuite customers.",
    fields: ["Lead", "Activity", "Customer", "Revenue"],
    deployDays: 7,
    direction: "↔",
    counterpart: "Marketo",
    aliases: ["marketo"],
  },
  {
    slug: "expensify",
    name: "Expensify",
    category: "Expense",
    oneLiner: "Approved expense reports posted to NetSuite as employee expense bills.",
    fields: ["Report", "Receipt", "GL Coding"],
    deployDays: 4,
    direction: "→",
    counterpart: "Expensify",
    aliases: ["expensify", "expense"],
  },
  {
    slug: "workday",
    name: "Workday HCM",
    category: "HRIS",
    oneLiner: "Employee master + cost center sync. New hires create NetSuite employees automatically.",
    fields: ["Employee", "CostCenter", "Department", "Manager"],
    deployDays: 9,
    direction: "→",
    counterpart: "Workday",
    aliases: ["workday", "hcm", "hris"],
  },
];

/** Find a connector by name fragment (used by the AI to materialize cards live). */
export function matchConnectors(query: string): Connector[] {
  const q = query.toLowerCase();
  return CONNECTORS.filter(
    (c) => c.aliases.some((a) => q.includes(a)) || q.includes(c.name.toLowerCase()),
  );
}
