"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Lang, type Translations } from "@/lib/i18n";

const STORAGE_KEY = "wedding_lang";

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: Translations;
}

const LanguageContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => {},
  toggle: () => {},
  t: translations.en
});

/**
 * Holds the active language. Starts "en" on the server + first client render
 * (so hydration matches), then adopts the stored choice / browser language on
 * mount. Persists to localStorage.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    let initial: Lang | null = null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "fr") initial = stored;
    } catch {
      /* ignore */
    }
    if (!initial && typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("fr")) {
      initial = "fr";
    }
    if (initial && initial !== "en") setLangState(initial);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") document.documentElement.lang = l;
  };

  const toggle = () => setLang(lang === "en" ? "fr" : "en");

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Full context: { lang, setLang, toggle, t }. */
export function useLanguage(): LangContextValue {
  return useContext(LanguageContext);
}

/** Shortcut to the translation dictionary for the active language. */
export function useT(): Translations {
  return useContext(LanguageContext).t;
}
