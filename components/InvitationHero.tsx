"use client";

import { useLocalizedConfig } from "@/components/WeddingConfigProvider";
import { useT } from "@/components/LanguageProvider";
import { getIcsDataUri } from "@/lib/calendar";
import { FloralDivider, BotanicalSpray } from "@/components/Ornaments";

/**
 * Animated hero: the couple's portrait in a gold-framed arch with a slow
 * Ken Burns drift, staggered text reveal, and the primary CTAs.
 *
 * All entrance animation is pure CSS (`hero-rise` + delay classes) so the
 * hero is never blanked by a stalled JS animation loop; `prefers-reduced-motion`
 * collapses the durations globally.
 */
export default function InvitationHero({
  onNavigate,
  rsvpHref = "#rsvp"
}: {
  onNavigate?: (id: string) => void;
  rsvpHref?: string;
}) {
  const config = useLocalizedConfig();
  const { couple, date, invitation, ceremony, reception } = config;
  const t = useT();

  const go = (id: string) => (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(id);
    }
  };

  return (
    <section
      id="home"
      className="relative mx-auto flex min-h-[100svh] w-full max-w-3xl scroll-mt-24 flex-col items-center justify-center overflow-hidden px-5 pb-20 pt-24 text-center"
    >
      <BotanicalSpray className="pointer-events-none absolute -left-10 top-6 h-52 w-52 opacity-60" />
      <BotanicalSpray className="pointer-events-none absolute -right-10 bottom-10 h-52 w-52 -scale-x-100 opacity-60" />

      {/* Eyebrow */}
      <p className="hero-rise hero-d1 eyebrow">{t.hero.together}</p>

      {/* Arch-framed portrait with Ken Burns drift */}
      <div className="hero-rise hero-d2 relative mt-8">
        {/* outer hairline ring */}
        <div
          className="hero-arch bg-ivory-50 p-2.5 sm:p-3"
          style={{ border: "1px solid rgba(185,138,94,0.45)" }}
        >
          <div className="hero-arch relative h-[340px] w-[250px] overflow-hidden sm:h-[420px] sm:w-[310px]">
            {/* gradient placeholder behind (in case photo missing) */}
            <span className="absolute inset-0 bg-gradient-to-br from-blush-light via-ivory-100 to-sage-light" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="script text-5xl text-champagne/60">{couple.initials}</span>
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/story-1.jpg"
              alt={`${couple.combined} portrait`}
              className="hero-kenburns relative h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.opacity = "0";
              }}
            />
            {/* soft cream veil at the bottom for the names to sit on */}
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[rgba(243,234,214,0.92)] via-[rgba(243,234,214,0.35)] to-transparent" />
          </div>
        </div>

        {/* Names overlapping the arch base */}
        <h1 className="hero-rise hero-d3 absolute inset-x-0 -bottom-7 leading-none">
          <span className="script block text-6xl sm:text-7xl">
            <span className="foil-text">{couple.partnerOne}</span>
            <span className="mx-2 font-serif text-3xl uppercase tracking-[0.3em] text-champagne-dark sm:text-4xl">
              &
            </span>
            <span className="foil-text">{couple.partnerTwo}</span>
          </span>
        </h1>
      </div>

      {/* Date */}
      <p className="hero-rise hero-d4 mt-14 font-sans text-sm uppercase tracking-[0.34em] text-champagne-dark">
        {date.dayOfWeek} · {date.display}
      </p>

      <div className="hero-rise hero-d4">
        <FloralDivider className="mt-5" />
      </div>

      {/* Message */}
      <p className="hero-rise hero-d5 mx-auto mt-6 max-w-xl text-balance font-serif text-lg font-light leading-relaxed text-ink-soft sm:text-xl">
        {invitation.message}
      </p>

      {/* Ceremony / reception teaser */}
      <div className="hero-rise hero-d5 mt-8 flex w-full max-w-md flex-col items-center justify-center gap-4 sm:flex-row sm:gap-10">
        <div className="text-center">
          <p className="font-serif text-xl text-ink">{t.hero.ceremony}</p>
          <p className="mt-0.5 font-sans text-xs uppercase tracking-[0.18em] text-ink-light">
            {ceremony.time} · {ceremony.venue}
          </p>
        </div>
        <span className="hidden h-10 w-px bg-champagne/40 sm:block" />
        <div className="text-center">
          <p className="font-serif text-xl text-ink">{t.hero.reception}</p>
          <p className="mt-0.5 font-sans text-xs uppercase tracking-[0.18em] text-ink-light">
            {reception.time} · {reception.venue}
          </p>
        </div>
      </div>

      {/* CTAs */}
      <div className="hero-rise hero-d6 mt-9 flex flex-wrap items-center justify-center gap-3">
        <a href={rsvpHref} onClick={onNavigate ? go("rsvp") : undefined} className="btn-gold">
          {t.cta.rsvp}
        </a>
        <a href="#details" onClick={go("details")} className="btn-outline">
          {t.cta.viewDetails}
        </a>
        <a href="#location" onClick={go("location")} className="btn-outline">
          {t.cta.location}
        </a>
        <a href={getIcsDataUri(config)} download="wedding.ics" className="btn-outline">
          {t.cta.addToCalendar}
        </a>
      </div>

      {/* Scroll cue */}
      <div
        className="hero-rise hero-d6 mt-10 flex animate-floatY flex-col items-center gap-2 text-champagne-dark/70"
        aria-hidden="true"
      >
        <span className="font-sans text-[0.6rem] uppercase tracking-[0.32em]">{t.hero.scroll}</span>
        <span className="h-7 w-px bg-gradient-to-b from-champagne to-transparent" />
      </div>
    </section>
  );
}
