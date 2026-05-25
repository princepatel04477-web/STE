"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, UserCheck, MapPin, Tag, Heart, MessageSquare } from "lucide-react";

const BUYER_TYPES = [
  { id: "wholesaler", name: "Wholesaler / Distributor", desc: "Sourcing high-volume lots and catalog sets" },
  { id: "retailer", name: "Retail Store Owner", desc: "Procuring seasonal stock for physical retail outlets" },
  { id: "boutique", name: "Boutique Owner", desc: "Curating exclusive designer wear & custom pieces" },
  { id: "exporter", name: "Exporter", desc: "Sourcing for international trade networks" },
  { id: "designer", name: "Fashion Designer", desc: "Finding premium fabrics and manufacturing partners" }
];

const CATEGORIES = [
  "Sarees & Lehengas",
  "Kurtis & Tunics",
  "Salwar Kameez & Dress Materials",
  "Mens Ethnic Wear",
  "Designer Fabrics & Looms",
  "Embroidery & Laces"
];

const FABRICS = [
  "Silk & Brocades",
  "Organza & Georgettes",
  "Cotton & Linens",
  "Digital Prints & Jacquards",
  "Heavy Handwork Fabrics"
];

export default function BuyerRegistration() {
  const [step, setStep] = useState(1);
  const [buyerType, setBuyerType] = useState("");
  const [city, setCity] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleFabric = (fab: string) => {
    setSelectedFabrics((prev) =>
      prev.includes(fab) ? prev.filter((f) => f !== fab) : [...prev, fab]
    );
  };

  const handleNext = () => {
    if (step === 1 && !buyerType) return;
    if (step === 2 && (!city || !businessName || !whatsapp)) return;
    if (step === 3 && selectedCategories.length === 0) return;
    
    if (step < 4) {
      setStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  const handleWhatsAppRedirect = () => {
    const text = `Hello STE 2026, I have registered as a B2B Buyer.\n\nBusiness: ${businessName}\nType: ${buyerType}\nCity: ${city}\nInterests: ${selectedCategories.join(", ")}`;
    const url = `https://wa.me/919950787787?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <section
      id="buyer-registration"
      className="relative w-full py-24 sm:py-32 bg-[#050505] overflow-hidden border-b border-white/5"
    >
      <div className="absolute inset-0 bg-mesh-dark opacity-60 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />

      <div className="spotlight-glowing left-[40%] top-[20%] w-[35vw] h-[35vw]" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-3 block">
            07 • B2B BUYER ONBOARDING
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-white tracking-wide">
            Register as a <span className="text-metallic italic font-light">VIP Buyer</span>
          </h2>
          <p className="font-sans text-xs sm:text-sm text-expo-warm/50 leading-relaxed mt-4 max-w-lg mx-auto">
            Acquire priority entry badges, bypass registration queues, and receive direct matching invitations from Surat’s leading manufacturers.
          </p>
        </div>

        {/* Wizard Container */}
        <div className="w-full bg-[#0a0a0a]/80 border border-white/5 backdrop-blur-xl rounded-2xl overflow-hidden p-6 sm:p-12 shadow-[0_0_80px_rgba(0,0,0,0.8)] relative">
          
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key={`step-${step}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                {/* Step Indicator */}
                <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-2">
                  <span className="text-[9px] tracking-[2px] text-expo-gold uppercase font-bold">
                    Step {step} of 4 • {step === 1 && "Identity"} {step === 2 && "Profile"} {step === 3 && "Interests"} {step === 4 && "Verification"}
                  </span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          i <= step ? "w-6 bg-expo-gold" : "w-2 bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* STEP 1: BUYER TYPE */}
                {step === 1 && (
                  <div className="flex flex-col gap-4">
                    <h3 className="font-serif text-lg sm:text-xl text-white flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-expo-gold" /> Select Your Sourcing Identity
                    </h3>
                    <div className="grid grid-cols-1 gap-3 mt-2">
                      {BUYER_TYPES.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setBuyerType(type.name)}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                            buyerType === type.name
                              ? "bg-expo-gold/[0.04] border-expo-gold/45 shadow-[0_0_20px_rgba(214,160,102,0.08)]"
                              : "bg-white/[0.01] border-white/5 hover:border-white/20"
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm font-sans font-bold text-white">{type.name}</span>
                            <span className="text-[10px] text-expo-warm/50 font-sans mt-0.5">{type.desc}</span>
                          </div>
                          {buyerType === type.name && (
                            <div className="w-5 h-5 rounded-full bg-expo-gold flex items-center justify-center">
                              <Check className="w-3 h-3 text-expo-midnight stroke-[3]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2: BUSINESS DETAILS */}
                {step === 2 && (
                  <div className="flex flex-col gap-4">
                    <h3 className="font-serif text-lg sm:text-xl text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-expo-gold" /> Business Credentials
                    </h3>
                    <div className="flex flex-col gap-5 mt-2">
                      <div className="flex flex-col gap-2">
                        <label className="text-[9px] tracking-[1.5px] text-expo-warm/50 uppercase font-bold">Company / Firm Name</label>
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="e.g., Vardan Fabrics & Couture"
                          className="w-full bg-white/[0.02] border border-white/10 rounded-lg p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-expo-gold/50 transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] tracking-[1.5px] text-expo-warm/50 uppercase font-bold">City Sourced From</label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g., Delhi, Bangalore, Mumbai"
                            className="w-full bg-white/[0.02] border border-white/10 rounded-lg p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-expo-gold/50 transition-colors"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] tracking-[1.5px] text-expo-warm/50 uppercase font-bold">Mobile (WhatsApp Number)</label>
                          <input
                            type="tel"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            placeholder="10-Digit Mobile Number"
                            className="w-full bg-white/[0.02] border border-white/10 rounded-lg p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-expo-gold/50 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: CATEGORY INTERESTS */}
                {step === 3 && (
                  <div className="flex flex-col gap-4">
                    <h3 className="font-serif text-lg sm:text-xl text-white flex items-center gap-2">
                      <Tag className="w-5 h-5 text-expo-gold" /> Select Sourcing Interests
                    </h3>
                    <p className="text-[10px] text-expo-warm/40 uppercase tracking-[1px] -mt-2">
                      Choose at least one category to customize match suggestions
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                            selectedCategories.includes(cat)
                              ? "bg-expo-gold/[0.04] border-expo-gold/45 shadow-[0_0_20px_rgba(214,160,102,0.08)]"
                              : "bg-white/[0.01] border-white/5 hover:border-white/20"
                          }`}
                        >
                          <span className="text-xs font-sans font-bold text-white">{cat}</span>
                          {selectedCategories.includes(cat) && (
                            <div className="w-4 h-4 rounded-full bg-expo-gold flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-expo-midnight stroke-[3]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 4: FABRIC SELECTION */}
                {step === 4 && (
                  <div className="flex flex-col gap-4">
                    <h3 className="font-serif text-lg sm:text-xl text-white flex items-center gap-2">
                      <Heart className="w-5 h-5 text-expo-gold" /> Specific Fabric Interests
                    </h3>
                    <p className="text-[10px] text-expo-warm/40 uppercase tracking-[1px] -mt-2">
                      Help us match you with specialized looms
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      {FABRICS.map((fab) => (
                        <button
                          key={fab}
                          onClick={() => toggleFabric(fab)}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                            selectedFabrics.includes(fab)
                              ? "bg-expo-gold/[0.04] border-expo-gold/45 shadow-[0_0_20px_rgba(214,160,102,0.08)]"
                              : "bg-white/[0.01] border-white/5 hover:border-white/20"
                          }`}
                        >
                          <span className="text-xs font-sans font-bold text-white">{fab}</span>
                          {selectedFabrics.includes(fab) && (
                            <div className="w-4 h-4 rounded-full bg-expo-gold flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-expo-midnight stroke-[3]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Buttons controls */}
                <div className="flex justify-between items-center mt-8 border-t border-white/5 pt-6">
                  {step > 1 ? (
                    <button
                      onClick={handleBack}
                      className="px-6 py-3 rounded-full border border-white/10 hover:border-white/30 text-white font-sans text-[10px] tracking-[1.5px] uppercase transition-colors"
                    >
                      Back
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    onClick={handleNext}
                    disabled={
                      loading ||
                      (step === 1 && !buyerType) ||
                      (step === 2 && (!city || !businessName || !whatsapp)) ||
                      (step === 3 && selectedCategories.length === 0)
                    }
                    className="px-6 py-3 rounded-full bg-gold-gradient text-expo-midnight font-bold font-sans text-[10px] tracking-[1.5px] uppercase shadow-lg hover:shadow-expo-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {loading ? "Processing..." : step === 4 ? "Complete Profile" : "Continue"}
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </motion.div>
            ) : (
              // Success Screen
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-expo-gold/10 border border-expo-gold/30 flex items-center justify-center mb-6">
                  <Check className="w-8 h-8 text-expo-gold stroke-[2.5]" />
                </div>

                <span className="text-[10px] font-bold tracking-[3px] text-expo-gold uppercase mb-2">
                  VIP Profile Registered
                </span>
                
                <h3 className="font-serif text-2xl sm:text-3xl text-white mb-4">
                  Welcome to the Elite Circle
                </h3>

                <p className="font-sans text-xs sm:text-sm text-expo-warm/60 leading-relaxed max-w-md mb-8">
                  Your VIP B2B Buyer Onboarding profile has been successfully generated. Our trade concierge desk will verify your business status and generate your official digital badge within 24 hours.
                </p>

                {/* Sourcing Summary */}
                <div className="w-full max-w-sm bg-white/[0.02] border border-white/5 p-4 rounded-xl text-left mb-8 flex flex-col gap-2.5">
                  <div className="flex justify-between text-[10px] sm:text-xs">
                    <span className="text-expo-warm/40 uppercase tracking-[1px]">Business Name:</span>
                    <span className="text-white font-bold">{businessName}</span>
                  </div>
                  <div className="flex justify-between text-[10px] sm:text-xs">
                    <span className="text-expo-warm/40 uppercase tracking-[1px]">Buyer Profile:</span>
                    <span className="text-white font-bold">{buyerType}</span>
                  </div>
                  <div className="flex justify-between text-[10px] sm:text-xs">
                    <span className="text-expo-warm/40 uppercase tracking-[1px]">Sourcing Hub:</span>
                    <span className="text-white font-bold">{city}</span>
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
                  <button
                    onClick={handleWhatsAppRedirect}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gold-gradient rounded-full text-expo-midnight font-sans font-bold text-[10px] tracking-[2px] uppercase shadow-lg hover:shadow-expo-glow transition-all flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4 stroke-[2.5]" /> Send Verification via WhatsApp
                  </button>
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setStep(1);
                      setBuyerType("");
                      setBusinessName("");
                      setCity("");
                      setWhatsapp("");
                      setSelectedCategories([]);
                      setSelectedFabrics([]);
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 bg-transparent border border-white/10 hover:border-white/30 rounded-full text-white font-sans text-[10px] tracking-[2px] uppercase transition-colors"
                  >
                    New Profile
                  </button>
                </div>

                <p className="text-[9px] text-expo-warm/30 uppercase tracking-[1.5px] mt-8">
                  Concierge Desk Call/WhatsApp Support: +91 9950787787
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </section>
  );
}
