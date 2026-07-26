"use client";

import { useState } from "react";
import { useInView } from "@/hooks/useInView";
import { FadeUp } from "@/components/animations/MobileAnimations";
import { Translate } from "@/components/LanguageContext";
import { Calendar, Clock } from "lucide-react";

interface ScheduleItem {
  time: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  type: "inauguration" | "expo" | "networking" | "summit";
}

const EVENT_DAYS: { day: string; dateEn: string; dateHi: string; schedule: ScheduleItem[] }[] = [
  {
    day: "Day 1",
    dateEn: "Saturday, Sept 12, 2026",
    dateHi: "शनिवार, 12 सितंबर 2026",
    schedule: [
      { time: "09:30 AM", titleEn: "B2B Trade Buyer Check-In & Badge Collection", titleHi: "B2B ट्रेड बायर्स चेक-इन एवं बैज संग्रह", descEn: "Express registration counter open at SIECC Main Concourse.", descHi: "SIECC मुख्य कॉनकोर्स पर एक्सप्रेस पंजीकरण काउंटर खुला।", type: "expo" },
      { time: "11:00 AM", titleEn: "Grand Inauguration & Traditional Lamp Lighting", titleHi: "भव्य उद्घाटन और पारंपरिक दीप प्रज्वलन", descEn: "Dignitaries, AKAS leadership, and Surat Weavers Alliance keynotes.", descHi: "गणमान्य व्यक्ति, अकास नेतृत्व और सूरत वीवर्स एलायंस के मुख्य भाषण।", type: "inauguration" },
      { time: "12:30 PM", titleEn: "Unveiling of Festival & Wedding Catalog Collections", titleHi: "त्योहारी एवं वेडिंग कैटलॉग संग्रह का अनावरण", descEn: "Live showcase of 2026-2027 silk, saree, and ethnic wear lines.", descHi: "2026-2027 सिल्क, साड़ी और एथनिक वियर लाइनों का सीधा प्रदर्शन।", type: "expo" },
      { time: "03:30 PM", titleEn: "Manufacturer-Wholesaler High-Value Networking Lounge", titleHi: "निर्माता-थोक विक्रेता हाई-वैल्यू नेटवर्किंग लाउंज", descEn: "Exclusive B2B matchmaking sessions for volume buyers.", descHi: "बड़ी मात्रा में खरीदारी करने वालों के लिए विशेष B2B मैचमेकिंग सत्र।", type: "networking" },
      { time: "06:00 PM", titleEn: "Day 1 Exhibition Floor Close", titleHi: "प्रथम दिवस प्रदर्शनी समापन", descEn: "Evening networking dinner for registered stall exhibitors.", descHi: "पंजीकृत स्टॉल प्रदर्शकों के लिए शाम का नेटवर्किंग रात्रिभोज।", type: "networking" }
    ]
  },
  {
    day: "Day 2",
    dateEn: "Sunday, Sept 13, 2026",
    dateHi: "रविवार, 13 सितंबर 2026",
    schedule: [
      { time: "10:00 AM", titleEn: "B2B Wholesale Order Booking Arena Open", titleHi: "B2B थोक ऑर्डर बुकिंग एरिना खुला", descEn: "Full access to 650+ stalls for bulk order placements & contract locks.", descHi: "थोक ऑर्डर प्लेसमेंट और अनुबंध लॉकिंग के लिए 650+ स्टॉलों तक पूर्ण पहुंच।", type: "expo" },
      { time: "02:00 PM", titleEn: "Textile Machinery & Digital Weaving Live Demos", titleHi: "टेक्सटाइल मशीनरी और डिजिटल बुनाई लाइव डेमो", descEn: "Next-gen rapier looms, embroidery & eco-dyeing tech displays.", descHi: "अगली पीढ़ी के रैपियर लूम, कढ़ाई और इको-डाईंग तकनीक का प्रदर्शन।", type: "summit" },
      { time: "04:30 PM", titleEn: "Surat Export & Global Supply Chain Summit", titleHi: "सूरत एक्सपोर्ट एवं ग्लोबल सप्लाई चेन समिट", descEn: "Panel discussion on international trade compliance and direct exports.", descHi: "अंतर्राष्ट्रीय व्यापार अनुपालन और प्रत्यक्ष निर्यात पर पैनल चर्चा।", type: "summit" },
      { time: "06:30 PM", titleEn: "Day 2 Exhibition Floor Close", titleHi: "द्वितीय दिवस प्रदर्शनी समापन", descEn: "Floor closing and preparation for final order signings.", descHi: "अंतिम ऑर्डर हस्ताक्षरों के लिए फ्लोर समापन।", type: "expo" }
    ]
  },
  {
    day: "Day 3",
    dateEn: "Monday, Sept 14, 2026",
    dateHi: "सोमवार, 14 सितंबर 2026",
    schedule: [
      { time: "10:00 AM", titleEn: "Final Wholesale Contract Signings & Clearance Expo", titleHi: "अंतिम थोक अनुबंध हस्ताक्षर एवं क्लियरेंस एक्सपो", descEn: "Direct mill sample allocations and seasonal repeat order locks.", descHi: "सीधे मिल सैंपल आवंटन और मौसमी दोहराव वाले ऑर्डर लॉक्स।", type: "expo" },
      { time: "03:00 PM", titleEn: "Exhibition Excellence Awards & Exhibitor Honors", titleHi: "प्रदर्शनी उत्कृष्टता पुरस्कार एवं प्रदर्शक सम्मान", descEn: "Recognizing outstanding booth design, innovation, and trade volume.", descHi: "उत्कृष्ट बूथ डिजाइन, नवाचार और व्यापार मात्रा को मान्यता देने का अवसर।", type: "inauguration" },
      { time: "05:00 PM", titleEn: "Official STE 2026 Closing Ceremony", titleHi: "आधिकारिक STE 2026 समापन समारोह", descEn: "Vote of thanks by AKAS Events and STE Surat organizing committee.", descHi: "अकास इवेंट्स और STE सूरत आयोजन समिति द्वारा धन्यवाद प्रस्ताव।", type: "inauguration" }
    ]
  }
];

