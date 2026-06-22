"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import FloatingPetals from "@/components/FloatingPetals";
import LanguageToggle from "@/components/LanguageToggle";
import { useLocalizedConfig } from "@/components/WeddingConfigProvider";
import { useT } from "@/components/LanguageProvider";
import { getGoogleCalendarUrl, getIcsDataUri } from "@/lib/calendar";
import type { AttendanceStatus } from "@/types/rsvp";

interface Summary {
  name: string;
  status: string;
  guestCount: number;
  mocked: boolean;
}

export default function ThankYouPage() {
  const weddingConfig = useLocalizedConfig();
  const t = useT();
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("rsvp_summary");
      if (raw) setSummary(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const statusLabel = summary
    ? t.attendance[summary.status as AttendanceStatus] ?? t.thankYou.yourResponse
    : t.thankYou.yourResponse;
  const firstName = summary?.name?.split(" ")[0];

  return (
    <main className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-romantic-gradient px-6 py-16 text-center">
      <LanguageToggle />
      <FloatingPetals count={12} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-card relative z-10 w-full max-w-lg p-8 sm:p-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.2 }}
          className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-champagne/15 text-4xl"
        >
          💛
        </motion.div>

        <h1 className="font-script text-5xl text-ink">
          {t.thankYou.title}{firstName ? `, ${firstName}` : ""}!
        </h1>
        <div className="gold-divider" />

        <p className="font-serif text-xl font-light text-ink-soft">{t.thankYou.body}</p>

        {summary && (
          <div className="mt-6 rounded-2xl bg-white/50 p-4">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-champagne-dark">
              {t.thankYou.yourResponse}
            </p>
            <p className="mt-1 font-serif text-2xl font-light text-ink">{statusLabel}</p>
            {summary.status === "attending" && (
              <p className="font-sans text-sm text-ink-soft">
                {summary.guestCount} {summary.guestCount > 1 ? t.rsvp.guests : t.rsvp.guest}
              </p>
            )}
          </div>
        )}

        {summary?.mocked && (
          <p className="mt-4 rounded-xl bg-sage-light/30 px-3 py-2 font-sans text-xs text-ink-soft">
            {t.rsvp.demoMode}
          </p>
        )}

        <p className="mt-6 font-sans text-sm uppercase tracking-[0.25em] text-champagne-dark">
          {weddingConfig.date.display} · {weddingConfig.location.primaryVenue}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={getGoogleCalendarUrl(weddingConfig)} target="_blank" rel="noopener noreferrer" className="btn-gold">
            {t.thankYou.addGoogle}
          </a>
          <a href={getIcsDataUri(weddingConfig)} download="wedding.ics" className="btn-outline">
            {t.thankYou.downloadIcs}
          </a>
        </div>

        <Link href="/" className="mt-6 inline-block font-sans text-sm uppercase tracking-[0.2em] text-ink-soft underline-offset-4 hover:text-champagne-dark hover:underline">
          ← {t.thankYou.return}
        </Link>
      </motion.div>
    </main>
  );
}
