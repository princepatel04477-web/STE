"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';

const categories = [
  { name: "Sarees", colSpan: "md:col-span-2", rowSpan: "md:row-span-2" },
  { name: "Lehenga Choli", colSpan: "md:col-span-1", rowSpan: "md:row-span-1" },
  { name: "Kurti", colSpan: "md:col-span-1", rowSpan: "md:row-span-1" },
  { name: "Salwar Suit", colSpan: "md:col-span-1", rowSpan: "md:row-span-2" },
  { name: "Readymade", colSpan: "md:col-span-1", rowSpan: "md:row-span-1" },
  { name: "Value Added Fabrics", colSpan: "md:col-span-2", rowSpan: "md:row-span-1" },
  { name: "Kids Wear", colSpan: "md:col-span-1", rowSpan: "md:row-span-1" },
  { name: "Sherwani & Men's Ethnic Wear", colSpan: "md:col-span-3", rowSpan: "md:row-span-1" },
];

export default function CategoriesSection() {
  return (
    <section id="categories" className="relative w-full bg-expo-black py-32 px-6">

      {/* Background Texture Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('/assets/ste_luxury_hero_613dfd3b.jpg')] bg-cover bg-center mix-blend-overlay" />

      <div className="max-w-7xl mx-auto relative z-20">

        {/* Heading */}
        <div className="flex flex-col items-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-6xl tracking-widest text-expo-warm text-center mb-6"
          >
            TEXTILE CATEGORIES
          </motion.h2>
          <div className="w-24 h-[1px] bg-expo-gold/50" />
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[200px] gap-4 md:gap-6">
          {categories.map((cat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className={`group relative overflow-hidden rounded-xl border border-expo-border bg-expo-midnight ${cat.colSpan} ${cat.rowSpan}`}
            >
              {/* Image background - using provided images as placeholders */}
              <Image
                src="/assets/ste_luxury_hero_613dfd3b.jpg"
                alt={cat.name}
                fill
                sizes="(min-width: 768px) 25vw, 100vw"
                className="object-cover opacity-40 group-hover:opacity-70 transition-all duration-1000 ease-luxury group-hover:scale-110 mix-blend-luminosity"
              />

              {/* Soft gold lighting gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-expo-midnight via-transparent to-transparent opacity-90" />
              <div className="absolute inset-0 bg-expo-gold/0 group-hover:bg-expo-gold/10 transition-colors duration-500 ease-luxury" />

              {/* Animated shimmer sweep */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_2s_infinite]" />

              {/* Glass overlay label */}
              <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto">
                <div className="glass-panel px-6 py-3 rounded-lg border border-expo-border/50 group-hover:border-expo-gold/40 transition-colors duration-300">
                  <h3 className="font-display text-xl tracking-wider text-expo-warm group-hover:text-expo-gold transition-colors duration-300">
                    {cat.name}
                  </h3>
                </div>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
