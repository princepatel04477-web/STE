"use client";

import { useInView } from "@/hooks/useInView";
import { FadeUp } from "@/components/animations/MobileAnimations";
import { Translate } from "@/components/LanguageContext";
import { Plane, Train, Hotel, Car, ExternalLink } from "lucide-react";

const TRANSIT_MODES = [
  {
    icon: <Plane className="w-5 h-5 text-expo-gold" />,
    titleEn: "Surat International Airport (STV)",
    titleHi: "सूरत अंतर्राष्ट्रीय हवाई अड्डा (STV)",
    distanceEn: "12 KM • 20 Min Drive to SIECC",
    distanceHi: "12 किमी • SIECC के लिए 20 मिनट की ड्राइव",
    descEn: "Direct flights connecting Delhi, Mumbai, Bengaluru, Hyderabad, Kolkata, and Dubai.",
    descHi: "दिल्ली, मुंबई, बेंगलुरु, हैदराबाद, कोलकाता और दुबई को जोड़ने वाली सीधी उड़ानें।"
  },
  {
    icon: <Train className="w-5 h-5 text-expo-gold" />,
    titleEn: "Surat Railway Junction (ST)",
    titleHi: "सूरत रेलवे जंक्शन (ST)",
    distanceEn: "14 KM • 30 Min Drive to SIECC",
    distanceHi: "14 किमी • SIECC के लिए 30 मिनट की ड्राइव",
    descEn: "Western Railway trunk route with high-frequency Vande Bharat and Rajdhani express trains.",
    descHi: "उच्च आवृत्ति वंदे भारत और राजधानी एक्सप्रेस ट्रेनों के साथ पश्चिम रेलवे ट्रंक मार्ग।"
  },
  {
    icon: <Car className="w-5 h-5 text-expo-gold" />,
    titleEn: "National Highway Access",
    titleHi: "राष्ट्रीय राजमार्ग पहुंच",
    distanceEn: "Direct Access via NH 48",
    distanceHi: "NH 48 के माध्यम से सीधी पहुंच",
    descEn: "Seamless express connection for buyers traveling from Mumbai (280 km) & Ahmedabad (260 km).",
    descHi: "मुंबई (280 किमी) और अहमदाबाद (260 किमी) से आने वाले खरीदारों के लिए एक्सप्रेस कनेक्शन।"
  }
];

const PARTNER_HOTELS = [
  {
    nameEn: "Courtyard by Marriott Surat",
    nameHi: "कोर्टयार्ड बाय मैरियट सूरत",
    locationEn: "Hazira Road (7 km to SIECC)",
    locationHi: "हजीरा रोड (SIECC से 7 किमी)",
    stars: 5,
    tagEn: "Official VIP Partner Hotel",
    tagHi: "आधिकारिक वीआईपी पार्टनर होटल"
  },
  {
    nameEn: "Surat Marriott Hotel",
    nameHi: "सूरत मैरियट होटल",
    locationEn: "Dumas Road (9 km to SIECC)",
    locationHi: "डूमस रोड (SIECC से 9 किमी)",
    stars: 5,
    tagEn: "Exhibitor Discount Tariff",
    tagHi: "प्रदर्शक रियायती शुल्क"
  },
  {
    nameEn: "Lords Plaza Surat",
    nameHi: "लॉर्ड्स प्लाजा सूरत",
    locationEn: "Delhi Gate (12 km to SIECC)",
    locationHi: "दिल्ली गेट (SIECC से 12 किमी)",
    stars: 4,
    tagEn: "Shuttle Service Available",
    tagHi: "शटल सेवा उपलब्ध"
  },
  {
    nameEn: "Park Inn by Radisson",
    nameHi: "पार्क इन बाय रेडिसन",
    locationEn: "Ring Road (11 km to SIECC)",
    locationHi: "रिंग रोड (SIECC से 11 किमी)",
    stars: 4,
    tagEn: "B2B Trade Preferred",
    tagHi: "बी2बी व्यापार पसंदीदा"
  }
];

