"use client";

import { motion } from 'framer-motion';

export default function ContactSection() {
  return (
    <section id="contact" className="relative w-full min-h-screen py-32 flex items-center justify-center overflow-hidden">

      {/* Full-width cinematic background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-expo-midnight/60 z-10" />
        <div
          className="absolute inset-0 bg-[url('/assets/ste_luxury_hero_613dfd3b.jpg')] bg-cover bg-center"
          style={{ filter: 'contrast(1.2) brightness(0.7)' }}
        />
        {/* Cinematic lens bloom */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[50vh] bg-expo-gold/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      </div>

      <div className="relative z-20 w-full max-w-3xl px-6">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel glass-panel-glow rounded-3xl p-8 md:p-14"
        >
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl tracking-widest text-expo-warm mb-4">RESERVE YOUR STALL</h2>
            <p className="text-expo-warm/60 font-sans">Secure your presence at India&apos;s most prestigious B2B textile summit.</p>
          </div>

          <form className="flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative group">
                <input
                  type="text"
                  id="name"
                  className="w-full bg-transparent border-b border-expo-border/50 py-3 text-expo-warm outline-none focus:border-expo-gold transition-colors duration-300 peer placeholder-transparent"
                  placeholder="Name"
                />
                <label htmlFor="name" className="absolute left-0 top-3 text-expo-warm/40 text-sm transition-all duration-300 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-expo-gold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">
                  Full Name
                </label>
              </div>

              <div className="relative group">
                <input
                  type="text"
                  id="company"
                  className="w-full bg-transparent border-b border-expo-border/50 py-3 text-expo-warm outline-none focus:border-expo-gold transition-colors duration-300 peer placeholder-transparent"
                  placeholder="Company"
                />
                <label htmlFor="company" className="absolute left-0 top-3 text-expo-warm/40 text-sm transition-all duration-300 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-expo-gold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">
                  Company Name
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative group">
                <input
                  type="tel"
                  id="phone"
                  className="w-full bg-transparent border-b border-expo-border/50 py-3 text-expo-warm outline-none focus:border-expo-gold transition-colors duration-300 peer placeholder-transparent"
                  placeholder="Phone"
                />
                <label htmlFor="phone" className="absolute left-0 top-3 text-expo-warm/40 text-sm transition-all duration-300 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-expo-gold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">
                  Phone Number
                </label>
              </div>

              <div className="relative group">
                <select
                  id="category"
                  className="w-full bg-transparent border-b border-expo-border/50 py-3 text-expo-warm/80 outline-none focus:border-expo-gold transition-colors duration-300 appearance-none cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled className="bg-expo-midnight text-expo-warm/40">Select Category</option>
                  <option value="sarees" className="bg-expo-midnight text-expo-warm">Sarees</option>
                  <option value="lehenga" className="bg-expo-midnight text-expo-warm">Lehenga Choli</option>
                  <option value="kurti" className="bg-expo-midnight text-expo-warm">Kurti</option>
                  <option value="salwar" className="bg-expo-midnight text-expo-warm">Salwar Suit</option>
                  <option value="other" className="bg-expo-midnight text-expo-warm">Other</option>
                </select>
              </div>
            </div>

            <div className="relative group">
              <textarea
                id="message"
                rows={3}
                className="w-full bg-transparent border-b border-expo-border/50 py-3 text-expo-warm outline-none focus:border-expo-gold transition-colors duration-300 peer placeholder-transparent resize-none"
                placeholder="Message"
              />
              <label htmlFor="message" className="absolute left-0 top-3 text-expo-warm/40 text-sm transition-all duration-300 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-expo-gold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">
                Additional Message (Optional)
              </label>
            </div>

            <button
              type="submit"
              className="group relative w-full overflow-hidden rounded-lg bg-gold-gradient py-4 mt-4 transition-transform duration-500 hover:scale-[1.01]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative z-10 font-bold uppercase tracking-widest text-expo-midnight text-sm">
                Submit Request
              </span>
            </button>

          </form>
        </motion.div>
      </div>
    </section>
  );
}
