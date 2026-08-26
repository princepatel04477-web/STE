import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PrivacyPolicyContent from "./PrivacyPolicyContent";

// STE-06: Unique page-level metadata (overrides root layout template)
export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Surat Textile Exhibition 2026 (STE), organised by AKAS Group, collects, uses, and protects exhibitor and buyer data submitted through www.stesurat.com.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

// STE-09: Legal pages now include the full site chrome (header + footer)
// so visitors can navigate back, toggle language, and reach the Exhibitor
// Portal without using the browser back button.
export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <PrivacyPolicyContent />
      <Footer />
    </>
  );
}
