"use client";

import { useState } from "react";
import { useInView } from "@/hooks/useInView";
import { FadeUp } from "@/components/animations/MobileAnimations";
import { Translate } from "@/components/LanguageContext";
import { LayoutGrid, Info, PhoneCall } from "lucide-react";

interface StallSlot {
  id: string;
  number: string;
  sizeSqft: number;
  category: "Starter" | "Standard" | "Premium" | "Pro" | "Flagship";
  status: "available" | "reserved" | "booked";
  zone: "Hall A" | "Hall B" | "Hall C" | "VIP Concourse";
}

const STALL_SLOTS: StallSlot[] = [
  { id: "s1", number: "A-101", sizeSqft: 100, category: "Starter", status: "booked", zone: "Hall A" },
  { id: "s2", number: "A-102", sizeSqft: 100, category: "Starter", status: "available", zone: "Hall A" },
  { id: "s3", number: "A-103", sizeSqft: 100, category: "Starter", status: "reserved", zone: "Hall A" },
  { id: "s4", number: "A-104", sizeSqft: 100, category: "Starter", status: "booked", zone: "Hall A" },
  
  { id: "s5", number: "B-201", sizeSqft: 400, category: "Premium", status: "booked", zone: "Hall B" },
  { id: "s6", number: "B-202", sizeSqft: 400, category: "Premium", status: "available", zone: "Hall B" },
  { id: "s7", number: "B-203", sizeSqft: 400, category: "Premium", status: "reserved", zone: "Hall B" },
  { id: "s8", number: "B-204", sizeSqft: 400, category: "Premium", status: "available", zone: "Hall B" },
  
  { id: "s9", number: "C-301", sizeSqft: 600, category: "Pro", status: "booked", zone: "Hall C" },
  { id: "s10", number: "C-302", sizeSqft: 600, category: "Pro", status: "available", zone: "Hall C" },
  { id: "s11", number: "C-303", sizeSqft: 600, category: "Pro", status: "booked", zone: "Hall C" },
  
  { id: "s12", number: "VIP-1", sizeSqft: 1000, category: "Flagship", status: "reserved", zone: "VIP Concourse" },
  { id: "s13", number: "VIP-2", sizeSqft: 1000, category: "Flagship", status: "available", zone: "VIP Concourse" },
];

const PHONE_NUMBER = "919950787787";

