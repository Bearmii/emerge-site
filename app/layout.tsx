import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "eMerge — NetSuite integration, without the 6-month wait.",
    template: "%s · eMerge",
  },
  description:
    "NetSuite specialists with a library of 80+ pre-built connectors. Implementation, support, and customization. Try our AI consultant — it builds the integration map in front of you.",
  metadataBase: new URL("https://emerge-site-eight.vercel.app"),
  openGraph: {
    title: "eMerge — NetSuite integration, without the 6-month wait.",
    description:
      "80+ pre-built NetSuite connectors. Deployed in days. Talk to our AI to find the right one.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} dark scheme-dark`}
    >
      <body className="bg-ink text-ink-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
