"use client";

import { useInView } from "@/hooks/useInView";
import { FadeUp } from "@/components/animations/MobileAnimations";
import { Translate } from "@/components/LanguageContext";
import Image from "next/image";
import { MapPin, Navigation, Building2, Car, ShieldCheck } from "lucide-react";

const VENUE_SPECS = [
  {
    icon: <Building2 className="w-5 h-5 text-expo-gold" />,
    titleEn: "1,16,000 Sq. Ft. Pillarless Dome",
    titleHi: "1,16,000 वर्ग फुट पिलरलेस डोम",
    descEn: "Asia's premier air-conditioned exhibition space with clear sightlines.",
    descHi: "स्पष्ट दृश्यता के साथ एशिया का प्रमुख वातानुकूलित प्रदर्शनी स्थल।"
  },
  {
    icon: <Car className="w-5 h-5 text-expo-gold" />,
    titleEn: "5,000+ Vehicle Parking",
    titleHi: "5,000+ वाहन पार्किंग",
    descEn: "Dedicated VIP and visitor parking zones with valet services.",
    descHi: "वैलेट सेवाओं के साथ समर्पित वीआईपी और आगंतुक पार्किंग क्षेत्र।"
  },
  {
    icon: <Navigation className="w-5 h-5 text-expo-gold" />,
    titleEn: "Strategic Surat Location",
    titleHi: "रणनीतिक सूरत स्थान",
    descEn: "20 minutes from Surat Airport (STV) on Sarsana-Althan Road.",
    descHi: "सरसाना-अलथान रोड पर सूरत हवाई अड्डे (STV) से 20 मिनट।"
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-expo-gold" />,
    titleEn: "Heavy Cargo Freight Loading",
    titleHi: "भारी माल कार्गो लोडिंग",
    descEn: "Direct drive-in freight access docks for seamless machinery setup.",
    descHi: "निर्बाध मशीनरी सेटअप के लिए डायरेक्ट ड्राइव-इन फ्रेट एक्सेस डॉक।"
  }
];

export default function VenueGallery() {
  const { ref: headingRef, inView: headingInView } = useInView<HTMLHeadingElement>(0.3);

  return (
    <section id="venue" className="relative w-full py-20 px-5 md:py-28 md:px-8 bg-[#060607] border-b border-white/5 overflow-hidden">
      {/* Mesh Background */}
      <div className="absolute inset-0 bg-mesh-dark opacity-50 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <FadeUp delay={0}>
            <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-3 block">
              <Translate en="WORLD-CLASS EXHIBITION VENUE" hi="विश्वस्तरीय प्रदर्शनी स्थल" />
            </span>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h2
              ref={headingRef}
              className={`font-serif text-3xl sm:text-5xl text-white tracking-wide leading-tight heading-underline ${
                headingInView ? "in-view" : ""
              }`}
            >
              <span className="gold-shimmer-text"><Translate en="SIECC Sarsana Dome" hi="SIECC सरसाना डोम" /></span> <br />
              <span className="text-metallic font-light italic"><Translate en="Surat, Gujarat" hi="सूरत, गुजरात" /></span>
            </h2>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="font-sans text-sm text-expo-warm/60 leading-relaxed mt-4 max-w-xl">
              <Translate
                en="Hosted at Gujarat's grandest international convention hub. Purpose-built for massive capital machinery, luxury pavilions, and high-footfall B2B trade."
                hi="गुजरात के सबसे भव्य अंतर्राष्ट्रीय सम्मेलन केंद्र में आयोजित। विशाल पूंजीगत मशीनरी, लक्जरी मंडपों और उच्च व्यापारिक गतिविधि के लिए विशेष रूप से निर्मित।"
              />
            </p>
          </FadeUp>
        </div>

        {/* Venue Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
          {/* Main Large Venue Photo */}
          <div className="md:col-span-8 relative h-[340px] sm:h-[440px] rounded-2xl overflow-hidden border border-white/10 group shadow-2xl">
            <Image
              src="/assets/images/f_suitings.webp"
              alt="SIECC Sarsana Exhibition Hall Interior"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.75] contrast-[1.1]"
              sizes="(max-width: 768px) 100vw, 66vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[9px] uppercase tracking-[3px] text-expo-gold font-bold block mb-1">
                <Translate en="Main Exhibition Arena" hi="मुख्य प्रदर्शनी एरिना" />
              </span>
              <h3 className="font-serif text-xl sm:text-2xl text-white font-semibold">
                <Translate en="1,16,000 Sq Ft Central Air-Conditioned Pillarless Hall" hi="1,16,000 वर्ग फुट केंद्रीय वातानुकूलित पिलरलेस हॉल" />
              </h3>
            </div>
          </div>

          {/* Secondary Venue Photos Column */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="relative h-[160px] sm:h-[208px] rounded-2xl overflow-hidden border border-white/10 group shadow-lg">
              <Image
                src="/assets/images/f_bridalwear.webp"
                alt="SIECC Entrance Concourse"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.75]"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-[9px] uppercase tracking-[2px] text-expo-gold font-bold block">
                  <Translate en="VIP Entrance & Concourse" hi="वीआईपी प्रवेश द्वार एवं कॉनकोर्स" />
                </span>
              </div>
            </div>

            <div className="relative h-[160px] sm:h-[208px] rounded-2xl overflow-hidden border border-white/10 group shadow-lg">
              <Image
                src="/assets/images/f_machinery.webp"
                alt="Heavy Machinery & Loom Docks"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.75]"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-[9px] uppercase tracking-[2px] text-expo-gold font-bold block">
                  <Translate en="Textile Machinery & Freight Docks" hi="टेक्सटाइल मशीनरी एवं माल लोड डॉक्स" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Venue Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {VENUE_SPECS.map((spec, i) => (
            <div key={i} className="p-6 bg-black/40 border border-white/5 rounded-xl hover:border-expo-gold/40 transition-all duration-300 backdrop-blur-md">
              <div className="w-10 h-10 rounded-lg bg-expo-gold/10 border border-expo-gold/20 flex items-center justify-center mb-4">
                {spec.icon}
              </div>
              <h4 className="font-serif text-base text-white font-semibold mb-2">
                <Translate en={spec.titleEn} hi={spec.titleHi} />
              </h4>
              <p className="font-sans text-xs text-expo-warm/60 leading-relaxed">
                <Translate en={spec.descEn} hi={spec.descHi} />
              </p>
            </div>
          ))}
        </div>

        {/* Location & Directions Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-gold-gradient/5 border border-expo-gold/20 rounded-2xl gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-expo-gold/10 border border-expo-gold/30 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-expo-gold" />
            </div>
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                SIECC Sarsana, Althan-Sarsana Road, Surat, Gujarat 395007
              </span>
              <span className="text-[11px] text-expo-warm/50">
                <Translate en="20 min drive from Surat Airport (STV) • 30 min drive from Surat Railway Station (ST)" hi="सूरत हवाई अड्डे (STV) से 20 मिनट की ड्राइव • सूरत रेलवे स्टेशन (ST) से 30 मिनट की ड्राइव" />
              </span>
            </div>
          </div>

          <a
            href="https://maps.google.com/?q=SIECC+Sarsana+Surat"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#D4AF37] hover:bg-[#FFD700] text-black text-xs font-bold tracking-widest uppercase rounded-lg transition-all duration-300 shrink-0 flex items-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            <Translate en="Get Google Maps Location" hi="गूगल मैप्स लोकेशन प्राप्त करें" />
          </a>
        </div>

      </div>
    </section>
  );
}
