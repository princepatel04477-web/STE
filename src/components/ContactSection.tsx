/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { waapi } from "animejs";

const categories = [
  { value: "sarees", label: "Sarees" },
  { value: "lehenga", label: "Lehenga Choli" },
  { value: "kurti", label: "Kurti" },
  { value: "salwar", label: "Salwar Suit" },
  { value: "other", label: "Other" },
];

export default function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);

  // Scroll Reveal and Glow follow effect
  useEffect(() => {
    if (sectionRef.current && cardRef.current) {
      const card = cardRef.current;
      
      // Scroll entry animation
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            waapi.animate(card as any, {
              opacity: [0, 1],
              translate: ["0 50px", "0 0px"],
              duration: 1000,
              ease: "outExpo"
            });
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(sectionRef.current);

      // Mouse move border glow follow
      const handleMouseMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      };

      card.addEventListener("mousemove", handleMouseMove);
      return () => {
        observer.disconnect();
        card.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section 
      ref={sectionRef} 
      id="contact" 
      className="relative w-full min-h-screen py-32 flex items-center justify-center overflow-hidden bg-expo-midnight"
    >
      {/* Background visual components */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#050505]/75 z-10" />
        <div className="absolute inset-0 noise-overlay" />
        
        {/* Cinematic gradient bloom blobs */}
        <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-expo-gold/5 rounded-full blur-[140px] animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-expo-copper/5 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite_reverse]" />
      </div>

      <div className="relative z-20 w-full max-w-4xl px-6">
        
        {/* Morphing border wrapper card */}
        <div
          ref={cardRef}
          className="opacity-0 relative rounded-[2.5rem] p-[1.5px] overflow-hidden bg-gradient-to-br from-expo-border/30 via-expo-border/10 to-expo-gold/20 shadow-2xl transition-all duration-700"
          style={{
            backgroundSize: "200% 200%",
          }}
        >
          {/* Internal Glow Effect */}
          <div 
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: "radial-gradient(400px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(214, 160, 102, 0.12), transparent 80%)"
            }}
          />

          {/* Form Card Content */}
          <div className="relative bg-[#070707]/90 backdrop-blur-2xl rounded-[2.45rem] p-8 md:p-16 overflow-hidden">
            
            {/* Morphing shape decorative element inside card */}
            <div 
              ref={glowRef}
              className="absolute -top-32 -right-32 w-64 h-64 bg-expo-gold/10 rounded-full blur-[60px] pointer-events-none"
            />

            {!submitted ? (
              <>
                <div className="text-center mb-16">
                  <span className="text-xs uppercase tracking-[0.3em] text-expo-gold font-medium mb-3 block">Exhibition Space</span>
                  <h2 className="font-display text-4xl md:text-5xl tracking-widest text-expo-warm mb-4">
                    RESERVE YOUR PAVILION
                  </h2>
                  <p className="text-expo-warm/50 font-sans text-sm max-w-md mx-auto leading-relaxed">
                    Secure your custom exhibit stall at India&apos;s premier corporate B2B textile summit.
                  </p>
                </div>

                <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
                  
                  {/* Name and Company */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="relative group">
                      <input
                        type="text"
                        id="name"
                        required
                        className="w-full bg-transparent border-b border-expo-border/50 py-3 text-expo-warm outline-none focus:border-expo-gold transition-colors duration-300 peer placeholder-transparent"
                        placeholder="Full Name"
                      />
                      <label 
                        htmlFor="name" 
                        className="absolute left-0 top-3 text-expo-warm/40 text-sm transition-all duration-300 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-expo-gold peer-[:not(:placeholder-shown)]:-top-5 peer-[:not(:placeholder-shown)]:text-xs"
                      >
                        Full Name
                      </label>
                    </div>

                    <div className="relative group">
                      <input
                        type="text"
                        id="company"
                        required
                        className="w-full bg-transparent border-b border-expo-border/50 py-3 text-expo-warm outline-none focus:border-expo-gold transition-colors duration-300 peer placeholder-transparent"
                        placeholder="Company Name"
                      />
                      <label 
                        htmlFor="company" 
                        className="absolute left-0 top-3 text-expo-warm/40 text-sm transition-all duration-300 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-expo-gold peer-[:not(:placeholder-shown)]:-top-5 peer-[:not(:placeholder-shown)]:text-xs"
                      >
                        Company Name
                      </label>
                    </div>
                  </div>

                  {/* Phone and Segment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="relative group">
                      <input
                        type="tel"
                        id="phone"
                        required
                        className="w-full bg-transparent border-b border-expo-border/50 py-3 text-expo-warm outline-none focus:border-expo-gold transition-colors duration-300 peer placeholder-transparent"
                        placeholder="Phone Number"
                      />
                      <label 
                        htmlFor="phone" 
                        className="absolute left-0 top-3 text-expo-warm/40 text-sm transition-all duration-300 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-expo-gold peer-[:not(:placeholder-shown)]:-top-5 peer-[:not(:placeholder-shown)]:text-xs"
                      >
                        Phone Number
                      </label>
                    </div>

                    <div className="relative group">
                      <select
                        id="category"
                        required
                        className="w-full bg-transparent border-b border-expo-border/50 py-3 text-expo-warm/80 outline-none focus:border-expo-gold transition-colors duration-300 appearance-none cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled className="bg-expo-midnight text-expo-warm/40">Select Sourcing Segment</option>
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value} className="bg-[#0b0b0b] text-expo-warm py-2">
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-0 top-4 pointer-events-none text-expo-warm/40">
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="relative group">
                    <textarea
                      id="message"
                      rows={3}
                      className="w-full bg-transparent border-b border-expo-border/50 py-3 text-expo-warm outline-none focus:border-expo-gold transition-colors duration-300 peer placeholder-transparent resize-none"
                      placeholder="Message"
                    />
                    <label 
                      htmlFor="message" 
                      className="absolute left-0 top-3 text-expo-warm/40 text-sm transition-all duration-300 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-expo-gold peer-[:not(:placeholder-shown)]:-top-5 peer-[:not(:placeholder-shown)]:text-xs"
                    >
                      Stall Size & Special Requirements (Optional)
                    </label>
                  </div>

                  {/* Button */}
                  <button
                    type="submit"
                    className="group relative w-full overflow-hidden rounded-xl bg-gold-gradient py-5 mt-6 transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(214,160,102,0.25)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    <span className="relative z-10 font-display font-bold uppercase tracking-widest text-expo-midnight text-xs">
                      Submit Exhibition Inquiry
                    </span>
                  </button>

                </form>
              </>
            ) : (
              <div className="text-center py-16 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border border-expo-gold/40 flex items-center justify-center mb-8 bg-expo-midnight relative">
                  <div className="absolute inset-0 bg-expo-gold/5 rounded-full blur-md animate-pulse" />
                  <span className="text-expo-gold text-3xl font-display">✓</span>
                </div>
                <h3 className="font-display text-3xl text-expo-warm mb-4 tracking-wider">
                  REGISTRATION RECEIVED
                </h3>
                <p className="text-sm text-expo-warm/50 max-w-sm mx-auto leading-relaxed mb-8">
                  Our commercial team will review your sourcing segment request and contact you within 24 hours with floorplan layout designs.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-3 rounded-full border border-expo-border hover:border-expo-gold text-xs text-expo-warm/75 hover:text-expo-gold uppercase tracking-widest transition-colors duration-300"
                >
                  New Inquiry
                </button>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </section>
  );
}
