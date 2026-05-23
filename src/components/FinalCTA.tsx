"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { waapi, splitText, stagger } from "animejs";

export default function FinalCTA() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  
  const [formData, setFormData] = useState({
    companyName: "",
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

  const [gstValid, setGstValid] = useState<boolean | null>(null);
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: "" });
  const [captchaError, setCaptchaError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  function generateCaptcha() {
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    setTimeout(() => {
      setCaptcha({ num1: n1, num2: n2, answer: "" });
      setCaptchaError(false);
    }, 0);
  }

  useEffect(() => {
    generateCaptcha();

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

  const handleGstChange = (val: string) => {
    const cleaned = val.toUpperCase().trim();
    setFormData((prev) => ({ ...prev, gstin: cleaned }));
    
    if (cleaned === "") {
      setGstValid(null);
      return;
    }
    // GSTIN format: 15 chars (e.g. 24AAAAA1111A1Z1)
    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    setGstValid(regex.test(cleaned));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      sameAsContact: checked,
      whatsAppNumber: checked ? prev.contactNumber : prev.whatsAppNumber
    }));
  };

  const handleContactChange = (val: string) => {
    const cleanNum = val.trim();
    setFormData((prev) => ({
      ...prev,
      contactNumber: cleanNum,
      whatsAppNumber: prev.sameAsContact ? cleanNum : prev.whatsAppNumber
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verify GST (optional field but if provided must be valid format)
    if (formData.gstin !== "" && gstValid === false) {
      alert("Please provide a valid GSTIN or leave it blank.");
      return;
    }

    // Verify Captcha
    const expected = captcha.num1 + captcha.num2;
    if (parseInt(captcha.answer.trim(), 10) !== expected) {
      setCaptchaError(true);
      return;
    }

    setShowModal(true);
  };

  const handleWhatsAppRedirect = () => {
    const textMessage = `*STE 2026 Stall Booking Inquiry*
---------------------------------------
*Company:* ${formData.companyName}
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
          className="absolute right-[5%] top-[25%] w-[15vw] h-[20vw] bg-cover bg-center border border-white/5 rounded-sm opacity-[0.08] hidden lg:block"
          style={{ backgroundImage: `url('/assets/images/expo-stall.png')` }}
        />
        {/* Couture queen panel */}
        <div
          className="absolute left-[8%] bottom-[15%] w-[15vw] h-[20vw] bg-cover bg-center border border-white/5 rounded-sm opacity-[0.08] hidden lg:block"
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
            className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-tight text-white leading-[1.08] mb-8 uppercase"
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
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <h3 className="font-serif text-xl sm:text-2xl text-white italic mb-2">
                Exhibitor Stall Registration
              </h3>

              {/* Grid 2 Column on Desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Company Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 focus:border-expo-gold focus:outline-none rounded-sm px-4 py-3 text-sm text-white placeholder-white/20 transition-colors duration-300"
                    placeholder="Enter company name"
                  />
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 focus:border-expo-gold focus:outline-none rounded-sm px-4 py-3 text-sm text-white placeholder-white/20 transition-colors duration-300"
                    placeholder="e.g. contact@company.com"
                  />
                </div>

                {/* Contact Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">Contact Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.contactNumber}
                    onChange={(e) => handleContactChange(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-expo-gold focus:outline-none rounded-sm px-4 py-3 text-sm text-white placeholder-white/20 transition-colors duration-300"
                    placeholder="10-digit mobile number"
                  />
                </div>

                {/* WhatsApp Number with copy switch */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">WhatsApp Number *</label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sameAsContact}
                        onChange={(e) => handleCheckboxChange(e.target.checked)}
                        className="w-3 h-3 rounded bg-black border-white/10 text-expo-gold focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="font-sans text-[8px] text-expo-warm/50 uppercase tracking-[1px]">Same as contact</span>
                    </label>
                  </div>
                  <input
                    type="tel"
                    required
                    disabled={formData.sameAsContact}
                    value={formData.whatsAppNumber}
                    onChange={(e) => setFormData({ ...formData, whatsAppNumber: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 focus:border-expo-gold focus:outline-none rounded-sm px-4 py-3 text-sm text-white placeholder-white/20 transition-colors duration-300 disabled:opacity-50"
                    placeholder="WhatsApp contact number"
                  />
                </div>

                {/* City */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 focus:border-expo-gold focus:outline-none rounded-sm px-4 py-3 text-sm text-white placeholder-white/20 transition-colors duration-300"
                    placeholder="Enter city (e.g., Surat, Mumbai)"
                  />
                </div>

                {/* GSTIN (with verification check and trust badge) */}
                <div className="flex flex-col gap-1.5 relative">
                  <div className="flex justify-between items-center">
                    <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">GSTIN (Optional)</label>
                    {gstValid === true && (
                      <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-[1px]">✓ Form Verified</span>
                    )}
                    {gstValid === false && (
                      <span className="text-[8px] text-rose-400 font-bold uppercase tracking-[1px]">Invalid Format</span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={15}
                    value={formData.gstin}
                    onChange={(e) => handleGstChange(e.target.value)}
                    className={`w-full bg-white/5 border rounded-sm px-4 py-3 text-sm text-white placeholder-white/20 transition-colors duration-300 focus:outline-none ${
                      gstValid === true
                        ? "border-emerald-500/50 focus:border-emerald-500"
                        : gstValid === false
                        ? "border-rose-500/50 focus:border-rose-500"
                        : "border-white/10 focus:border-expo-gold"
                    }`}
                    placeholder="15-character GSTIN"
                  />
                </div>

                {/* Business Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">Business Type *</label>
                  <select
                    required
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full bg-black/90 border border-white/10 focus:border-expo-gold focus:outline-none rounded-sm px-4 py-3 text-sm text-white/80 transition-colors duration-300"
                  >
                    <option value="" disabled>Select Business Type</option>
                    <option value="Manufacturer">Manufacturer</option>
                    <option value="Weaver">Weaver</option>
                    <option value="Wholesaler">Wholesaler / Trader</option>
                    <option value="Retailer">Retailer / Boutique Owner</option>
                    <option value="Exporter">Exporter</option>
                    <option value="Brand">Retail Chain / Brand</option>
                  </select>
                </div>

                {/* Stall Area Required */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">Stall Area Required *</label>
                  <select
                    required
                    value={formData.stallDimension}
                    onChange={(e) => setFormData({ ...formData, stallDimension: e.target.value })}
                    className="w-full bg-black/90 border border-white/10 focus:border-expo-gold focus:outline-none rounded-sm px-4 py-3 text-sm text-white/80 transition-colors duration-300"
                  >
                    <option value="" disabled>Select Stall Dimension</option>
                    <option value="9">9 Sqm Standard Stall</option>
                    <option value="18">18 Sqm Executive Space</option>
                    <option value="27">27 Sqm Premium Space</option>
                    <option value="36">36 Sqm+ Custom Pavilion</option>
                  </select>
                </div>

                {/* Primary Sourcing Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">Primary Product Category *</label>
                  <select
                    required
                    value={formData.primaryCategory}
                    onChange={(e) => setFormData({ ...formData, primaryCategory: e.target.value })}
                    className="w-full bg-black/90 border border-white/10 focus:border-expo-gold focus:outline-none rounded-sm px-4 py-3 text-sm text-white/80 transition-colors duration-300"
                  >
                    <option value="" disabled>Select Sourcing Category</option>
                    <option value="Sarees">Sarees</option>
                    <option value="Lehenga Choli">Lehenga Choli</option>
                    <option value="Kurti & Tunics">Kurti & Tunics</option>
                    <option value="Salwar Suits">Salwar Suits</option>
                    <option value="Kids Ethnic Wear">Kids Ethnic Wear</option>
                    <option value="Mens Ethnic Wear">{"Sherwani & Men's Ethnic Wear"}</option>
                    <option value="Value Added Fabrics">Value Added Fabrics / Embroideries</option>
                  </select>
                </div>

                {/* Monthly/Annual Turnover */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">Monthly Turnover *</label>
                  <select
                    required
                    value={formData.turnover}
                    onChange={(e) => setFormData({ ...formData, turnover: e.target.value })}
                    className="w-full bg-black/90 border border-white/10 focus:border-expo-gold focus:outline-none rounded-sm px-4 py-3 text-sm text-white/80 transition-colors duration-300"
                  >
                    <option value="" disabled>Select Revenue Bracket</option>
                    <option value="Under 50 Lakhs">Under ₹50 Lakhs</option>
                    <option value="50 Lakhs - 2 Crores">₹50 Lakhs - ₹2 Crores</option>
                    <option value="2 - 5 Crores">₹2 Crores - ₹5 Crores</option>
                    <option value="Above 5 Crores">Above ₹5 Crores</option>
                  </select>
                </div>

              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">Sourcing Requirements / Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 focus:border-expo-gold focus:outline-none rounded-sm px-4 py-3 text-sm text-white placeholder-white/20 transition-colors duration-300 resize-none"
                  placeholder="Enter details about your brand, catalogs, or custom space needs..."
                />
              </div>

              {/* Spam Prevention Math CAPTCHA */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-sm">
                <div className="flex items-center gap-3">
                  <span className="font-sans text-[10px] tracking-[2px] text-expo-gold uppercase font-bold">SPAM PROTECTION:</span>
                  <span className="font-serif text-base text-white font-bold select-none bg-black/50 border border-white/10 px-3 py-1.5 rounded-sm">
                    {captcha.num1} + {captcha.num2} = ?
                  </span>
                </div>
                <div className="flex-1 w-full relative">
                  <input
                    type="number"
                    required
                    value={captcha.answer}
                    onChange={(e) => {
                      setCaptcha({ ...captcha, answer: e.target.value });
                      setCaptchaError(false);
                    }}
                    className={`w-full bg-white/5 border rounded-sm px-4 py-2.5 text-sm text-white focus:outline-none transition-colors duration-300 ${
                      captchaError ? "border-rose-500/50 focus:border-rose-500" : "border-white/10 focus:border-expo-gold"
                    }`}
                    placeholder="Solve equation"
                  />
                  {captchaError && (
                    <span className="absolute bottom-[-15px] left-1 text-[8px] text-rose-400 font-bold uppercase tracking-[1px]">
                      Incorrect sum answer.
                    </span>
                  )}
                </div>
              </div>

              {/* Submit & Hotline CTA */}
              <button
                type="submit"
                className="w-full py-4 bg-gold-gradient rounded-sm text-expo-midnight font-sans font-bold text-xs tracking-[3px] uppercase mt-2 overflow-hidden shadow-lg hover:shadow-expo-glow transition-all duration-500 hover:brightness-105"
                data-cursor="click"
              >
                BOOK YOUR STALL NOW
              </button>
              
              <a
                href="tel:+919950787787"
                className="w-full py-3.5 bg-transparent border border-expo-gold/40 hover:border-expo-gold rounded-sm text-expo-gold font-sans font-bold text-center text-xs tracking-[2px] uppercase overflow-hidden transition-all duration-500"
              >
                CALL FOR STALL BOOKING: +91 9950787787
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
                   generateCaptcha();
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
              Booking Request Registered
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
                  generateCaptcha();
                }}
                className="w-full py-4 bg-gold-gradient rounded-sm text-expo-midnight font-sans font-bold text-xs tracking-[3px] uppercase shadow-lg hover:shadow-expo-glow transition-all duration-500 flex items-center justify-center gap-2"
              >
                📲 Complete on WhatsApp
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  generateCaptcha();
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
