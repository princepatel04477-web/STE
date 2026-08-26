import type { Metadata } from "next";

/**
 * STE-06 + STE-17: Exhibitor login page metadata.
 *
 * robots: noindex, follow — this page should NOT appear in search results
 * (it's a portal login, not a public landing page) but crawlers can still
 * follow links FROM it, and WhatsApp / LinkedIn can still generate link
 * previews when an exhibitor receives their portal URL directly.
 *
 * This is the correct approach: robots.txt disallow blocks ALL bots including
 * WhatsApp/LinkedIn scrapers; `noindex` via metadata only affects search index,
 * leaving previews intact.
 */
export const metadata: Metadata = {
  title: "Exhibitor Login",
  description:
    "Log in to your STE 2026 exhibitor portal to manage your stall booking, view floor allocation, and access your exhibition credentials.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/exhibitor/login",
  },
};

export default function ExhibitorLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
