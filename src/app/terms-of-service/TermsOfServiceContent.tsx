"use client";

import Link from "next/link";
import { Translate } from "@/components/LanguageContext";
import { EVENT } from "@/lib/event-facts";

// STE-10: Canonical contact values — never hardcode these strings again.
const SUPPORT_PHONE_TEL  = "+919950787787";
const SUPPORT_PHONE_DISP = "+91 99507 87787";
const COMPLIANCE_EMAIL   = EVENT.email;

export default function TermsOfServiceContent() {
  return (
    <main className="min-h-screen bg-[#050505] text-expo-warm selection:bg-expo-gold/30 antialiased relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
      {/* Aesthetic Backplates */}
      <div className="absolute inset-0 bg-mesh-dark opacity-60 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />
      <div className="spotlight-glowing right-[20%] top-[10%] w-[35vw] h-[35vw]" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12">
        {/* Back Link + cross-link to Privacy Policy (STE-09) */}
        <div className="flex items-center justify-between mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[3px] text-expo-gold hover:text-white transition-colors duration-300 group"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>{" "}
            <Translate en="Exhibition Home" hi="प्रदर्शनी होम" />
          </Link>
          <Link
            href="/privacy-policy"
            className="font-sans text-xs text-expo-warm/50 hover:text-expo-gold transition-colors duration-300 underline underline-offset-4"
          >
            <Translate en="← Privacy Policy" hi="← गोपनीयता नीति" />
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-white/10 pb-8 mb-12">
          <span className="text-xs font-bold tracking-[6px] text-expo-gold uppercase mb-3 block">
            <Translate en="STE 2026 • COMPLIANCE" hi="एसटीई 2026 • अनुपालन" />
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight text-white leading-none">
            <Translate en="Terms of" hi="सेवा की" />{" "}
            <span className="text-metallic font-light italic">
              <Translate en="Service" hi="शर्ते" />
            </span>
          </h1>
          <p className="font-sans text-xs text-expo-warm/60 mt-4">
            <Translate en="Last Updated: May 23, 2026" hi="अंतिम अपडेट: 23 मई, 2026" />
          </p>
        </div>

        {/* Content */}
        <div className="font-sans text-sm sm:text-base text-expo-warm/75 leading-relaxed space-y-8">
          <p>
            <Translate
              en="Welcome to the official portal of the Surat Textile Exhibition (STE 2026). By accessing our website, downloading our technical exhibition blueprints, downloading brochures, or submitting stall booking registrations, you agree to comply with and be bound by the following Terms of Service. Please review them carefully."
              hi="सूरत टेक्सटाइल प्रदर्शनी (STE 2026) के आधिकारिक पोर्टल पर आपका स्वागत है। हमारी वेबसाइट का उपयोग करके, हमारे तकनीकी प्रदर्शनी ब्लूप्रिंट डाउनलोड करके, ब्रोशर डाउनलोड करके, या स्टॉल बुकिंग पंजीकरण सबमिट करके, आप निम्नलिखित सेवा की शर्तों का पालन करने और उनसे बंधे रहने के लिए सहमत होते हैं। कृपया उनकी सावधानीपूर्वक समीक्षा करें।"
            />
          </p>

          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl text-white tracking-wide border-l-2 border-expo-gold pl-4">
              <Translate en="1. B2B Eligibility &amp; Stall Applications" hi="1. बी2बी पात्रता और स्टॉल आवेदन" />
            </h2>
            <p>
              <Translate
                en="STE 2026 is an exclusive commercial trade-only B2B exhibition. General public registrations are not eligible for commercial stall purchases:"
                hi="STE 2026 एक विशेष व्यावसायिक केवल-व्यापार (B2B) प्रदर्शनी है। आम जनता के पंजीकरण व्यावसायिक स्टॉल खरीद के लिए पात्र नहीं हैं:"
              />
            </p>
            <ul className="list-disc pl-6 space-y-2 text-expo-warm/70">
              <li>
                <Translate
                  en="Exhibitors must provide valid commercial corporate credentials, including an active and legally valid GSTIN."
                  hi="प्रदर्शकों को एक सक्रिय और कानूनी रूप से मान्य जीएसटीआईएन सहित वैध व्यावसायिक कॉर्पोरेट प्रमाण-पत्र प्रदान करने होंगे।"
                />
              </li>
              <li>
                <Translate
                  en="Stall space applications submitted via this website represent preliminary bookings and are subject to final layout review, space availability, and organizer approval."
                  hi="इस वेबसाइट के माध्यम से सबमिट किए गए स्टॉल स्पेस के आवेदन प्रारंभिक बुकिंग का प्रतिनिधित्व करते हैं और अंतिम लेआउट समीक्षा, स्थान की उपलब्धता और आयोजक की स्वीकृति के अधीन हैं।"
                />
              </li>
              <li>
                <Translate
                  en="The organizers (AKAS Group) reserve absolute discretion to reallocate stall numbers, zones, or adjust final floor concourses in line with safety regulations and zoning compliance."
                  hi="आयोजकों (अकास ग्रुप) के पास सुरक्षा नियमों और ज़ोनिंग अनुपालन के अनुरूप स्टॉल नंबरों, ज़ोनों को पुन: आवंटित करने या अंतिम फ्लोर कॉनकोर्स को समायोजित करने का पूर्ण अधिकार सुरक्षित है।"
                />
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl text-white tracking-wide border-l-2 border-expo-gold pl-4">
              <Translate en="2. Intellectual Property and Technical Blueprints" hi="2. बौद्धिक संपदा और तकनीकी ब्लूप्रिंट" />
            </h2>
            <p>
              <Translate
                en="All materials published on this website, including but not limited to technical SVG floor plans, high-fidelity promotional videos, official brochures, logos, branding, and copy structures are the absolute intellectual property of AKAS Group. Any unauthorized redistribution, hotlinking, or commercial reproduction of these digital assets without prior written consent is strictly prohibited."
                hi="तकनीकी एसवीजी फ्लोर प्लान, हाई-फिडेलिटी प्रमोशनल वीडियो, आधिकारिक ब्रोशर, लोगो, ब्रांडिंग और कॉपी संरचनाओं सहित लेकिन इन्हीं तक सीमित नहीं, इस वेबसाइट पर प्रकाशित सभी सामग्रियां अकास ग्रुप की पूर्ण बौद्धिक संपदा हैं। पूर्व लिखित सहमति के बिना इन डिजिटल संपत्तियों का कोई भी अनधिकृत पुनर्वितरण, हॉटलिंकिंग, या व्यावसायिक पुनरुत्पादन सख्त वर्जित है।"
              />
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl text-white tracking-wide border-l-2 border-expo-gold pl-4">
              <Translate en="3. Commercial Booking Confirmations &amp; Cancellation" hi="3. व्यावसायिक बुकिंग पुष्टि और रद्दीकरण" />
            </h2>
            <p>
              <Translate
                en="Initial registration on this portal does not guarantee stall space. Secure reservation is only completed upon the verification of business details, formal slot allocation by an STE manager, and execution of the final commercial contract alongside necessary down payments:"
                hi="इस पोर्टल पर प्रारंभिक पंजीकरण स्टॉल स्पेस की गारंटी नहीं देता है। सुरक्षित आरक्षण केवल व्यावसायिक विवरणों के सत्यापन, एक STE प्रबंधक द्वारा औपचारिक स्लॉट आवंटन, और आवश्यक अग्रिम भुगतान (डाउन पेमेंट) के साथ अंतिम व्यावसायिक अनुबंध के निष्पादन के बाद ही पूरा होता है:"
              />
            </p>
            <ul className="list-disc pl-6 space-y-2 text-expo-warm/70">
              <li>
                <Translate
                  en="Stall cancellation, fee structures, refunds, and transfer rules are governed exclusively by the primary physical contract signed between the exhibitor and AKAS Group."
                  hi="स्टॉल रद्द करना, शुल्क संरचना, रिफंड और ट्रांसफर नियम विशेष रूप से प्रदर्शक और अकास ग्रुप के बीच हस्ताक्षरित प्राथमिक भौतिक अनुबंध द्वारा शासित होते हैं।"
                />
              </li>
              <li>
                <Translate
                  en="Organizers shall not be held liable for any loss, delay, or event cancellations caused by Force Majeure circumstances including government regulations, municipal restrictions, natural disasters, or strikes."
                  hi="सरकारी नियमों, नगरपालिका प्रतिबंधों, प्राकृतिक आपदाओं या हड़तालों सहित अप्रत्याशित परिस्थितियों (फोर्स मेज्योर) के कारण होने वाले किसी भी नुकसान, देरी या कार्यक्रम रद्द होने के लिए आयोजक उत्तरदायी नहीं होंगे।"
                />
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl text-white tracking-wide border-l-2 border-expo-gold pl-4">
              <Translate en="4. Governing Law and Dispute Resolution" hi="4. लागू कानून और विवाद समाधान" />
            </h2>
            <p>
              <Translate
                en="These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes, claims, or controversies arising out of or in connection with the digital services, registrations, or events organized on this platform shall be subject to the exclusive jurisdiction of the competent courts in Surat, Gujarat."
                hi="ये सेवा की शर्तें भारत के कानूनों के अनुसार शासित और विश्लेषित होती हैं। इस मंच पर आयोजित डिजिटल सेवाओं, पंजीकरणों या कार्यक्रमों के संबंध में या उससे उत्पन्न होने वाले किसी भी विवाद, दावे या असहमति को सूरत, गुजरात में सक्षम न्यायालयों के अनन्य क्षेत्राधिकार के अधीन किया जाएगा।"
              />
            </p>
          </section>

          {/* STE-10: Contact details — required for any terms document covering bookings */}
          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl text-white tracking-wide border-l-2 border-expo-gold pl-4">
              <Translate en="5. Notices &amp; Contact" hi="5. नोटिस और संपर्क" />
            </h2>
            <p>
              <Translate
                en="For formal notices, booking disputes, or queries about these Terms, write to the AKAS Group compliance office. All notices must be in writing and sent to the postal or email address below."
                hi="औपचारिक नोटिस, बुकिंग विवाद, या इन शर्तों के बारे में प्रश्नों के लिए, अकास ग्रुप के अनुपालन कार्यालय को लिखें। सभी नोटिस लिखित रूप में और नीचे दिए गए डाक या ईमेल पते पर भेजे जाने चाहिए।"
              />
            </p>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 font-sans text-sm text-expo-warm/80 space-y-2 max-w-md">
              <p className="font-semibold text-white">
                <Translate en="AKAS Group (STE Organizers)" hi="अकास ग्रुप (STE आयोजक)" />
              </p>
              <p>
                <Translate en={`Email: ${COMPLIANCE_EMAIL}`} hi={`ईमेल: ${COMPLIANCE_EMAIL}`} />
              </p>
              <p>
                <Translate en="Hotline: " hi="हॉटलाइन: " />
                <a
                  href={`tel:${SUPPORT_PHONE_TEL}`}
                  className="text-expo-gold hover:text-white transition-colors"
                >
                  {SUPPORT_PHONE_DISP}
                </a>
              </p>
              <p>
                <Translate
                  en={`Postal Address: ${EVENT.venueName}, ${EVENT.streetAddress}, ${EVENT.city}, ${EVENT.region} — ${EVENT.postalCode}`}
                  hi={`डाक पता: ${EVENT.venueName}, ${EVENT.streetAddress}, ${EVENT.city}, ${EVENT.region} — ${EVENT.postalCode}`}
                />
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
