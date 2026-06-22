"use client";

import Link from "next/link";
import { useLocalizedConfig } from "@/components/WeddingConfigProvider";
import { useT } from "@/components/LanguageProvider";

/** Localized header for the standalone /rsvp page (server page stays static). */
export default function RsvpPageHeader() {
  const config = useLocalizedConfig();
  const t = useT();

  return (
    <header className="mb-10 text-center">
      <Link href="/" className="font-script text-4xl text-champagne-dark">
        {config.couple.combined}
      </Link>
      <p className="eyebrow mt-4">{t.rsvp.eyebrow}</p>
      <h1 className="font-serif text-5xl font-light text-ink">{t.rsvp.title}</h1>
      <div className="gold-divider" />
      <p className="mx-auto max-w-md font-serif text-lg font-light text-ink-soft">
        {t.rsvp.intro} {config.rsvp.deadlineDisplay}.
      </p>
    </header>
  );
}