export default function FloorPlanMap() {
  const [activeZone, setActiveZone] = useState<string>("All");
  const [selectedStall, setSelectedStall] = useState<StallSlot | null>(STALL_SLOTS[1]);
  const { ref: headingRef, inView: headingInView } = useInView<HTMLHeadingElement>(0.3);

  const filteredStalls = activeZone === "All" 
    ? STALL_SLOTS 
    : STALL_SLOTS.filter(s => s.zone === activeZone);

  const availableCount = STALL_SLOTS.filter(s => s.status === "available").length;
  const reservedCount = STALL_SLOTS.filter(s => s.status === "reserved").length;
  const bookedCount = STALL_SLOTS.filter(s => s.status === "booked").length;

  return (
    <section id="floor-plan" className="relative w-full py-20 px-5 md:py-28 md:px-8 bg-[#050505] border-b border-white/5 overflow-hidden">
      <div className="absolute inset-0 bg-mesh-dark opacity-60 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <FadeUp delay={0}>
            <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-3 block">
              <Translate en="REAL-TIME STALL AVAILABILITY" hi="वास्तविक समय स्टॉल उपलब्धता" />
            </span>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h2
              ref={headingRef}
              className={`font-serif text-3xl sm:text-5xl text-white tracking-wide leading-tight heading-underline ${
                headingInView ? "in-view" : ""
              }`}
            >
              <span className="gold-shimmer-text"><Translate en="Interactive Floor Plan" hi="इंटरएक्टिव फ्लोर प्लान" /></span> <br />
              <span className="text-metallic font-light italic"><Translate en="Live Stall Allocations" hi="लाइव स्टॉल आवंटन" /></span>
            </h2>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="font-sans text-sm text-expo-warm/60 leading-relaxed mt-4 max-w-xl">
              <Translate
                en="Explore SIECC Dome layout zones. Over 68% of prime concourse stalls are already allocated. Select an available stall to lock direct mill pricing."
                hi="SIECC डोम लेआउट ज़ोन का अन्वेषण करें। 68% से अधिक प्रमुख कॉनकोर्स स्टॉल पहले ही आवंटित किए जा चुके हैं। सीधे मिल दरें लॉक करने के लिए उपलब्ध स्टॉल चुनें।"
              />
            </p>
          </FadeUp>
        </div>

        {/* Live Counter Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-black/50 border border-white/10 rounded-xl mb-8">
          <div className="flex items-center gap-6 text-xs font-sans">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
              <span className="text-white font-medium"><Translate en="Available" hi="उपलब्ध" /> ({availableCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="text-white font-medium"><Translate en="Reserved" hi="आरक्षित" /> ({reservedCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-600/70" />
              <span className="text-white/60 font-medium"><Translate en="Booked" hi="बुक" /> ({bookedCount})</span>
            </div>
          </div>

          {/* Zone Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {["All", "Hall A", "Hall B", "Hall C", "VIP Concourse"].map((zone) => (
              <button
                key={zone}
                onClick={() => setActiveZone(zone)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                  activeZone === zone
                    ? "bg-[#D4AF37] text-black font-bold"
                    : "bg-white/5 border border-white/10 text-expo-warm/60 hover:text-white"
                }`}
              >
                {zone}
              </button>
            ))}
          </div>
        </div>

        {/* Floor Plan Layout & Details Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Visual 2D Grid Layout Map */}
          <div className="lg:col-span-8 p-6 sm:p-8 bg-black/60 border border-white/10 rounded-2xl relative">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-expo-gold" />
                <span className="text-xs font-serif font-bold text-white uppercase tracking-wider">
                  <Translate en="SIECC Sarsana Main Dome Floor Map" hi="SIECC सरसाना मुख्य डोम फ्लोर मैप" />
                </span>
              </div>
              <span className="text-[10px] text-expo-gold font-mono uppercase tracking-widest bg-expo-gold/10 px-2.5 py-1 rounded-full border border-expo-gold/20">
                LIVE STATUS SYNC
              </span>
            </div>

            {/* Stall Blocks Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredStalls.map((stall) => {
                const isSelected = selectedStall?.id === stall.id;
                let statusClasses = "";
                
                if (stall.status === "available") {
                  statusClasses = "bg-emerald-950/30 border-emerald-500/40 text-emerald-300 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                } else if (stall.status === "reserved") {
                  statusClasses = "bg-amber-950/20 border-amber-500/30 text-amber-300 opacity-85";
                } else {
                  statusClasses = "bg-rose-950/15 border-rose-900/30 text-rose-400/50 cursor-not-allowed";
                }

                return (
                  <button
                    key={stall.id}
                    onClick={() => setSelectedStall(stall)}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-300 text-left relative overflow-hidden ${statusClasses} ${
                      isSelected ? "ring-2 ring-expo-gold shadow-[0_0_20px_rgba(212,175,55,0.3)] scale-[1.02]" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-serif font-bold text-sm text-white">{stall.number}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/10 uppercase">
                        {stall.sizeSqft} sqft
                      </span>
                    </div>

                    <div className="text-[10px] font-sans">
                      <span className="block font-semibold opacity-90">{stall.category}</span>
                      <span className="block text-[9px] opacity-60 uppercase">{stall.zone}</span>
                    </div>

                    {/* Status Badge Tag */}
                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] uppercase font-bold">
                      <span>{stall.status}</span>
                      {stall.status === "available" && <span className="text-emerald-400 font-mono">⚡ LOCK</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stall Details & WhatsApp Booking Card */}
          <div className="lg:col-span-4 p-6 sm:p-8 bg-[#0a0a0c] border border-expo-gold/30 rounded-2xl relative shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#B87333] to-[#D4AF37]" />

            {selectedStall ? (
              <div>
                <span className="text-[9px] uppercase tracking-[3px] text-expo-gold font-bold block mb-2">
                  <Translate en="SELECTED STALL DETAILS" hi="चयनित स्टॉल विवरण" />
                </span>
                
                <h3 className="font-serif text-2xl text-white font-bold mb-4">
                  Stall {selectedStall.number} ({selectedStall.sizeSqft} Sqft)
                </h3>

                <div className="flex flex-col gap-3 text-xs font-sans mb-6">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-expo-warm/50"><Translate en="Zone Sector" hi="जोन सेक्टर" /></span>
                    <span className="text-white font-semibold">{selectedStall.zone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-expo-warm/50"><Translate en="Stall Tier" hi="स्टॉल श्रेणी" /></span>
                    <span className="text-expo-gold font-bold">{selectedStall.category}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-expo-warm/50"><Translate en="Allocation Status" hi="आवंटन स्थिति" /></span>
                    <span className={`font-bold uppercase ${
                      selectedStall.status === "available" ? "text-emerald-400" :
                      selectedStall.status === "reserved" ? "text-amber-400" : "text-rose-400"
                    }`}>
                      {selectedStall.status}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10 items-center">
                    <span className="text-expo-warm/50"><Translate en="Estimated Cost (+GST)" hi="अनुमानित लागत (+GST)" /></span>
                    <span className="text-lg font-serif font-bold text-expo-gold">
                      ₹{(selectedStall.sizeSqft * 510 * 1.18).toLocaleString()}
                    </span>
                  </div>
                </div>

                {selectedStall.status === "available" ? (
                  <a
                    href={`https://wa.me/${PHONE_NUMBER}?text=Hi,%20I'm%20interested%20in%20locking%20Stall%20${selectedStall.number}%20(${selectedStall.sizeSqft}%20Sqft)%20at%20STE%202026`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <Translate en="Lock Stall on WhatsApp" hi="व्हाट्सएप पर स्टॉल लॉक करें" />
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full py-3.5 bg-white/5 border border-white/10 text-white/40 font-bold text-xs tracking-wider uppercase rounded-xl cursor-not-allowed"
                  >
                    <Translate en="Stall Unavailable" hi="स्टॉल अनुपलब्ध है" />
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-8 h-8 text-expo-gold mx-auto mb-3 opacity-60" />
                <p className="text-xs text-expo-warm/60">
                  <Translate en="Click any stall on the map to view size specs and lock booking." hi="आकार विनिर्देश देखने और बुकिंग लॉक करने के लिए नक्शे पर किसी भी स्टॉल पर क्लिक करें।" />
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
