"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import Lightbox from "@/components/Lightbox";
import { useLocalizedConfig } from "@/components/WeddingConfigProvider";
import { useT } from "@/components/LanguageProvider";

export default function Gallery() {
  const reduce = useReducedMotion();
  const { gallery, couple } = useLocalizedConfig();
  const t = useT();

  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const count = gallery.length;

  const scrollToIndex = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.max(0, Math.min(count - 1, i));
      const slide = track.children[clamped] as HTMLElement | undefined;
      if (slide) {
        setCurrent(clamped); // reflect immediately; IntersectionObserver keeps swipe in sync
        track.scrollTo({ left: slide.offsetLeft, behavior: reduce ? "auto" : "smooth" });
      }
    },
    [count, reduce]
  );

  // Track the most-visible slide to drive the dots + arrow state.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const slides = Array.from(track.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setCurrent(slides.indexOf(e.target as HTMLElement));
        }
      },
      { root: track, threshold: 0.6 }
    );
    slides.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [count]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollToIndex(current + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollToIndex(current - 1);
    }
  };

  return (
    <SectionWrapper id="gallery" eyebrow={t.gallery.eyebrow} script={t.gallery.script} title={t.gallery.title}>
      <div
        className="relative"
        role="group"
        aria-roledescription="carousel"
        aria-label={t.gallery.title}
        onKeyDown={onKeyDown}
      >
        {/* Slides */}
        <div
          ref={trackRef}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          {gallery.map((img, i) => (
            <div
              key={img.src + i}
              data-slide={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              className="relative w-full flex-none snap-center px-1.5 sm:px-2"
            >
              <button
                type="button"
                onClick={() => setLightbox(i)}
                aria-label={`Open photo: ${img.caption ?? "wedding moment"}`}
                className="group relative block aspect-[4/3] w-full overflow-hidden rounded-lg shadow-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne sm:aspect-[3/2]"
              >
                {/* Duotone placeholder backdrop + monogram (shows if image is missing) */}
                <span
                  className={`absolute inset-0 ${
                    i % 3 === 0
                      ? "bg-gradient-to-br from-blush-light via-ivory-100 to-blush"
                      : i % 3 === 1
                        ? "bg-gradient-to-br from-sage-light via-ivory-100 to-sage"
                        : "bg-gradient-to-br from-ivory-200 via-ivory-100 to-champagne-light/50"
                  }`}
                />
                <span className="pointer-events-none absolute inset-[8px] z-10 rounded-md border border-champagne/40" />
                <span className="absolute inset-0 z-0 flex items-center justify-center text-champagne/60">
                  <span className="script text-5xl">{couple.initials}</span>
                </span>

                {/* Blurred fill keeps the frame full while the whole photo shows */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt=""
                  aria-hidden="true"
                  loading={i <= 1 ? "eager" : "lazy"}
                  className="absolute inset-0 z-[1] h-full w-full scale-110 object-cover opacity-50 blur-2xl"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = "0";
                  }}
                />
                {/* Whole photo, uncropped */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.caption ?? "Wedding gallery photo"}
                  loading={i <= 1 ? "eager" : "lazy"}
                  className="relative z-[2] h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = "0";
                  }}
                />

                {img.caption && (
                  <span className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink/65 to-transparent p-4 text-left font-sans text-xs uppercase tracking-wider text-white">
                    {img.caption}
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Arrows */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => scrollToIndex(current - 1)}
              disabled={current === 0}
              aria-label="Previous photo"
              className="vellum absolute left-2 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-champagne-dark transition-opacity duration-300 hover:text-ink disabled:pointer-events-none disabled:opacity-0 sm:left-4"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollToIndex(current + 1)}
              disabled={current === count - 1}
              aria-label="Next photo"
              className="vellum absolute right-2 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-champagne-dark transition-opacity duration-300 hover:text-ink disabled:pointer-events-none disabled:opacity-0 sm:right-4"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}

        {/* Dots */}
        {count > 1 && (
          <div className="mt-5 flex items-center justify-center gap-2.5">
            {gallery.map((img, i) => (
              <button
                key={img.src + i}
                type="button"
                onClick={() => scrollToIndex(i)}
                aria-label={`Go to photo ${i + 1}`}
                aria-current={i === current}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? "w-6 bg-champagne-dark" : "w-2 bg-champagne/40 hover:bg-champagne/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <Lightbox images={gallery} index={lightbox} onClose={() => setLightbox(null)} onNavigate={setLightbox} />
    </SectionWrapper>
  );
}