export default function TravelStay() {
  const { ref: headingRef, inView: headingInView } = useInView<HTMLHeadingElement>(0.3);

  return (
    <section id="travel-stay" className="relative w-full py-20 px-5 md:py-28 md:px-8 bg-[#060607] border-b border-white/5 overflow-hidden">
      <div className="absolute inset-0 bg-mesh-dark opacity-50 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <FadeUp delay={0}>
            <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-3 block">
              <Translate en="OUT-OF-STATE BUYER GUIDE" hi="राज्य के बाहर के खरीदारों के लिए गाइड" />
            </span>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h2
              ref={headingRef}
              className={`font-serif text-3xl sm:text-5xl text-white tracking-wide leading-tight heading-underline ${
                headingInView ? "in-view" : ""
              }`}
            >
              <span className="gold-shimmer-text"><Translate en="Travel & Accommodation" hi="यात्रा और आवास सहायता" /></span> <br />
              <span className="text-metallic font-light italic"><Translate en="For Trade Visitors" hi="व्यापारिक आगंतुकों के लिए" /></span>
            </h2>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="font-sans text-sm text-expo-warm/60 leading-relaxed mt-4 max-w-xl">
              <Translate
                en="Seamless logistics for wholesalers and boutique buyers arriving from Delhi, Karnataka, Tamil Nadu, Bihar, Maharashtra, and Bengal."
                hi="दिल्ली, कर्नाटक, तमिलनाडु, बिहार, महाराष्ट्र और बंगाल से आने वाले थोक विक्रेताओं और बुटीक खरीदारों के लिए निर्बाध रसद व्यवस्था।"
              />
            </p>
          </FadeUp>
        </div>

        {/* Transit Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {TRANSIT_MODES.map((transit, i) => (
            <div key={i} className="p-6 bg-black/40 border border-white/5 rounded-2xl hover:border-expo-gold/40 transition-all duration-300 backdrop-blur-md">
              <div className="w-12 h-12 rounded-xl bg-expo-gold/10 border border-expo-gold/20 flex items-center justify-center mb-5">
                {transit.icon}
              </div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-expo-gold font-semibold block mb-1">
                <Translate en={transit.distanceEn} hi={transit.distanceHi} />
              </span>
              <h3 className="font-serif text-lg text-white font-bold mb-3">
                <Translate en={transit.titleEn} hi={transit.titleHi} />
              </h3>
              <p className="font-sans text-xs text-expo-warm/60 leading-relaxed">
                <Translate en={transit.descEn} hi={transit.descHi} />
              </p>
            </div>
          ))}
        </div>

        {/* Partner Hotels Section */}
        <div className="p-8 bg-black/60 border border-white/10 rounded-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Hotel className="w-6 h-6 text-expo-gold" />
              <div>
                <h3 className="font-serif text-xl text-white font-bold">
                  <Translate en="Recommended Hospitality & Partner Hotels" hi="अनुशंसित आतिथ्य एवं पार्टनर होटल" />
                </h3>
                <span className="text-xs text-expo-warm/50">
                  <Translate en="Special STE 2026 trade discount tariffs available upon registration" hi="पंजीकरण पर विशेष STE 2026 व्यापार छूट शुल्क उपलब्ध" />
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PARTNER_HOTELS.map((hotel, idx) => (
              <div key={idx} className="p-5 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] uppercase tracking-wider text-expo-gold bg-expo-gold/10 px-2 py-0.5 rounded font-bold border border-expo-gold/20">
                      <Translate en={hotel.tagEn} hi={hotel.tagHi} />
                    </span>
                    <span className="text-xs text-expo-gold">{'★'.repeat(hotel.stars)}</span>
                  </div>
                  <h4 className="font-serif text-sm text-white font-bold mb-1">
                    <Translate en={hotel.nameEn} hi={hotel.nameHi} />
                  </h4>
                  <span className="text-[11px] text-expo-warm/50 block font-sans">
                    <Translate en={hotel.locationEn} hi={hotel.locationHi} />
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-expo-gold uppercase font-bold">
                  <span><Translate en="Complimentary Shuttle" hi="निःशुल्क शटल" /></span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
