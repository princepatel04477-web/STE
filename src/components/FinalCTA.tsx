"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { waapi, splitText, stagger } from "animejs";
import { motion, AnimatePresence } from "framer-motion";
import LoomGateVerification from "./LoomGateVerification";

export default function FinalCTA() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    contactNumber: "",
    whatsAppNumber: "",
    sameAsContact: false,
    email: "",
    city: "",
    gstin: "",
    businessType: "",
    primaryCategory: "",
    stallDimension: "",
    turnover: "",
    message: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0); // 1 = forward, -1 = backward
  const [isGstLoading, setIsGstLoading] = useState(false);
  const [gstValid, setGstValid] = useState<boolean | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [resetCaptcha, setResetCaptcha] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const triggerCaptchaReset = () => {
    setResetCaptcha((prev) => !prev);
    setIsVerified(false);
  };

  useEffect(() => {

    // Reveal text animation
    if (headlineRef.current) {
      const split = splitText(headlineRef.current, {
        chars: true,
        accessible: true,
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              waapi.animate(split.chars, {
                translateY: [35, 0],
                opacity: [0, 1],
                duration: 1000,
                delay: stagger(30),
                ease: "outExpo",
              });
              observer.disconnect();
            }
          });
        },
        { threshold: 0.2 }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }
      return () => observer.disconnect();
    }
  }, []);

  // Simulated async GSTIN validation with 600ms latency
  useEffect(() => {
    if (formData.gstin === "") {
      return;
    }

    const timer = setTimeout(() => {
      // GSTIN format: 15 chars (e.g. 24AAAAA1111A1Z1)
      const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      setGstValid(regex.test(formData.gstin));
      setIsGstLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.gstin]);

  const handleGstChange = (val: string) => {
    // Format: Uppercase, alphanumeric, 15 chars max
    const cleaned = val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
    setFormData((prev) => ({ ...prev, gstin: cleaned }));
    
    if (cleaned === "") {
      setGstValid(null);
      setIsGstLoading(false);
    } else {
      setIsGstLoading(true);
      setGstValid(null);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      sameAsContact: checked,
      whatsAppNumber: checked ? prev.contactNumber : prev.whatsAppNumber
    }));
  };

  const handleContactChange = (val: string) => {
    // Format: numbers only
    const cleanNum = val.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({
      ...prev,
      contactNumber: cleanNum,
      whatsAppNumber: prev.sameAsContact ? cleanNum : prev.whatsAppNumber
    }));
  };

  const isStep1Valid = () => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const isPhoneValid = formData.contactNumber.length === 10;
    const isWhatsAppValid = formData.sameAsContact || formData.whatsAppNumber.length === 10;

    return (
      formData.companyName.trim() !== "" &&
      formData.contactPerson.trim() !== "" &&
      formData.email.trim() !== "" &&
      isEmailValid &&
      isPhoneValid &&
      isWhatsAppValid
    );
  };

  const isStep2Valid = () => {
    const isGstOk = formData.gstin === "" || gstValid === true;
    return (
      isGstOk &&
      !isGstLoading &&
      formData.businessType !== "" &&
      formData.turnover !== ""
    );
  };

  const isStep3Valid = () => {
    return (
      formData.city.trim() !== "" &&
      formData.stallDimension !== "" &&
      formData.primaryCategory !== "" &&
      isVerified
    );
  };

  const handleNextStep = () => {
    if (currentStep === 1 && isStep1Valid()) {
      setDirection(1);
      setCurrentStep(2);
    } else if (currentStep === 2 && isStep2Valid()) {
      setDirection(1);
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isStep1Valid() || !isStep2Valid() || !isStep3Valid()) {
      return;
    }

    setShowModal(true);
  };

  const handleWhatsAppRedirect = () => {
    const textMessage = `*STE 2026 Stall Booking Inquiry*
---------------------------------------
*Company:* ${formData.companyName}
*Contact Person:* ${formData.contactPerson}
*Phone:* ${formData.contactNumber}
*WhatsApp:* ${formData.whatsAppNumber}
*Email:* ${formData.email}
*City:* ${formData.city}
*GSTIN:* ${formData.gstin || "N/A"}
*Business Type:* ${formData.businessType}
*Category:* ${formData.primaryCategory}
*Stall Dimension:* ${formData.stallDimension} sq meters
*Turnover:* ${formData.turnover}
*Message:* ${formData.message || "N/A"}`;

    const encoded = encodeURIComponent(textMessage);
    window.open(`https://wa.me/919950787787?text=${encoded}`, "_blank");
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <section
      ref={containerRef}
      id="final-cta"
      className="relative w-full min-h-screen py-24 sm:py-32 bg-[#050505] flex flex-col justify-center overflow-hidden"
    >
      {/* Loop background video */}
      <div className="absolute inset-0 w-full h-full select-none pointer-events-none z-0">
        <video
          className="w-full h-full object-cover filter brightness-[0.18] contrast-[1.1] saturate-[0.7]"
          autoPlay
          muted
          loop
          playsInline
          src="/assets/video/cta.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/40 to-[#050505] z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-[#050505] z-10" />
        <div className="noise-overlay z-20" />
        <div className="grid-overlay-pattern absolute inset-0 opacity-[0.06] z-20" />
      </div>

      {/* Decorative Layered Panels */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-10 overflow-hidden">
        {/* World map panel */}
        <div
          className="absolute left-[5%] top-[15%] w-[18vw] h-[12vw] bg-cover bg-center border border-white/5 rounded-sm opacity-[0.08] hidden lg:block scale-[1.05]"
          style={{ backgroundImage: `url('/assets/images/world-map.jpg')` }}
        />
        {/* Saree stall panel */}
        <div
          className="absolute right-[5%] top-[25%] w-[15vw] h-[20vw] bg-cover bg-[position:center_20%] border border-white/5 rounded-sm opacity-[0.08] hidden lg:block"
          style={{ backgroundImage: `url('/assets/images/expo-stall.png')` }}
        />
        {/* Couture queen panel */}
        <div
          className="absolute left-[8%] bottom-[15%] w-[15vw] h-[20vw] bg-cover bg-[position:center_15%] border border-white/5 rounded-sm opacity-[0.08] hidden lg:block"
          style={{ backgroundImage: `url('/assets/images/editorial-queen.png')` }}
        />
        {/* Line graph panel */}
        <div
          className="absolute right-[8%] bottom-[10%] w-[18vw] h-[12vw] bg-contain bg-no-repeat bg-center border border-white/5 rounded-sm opacity-[0.06] hidden lg:block"
          style={{ backgroundImage: `url('/assets/images/line-graph-rising.png')` }}
        />

        {/* Ambient glow lights */}
        <div className="spotlight-glowing left-[35%] top-[10%] w-[40vw] h-[40vw]" />
        <div className="spotlight-glowing right-[30%] bottom-[10%] w-[45vw] h-[45vw]" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left column: Text invitations */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <span className="text-[10px] sm:text-xs font-bold tracking-[6px] text-expo-gold uppercase mb-6 block">
            07 • EXHIBITOR REGISTRATION
          </span>
          <h2
            ref={headlineRef}
            className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-wide text-white leading-[1.08] mb-8 uppercase"
          >
            Exhibitor Stall <br />
            <span className="text-metallic font-light italic normal-case">Booking Request</span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-expo-warm/60 leading-relaxed max-w-lg mb-8">
            Book your premium exhibition space at SIECC Sarsana Dome, Surat. With 650+ stalls and 8000+ verified buyers from all across India, establish critical connections and command maximum B2B seasonal trade.
          </p>

          <div className="flex items-center gap-6 border-t border-white/10 pt-8 mt-4 z-30 select-none">
            {/* STE Logo */}
            <div className="flex flex-col">
              <div className="relative w-28 h-16 overflow-hidden bg-white/[0.02] border border-white/10 rounded-lg p-2.5 backdrop-blur-md flex items-center justify-center group/logo hover:border-expo-gold/40 transition-all duration-500 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gold-gradient opacity-0 group-hover/logo:opacity-[0.03] transition-opacity duration-500" />
                <Image
                  src="/assets/logo_STE.png"
                  alt="STE Big Logo"
                  width={140}
                  height={80}
                  className="object-contain filter drop-shadow-[0_0_8px_rgba(214,160,102,0.3)] transition-transform duration-500 group-hover/logo:scale-105"
                />
              </div>
              <span className="font-sans text-[8px] tracking-[1.5px] text-expo-warm/50 block mt-2 text-center uppercase font-bold">
                Ecosystem Organizer
              </span>
            </div>

            <div className="h-14 w-px bg-white/10" />

            {/* AKAS Circular Logo */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 overflow-hidden bg-white border border-white/10 rounded-full flex items-center justify-center group/logo hover:border-expo-gold transition-all duration-500 hover:-translate-y-1 shadow-lg">
                <Image
                  src="/assets/AKAS_1.png"
                  alt="AKAS Big Logo"
                  width={180}
                  height={180}
                  className="object-contain scale-[1.3] transition-transform duration-500 group-hover/logo:scale-[1.38]"
                />
              </div>
              <span className="font-sans text-[8px] tracking-[1.5px] text-expo-warm/50 block mt-3 text-center uppercase font-bold">
                Supporting Association
              </span>
            </div>
          </div>
        </div>

        {/* Right column: Premium Inquiry Form */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end">
          <div className="w-full border-glow-card p-6 sm:p-10 relative overflow-hidden bg-black/45 backdrop-blur-xl">
            <div className="absolute right-[-10%] top-[-10%] w-[150px] h-[150px] bg-expo-gold/5 blur-[50px] pointer-events-none" />
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Header */}
              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl text-white italic">
                    Stall Registration
                  </h3>
                  <p className="font-sans text-[9px] tracking-[1.5px] uppercase text-expo-warm/50 mt-1">
                    Surat Textile Exhibition 2026
                  </p>
                </div>
                <span className="font-sans text-[10px] tracking-[3px] text-expo-gold font-bold uppercase">
                  Step {currentStep} / 3
                </span>
              </div>

              {/* Progress Indicator Stepper */}
              <div className="flex items-center justify-between mb-2 relative select-none px-2">
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10 -translate-y-1/2 z-0" />
                <motion.div
                  className="absolute top-1/2 left-0 h-[1px] bg-gold-gradient -translate-y-1/2 z-0"
                  initial={{ width: "0%" }}
                  animate={{
                    width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%",
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />

                {[
                  { step: 1, label: "Identity" },
                  { step: 2, label: "Business" },
                  { step: 3, label: "Stall" },
                ].map((item) => {
                  const isActive = currentStep === item.step;
                  const isCompleted = currentStep > item.step;
                  return (
                    <div key={item.step} className="flex flex-col items-center relative z-10">
                      <motion.div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-sans text-[10px] font-bold transition-all duration-500 border ${
                          isActive
                            ? "bg-black border-expo-gold text-expo-gold shadow-[0_0_10px_rgba(214,160,102,0.3)]"
                            : isCompleted
                            ? "bg-expo-gold border-expo-gold text-expo-midnight"
                            : "bg-[#0c0c0c] border-white/10 text-expo-warm/40"
                        }`}
                        animate={{
                          scale: isActive ? 1.08 : 1,
                        }}
                      >
                        {isCompleted ? "✓" : item.step}
                      </motion.div>
                      <span
                        className={`font-sans text-[7px] tracking-[1.5px] uppercase mt-1.5 font-bold ${
                          isActive
                            ? "text-expo-gold"
                            : isCompleted
                            ? "text-expo-warm"
                            : "text-expo-warm/30"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Steps Layout Container with animated height */}
              <motion.div layout transition={{ duration: 0.3, ease: "easeInOut" }} className="w-full">
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 380, damping: 30 },
                      opacity: { duration: 0.18 },
                    }}
                    className="flex flex-col gap-5"
                  >
                    {/* STEP 1: IDENTITY & CONTACT */}
                    {currentStep === 1 && (
                      <div className="flex flex-col gap-4">
                        {/* Company Name */}
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">
                            Company Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            className="w-full bg-white/[0.02] border border-white/10 focus:border-expo-gold focus:outline-none rounded-sm px-4 py-3.5 text-base text-white placeholder-white/20 transition-all duration-300 focus:ring-1 focus:ring-expo-gold/20"
                            placeholder="Enter company name"
                          />
                        </div>

                        {/* Contact Person */}
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">
                            Contact Person *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.contactPerson}
                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                            className="w-full bg-white/[0.02] border border-white/10 focus:border-expo-gold focus:outline-none rounded-sm px-4 py-3.5 text-base text-white placeholder-white/20 transition-all duration-300 focus:ring-1 focus:ring-expo-gold/20"
                            placeholder="Full name of contact person"
                          />
                        </div>

                        {/* Email Address */}
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-white/[0.02] border border-white/10 focus:border-expo-gold focus:outline-none rounded-sm px-4 py-3.5 text-base text-white placeholder-white/20 transition-all duration-300 focus:ring-1 focus:ring-expo-gold/20"
                            placeholder="e.g. partner@company.com"
                          />
                        </div>

                        {/* Mobile / Contact Number */}
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">
                            Mobile Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={formData.contactNumber}
                            onChange={(e) => handleContactChange(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/10 focus:border-expo-gold focus:outline-none rounded-sm px-4 py-3.5 text-base text-white placeholder-white/20 transition-all duration-300 focus:ring-1 focus:ring-expo-gold/20"
                            placeholder="10-digit mobile number"
                          />
                        </div>

                        {/* WhatsApp Checkbox */}
                        <label className="flex items-center justify-between py-2 cursor-pointer select-none group">
                          <span className="font-sans text-[10px] text-expo-warm/80 uppercase tracking-[1px] group-hover:text-expo-gold transition-colors duration-300">
                            WhatsApp same as mobile
                          </span>
                          <div className="relative inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.sameAsContact}
                              onChange={(e) => handleCheckboxChange(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-expo-warm/75 peer-checked:after:bg-expo-gold after:border-none after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-expo-gold/20 border border-white/10 peer-checked:border-expo-gold/40"></div>
                          </div>
                        </label>

                        {/* WhatsApp Number (Animated conditional rendering) */}
                        <AnimatePresence initial={false}>
                          {!formData.sameAsContact && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, marginTop: -8 }}
                              animate={{ opacity: 1, height: "auto", marginTop: 0 }}
                              exit={{ opacity: 0, height: 0, marginTop: -8 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden flex flex-col gap-1.5"
                            >
                              <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">
                                WhatsApp Number *
                              </label>
                              <input
                                type="tel"
                                required={!formData.sameAsContact}
                                value={formData.whatsAppNumber}
                                onChange={(e) => setFormData({ ...formData, whatsAppNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                                className="w-full bg-white/[0.02] border border-white/10 focus:border-expo-gold focus:outline-none rounded-sm px-4 py-3.5 text-base text-white placeholder-white/20 transition-all duration-300 focus:ring-1 focus:ring-expo-gold/20"
                                placeholder="WhatsApp mobile number"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* STEP 2: BUSINESS INFORMATION */}
                    {currentStep === 2 && (
                      <div className="flex flex-col gap-4">
                        {/* GSTIN with loader and validation badges */}
                        <div className="flex flex-col gap-1.5 relative">
                          <div className="flex justify-between items-center">
                            <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">
                              GSTIN (Optional)
                            </label>
                            {isGstLoading && (
                              <span className="flex items-center gap-1.5 text-[8px] text-expo-gold/70 font-bold uppercase tracking-[1px]">
                                <svg className="animate-spin h-2.5 w-2.5 text-expo-gold" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Verifying...
                              </span>
                            )}
                            {!isGstLoading && gstValid === true && (
                              <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-[1px] flex items-center gap-1 animate-fade-in">
                                ✓ Form Verified
                              </span>
                            )}
                            {!isGstLoading && gstValid === false && (
                              <span className="text-[8px] text-rose-400 font-bold uppercase tracking-[1px] flex items-center gap-1 animate-fade-in">
                                ⚠ Invalid Format
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            maxLength={15}
                            value={formData.gstin}
                            onChange={(e) => handleGstChange(e.target.value)}
                            className={`w-full bg-white/[0.02] border rounded-sm px-4 py-3.5 text-base text-white placeholder-white/20 transition-all duration-300 focus:outline-none focus:ring-1 ${
                              gstValid === true
                                ? "border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20"
                                : gstValid === false
                                ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20"
                                : "border-white/10 focus:border-expo-gold focus:ring-expo-gold/20"
                            }`}
                            placeholder="e.g. 24AAAAA1111A1Z1"
                          />
                        </div>

                        {/* Business Type */}
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">
                            Business Type *
                          </label>
                          <select
                            required
                            value={formData.businessType}
                            onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                            className="w-full bg-[#0c0c0c] border border-white/10 focus:border-expo-gold focus:outline-none focus:ring-1 focus:ring-expo-gold/20 rounded-sm px-4 py-3.5 text-base text-white transition-colors duration-300 appearance-none cursor-pointer"
                          >
                            <option value="" disabled className="text-white/20">Select Business Type</option>
                            <option value="Weaver">Weaver</option>
                            <option value="Manufacturer">Manufacturer</option>
                            <option value="Wholesaler">Wholesaler</option>
                            <option value="Retailer">Retailer</option>
                            <option value="Exporter">Exporter</option>
                            <option value="Fabric Supplier">Fabric Supplier</option>
                          </select>
                        </div>

                        {/* Monthly/Annual Turnover */}
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">
                            Annual Turnover *
                          </label>
                          <select
                            required
                            value={formData.turnover}
                            onChange={(e) => setFormData({ ...formData, turnover: e.target.value })}
                            className="w-full bg-[#0c0c0c] border border-white/10 focus:border-expo-gold focus:outline-none focus:ring-1 focus:ring-expo-gold/20 rounded-sm px-4 py-3.5 text-base text-white transition-colors duration-300 appearance-none cursor-pointer"
                          >
                            <option value="" disabled className="text-white/20">Select Turnover Bracket</option>
                            <option value="Under 50 Lakhs">Under ₹50 Lakhs</option>
                            <option value="50 Lakhs - 2 Crores">₹50 Lakhs - ₹2 Crores</option>
                            <option value="2 - 5 Crores">₹2 Crores - ₹5 Crores</option>
                            <option value="Above 5 Crores">Above ₹5 Crores</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: STALL REQUIREMENTS & VERIFICATION */}
                    {currentStep === 3 && (
                      <div className="flex flex-col gap-4">
                        {/* Preferred Stall Area */}
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">
                            Preferred Stall Area *
                          </label>
                          <select
                            required
                            value={formData.stallDimension}
                            onChange={(e) => setFormData({ ...formData, stallDimension: e.target.value })}
                            className="w-full bg-[#0c0c0c] border border-white/10 focus:border-expo-gold focus:outline-none focus:ring-1 focus:ring-expo-gold/20 rounded-sm px-4 py-3.5 text-base text-white transition-colors duration-300 appearance-none cursor-pointer"
                          >
                            <option value="" disabled className="text-white/20">Select Preferred Stall Area</option>
                            <option value="9">9 Sqm Standard Stall</option>
                            <option value="18">18 Sqm Executive Space</option>
                            <option value="27">27 Sqm Premium Space</option>
                            <option value="36">36 Sqm+ Custom Pavilion</option>
                          </select>
                        </div>

                        {/* Category Interested In */}
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">
                            Category Interested In *
                          </label>
                          <select
                            required
                            value={formData.primaryCategory}
                            onChange={(e) => setFormData({ ...formData, primaryCategory: e.target.value })}
                            className="w-full bg-[#0c0c0c] border border-white/10 focus:border-expo-gold focus:outline-none focus:ring-1 focus:ring-expo-gold/20 rounded-sm px-4 py-3.5 text-base text-white transition-colors duration-300 appearance-none cursor-pointer"
                          >
                            <option value="" disabled className="text-white/20">Select Category</option>
                            <option value="Sarees">Sarees</option>
                            <option value="Lehenga Choli">Lehenga Choli</option>
                            <option value="Kurti & Tunics">Kurti & Tunics</option>
                            <option value="Salwar Suits">Salwar Suits</option>
                            <option value="Kids Ethnic Wear">Kids Ethnic Wear</option>
                            <option value="Mens Ethnic Wear">{"Sherwani & Men's Ethnic Wear"}</option>
                            <option value="Value Added Fabrics">Value Added Fabrics / Embroideries</option>
                          </select>
                        </div>

                        {/* City */}
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">
                            City *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full bg-white/[0.02] border border-white/10 focus:border-expo-gold focus:outline-none rounded-sm px-4 py-3.5 text-base text-white placeholder-white/20 transition-all duration-300 focus:ring-1 focus:ring-expo-gold/20"
                            placeholder="e.g. Surat, Mumbai"
                          />
                        </div>

                        {/* Dynamic LoomGate CAPTCHA */}
                        <div className="flex flex-col gap-2 w-full">
                          <LoomGateVerification
                            onVerify={(val) => setIsVerified(val)}
                            resetTrigger={resetCaptcha}
                          />
                        </div>

                        {/* Elegant Confirmation Panel */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1, duration: 0.4 }}
                          className="border border-expo-gold/20 bg-expo-gold/[0.02] p-5 rounded-md flex flex-col gap-3 backdrop-blur-md relative overflow-hidden"
                        >
                          <div className="absolute right-0 top-0 w-24 h-24 bg-expo-gold/5 blur-2xl pointer-events-none rounded-full" />
                          
                          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                            <span className="font-serif text-xs text-white italic">Surat Textile Exhibition 2026</span>
                            <span className="font-sans text-[8px] tracking-[2px] bg-expo-gold/15 text-expo-gold px-2 py-0.5 rounded-sm uppercase font-bold">
                              STE Surat 2026
                            </span>
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="flex items-start gap-2.5">
                              <span className="text-expo-gold text-xs mt-0.5">⚡</span>
                              <p className="font-sans text-xs text-expo-warm/80 leading-relaxed">
                                <strong>Priority allocation</strong> for early registrations.
                              </p>
                            </div>
                            <div className="flex items-start gap-2.5">
                              <span className="text-expo-gold text-xs mt-0.5">🕒</span>
                              <p className="font-sans text-xs text-expo-warm/80 leading-relaxed">
                                Our relationship team will contact you within <strong>24 hours</strong>.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Step Navigation Controls */}
              <div className="flex gap-4 mt-2">
                {/* Back Button */}
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 py-4 bg-transparent border border-expo-gold/30 hover:border-expo-gold text-expo-gold rounded-sm font-sans font-bold text-xs tracking-[3px] uppercase transition-all duration-300 flex items-center justify-center gap-1.5"
                  >
                    <span>Back</span>
                  </button>
                )}

                {/* Next / Submit Button */}
                {currentStep < 3 ? (
                  <button
                    type="button"
                    disabled={currentStep === 1 ? !isStep1Valid() : !isStep2Valid()}
                    onClick={handleNextStep}
                    className="flex-[2] py-4 bg-white/5 border border-white/10 text-white hover:border-expo-gold/60 hover:text-expo-gold disabled:opacity-30 disabled:border-white/5 disabled:text-white/20 disabled:hover:text-white/20 disabled:hover:border-white/5 rounded-sm font-sans font-bold text-xs tracking-[3px] uppercase transition-all duration-300 flex items-center justify-center gap-1"
                  >
                    <span>Continue</span>
                    <span className="text-[10px]">→</span>
                  </button>
                ) : (
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01, boxShadow: "0 0 25px rgba(214,160,102,0.4)" }}
                    whileTap={{ scale: 0.99 }}
                    className="relative flex-[2] py-4 bg-gold-gradient rounded-sm text-expo-midnight font-sans font-bold text-xs tracking-[3px] uppercase overflow-hidden shadow-lg transition-all duration-500 hover:brightness-105"
                  >
                    <span className="relative z-10">Confirm & Book Stall</span>
                    {/* Shine sweep animation */}
                    <motion.div
                      className="absolute top-0 bottom-0 left-0 w-20 bg-white/20 skew-x-12 blur-md"
                      animate={{
                        left: ["-100%", "250%"],
                      }}
                      transition={{
                        repeat: Infinity,
                        repeatDelay: 4,
                        duration: 1.5,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.button>
                )}
              </div>
              
              <a
                href="tel:+919950787787"
                className="w-full py-3 bg-transparent border border-white/5 hover:border-expo-gold/30 hover:text-expo-gold text-expo-warm/50 rounded-sm font-sans font-bold text-center text-[10px] tracking-[2px] uppercase overflow-hidden transition-all duration-500"
              >
                CALL SOURCING HOTLINE: +91 9950787787
              </a>
            </form>

          </div>
        </div>

      </div>

      {/* Premium Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-lg border border-expo-gold/30 bg-[#070707] p-8 sm:p-10 rounded-lg shadow-[0_0_80px_rgba(214,160,102,0.25)] flex flex-col items-center text-center animate-fade-in">
             <div className="absolute top-4 right-4 cursor-pointer text-expo-warm/40 hover:text-white transition-colors duration-300"
                  onClick={() => {
                    setShowModal(false);
                    triggerCaptchaReset();
                  }}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            {/* Success Shield */}
            <div className="w-20 h-20 rounded-full border border-expo-gold bg-[#D6A066]/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(214,160,102,0.1)]">
              <span className="text-expo-gold text-3xl font-light">✓</span>
            </div>

            <h3 className="font-serif text-3xl text-white italic tracking-wide mb-4">
              Booking Registered
            </h3>
            
            <p className="font-sans text-xs text-expo-warm/70 leading-relaxed max-w-sm mb-6">
              Congratulations! Your exhibitor stall booking request has been successfully filed. The Surat Textile Exhibition allocation committee has locked your preferences.
            </p>

            <div className="w-full bg-white/[0.02] border border-white/5 p-4 rounded-sm text-left mb-6 flex flex-col gap-2.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-expo-warm/40 uppercase tracking-[1px]">Company Name:</span>
                <span className="text-white font-bold">{formData.companyName}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-expo-warm/40 uppercase tracking-[1px]">Contact Person:</span>
                <span className="text-white font-bold">{formData.contactPerson}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-expo-warm/40 uppercase tracking-[1px]">Required Area:</span>
                <span className="text-expo-gold font-bold">{formData.stallDimension} Sqm Space</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-expo-warm/40 uppercase tracking-[1px]">Trade Category:</span>
                <span className="text-white font-bold">{formData.primaryCategory}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-expo-warm/40 uppercase tracking-[1px]">City Sourced:</span>
                <span className="text-white font-bold">{formData.city}</span>
              </div>
            </div>

            <div className="flex flex-col w-full gap-3">
              <button
                onClick={() => {
                  handleWhatsAppRedirect();
                  setShowModal(false);
                  triggerCaptchaReset();
                }}
                className="w-full py-4 bg-gold-gradient rounded-sm text-expo-midnight font-sans font-bold text-xs tracking-[3px] uppercase shadow-lg hover:shadow-expo-glow transition-all duration-500 flex items-center justify-center gap-2"
              >
                📲 Complete on WhatsApp
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  triggerCaptchaReset();
                }}
                className="w-full py-3.5 bg-transparent border border-white/10 hover:border-white/30 rounded-sm text-white/70 hover:text-white font-sans text-[11px] tracking-[2px] uppercase transition-all duration-300"
              >
                Close Window
              </button>
            </div>
            
            <p className="text-[9px] text-expo-warm/30 uppercase tracking-[1.5px] mt-6">
              Our sourcing hotline is open 24/7 at +91 9950787787
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
