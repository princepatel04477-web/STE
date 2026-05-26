"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck, Users, Network, TrendingUp } from "lucide-react";

export default function CollaborationSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <section
      ref={containerRef}
      id="collaboration-section"
      className="relative w-full py-24 sm:py-32 bg-[#050505] overflow-hidden border-b border-white/5"
    >
      {/* Background visual detail */}
      <div className="absolute inset-0 bg-mesh-dark opacity-60 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />
      
      {/* Ambient glowing spots */}
      <div className="spotlight-glowing left-[10%] top-[20%] w-[35vw] h-[35vw]" />
      <div className="spotlight-glowing right-[10%] bottom-[10%] w-[40vw] h-[40vw]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 w-full">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-4 block">
            01 • THE POWER COLLABORATION
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-wide text-white leading-tight">
            STE × AKAS <br />
            <span className="text-metallic font-light italic">Alliance of Industrial Trust</span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-expo-warm/60 leading-relaxed mt-6 max-w-xl">
            Surat Textile Exhibition (STE) joins forces with Adatiya Kapad Association Surat (AKAS) to orchestrate India’s most trusted, verified, and high-impact B2B textile sourcing ecosystem.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch relative">
          
          {/* Connection Lines (SVG) - Visible on desktop */}
          <div className="absolute inset-0 pointer-events-none hidden lg:block z-0">
            <svg className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <motion.path
                d="M 380,220 L 780,220"
                stroke="url(#goldGradientLine)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ repeat: Infinity, ease: "linear", duration: 8 }}
              />
              <motion.path
                d="M 380,360 L 780,360"
                stroke="url(#goldGradientLine)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ repeat: Infinity, ease: "linear", duration: 8 }}
              />
              <defs>
                <linearGradient id="goldGradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D6A066" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#F0C48A" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#B87333" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Left Column: STE - The Sourcing Powerhouse */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-5 border-glow-card p-8 sm:p-10 bg-black/40 backdrop-blur-md rounded-xl flex flex-col justify-between z-10"
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="text-[9px] tracking-[2px] text-expo-gold border border-expo-gold/30 px-3 py-1 rounded-full uppercase font-bold bg-expo-gold/5">
                  THE EXHIBITION SUMMIT
                </span>
                <span className="text-xl">🏆</span>
              </div>

              <div className="relative w-36 h-20 mb-6">
                <Image
                  src="/assets/logo_STE.png"
                  alt="STE Logo"
                  fill
                  className="object-contain filter drop-shadow-[0_0_8px_rgba(214,160,102,0.25)]"
                />
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl text-white mb-4">
                Surat Textile Exhibition
              </h3>
              
              <p className="font-sans text-xs sm:text-sm text-expo-warm/70 leading-relaxed mb-6">
                STE represents the physical sourcing summit of the year. Orchestrated at the massive SIECC Sarsana Dome, it gathers the elite textile manufacturers under one roof, presenting catalog collections directly to commercial wholesale and retail buyers.
              </p>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 mt-4">
                <div>
                  <span className="font-sans text-[8px] text-expo-warm/40 uppercase block tracking-[1px]">Capacity:</span>
                  <span className="text-white text-sm font-bold font-sans">650+ Designer Pavilions</span>
                </div>
                <div>
                  <span className="font-sans text-[8px] text-expo-warm/40 uppercase block tracking-[1px]">Reach:</span>
                  <span className="text-white text-sm font-bold font-sans">80,000+ Sourcing Footfalls</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Center Connector Card (Animated badge) - Visible on desktop */}
          <div className="lg:col-span-2 hidden lg:flex flex-col items-center justify-center z-15 relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
              className="absolute w-28 h-28 border border-expo-gold/15 rounded-full z-0 flex items-center justify-center"
            >
              <div className="w-24 h-24 border border-expo-gold/5 rounded-full scale-[1.2]" />
            </motion.div>
            
            <div className="relative w-16 h-16 rounded-full bg-[#050505] border border-expo-gold/30 flex items-center justify-center z-10 shadow-lg shadow-black/80">
              <span className="font-serif text-xs font-bold text-expo-gold tracking-widest">ALLIED</span>
            </div>
          </div>

          {/* Right Column: AKAS - The Foundation of Trust */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="lg:col-span-5 border-glow-card p-8 sm:p-10 bg-black/40 backdrop-blur-md rounded-xl flex flex-col justify-between z-10"
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="text-[9px] tracking-[2px] text-expo-gold border border-expo-gold/30 px-3 py-1 rounded-full uppercase font-bold bg-expo-gold/5">
                  SUPPORTING ASSOCIATION
                </span>
                <span className="text-xl">🤝</span>
              </div>

              <div className="relative w-20 h-20 mb-6 bg-white rounded-full p-1 flex items-center justify-center border border-white/10">
                <Image
                  src="/assets/AKAS_1.png"
                  alt="AKAS Logo"
                  width={72}
                  height={72}
                  className="object-contain scale-[1.3]"
                />
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl text-white mb-4">
                Adatiya Kapad Association
              </h3>
              
              <p className="font-sans text-xs sm:text-sm text-expo-warm/70 leading-relaxed mb-6">
                AKAS Surat is the structural foundation of the Surat textile market. Representing the city’s leading weavers, processors, and wholesalers, the association-backed partnership guarantees sourcing safety, verified manufacturer credentials, and direct-to-mill trade trust.
              </p>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 mt-4">
                <div>
                  <span className="font-sans text-[8px] text-expo-warm/40 uppercase block tracking-[1px]">Ecosystem Trust:</span>
                  <span className="text-white text-sm font-bold font-sans">100% Verified Sellers</span>
                </div>
                <div>
                  <span className="font-sans text-[8px] text-expo-warm/40 uppercase block tracking-[1px]">Network:</span>
                  <span className="text-white text-sm font-bold font-sans">PAN-India Trade Alliances</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Pillars of Partnership Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16 z-20 relative">
          {[
            {
              icon: <ShieldCheck className="w-5 h-5 text-expo-gold" />,
              title: "Association-Backed Trust",
              desc: "Every exhibitor is pre-screened and certified by the AKAS alliance, safeguarding contract integrity."
            },
            {
              icon: <Users className="w-5 h-5 text-expo-gold" />,
              title: "Surat Textile Power",
              desc: "Direct access to Surat's humongous looms, printing processors, and value-added embellishers."
            },
            {
              icon: <Network className="w-5 h-5 text-expo-gold" />,
              title: "Ecosystem Integration",
              desc: "A singular platform connecting raw fabric mills, designer houses, logistics partners, and B2B buyers."
            },
            {
              icon: <TrendingUp className="w-5 h-5 text-expo-gold" />,
              title: "Seasonal Trade Surge",
              desc: "Strategically timed before festive and wedding seasons to maximize retail inventory margins."
            }
          ].map((pillar, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 bg-white/[0.02] border border-white/5 hover:border-expo-gold/25 hover:bg-expo-gold/[0.01] transition-all duration-500 rounded-lg group"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:border-expo-gold/30 transition-colors">
                {pillar.icon}
              </div>
              <h4 className="font-serif text-base text-white group-hover:text-expo-gold transition-colors mb-2">
                {pillar.title}
              </h4>
              <p className="font-sans text-xs text-expo-warm/50 leading-relaxed">
                {pillar.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
