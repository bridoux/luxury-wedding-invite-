"use client";

import { motion, useReducedMotion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import { useLocalizedConfig } from "@/components/WeddingConfigProvider";
import { useT } from "@/components/LanguageProvider";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Elegant framed photo placeholder (shows real image if present, else duotone). */
function StoryPhoto({ src, label, initials }: { src: string; label: string; initials: string }) {
  return (
    <div className="relative h-52 w-full overflow-hidden rounded-md bg-gradient-to-br from-blush-light via-ivory-100 to-sage-light">
      <span className="pointer-events-none absolute inset-[7px] z-10 rounded border border-champagne/40" />
      <span className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-1 text-champagne/70">
        <span className="script text-4xl">{initials}</span>
        <span className="font-sans text-[0.55rem] uppercase tracking-[0.3em] text-champagne-dark/70">
          {label}
        </span>
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={label}
        loading="lazy"
        className="relative z-[1] h-full w-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.opacity = "0";
        }}
      />
    </div>
  );
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
                  <StoryPhoto src={item.image} label={item.title} initials={couple.initials} />
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
