"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Factory, Warehouse, Compass, Send, Layers, Palette } from "lucide-react";

const ECOSYSTEM_NODES = [
  {
    icon: <Factory className="w-6 h-6 text-expo-gold" />,
    title: "Manufacturers",
    sub: "Direct Loom Access",
    desc: "Connect directly with Surat's industrial weaving, processing and embroidery powerhouses producing large capacity lots.",
    stats: "650+ Mills Connected"
  },
  {
    icon: <Warehouse className="w-6 h-6 text-expo-gold" />,
    title: "Wholesalers",
    sub: "Bulk Sourcing Scale",
    desc: "Procure high-volume textile materials, wedding lehengas and festive saree stocks at absolute primary market prices.",
    stats: "15,000+ Catalogs Live"
  },
  {
    icon: <Compass className="w-6 h-6 text-expo-gold" />,
    title: "Exporters",
    sub: "Global Supply Networks",
    desc: "Ship Surat's world-class fabrics, value-added garments, and ethnic drapes to wholesale trade channels globally.",
    stats: "28+ States Represented"
  },
  {
    icon: <Send className="w-6 h-6 text-expo-gold" />,
    title: "Retail Buyers",
    sub: "Boutique & Chain Stores",
    desc: "Verified retail boutique owners, bridal chain stores, and online fashion brands acquiring pre-season premium stock.",
    stats: "8,000+ Verified Buyers"
  },
  {
    icon: <Layers className="w-6 h-6 text-expo-gold" />,
    title: "Fabric Suppliers",
    sub: "Raw Material Weaves",
    desc: "Source raw materials from high-grade crepes, silk yarns, cotton filaments, metallic jacquards to designer prints.",
    stats: "Limitless Weaving Options"
  },
  {
    icon: <Palette className="w-6 h-6 text-expo-gold" />,
    title: "Fashion Designers",
    sub: "Couture Design Hub",
    desc: "Master craftsmanship and contemporary wedding collections custom-designed by Surat's premier designer teams.",
    stats: "First-Reveal Collections"
  }
];

export default function BusinessEcosystem() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <section
      ref={containerRef}
      id="business-ecosystem"
      className="relative w-full py-24 sm:py-32 bg-[#070707] overflow-hidden border-b border-white/5"
    >
      <div className="absolute inset-0 bg-mesh-dark opacity-80 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />
      
      {/* Glow lights */}
      <div className="spotlight-glowing left-[20%] top-[10%] w-[35vw] h-[35vw]" />
      <div className="spotlight-glowing right-[15%] bottom-[10%] w-[40vw] h-[40vw]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 w-full">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-24">
          <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-4 block">
            02 • BUSINESS ECOSYSTEM
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-wide text-white leading-tight">
            A Global Textile <br />
            <span className="text-metallic font-light italic">Commerce Network</span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-expo-warm/60 leading-relaxed mt-6 max-w-xl">
            Surat is not just a city—it is India’s largest, fully integrated textile sourcing machine. Connect with every major node of the textile value chain in a seamless, high-volume environment.
          </p>
        </div>

        {/* Global Network Graphic backdrop (Dotted map styling) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-screen z-0">
          <div
            className="w-full h-full bg-center bg-no-repeat bg-contain"
            style={{ backgroundImage: `url('/assets/images/world-map.jpg')` }}
          />
        </div>

        {/* Interactive Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 relative z-10">
          {ECOSYSTEM_NODES.map((node, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              className="border-glow-card p-6 sm:p-8 bg-black/45 backdrop-blur-xl flex flex-col justify-between group cursor-default transition-all duration-500 hover:-translate-y-1 hover:bg-black/60 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
            >
              <div>
                {/* Icon & Label */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-expo-gold/40 transition-colors">
                    {node.icon}
                  </div>
                  <span className="font-sans text-[9px] tracking-[1.5px] uppercase text-expo-warm/40 group-hover:text-expo-gold/60 transition-colors font-bold">
                    {node.sub}
                  </span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl text-white group-hover:text-expo-gold transition-colors mb-3">
                  {node.title}
                </h3>
                
                <p className="font-sans text-xs sm:text-sm text-expo-warm/60 leading-relaxed group-hover:text-expo-warm/75 transition-colors">
                  {node.desc}
                </p>
              </div>

              {/* Stats Footer inside Card */}
              <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center">
                <span className="font-sans text-[9px] tracking-[1px] text-expo-warm/30 uppercase font-bold">Ecosystem Metric</span>
                <span className="font-sans text-xs font-bold text-expo-gold">{node.stats}</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
