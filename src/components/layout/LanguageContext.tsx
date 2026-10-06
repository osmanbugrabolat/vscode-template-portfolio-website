"use client";

import { createContext, useCallback, useContext, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type Language = "tr" | "en";

const COOKIE = "lang";
const ONE_YEAR = 60 * 60 * 24 * 365;

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  isSwitching: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * The language lives in a cookie so the server renders content in the right
 * language on the first request; switching re-renders server content.
 */
export function LanguageProvider({ children, initialLanguage }: { children: React.ReactNode; initialLanguage: Language }) {
  const router = useRouter();
  const [language, setState] = useState<Language>(initialLanguage);
  const [isSwitching, startTransition] = useTransition();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback(
    (next: Language) => {
      if (next === language) return;
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${COOKIE}=${next}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax${secure}`;
      setState(next);
      startTransition(() => router.refresh());
    },
    [language, router],
  );

  const toggleLanguage = useCallback(() => setLanguage(language === "tr" ? "en" : "tr"), [language, setLanguage]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, isSwitching }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