export default function EventSchedule() {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const { ref: headingRef, inView: headingInView } = useInView<HTMLHeadingElement>(0.3);

  const activeDay = EVENT_DAYS[selectedDayIdx];

  return (
    <section id="schedule" className="relative w-full py-20 px-5 md:py-28 md:px-8 bg-[#050505] border-b border-white/5 overflow-hidden">
      <div className="absolute inset-0 bg-mesh-dark opacity-60 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <FadeUp delay={0}>
            <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-3 block">
              <Translate en="THREE-DAY B2B TIMELINE" hi="तीन दिवसीय B2B समय सारिणी" />
            </span>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h2
              ref={headingRef}
              className={`font-serif text-3xl sm:text-5xl text-white tracking-wide leading-tight heading-underline ${
                headingInView ? "in-view" : ""
              }`}
            >
              <span className="gold-shimmer-text"><Translate en="Official Event Schedule" hi="आधिकारिक कार्यक्रम अनुसूची" /></span> <br />
              <span className="text-metallic font-light italic"><Translate en="September 12–14, 2026" hi="12–14 सितंबर, 2026" /></span>
            </h2>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="font-sans text-sm text-expo-warm/60 leading-relaxed mt-4 max-w-xl">
              <Translate
                en="Plan your visit to maximize B2B order bookings, manufacturer lounge passes, and live textile technology summits."
                hi="B2B ऑर्डर बुकिंग, निर्माता लाउंज पास और लाइव टेक्सटाइल तकनीक सम्मेलनों को अधिकतम करने के लिए अपनी यात्रा की योजना बनाएं।"
              />
            </p>
          </FadeUp>
        </div>

        {/* Day Selector Buttons */}
        <div className="flex flex-wrap gap-4 mb-10">
          {EVENT_DAYS.map((dayObj, idx) => (
            <button
              key={dayObj.day}
              onClick={() => setSelectedDayIdx(idx)}
              className={`px-6 py-3.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-3 active:scale-95 ${
                selectedDayIdx === idx
                  ? "bg-gradient-to-r from-[#B87333] to-[#D4AF37] text-black border-expo-gold shadow-lg"
                  : "bg-black/40 border-white/10 text-expo-warm/60 hover:text-white hover:border-white/20"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{dayObj.day} • <Translate en={dayObj.dateEn} hi={dayObj.dateHi} /></span>
            </button>
          ))}
        </div>

        {/* Timeline Event Items List */}
        <div className="p-6 sm:p-10 bg-black/60 border border-white/10 rounded-2xl relative">
          <div className="flex items-center gap-2 mb-8 pb-4 border-b border-white/10 text-expo-gold font-serif font-bold text-lg">
            <Clock className="w-5 h-5" />
            <span><Translate en={activeDay.dateEn} hi={activeDay.dateHi} /> Schedule</span>
          </div>

          <div className="flex flex-col gap-6 relative">
            {/* Timeline Vertical Guide Line */}
            <div className="absolute left-[85px] sm:left-[110px] top-3 bottom-3 w-[1px] bg-white/10 hidden sm:block" />

            {activeDay.schedule.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-expo-gold/30 transition-all">
                {/* Time Badge */}
                <div className="w-full sm:w-[90px] shrink-0 font-mono text-xs font-bold text-expo-gold bg-expo-gold/10 border border-expo-gold/20 px-3 py-1.5 rounded-md text-center">
                  {item.time}
                </div>

                {/* Event Content */}
                <div className="flex-1">
                  <h4 className="font-serif text-base text-white font-bold mb-1">
                    <Translate en={item.titleEn} hi={item.titleHi} />
                  </h4>
                  <p className="font-sans text-xs text-expo-warm/60">
                    <Translate en={item.descEn} hi={item.descHi} />
                  </p>
                </div>

                {/* Type Badge */}
                <span className="text-[9px] uppercase font-mono tracking-widest text-expo-warm/40 px-2.5 py-1 bg-black/40 border border-white/10 rounded">
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
