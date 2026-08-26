"use client";

import Link from "next/link";
import { Translate } from "@/components/LanguageContext";
import { EVENT } from "@/lib/event-facts";

// STE-10: Contact details come from event-facts so they can never drift.
const SUPPORT_PHONE_TEL  = "+919950787787";
const SUPPORT_PHONE_DISP = "+91 99507 87787";
const COMPLIANCE_EMAIL   = EVENT.email;

export default function PrivacyPolicyContent() {
  return (
    <main className="min-h-screen bg-[#050505] text-expo-warm selection:bg-expo-gold/30 antialiased relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
      {/* Aesthetic Backplates */}
      <div className="absolute inset-0 bg-mesh-dark opacity-60 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />
      <div className="spotlight-glowing left-[20%] top-[10%] w-[35vw] h-[35vw]" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12">
        {/* Back Link + cross-link to Terms (STE-09) */}
        <div className="flex items-center justify-between mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[3px] text-expo-gold hover:text-white transition-colors duration-300 group"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>{" "}
            <Translate en="Exhibition Home" hi="प्रदर्शनी होम" />
          </Link>
          <Link
            href="/terms-of-service"
            className="font-sans text-xs text-expo-warm/50 hover:text-expo-gold transition-colors duration-300 underline underline-offset-4"
          >
            <Translate en="Terms of Service →" hi="सेवा की शर्तें →" />
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-white/10 pb-8 mb-12">
          <span className="text-xs font-bold tracking-[6px] text-expo-gold uppercase mb-3 block">
            <Translate en="STE 2026 • COMPLIANCE" hi="एसटीई 2026 • अनुपालन" />
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight text-white leading-none">
            <Translate en="Privacy" hi="गोपनीयता" />{" "}
            <span className="text-metallic font-light italic">
              <Translate en="Policy" hi="नीति" />
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
              en="Surat Textile Exhibition (STE 2026), organized by AKAS Group, is committed to protecting the privacy and security of your business and personal information. This Privacy Policy describes how we collect, use, and safeguard data when you visit our website (www.stesurat.com), register as an exhibitor, book exhibition stalls, or submit inquiries."
              hi="अकास ग्रुप द्वारा आयोजित सूरत टेक्सटाइल प्रदर्शनी (STE 2026), आपके व्यवसाय और व्यक्तिगत जानकारी की गोपनीयता और सुरक्षा की रक्षा करने के लिए प्रतिबद्ध है। यह गोपनीयता नीति बताती है कि जब आप हमारी वेबसाइट (www.stesurat.com) पर जाते हैं, एक प्रदर्शक के रूप में पंजीकरण करते हैं, प्रदर्शनी स्टॉल बुक करते हैं, या पूछताछ सबमिट करते हैं, तो हम डेटा को कैसे एकत्र, उपयोग और सुरक्षित करते हैं।"
            />
          </p>

          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl text-white tracking-wide border-l-2 border-expo-gold pl-4">
              <Translate en="1. Information We Collect" hi="1. जानकारी जो हम एकत्र करते हैं" />
            </h2>
            <p>
              <Translate
                en="To facilitate B2B stall bookings and buyer registrations, we collect trade-related details including:"
                hi="बी2बी स्टॉल बुकिंग और खरीदार पंजीकरण की सुविधा के लिए, हम व्यापार-संबंधी विवरण एकत्र करते हैं जिनमें शामिल हैं:"
              />
            </p>
            <ul className="list-disc pl-6 space-y-2 text-expo-warm/70">
              <li>
                <Translate
                  en="Company Name, Authorized Contact Person name, and designation."
                  hi="कंपनी का नाम, अधिकृत संपर्क व्यक्ति का नाम और पद।"
                />
              </li>
              <li>
                <Translate
                  en="Active commercial contact numbers and verified WhatsApp business numbers."
                  hi="सक्रिय व्यावसायिक संपर्क नंबर और सत्यापित व्हाट्सएप व्यावसायिक नंबर।"
                />
              </li>
              <li>
                <Translate
                  en="Corporate email address and business registered city."
                  hi="कॉर्पोरेट ईमेल पता और व्यावसायिक पंजीकृत शहर।"
                />
              </li>
              <li>
                <Translate
                  en="GSTIN (Goods and Services Tax Identification Number) for legal B2B verification."
                  hi="कानूनी बी2बी सत्यापन के लिए जीएसटीआईएन (माल और सेवा कर पहचान संख्या)।"
                />
              </li>
              <li>
                <Translate
                  en="Business Type (e.g., Manufacturer, Wholesaler, Retailer) and Primary Product Categories."
                  hi="व्यवसाय का प्रकार (जैसे, निर्माता, थोक विक्रेता, खुदरा विक्रेता) और मुख्य उत्पाद श्रेणियां।"
                />
              </li>
              <li>
                <Translate
                  en="Exhibition specifications, such as desired stall dimensions and annual business turnover brackets."
                  hi="प्रदर्शनी विनिर्देश, जैसे वांछित स्टॉल के आयाम और वार्षिक व्यावसायिक टर्नओवर ब्रैकेट।"
                />
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl text-white tracking-wide border-l-2 border-expo-gold pl-4">
              <Translate en="2. How We Use Your Information" hi="2. हम आपकी जानकारी का उपयोग कैसे करते हैं" />
            </h2>
            <p>
              <Translate
                en="The collected corporate details are processed to:"
                hi="एकत्रित कॉर्पोरेट विवरणों को निम्नलिखित के लिए संसाधित किया जाता है:"
              />
            </p>
            <ul className="list-disc pl-6 space-y-2 text-expo-warm/70">
              <li>
                <Translate
                  en="Process and verify your commercial exhibition stall applications."
                  hi="आपके व्यावसायिक प्रदर्शनी स्टॉल के आवेदनों को संसाधित और सत्यापित करना।"
                />
              </li>
              <li>
                <Translate
                  en="Send verified tax receipts, registration invoices, and floor blueprints."
                  hi="सत्यापित कर रसीदें, पंजीकरण चालान और फ्लोर ब्लूप्रिंट भेजना।"
                />
              </li>
              <li>
                <Translate
                  en="Provide instant B2B inquiry confirmation alerts directly via WhatsApp and Email."
                  hi="व्हाट्सएप और ईमेल के माध्यम से सीधे त्वरित बी2बी पूछताछ पुष्टिकरण अलर्ट प्रदान करना।"
                />
              </li>
              <li>
                <Translate
                  en="Coordinate logistics, VIP lounge passes, and exhibition badge printings."
                  hi="रसद (लॉजिस्टिक्स), वीआईपी लाउंज पास और प्रदर्शनी बैज प्रिंटिंग का समन्वय करना।"
                />
              </li>
              <li>
                <Translate
                  en="Provide media and advertising opportunities relative to your trade catalog."
                  hi="आपके व्यापार कैटलॉग से संबंधित मीडिया और विज्ञापन के अवसर प्रदान करना।"
                />
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl text-white tracking-wide border-l-2 border-expo-gold pl-4">
              <Translate en="3. Data Security and Retention" hi="3. डेटा सुरक्षा और प्रतिधारण" />
            </h2>
            <p>
              <Translate
                en="We implement industry-grade technical and organizational measures to protect your commercial data against unauthorized access, disclosure, or alteration. All submitted GSTIN and contact details are stored securely. We retain trade inquiry records only as long as necessary to complete commercial booking agreements and legal tax reporting."
                hi="हम आपके व्यावसायिक डेटा को अनधिकृत पहुंच, प्रकटीकरण या परिवर्तन से बचाने के लिए उद्योग-स्तरीय तकनीकी और संगठनात्मक उपाय लागू करते हैं। सभी सबमिट किए गए जीएसटीआईएन और संपर्क विवरण सुरक्षित रूप से संग्रहीत किए जाते हैं। हम व्यापार पूछताछ रिकॉर्ड केवल तब तक बनाए रखते हैं जब तक कि व्यावसायिक बुकिंग समझौतों और कानूनी कर रिपोर्टिंग को पूरा करने के लिए आवश्यक हो।"
              />
            </p>
          </section>

          {/* STE-10: Contact block using canonical values from event-facts */}
          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl text-white tracking-wide border-l-2 border-expo-gold pl-4">
              <Translate en="4. Contact Our Compliance Team" hi="4. हमारी अनुपालन टीम से संपर्क करें" />
            </h2>
            <p>
              <Translate
                en="If you have any questions concerning this Privacy Policy or your business data rights, please contact the AKAS Group Compliance Office:"
                hi="यदि आपके पास इस गोपनीयता नीति या आपके व्यावसायिक डेटा अधिकारों के संबंध में कोई प्रश्न हैं, तो कृपया अकास ग्रुप अनुपालन कार्यालय से संपर्क करें:"
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
                  en={`Address: ${EVENT.venueName}, ${EVENT.streetAddress}, ${EVENT.city}, ${EVENT.region} — ${EVENT.postalCode}`} 
                  hi={`पता: ${EVENT.venueName}, ${EVENT.streetAddress}, ${EVENT.city}, ${EVENT.region} — ${EVENT.postalCode}`} 
                />
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
