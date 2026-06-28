"use client";

import { useEffect, useState } from "react";
import { useWeddingConfig } from "@/components/WeddingConfigProvider";
import { useT } from "@/components/LanguageProvider";
import { resolveVisibility } from "@/lib/visibility";

/**
 * Scroll-aware top header (adapted from 21st.dev's WeddingInviteHeader).
 * Hidden over the hero; slides in with a vellum blur once the guest scrolls,
 * giving a persistent brand anchor + RSVP shortcut. Pure CSS transition +
 * passive scroll listener — no animation-library dependency.
 */
export default function ScrollHeader({
  onNavigate
}: {
  onNavigate: (id: string) => void;
}) {
  const config = useWeddingConfig();
  const { couple } = config;
  const vis = resolveVisibility((config as { visibility?: unknown }).visibility);
  const t = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(id);
  };

  return (
    <header
      aria-hidden={!visible}
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ease-out ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto flex w-[min(94%,760px)] items-center justify-between rounded-b-2xl border-x border-b border-champagne/25 bg-[rgba(251,246,234,0.85)] py-2.5 pl-4 pr-16 shadow-paper backdrop-blur-xl sm:pr-20">
        {/* Monogram → back to top */}
        <a href="#home" onClick={go("home")} className="flex items-center gap-2.5" aria-label="Back to top">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne/40">
            <span className="script text-base leading-none">
              {couple.partnerOne[0]}{couple.partnerTwo[0]}
            </span>
          </span>
          <span className="hidden font-serif text-lg text-ink sm:block">{couple.combined}</span>
        </a>

        {/* Section links (desktop) */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Sections">
          {([
            ["story", t.nav.story, vis.story],
            ["details", t.nav.details, vis.details],
            ["gallery", t.nav.gallery, vis.gallery]
          ] as const)
            .filter(([, , show]) => show)
            .map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={go(id)}
              className="font-sans text-xs uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-champagne-dark"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* RSVP pill */}
        <a href="#rsvp" onClick={go("rsvp")} className="btn-gold px-6 py-2 text-[0.62rem]">
          {t.cta.rsvp}
        </a>
      </div>
    </header>
  );
}
