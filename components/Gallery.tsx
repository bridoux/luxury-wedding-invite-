"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import Lightbox from "@/components/Lightbox";
import { useLocalizedConfig } from "@/components/WeddingConfigProvider";
import { useT } from "@/components/LanguageProvider";

export default function Gallery() {
  const reduce = useReducedMotion();
  const { gallery, couple } = useLocalizedConfig();
  const t = useT();
  const [active, setActive] = useState<number | null>(null);

  return (
    <SectionWrapper id="gallery" eyebrow={t.gallery.eyebrow} script={t.gallery.script} title={t.gallery.title}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {gallery.map((img, i) => (
          <motion.button
            key={img.src + i}
            type="button"
            onClick={() => setActive(i)}
            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
            whileHover={{ scale: 1.02 }}
            className={`group relative overflow-hidden rounded-md shadow-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne ${
              i % 5 === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square"
            }`}
            aria-label={`Open photo: ${img.caption ?? "wedding moment"}`}
          >
            {/* Duotone placeholder backdrop (shows if image fails / not added) */}
            <span
              className={`absolute inset-0 ${
                i % 3 === 0
                  ? "bg-gradient-to-br from-blush-light via-ivory-100 to-blush"
                  : i % 3 === 1
                    ? "bg-gradient-to-br from-sage-light via-ivory-100 to-sage"
                    : "bg-gradient-to-br from-ivory-200 via-ivory-100 to-champagne-light/50"
              }`}
            />
            <span className="pointer-events-none absolute inset-[6px] z-10 rounded-sm border border-champagne/40" />
            <span className="absolute inset-0 z-0 flex items-center justify-center text-champagne/60">
              <span className="script text-4xl">{couple.initials}</span>
            </span>

            {/* Real image on top, hidden gracefully on error */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.caption ?? "Wedding gallery photo"}
              loading="lazy"
              className="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.opacity = "0";
              }}
            />

            {img.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent p-3 text-left font-sans text-xs uppercase tracking-wider text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {img.caption}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      <Lightbox
        images={gallery}
        index={active}
        onClose={() => setActive(null)}
        onNavigate={setActive}
      />
    </SectionWrapper>
  );
}
