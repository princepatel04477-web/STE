"use client";

import Link from "next/link";

const SUPPORT_PHONE = "+919950787787";
const SUPPORT_DISPLAY = "+91 99507 87787";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#050505] text-expo-warm selection:bg-expo-gold/30 antialiased relative overflow-hidden py-24 sm:py-32">
      {/* Aesthetic Backplates */}
      <div className="absolute inset-0 bg-mesh-dark opacity-60 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />
      <div className="spotlight-glowing left-[20%] top-[10%] w-[35vw] h-[35vw]" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[3px] text-expo-gold hover:text-white transition-colors duration-300 mb-12 group"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span> Back to Exhibition Home
        </Link>

        {/* Header */}
        <div className="border-b border-white/10 pb-8 mb-12">
          <span className="text-[10px] font-bold tracking-[6px] text-expo-gold uppercase mb-3 block">
            STE 2026 • COMPLIANCE
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight text-white leading-none">
            Privacy <span className="text-metallic font-light italic">Policy</span>
          </h1>
          <p className="font-sans text-xs text-expo-warm/40 mt-4">
            Last Updated: May 23, 2026
          </p>
        </div>

        {/* Content */}
        <div className="font-sans text-sm sm:text-base text-expo-warm/75 leading-relaxed space-y-8">
          <p>
            Surat Textile Exhibition (STE 2026), organized by AKAS Group, is committed to protecting the privacy and security of your business and personal information. This Privacy Policy describes how we collect, use, and safeguard data when you visit our website (stex2.vercel.app), register as an exhibitor, book exhibition stalls, or submit inquiries.
          </p>

          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl text-white tracking-wide border-l-2 border-expo-gold pl-4">
              1. Information We Collect
            </h2>
            <p>
              To facilitate B2B stall bookings and buyer registrations, we collect trade-related details including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-expo-warm/70">
              <li>Company Name, Authorized Contact Person name, and designation.</li>
              <li>Active commercial contact numbers and verified WhatsApp business numbers.</li>
              <li>Corporate email address and business registered city.</li>
              <li>GSTIN (Goods and Services Tax Identification Number) for legal B2B verification.</li>
              <li>Business Type (e.g., Manufacturer, Wholesaler, Retailer) and Primary Product Categories.</li>
              <li>Exhibition specifications, such as desired stall dimensions and annual business turnover brackets.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl text-white tracking-wide border-l-2 border-expo-gold pl-4">
              2. How We Use Your Information
            </h2>
            <p>
              The collected corporate details are processed to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-expo-warm/70">
              <li>Process and verify your commercial exhibition stall applications.</li>
              <li>Send verified tax receipts, registration invoices, and floor blueprints.</li>
              <li>Provide instant B2B inquiry confirmation alerts directly via WhatsApp and Email.</li>
              <li>Coordinate logistics, VIP lounge passes, and exhibition badge printings.</li>
              <li>Provide media and advertising opportunities relative to your trade catalog.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl text-white tracking-wide border-l-2 border-expo-gold pl-4">
              3. Data Security and Retention
            </h2>
            <p>
              We implement industry-grade technical and organizational measures to protect your commercial data against unauthorized access, disclosure, or alteration. All submitted GSTIN and contact details are stored securely. We retain trade inquiry records only as long as necessary to complete commercial booking agreements and legal tax reporting.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl text-white tracking-wide border-l-2 border-expo-gold pl-4">
              4. Contact Our Compliance Team
            </h2>
            <p>
              If you have any questions concerning this Privacy Policy or your business data rights, please contact the AKAS Group Compliance Office:
            </p>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 font-sans text-sm text-expo-warm/80 space-y-2 max-w-md">
              <p className="font-semibold text-white">AKAS Group (STE Organizers)</p>
              <p>Email: compliance@akasgroup.in</p>
              <p>
                Hotline:{" "}
                <a
                  href={`tel:${SUPPORT_PHONE}`}
                  className="text-expo-gold hover:text-white transition-colors"
                >
                  {SUPPORT_DISPLAY}
                </a>
              </p>
              <p>Address: Surat International Exhibition and Convention Centre (SIECC), Sarsana, Surat, Gujarat - 395007</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
