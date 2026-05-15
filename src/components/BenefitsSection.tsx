"use client";

import { motion } from 'framer-motion';
import { Globe, Users, CalendarDays, TrendingUp } from 'lucide-react';

const benefits = [
  {
    title: "PAN India Buyer Reach",
    description: "Connect with verified buyers, wholesalers, and retailers from across the country in one elite environment.",
    icon: Globe,
  },
  {
    title: "Verified B2B Networking",
    description: "Engage in high-value conversations with serious stakeholders focused on long-term commerce.",
    icon: Users,
  },
  {
    title: "Festive Season Demand",
    description: "Position your manufacturing capabilities perfectly ahead of India's biggest retail spending cycles.",
    icon: CalendarDays,
  },
  {
    title: "High-Volume Wholesale Market",
    description: "Capitalize on Surat's reputation as the ultimate destination for bulk textile sourcing.",
    icon: TrendingUp,
  }
];

export default function BenefitsSection() {
  return (
    <section id="benefits" className="relative w-full bg-expo-midnight py-32 px-6">

      {/* Background Environment */}
      <div className="absolute inset-0 z-0 overflow-hidden">
         {/* Subtle metallic gradient environment */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-expo-copper/5 via-expo-midnight to-expo-midnight opacity-70 pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto relative z-20">

        {/* Heading */}
        <div className="flex flex-col items-center mb-20 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-6xl tracking-widest text-expo-warm mb-6"
          >
            WHY EXHIBIT AT SURAT
          </motion.h2>
          <div className="w-24 h-[1px] bg-expo-gold/50" />
        </div>

        {/* Benefits Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative h-full"
              >
                {/* Glowing border effect container */}
                <div className="absolute inset-0 bg-gradient-to-br from-expo-border to-transparent rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Animated border tracing line */}
                <div className="absolute top-0 left-0 w-0 h-[1px] bg-expo-gold group-hover:w-full transition-all duration-1000 ease-luxury" />
                <div className="absolute top-0 right-0 w-[1px] h-0 bg-expo-gold group-hover:h-full transition-all duration-1000 delay-100 ease-luxury" />
                <div className="absolute bottom-0 right-0 w-0 h-[1px] bg-expo-gold group-hover:w-full transition-all duration-1000 delay-200 ease-luxury" />
                <div className="absolute bottom-0 left-0 w-[1px] h-0 bg-expo-gold group-hover:h-full transition-all duration-1000 delay-300 ease-luxury" />

                <div className="relative h-full glass-panel rounded-2xl p-8 md:p-12 flex flex-col justify-between overflow-hidden bg-expo-black/40 group-hover:-translate-y-2 transition-transform duration-500 ease-luxury group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">

                  {/* Subtle moving reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-luxury pointer-events-none" />

                  <div>
                    <div className="w-16 h-16 rounded-full bg-expo-midnight border border-expo-border flex items-center justify-center mb-8 relative group-hover:border-expo-gold/50 transition-colors duration-500">
                      <div className="absolute inset-0 bg-expo-gold/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Icon className="w-8 h-8 text-expo-gold relative z-10" strokeWidth={1.5} />
                    </div>

                    <h3 className="font-display text-2xl md:text-3xl tracking-wider text-expo-warm mb-4 group-hover:text-expo-gold transition-colors duration-300">
                      {benefit.title}
                    </h3>

                    <p className="text-expo-warm/60 leading-relaxed font-sans text-sm md:text-base">
                      {benefit.description}
                    </p>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
