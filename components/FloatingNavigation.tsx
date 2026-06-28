"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useT } from "@/components/LanguageProvider";
import { useWeddingConfig } from "@/components/WeddingConfigProvider";
import { resolveVisibility } from "@/lib/visibility";

// Maps a nav target id → its visibility key (ids without a key always show).
const NAV_VISIBILITY: Record<string, "countdown" | "story" | "details" | "location" | "dressCode" | "gallery" | "gift"> = {
  countdown: "countdown",
  story: "story",
  details: "details",
  location: "location",
  dresscode: "dressCode",
  gallery: "gallery",
  gift: "gift"
};

const iconBase = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const
};

const coreIcons: Record<string, React.ReactNode> = {
  home: <svg {...iconBase}><path d="M3 11l9-8 9 8M5 10v10h14V10" /></svg>,
  story: <svg {...iconBase}><path d="M12 21s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 11c0 5.5-7 10-7 10z" /></svg>,
  details: <svg {...iconBase}><path d="M4 6h16M4 12h16M4 18h10" /></svg>,
  rsvp: <svg {...iconBase}><path d="M4 5h16v14H4zM4 7l8 6 8-6" /></svg>
};

export default function FloatingNavigation({
  onNavigate
}: {
  onNavigate: (id: string) => void;
}) {
  const t = useT();
  const visibility = resolveVisibility((useWeddingConfig() as { visibility?: unknown }).visibility);
  const [menuOpen, setMenuOpen] = useState(false);

  const isVisible = (id: string) => {
    const key = NAV_VISIBILITY[id];
    return key ? visibility[key] : true;
  };

  const coreItems = [
    { id: "home", label: t.nav.home },
    { id: "story", label: t.nav.story },
    { id: "details", label: t.nav.details },
    { id: "rsvp", label: t.nav.rsvp }
  ].filter((i) => isVisible(i.id));

  const allSections = [
    { id: "home", label: t.nav.invitation },
    { id: "countdown", label: t.nav.countdown },
    { id: "story", label: t.story.title },
    { id: "details", label: t.details.title },
    { id: "location", label: t.nav.location },
    { id: "dresscode", label: t.nav.dresscode },
    { id: "gallery", label: t.nav.gallery },
    { id: "gift", label: t.nav.gift },
    { id: "rsvp", label: t.nav.rsvp }
  ].filter((s) => isVisible(s.id));

  const handle = (id: string) => {
    setMenuOpen(false);
    onNavigate(id);
  };

  return (
    <>
      {/* Bottom floating nav (mobile-first, visible everywhere) */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[min(92%,460px)] items-center justify-around rounded-full border border-champagne/25 bg-[rgba(252,249,243,0.82)] px-2 py-2 shadow-paper backdrop-blur-xl"
      >
        {coreItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handle(item.id)}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-1.5 text-ink-soft transition-colors hover:text-champagne-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-champagne"
            aria-label={item.label}
          >
            {coreIcons[item.id]}
            <span className="font-sans text-[0.6rem] uppercase tracking-wider">{item.label}</span>
          </button>
        ))}

        {/* More → opens overlay */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label={t.nav.more}
          aria-expanded={menuOpen}
          className="flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-1.5 text-ink-soft transition-colors hover:text-champagne-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-champagne"
        >
          <svg {...iconBase}>
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
          <span className="font-sans text-[0.6rem] uppercase tracking-wider">{t.nav.more}</span>
        </button>
      </nav>

      {/* Full-screen elegant menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-romantic-gradient/95 backdrop-blur-xl"
          >
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-champagne/40 bg-white/60 text-champagne-dark"
            >
              ✕
            </button>

            <p className="eyebrow mb-2">{t.nav.explore}</p>
            <div className="gold-divider" />

            <nav aria-label="All sections" className="flex flex-col items-center gap-1">
              {allSections.map((s, i) => (
                <motion.button
                  key={s.id}
                  type="button"
                  onClick={() => handle(s.id)}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="font-serif text-3xl font-light text-ink transition-colors hover:text-champagne-dark sm:text-4xl"
                >
                  {s.label}
                </motion.button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
