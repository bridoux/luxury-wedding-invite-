"use client";

import { useEffect, useState } from "react";

/**
 * Persistent full-viewport video backdrop for the invitation.
 *
 * - Fixed behind all content (-z-20) so it stays put while the page scrolls.
 * - A warm cream veil sits over it so the espresso text + paper cards stay
 *   readable; the video reads as soft ambient motion behind the stationery.
 * - Rendered client-only after mount (matches SSR's null → no hydration
 *   mismatch) and skipped entirely for `prefers-reduced-motion` users, who
 *   keep the static cream background instead of an autoplaying video.
 */
export default function VideoBackground() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setEnabled(!mq.matches);
  }, []);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden" aria-hidden="true">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        className="h-full w-full object-cover opacity-65"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/images/gallery-1.jpg"
        src="/images/Video.mp4"
      />
      {/* Warm cream veil — keeps content legible over the moving footage. */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(243,234,214,0.74)_0%,rgba(243,234,214,0.82)_45%,rgba(240,228,203,0.88)_100%)]" />
    </div>
  );
}
