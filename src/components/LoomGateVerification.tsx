"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";

interface LoomGateVerificationProps {
  onVerify: (verified: boolean) => void;
  resetTrigger?: boolean;
}

export default function LoomGateVerification({
  onVerify,
  resetTrigger,
}: LoomGateVerificationProps) {
  const [digits, setDigits] = useState<number[]>(() =>
    Array.from({ length: 4 }, () => Math.floor(Math.random() * 10))
  );
  const [slideValue, setSlideValue] = useState(0);
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "invalid">("idle");
  const [interactionStart, setInteractionStart] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Generate 4 dynamic random numbers on client side (wrapped in useCallback to prevent renders)
  const generateDigits = useCallback(() => {
    const newDigits = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10));
    setDigits(newDigits);
    if (status !== "success") {
      setStatus("idle");
      setSlideValue(0);
      onVerify(false);
    }
  }, [status, onVerify]);

  // Monitor reset requests from the parent (wrapped inside a deferred timer to prevent cascading renders)
  useEffect(() => {
    if (resetTrigger) {
      const timer = setTimeout(() => {
        setStatus("idle");
        setSlideValue(0);
        onVerify(false);
        setDigits(Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [resetTrigger, onVerify]);

  const handleSlideChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status === "success" || status === "verifying") return;

    const val = parseInt(e.target.value, 10);
    setSlideValue(val);

    if (!interactionStart) {
      setInteractionStart(Date.now());
    }

    if (status === "invalid") {
      setStatus("idle");
    }
  };

  const handleRelease = () => {
    if (status === "success" || status === "verifying") return;

    if (slideValue >= 100) {
      // Initiate verification process
      setStatus("verifying");

      const timeTaken = interactionStart ? Date.now() - interactionStart : 1000;

      // Simulate human interaction validation
      // Bot protection: if slide completes instantly (< 200ms) or without touch start timer, trigger invalid state
      setTimeout(() => {
        if (timeTaken < 180) {
          setStatus("invalid");
          setSlideValue(0);
          setInteractionStart(null);
          onVerify(false);
          // Trigger shake and numbers refresh
          generateDigits();
        } else {
          setStatus("success");
          onVerify(true);
        }
      }, 1200);
    } else {
      // Rebound/spring back slider if released early
      const springBack = () => {
        setSlideValue((prev) => {
          if (prev <= 2) return 0;
          setTimeout(springBack, 10);
          return Math.floor(prev * 0.7);
        });
      };
      springBack();
      setInteractionStart(null);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full border rounded-xl p-5 sm:p-6 backdrop-blur-xl transition-all duration-500 overflow-hidden ${
        status === "success"
          ? "border-emerald-500/30 bg-emerald-950/[0.04] shadow-[0_0_30px_rgba(16,185,129,0.05)]"
          : status === "invalid"
          ? "border-rose-500/30 bg-rose-950/[0.04] animate-shake shadow-[0_0_30px_rgba(244,63,94,0.05)]"
          : isHovered
          ? "border-expo-gold/30 bg-black/60 shadow-[0_0_40px_rgba(214,160,102,0.05)]"
          : "border-white/5 bg-black/40"
      }`}
    >
      {/* Background glow flares */}
      <div
        className={`absolute right-[-15%] top-[-15%] w-36 h-36 rounded-full blur-[60px] pointer-events-none transition-all duration-700 ${
          status === "success"
            ? "bg-emerald-500/10"
            : status === "invalid"
            ? "bg-rose-500/10"
            : "bg-expo-gold/5"
        }`}
      />

      {/* Main Grid: Dials & Status Title */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg border transition-colors duration-300 ${
              status === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : status === "invalid"
                ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                : "bg-white/[0.02] border-white/10 text-expo-gold"
            }`}
          >
            <Shield className={`w-4 h-4 ${status === "verifying" ? "animate-pulse" : ""}`} />
          </div>
          <div>
            <h4 className="font-sans text-[10px] sm:text-[11px] font-bold tracking-[2.5px] text-white uppercase leading-none mb-1.5">
              LoomGate Verification
            </h4>
            <p className="font-sans text-[9px] tracking-[1px] text-expo-warm/40 uppercase">
              {status === "success"
                ? "Access granted successfully"
                : status === "verifying"
                ? "Analyzing interaction path..."
                : status === "invalid"
                ? "Verification failed. Try again."
                : "Slide golden shuttle to unlock"}
            </p>
          </div>
        </div>

        {/* Digital Dials Panel */}
        <div className="flex items-center gap-2 select-none relative">
          <div className="flex items-center gap-1.5 bg-black/50 border border-white/5 p-2 rounded-lg">
            {digits.map((digit, index) => (
              <div
                key={index}
                className={`relative w-8 h-10 overflow-hidden flex items-center justify-center rounded border bg-gradient-to-b from-white/[0.02] to-white/[0.05] transition-all duration-300 ${
                  status === "success"
                    ? "border-emerald-500/30 text-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                    : status === "invalid"
                    ? "border-rose-500/30 text-rose-400 font-bold shadow-[0_0_10px_rgba(244,63,94,0.1)]"
                    : "border-white/10 text-expo-gold shadow-inner"
                }`}
              >
                {/* Digit scroll animate container */}
                <div className="h-6 overflow-hidden relative flex items-center justify-center w-full">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={digit}
                      initial={{ y: 24, opacity: 0, filter: "blur(2px)" }}
                      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                      exit={{ y: -24, opacity: 0, filter: "blur(2px)" }}
                      transition={{ type: "spring", stiffness: 220, damping: 18 }}
                      className="absolute font-mono text-base sm:text-lg font-bold tracking-widest text-center"
                    >
                      {digit}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Manual Refresh CTA */}
          {status !== "success" && status !== "verifying" && (
            <button
              type="button"
              onClick={generateDigits}
              aria-label="Refresh Captcha Dials"
              className="p-2 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] text-expo-warm/40 hover:text-expo-gold transition-all duration-300"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Slide Verification Track / Scanner */}
      <div className="relative w-full h-12 bg-white/[0.01] border border-white/5 rounded-lg overflow-hidden flex items-center px-1">
        <AnimatePresence mode="wait">
          {status === "success" ? (
            // Success State UI
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-0 w-full h-full flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400 font-sans text-xs font-semibold uppercase tracking-[2px] z-20"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Identity Decrypted • Human Verified</span>
            </motion.div>
          ) : status === "verifying" ? (
            // Verifying State UI
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full flex items-center justify-center gap-3 bg-expo-gold/[0.03] z-20"
            >
              <div className="relative flex items-center justify-center w-5 h-5">
                {/* Rotating scanner rings */}
                <div className="absolute inset-0 border border-expo-gold/40 border-t-transparent rounded-full animate-spin duration-700" />
                <div className="absolute w-3 h-3 border border-expo-gold/20 border-b-transparent rounded-full animate-spin duration-500" />
                <div className="absolute w-1 h-1 bg-expo-gold rounded-full animate-ping" />
              </div>
              <span className="font-sans text-[10px] text-expo-gold font-bold tracking-[2px] uppercase">
                Analyzing Biometric Speed Path...
              </span>
            </motion.div>
          ) : (
            // Slider Interaction State UI
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex items-center relative"
            >
              {/* Dynamic track progress bar */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-expo-gold/5 via-expo-gold/15 to-expo-gold/30 transition-all duration-100 ease-out z-0 pointer-events-none rounded-l-md"
                style={{ width: `${slideValue}%` }}
              />

              {/* Central text placeholder */}
              <div
                className="absolute inset-0 flex items-center justify-center font-sans text-[9px] sm:text-[10px] font-bold text-expo-warm/25 uppercase tracking-[2px] select-none pointer-events-none z-10 transition-opacity duration-300"
                style={{ opacity: (100 - slideValue) / 100 }}
              >
                Drag shuttle to lock verification
              </div>

              {/* Beautiful Weaving Shuttle Handle */}
              <div
                className={`absolute w-10 h-10 rounded-md border flex items-center justify-center shadow-lg transition-all duration-300 z-20 pointer-events-none ${
                  slideValue >= 98
                    ? "bg-expo-gold border-expo-gold text-expo-midnight shadow-[0_0_20px_rgba(214,160,102,0.4)]"
                    : status === "invalid"
                    ? "bg-rose-500 border-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-shake"
                    : "bg-gradient-to-b from-[#181818] to-[#0d0d0d] border-white/10 text-expo-gold"
                }`}
                style={{
                  left: `calc(${slideValue}% - ${slideValue * 0.4}px)`,
                }}
              >
                {status === "invalid" ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${
                      slideValue > 50 ? "scale-110" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* Modern dynamic shuttle path icon */}
                    <path d="M12 2L2 22h20L12 2z" />
                    <circle cx="12" cy="13" r="2" />
                  </svg>
                )}
              </div>

              {/* Hidden HTML Slider Track overlay */}
              <input
                type="range"
                min="0"
                max="100"
                value={slideValue}
                onChange={handleSlideChange}
                onMouseUp={handleRelease}
                onTouchEnd={handleRelease}
                className="absolute inset-0 w-full h-full opacity-0 z-30 cursor-pointer"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
