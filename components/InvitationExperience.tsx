"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

import OpeningEnvelope from "@/components/OpeningEnvelope";
import InvitationHero from "@/components/InvitationHero";
import CountdownTimer from "@/components/CountdownTimer";
import OurStory from "@/components/OurStory";
import WeddingDetails from "@/components/WeddingDetails";
import LocationSection from "@/components/LocationSection";
import DressCode from "@/components/DressCode";
import Gallery from "@/components/Gallery";
import GiftSection from "@/components/GiftSection";
import RSVPForm from "@/components/RSVPForm";
import FloatingNavigation from "@/components/FloatingNavigation";
import ScrollHeader from "@/components/ScrollHeader";
import MusicToggle from "@/components/MusicToggle";
import FloatingPetals from "@/components/FloatingPetals";
import VideoBackground from "@/components/VideoBackground";
import SectionWrapper from "@/components/SectionWrapper";
import LanguageToggle from "@/components/LanguageToggle";
import { MonogramCrest } from "@/components/Ornaments";
import { useLocalizedConfig } from "@/components/WeddingConfigProvider";
import { useT } from "@/components/LanguageProvider";
import { recordInvitationOpen } from "@/lib/mockGuests";
import { resolveVisibility } from "@/lib/visibility";

interface InvitationExperienceProps {
  /** Optional personalized guest context from /invite/[guestCode]. */
  guestName?: string;
  guestCode?: string;
  maxGuests?: number;
  greeting?: string;
}

export default function InvitationExperience({
  guestName,
  guestCode,
  maxGuests = 6,
  greeting
}: InvitationExperienceProps) {
  const weddingConfig = useLocalizedConfig();
  const visibility = resolveVisibility((weddingConfig as { visibility?: unknown }).visibility);
  const t = useT();
  const [opened, setOpened] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Render a static shell on the server + first client render (identical markup,
  // so hydration can never mismatch), then mount the fully interactive tree.
  // This is what makes the opening gate reliably interactive in production.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Log a personalized invitation open (best-effort; no-op without Supabase).
  useEffect(() => {
    if (guestCode) void recordInvitationOpen(guestCode);
  }, [guestCode]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (!mounted) {
    return (
      <main className="flex min-h-[100svh] w-full flex-col items-center justify-center bg-romantic-gradient px-6 text-center">
        <MonogramCrest initials={weddingConfig.couple.initials} size={120} />
        <p className="eyebrow mt-8">{t.envelope.invited}</p>
        <h1 className="mt-4 script text-6xl sm:text-7xl">{weddingConfig.couple.combined}</h1>
        <p className="mt-4 font-sans text-xs uppercase tracking-[0.32em] text-champagne-dark/80">
          {weddingConfig.date.display}
        </p>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100svh] w-full overflow-x-hidden">
      <VideoBackground />
      <LanguageToggle />
      {/* The experience is ALWAYS rendered and visible (CSS, not JS animation),
          so content can never be blanked by a stalled animation. The opening
          envelope sits on top as an overlay and removes itself on open. */}
      <div className="relative pb-28">
        <FloatingPetals count={10} />
        <ScrollHeader onNavigate={scrollTo} />
        {visibility.music && <MusicToggle />}

            <div className="relative z-10">
              {/* Personalized greeting banner */}
              {guestName && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="vellum mx-auto mt-8 w-[min(92%,620px)] rounded-xl px-6 py-5 text-center"
                >
                  <p className="script text-3xl">{t.greeting.dear} {guestName}</p>
                  <p className="mt-1 font-serif text-base font-light text-ink-soft">
                    {greeting ?? t.greeting.fallback}
                  </p>
                </motion.div>
              )}

              <InvitationHero onNavigate={scrollTo} />

              {visibility.countdown && (
                <SectionWrapper
                  id="countdown"
                  eyebrow={t.countdown.eyebrow}
                  script={t.countdown.script}
                  title={t.countdown.title}
                >
                  <CountdownTimer />
                  <p className="mx-auto mt-10 max-w-md text-center font-serif text-xl font-light italic text-champagne-dark">
                    {weddingConfig.invitation.teaser}
                  </p>
                </SectionWrapper>
              )}

              {visibility.story && <OurStory />}
              {visibility.details && <WeddingDetails />}
              {visibility.location && <LocationSection />}
              {visibility.dressCode && <DressCode />}
              {visibility.gallery && <Gallery />}
              {visibility.gift && <GiftSection />}

              <SectionWrapper
                id="rsvp"
                eyebrow={t.rsvp.eyebrow}
                script={t.rsvp.script}
                title={t.rsvp.title}
              >
                <p className="mx-auto mb-10 max-w-xl text-center font-serif text-lg font-light text-ink-soft">
                  {t.rsvp.intro} {weddingConfig.rsvp.deadlineDisplay}.
                </p>
                <RSVPForm
                  guestCode={guestCode}
                  defaultName={guestName ?? ""}
                  maxGuests={maxGuests}
                />
              </SectionWrapper>

              {/* Footer */}
              <footer className="flex flex-col items-center px-6 pb-12 pt-6 text-center">
                <MonogramCrest initials={weddingConfig.couple.initials} size={96} />
                <p className="mt-5 script text-5xl">{weddingConfig.couple.combined}</p>
                <p className="mt-3 font-sans text-xs uppercase tracking-[0.32em] text-ink-light">
                  {weddingConfig.date.display}
                </p>
                <p className="mt-1 font-sans text-xs uppercase tracking-[0.32em] text-champagne-dark/80">
                  {weddingConfig.couple.hashtag}
                </p>
              </footer>
            </div>

        <FloatingNavigation onNavigate={scrollTo} />
      </div>

      {!opened && (
        <OpeningEnvelope onOpen={() => setOpened(true)} guestName={guestName} />
      )}
    </main>
  );
}
