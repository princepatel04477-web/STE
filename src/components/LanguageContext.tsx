"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Language = "en" | "hi";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Load language preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ste_lang") as Language;
      if (stored === "en" || stored === "hi") {
        setTimeout(() => {
          setLanguageState(stored);
        }, 0);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("ste_lang", lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

interface TranslateProps {
  en: string;
  hi: string;
  className?: string;
}

export function Translate({ en, hi, className = "" }: TranslateProps) {
  const { language } = useLanguage();

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={language}
        initial={{ opacity: 0, filter: "blur(8px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(8px)" }}
        transition={{ duration: 0.3 }}
        className={`inline-block ${className}`}
      >
        {language === "en" ? en : hi}
      </motion.span>
    </AnimatePresence>
  );
}
