"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocalizedConfig } from "@/components/WeddingConfigProvider";
import { useT } from "@/components/LanguageProvider";
import { BotanicalSpray } from "@/components/Ornaments";

const GOLD = "#9A6A3C";
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Cinematic "digital envelope" opening screen.
 * Tap the seal (or button) → flap lifts, card rises out, then onOpen() fires.
 */
export default function OpeningEnvelope({
  onOpen,
  guestName
}: {
  onOpen: () => void;
  guestName?: string;
}) {
  const reduce = useReducedMotion();
  const weddingConfig = useLocalizedConfig();
  const { couple, invitation, date } = weddingConfig;
  const t = useT();
  const [opening, setOpening] = useState(false);

  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    // Play the flap/seal choreography, then hand off. The fade-out below is
    // CSS-driven (opacity transition), so it completes reliably even if JS
    // animation frames are throttled.
    window.setTimeout(onOpen, reduce ? 250 : 1500);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-romantic-gradient px-6 transition-opacity duration-700 ease-out ${
        opening ? "opacity-0" : "opacity-100"
      }`}
    >
      <BotanicalSpray className="pointer-events-none absolute -left-6 top-2 h-48 w-48 opacity-70 sm:h-64 sm:w-64" />
      <BotanicalSpray className="pointer-events-none absolute -right-6 bottom-2 h-48 w-48 -scale-x-100 opacity-70 sm:h-64 sm:w-64" />

      <motion.p
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.9, ease: EASE }}
        className="eyebrow mb-8 max-w-xs text-center"
      >
        {t.envelope.invited}
      </motion.p>

      {/* ── Envelope ─────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleOpen}
        aria-label={t.envelope.open}
        className="group relative mb-2 block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-champagne"
        style={{ perspective: 1400 }}
      >
        <div
          className={`relative h-[230px] w-[330px] sm:h-[262px] sm:w-[380px] ${reduce ? "" : "animate-floatY"}`}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Invitation card — concealed inside the envelope (behind the opaque
              back), slides up and forward on open. Hidden at rest, so no paper
              peeks through the seams. */}
          <motion.div
            initial={false}
            animate={
              opening
                ? { y: reduce ? 0 : -150, x: "-50%", zIndex: 60 }
                : { y: 24, x: "-50%", zIndex: 10 }
            }
            transition={{ duration: 1, ease: EASE, delay: opening ? 0.5 : 0 }}
            className="absolute left-1/2 top-0 flex h-[196px] w-[272px] flex-col items-center justify-center rounded-md bg-ivory-50 px-5 text-center shadow-paper sm:h-[224px] sm:w-[312px]"
          >
            <span className="pointer-events-none absolute inset-2 rounded border border-champagne/40" />
            <span className="script text-4xl sm:text-5xl">{couple.initials}</span>
            <span className="eyebrow-plain mt-2 text-[0.6rem]">{t.envelope.weddingOf}</span>
            <span className="mt-1 font-serif text-2xl text-ink sm:text-3xl">{couple.combined}</span>
            <span className="mt-2 font-sans text-[0.62rem] uppercase tracking-[0.3em] text-champagne-dark">
              {date.shortDisplay}
            </span>
          </motion.div>

          {/* Envelope back — opaque, conceals the card at rest */}
          <div
            className="absolute inset-0 z-20 rounded-xl shadow-paper"
            style={{ background: "linear-gradient(155deg, #EFE0C6 0%, #E4D2B0 55%, #D8C09A 100%)" }}
          />

          {/* Front pocket — the classic pointed envelope face */}
          <div
            className="absolute inset-0 z-30 rounded-xl"
            style={{
              clipPath: "polygon(0 30%, 50% 72%, 100% 30%, 100% 100%, 0 100%)",
              background: "linear-gradient(165deg, #E9D8BA, #D7BF94)"
            }}
          />
          {/* soft pocket-fold shading */}
          <div
            className="absolute inset-0 z-30"
            style={{
              clipPath: "polygon(0 30%, 50% 72%, 100% 30%, 50% 56%)",
              background: "rgba(124,98,48,0.07)"
            }}
          />

          {/* Top flap (hinged; lifts open on reveal) */}
          <motion.div
            initial={false}
            animate={opening ? { rotateX: -176 } : { rotateX: 0 }}
            transition={{ duration: 0.85, ease: EASE }}
            className="absolute inset-x-0 top-0 z-40 h-[60%] origin-top"
            style={{
              transformStyle: "preserve-3d",
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              background: "linear-gradient(180deg, #F3E7CD, #E2CCA2)",
              boxShadow: "inset 0 -12px 20px -10px rgba(124,98,48,0.30)"
            }}
          />

          {/* Light-gold wax seal */}
          <motion.div
            initial={false}
            animate={
              opening
                ? { opacity: 0, scale: 0.5, y: -12, x: "-50%" }
                : { opacity: 1, scale: reduce ? 1 : [1, 1.05, 1], y: 0, x: "-50%" }
            }
            transition={
              opening
                ? { duration: 0.4, ease: "easeOut" }
                : { duration: 4, ease: "easeInOut", repeat: Infinity }
            }
            className="absolute left-1/2 top-[45%] z-50 flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 28%, #F6E7C2, #DEC392 50%, #BE9A5E 100%)",
              boxShadow:
                "0 4px 12px -3px rgba(124,98,48,0.5), inset 0 2px 3px rgba(255,255,255,0.6), inset 0 -3px 6px rgba(124,98,48,0.35)"
            }}
          >
            <span
              className="font-script text-xl text-champagne-deep"
              style={{ textShadow: "0 1px 1px rgba(255,255,255,0.45)" }}
            >
              {couple.partnerOne[0]}
              {couple.partnerTwo[0]}
            </span>
          </motion.div>
        </div>
      </button>

      {/* Names / message below */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: opening ? 0 : 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.9, ease: EASE }}
        className="mt-6 flex flex-col items-center text-center"
      >
        <h1 className="script text-6xl leading-none sm:text-7xl">{couple.combined}</h1>
        <p className="mt-4 max-w-sm font-serif text-lg font-light text-ink-soft sm:text-xl">
          {guestName ? `${t.greeting.dear} ${guestName}, ` : ""}
          {invitation.intro.toLowerCase()}
        </p>

        <motion.button
          type="button"
          onClick={handleOpen}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="btn-gold mt-8"
        >
          {t.envelope.open}
        </motion.button>

        <motion.span
          animate={reduce ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="mt-7 font-sans text-[0.62rem] uppercase tracking-[0.32em] text-ink-light"
        >
          {t.envelope.tap}
        </motion.span>
      </motion.div>

      {/* faint date footer */}
      <p className="absolute bottom-6 font-sans text-[0.6rem] uppercase tracking-[0.34em] text-champagne-dark/70">
        {date.display}
      </p>
    </div>
  );
}
