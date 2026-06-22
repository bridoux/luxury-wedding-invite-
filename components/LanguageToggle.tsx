"use client";

import { useLanguage } from "@/components/LanguageProvider";

/**
 * Floating EN / FR toggle (mirrors the MusicToggle, top-left).
 * A segmented pill so guests see both options at a glance.
 */
export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className="fixed left-4 top-4 z-[60] flex items-center gap-0.5 rounded-full border border-champagne/30 bg-[rgba(251,246,234,0.85)] p-0.5 shadow-paper backdrop-blur-md"
      role="group"
      aria-label="Language / Langue"
    >
      {(["en", "fr"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-3 py-1.5 font-sans text-[0.62rem] uppercase tracking-[0.15em] transition-colors ${
            lang === l
              ? "bg-gradient-to-r from-champagne-dark to-champagne text-ivory-50"
              : "text-ink-soft hover:text-champagne-dark"
          }`}
        >
          {l === "en" ? "EN" : "FR"}
        </button>
      ))}
    </div>
  );
}
