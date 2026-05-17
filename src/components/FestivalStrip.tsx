"use client";

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const festivals = [
  "Durga Puja",
  "Dussehra",
  "Karwa Chauth",
  "Diwali",
  "Chhath Puja",
  "Wedding Season"
];
const reversedFestivals = [...festivals].reverse();

export default function FestivalStrip() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Parallax horizontal movement for the festival list
  const xLeft = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const xRight = useTransform(scrollYProgress, [0, 1], ["-30%", "0%"]);

  return (
    <section ref={containerRef} className="relative w-full bg-[#030303] py-24 overflow-hidden border-y border-expo-border/30">

      {/* Drifting Ember Particles Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/assets/ste_luxury_hero_613dfd3b.jpg')] bg-cover bg-center opacity-5 mix-blend-screen" />
        {/* Animated gradients to simulate soft fire/ember glow */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-expo-copper/10 rounded-full blur-[100px] -translate-y-1/2 animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-expo-gold/10 rounded-full blur-[100px] -translate-y-1/2 animate-[pulse_10s_ease-in-out_infinite_reverse]" />
      </div>

      <div className="relative z-10 flex flex-col gap-12">

        {/* Section Context */}
        <div className="w-full text-center px-6">
          <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-expo-gold/80 font-medium">
            India&apos;s Festive Economy Drives Textile Demand
          </p>
        </div>

        {/* Scrolling Festival Rows */}
        <div className="flex flex-col gap-6 w-full">

          {/* Top Row - Moving Left */}
          <motion.div style={{ x: xLeft }} className="flex gap-6 w-max whitespace-nowrap pl-6 md:pl-20">
            {festivals.concat(festivals).map((festival, index) => (
              <div
                key={`top-${index}`}
                className="glass-panel px-8 py-4 rounded-full border border-expo-border/40 hover:border-expo-gold/50 hover:bg-expo-midnight transition-colors duration-500 cursor-default group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-expo-gold/50 group-hover:bg-expo-gold group-hover:shadow-[0_0_10px_rgba(214,160,102,1)] transition-all duration-300" />
                  <span className="font-display text-xl md:text-2xl tracking-widest text-expo-warm/80 group-hover:text-expo-warm transition-colors duration-300">
                    {festival}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Bottom Row - Moving Right */}
          <motion.div style={{ x: xRight }} className="flex gap-6 w-max whitespace-nowrap pl-20 md:pl-64">
            {reversedFestivals.concat(reversedFestivals).map((festival, index) => (
              <div
                key={`bottom-${index}`}
                className="glass-panel px-8 py-4 rounded-full border border-expo-border/40 hover:border-expo-gold/50 hover:bg-expo-midnight transition-colors duration-500 cursor-default group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-expo-copper/50 group-hover:bg-expo-copper group-hover:shadow-[0_0_10px_rgba(184,115,51,1)] transition-all duration-300" />
                  <span className="font-display text-xl md:text-2xl tracking-widest text-expo-warm/80 group-hover:text-expo-warm transition-colors duration-300">
                    {festival}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
