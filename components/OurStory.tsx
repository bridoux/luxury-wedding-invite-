"use client";

import { motion, useReducedMotion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import MomentCarousel from "@/components/MomentCarousel";
import { useLocalizedConfig } from "@/components/WeddingConfigProvider";
import { useT } from "@/components/LanguageProvider";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Resolve a moment's photos, supporting both the new images[] and legacy image. */
function imagesFor(item: { image?: string; images?: string[] }): string[] {
  const list = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
  if (list.length) return list;
  return item.image ? [item.image] : [];
}

export default function OurStory() {
  const reduce = useReducedMotion();
  const { story, couple } = useLocalizedConfig();
  const t = useT();

  return (
    <SectionWrapper id="story" eyebrow={t.story.eyebrow} script={t.story.script} title={t.story.title}>
      <div className="relative mx-auto max-w-3xl">
        {/* Center line */}
        <div className="absolute left-[1.45rem] top-2 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-transparent via-champagne/45 to-transparent sm:left-1/2" />

        <div className="space-y-14">
          {story.map((item, i) => {
            const alignRight = i % 2 === 1;
            return (
              <motion.div
                key={item.title}
                initial={reduce ? false : { opacity: 0, y: 44 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-70px" }}
                transition={{ duration: 0.9, ease: EASE }}
                className={`relative flex flex-col gap-4 pl-14 sm:w-1/2 sm:pl-0 ${
                  alignRight ? "sm:ml-auto sm:pl-14 sm:text-left" : "sm:pr-14 sm:text-right"
                }`}
              >
                {/* Node */}
                <span
                  className={`absolute left-[1.45rem] top-3 z-10 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border border-white bg-champagne shadow-gold sm:left-auto ${
                    alignRight ? "sm:-left-[1.9rem]" : "sm:-right-[1.9rem]"
                  }`}
                  aria-hidden="true"
                />

                <div className="paper-plain overflow-hidden">
                  <MomentCarousel
                    images={imagesFor(item as { image?: string; images?: string[] })}
                    label={item.title}
                    initials={couple.initials}
                  />
                  <div className="p-6">
                    <p className="font-sans text-[0.62rem] uppercase tracking-[0.28em] text-champagne-dark">
                      {item.date}
                    </p>
                    <h3 className="mt-2 font-serif text-2xl text-ink sm:text-3xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 font-serif text-lg font-light leading-relaxed text-ink-soft">
                      {item.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
