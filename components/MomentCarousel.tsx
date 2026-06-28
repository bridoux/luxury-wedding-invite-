"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** One framed story photo (real image over a duotone monogram placeholder). */
function Framed({ src, label, initials }: { src?: string; label: string; initials: string }) {
  return (
    <div className="relative h-52 w-full overflow-hidden rounded-md bg-gradient-to-br from-blush-light via-ivory-100 to-sage-light">
      <span className="pointer-events-none absolute inset-[7px] z-10 rounded border border-champagne/40" />
      <span className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-1 text-champagne/70">
        <span className="script text-4xl">{initials}</span>
        <span className="font-sans text-[0.55rem] uppercase tracking-[0.3em] text-champagne-dark/70">{label}</span>
      </span>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={label}
          loading="lazy"
          className="relative z-[1] h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = "0";
          }}
        />
      )}
    </div>
  );
}

interface MomentCarouselProps {
  images: string[];
  label: string;
  initials: string;
}

/**
 * Per-moment photo carousel. Falls back to a single framed photo (no chrome)
 * when there's only one image. Native scroll-snap for swipe; arrows + dots for
 * pointer users. Active index is set optimistically on click and synced on
 * swipe via IntersectionObserver.
 */
export default function MomentCarousel({ images, label, initials }: MomentCarouselProps) {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const count = images.length;

  const scrollToIndex = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.max(0, Math.min(count - 1, i));
      const slide = track.children[clamped] as HTMLElement | undefined;
      if (slide) {
        setCurrent(clamped);
        track.scrollTo({ left: slide.offsetLeft, behavior: reduce ? "auto" : "smooth" });
      }
    },
    [count, reduce]
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track || count <= 1) return;
    const slides = Array.from(track.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(slides.indexOf(e.target as HTMLElement));
      },
      { root: track, threshold: 0.6 }
    );
    slides.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [count]);

  if (count <= 1) {
    return <Framed src={images[0]} label={label} initials={initials} />;
  }

  return (
    <div className="group/carousel relative" role="group" aria-roledescription="carousel" aria-label={`${label} photos`}>
      <div ref={trackRef} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {images.map((src, i) => (
          <div key={src + i} className="w-full flex-none snap-center" aria-label={`${i + 1} of ${count}`} role="group" aria-roledescription="slide">
            <Framed src={src} label={label} initials={initials} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollToIndex(current - 1)}
        disabled={current === 0}
        aria-label="Previous photo"
        className="vellum absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-champagne-dark opacity-0 transition-opacity duration-300 hover:text-ink group-hover/carousel:opacity-100 disabled:pointer-events-none disabled:!opacity-0"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => scrollToIndex(current + 1)}
        disabled={current === count - 1}
        aria-label="Next photo"
        className="vellum absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-champagne-dark opacity-0 transition-opacity duration-300 hover:text-ink group-hover/carousel:opacity-100 disabled:pointer-events-none disabled:!opacity-0"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => scrollToIndex(i)}
            aria-label={`Go to photo ${i + 1}`}
            aria-current={i === current}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-5 bg-champagne-dark" : "w-1.5 bg-champagne/40 hover:bg-champagne/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
