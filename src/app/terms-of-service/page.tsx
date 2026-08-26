import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TermsOfServiceContent from "./TermsOfServiceContent";

// STE-06: Unique page-level metadata
export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Booking eligibility, stall reservation terms, cancellation policy, intellectual property rights, and governing law for the Surat Textile Exhibition 2026.",
  alternates: {
    canonical: "/terms-of-service",
  },
};

// STE-09: Wrap legal page in the full site chrome (Navbar + Footer)
export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />
      <TermsOfServiceContent />
      <Footer />
    </>
  );
}
