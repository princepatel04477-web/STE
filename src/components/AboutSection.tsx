"use client";

import { useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const timelineNodes = [
  {
    title: "Exhibition",
    image: "/assets/STE.jpg", // Using main poster as placeholder
    align: "left"
  },
  {
    title: "Networking",
    image: "/assets/STE LOGO.jpg",
    align: "right"
  },
  {
    title: "Live Sourcing",
    image: "/assets/ste_luxury_hero_613dfd3b.jpg",
    align: "left"
  },
  {
    title: "Festive Collections",
    image: "/assets/STE.jpg",
    align: "right"
  },
  {
    title: "Wedding Market",
    image: "/assets/ste_luxury_hero_613dfd3b.jpg",
    align: "left"
  }
];

export default function AboutSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Framer Motion variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <section id="about" ref={containerRef} className="relative w-full bg-expo-midnight py-32 px-6 overflow-hidden">

      {/* Background Matte Transition */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[30vh] bg-gradient-to-b from-expo-midnight to-transparent z-10" />
      </div>

      <div className="max-w-7xl mx-auto relative z-20">

        {/* Heading */}
        <div className="flex items-center gap-6 mb-24">
          <h2 className="font-display text-4xl md:text-6xl tracking-widest text-expo-warm shrink-0">ABOUT THE EXHIBITION</h2>
          <div className="h-[1px] w-full bg-gradient-to-r from-expo-gold/50 to-transparent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">

          {/* Left Side - Editorial Content */}
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="prose prose-invert prose-lg max-w-none"
            >
              <p className="font-serif text-2xl md:text-3xl leading-relaxed text-expo-warm/80 mb-8">
                Welcome to the epicenter of <span className="text-expo-gold font-medium">India&apos;s textile ecosystem</span>. Surat, recognized globally as a manufacturing powerhouse, opens its doors to the most ambitious sourcing summit of the year.
              </p>

              <p className="text-sm md:text-base leading-loose text-expo-warm/60 mb-8 font-sans">
                Positioned strategically ahead of the festive and wedding seasons, SURAT EXPO is engineered for scale. We bring together top-tier manufacturers and <span className="text-white">verified buyers</span> in a hyper-premium environment designed for <span className="text-white">high-volume trade</span> and <span className="text-white">live sourcing</span>.
              </p>

              <div className="flex flex-col gap-4 pl-6 border-l-2 border-expo-gold/30">
                <span className="text-xs uppercase tracking-widest text-expo-gold">The Textile Capital Advantage</span>
                <p className="text-sm text-expo-warm/50">Experience unparalleled access to direct manufacturers, eliminating middlemen and accelerating your business momentum.</p>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Experience Timeline */}
          <div className="relative pt-10 pb-10">
            {/* Glowing vertical line */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-transparent via-expo-gold/30 to-transparent" />
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[20px] bg-expo-gold/10 blur-xl" />

            <div className="relative flex flex-col gap-32">
              {timelineNodes.map((node, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-150px" }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative flex items-center w-full ${node.align === 'left' ? 'justify-start' : 'justify-end'}`}
                >

                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-expo-gold shadow-[0_0_15px_rgba(214,160,102,0.8)] z-30" />

                  {/* Content Card */}
                  <div className={`w-[45%] relative group ${node.align === 'left' ? 'pr-8' : 'pl-8'}`}>
                     <div className="relative h-[200px] w-full rounded-lg overflow-hidden border border-expo-border bg-expo-black">
                       <Image
                         src={node.image}
                         alt={node.title}
                         fill
                         sizes="(min-width: 1024px) 45vw, 90vw"
                         className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-luxury mix-blend-luminosity group-hover:mix-blend-normal"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-expo-midnight to-transparent opacity-80" />

                       <div className="absolute bottom-4 left-4 right-4">
                         <h3 className="font-display text-2xl tracking-wider text-expo-warm group-hover:text-expo-gold transition-colors duration-300">
                           {node.title}
                         </h3>
                       </div>
                     </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
