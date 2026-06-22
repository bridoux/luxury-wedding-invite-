"use client";

import SectionWrapper from "@/components/SectionWrapper";
import { CardCorners } from "@/components/Ornaments";
import { useLocalizedConfig } from "@/components/WeddingConfigProvider";
import { useT } from "@/components/LanguageProvider";

export default function DressCode() {
  const { dressCode } = useLocalizedConfig();
  const t = useT();

  return (
    <SectionWrapper id="dresscode" eyebrow={t.dress.eyebrow} script={t.dress.script} title={t.dress.title}>
      <div className="paper-card relative px-6 py-12 text-center sm:px-12">
        <CardCorners />
        <div className="relative z-20">
          <p className="font-sans text-sm uppercase tracking-[0.28em] text-champagne-dark">
            {dressCode.formality}
          </p>
          <p className="mx-auto mt-4 max-w-xl font-serif text-xl font-light text-ink-soft">
            {dressCode.description}
          </p>

          {/* Colour palette */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
            {dressCode.palette.map((c) => (
              <div key={c.name} className="flex flex-col items-center">
                <span
                  className="h-[4.5rem] w-[4.5rem] rounded-full shadow-paper ring-1 ring-champagne/30 ring-offset-2 ring-offset-ivory-50"
                  style={{ backgroundColor: c.hex }}
                  aria-hidden="true"
                />
                <span className="mt-3 font-sans text-[0.65rem] uppercase tracking-[0.18em] text-ink-soft">
                  {c.name}
                </span>
              </div>
            ))}
          </div>

          <span className="mx-auto my-10 block h-px w-40 bg-gold-rule" />

          <div className="grid gap-6 text-left sm:grid-cols-2">
            <div className="rounded-lg bg-sage-light/20 p-6">
              <h3 className="font-serif text-2xl text-ink">{t.dress.suggested}</h3>
              <ul className="mt-3 space-y-2.5 font-sans text-sm text-ink-soft">
                {dressCode.suggested.map((s) => (
                  <li key={s} className="flex gap-2.5">
                    <span className="mt-0.5 text-champagne">✦</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg bg-blush-light/35 p-6">
              <h3 className="font-serif text-2xl text-ink">{t.dress.avoid}</h3>
              <ul className="mt-3 space-y-2.5 font-sans text-sm text-ink-soft">
                {dressCode.avoid.map((s) => (
                  <li key={s} className="flex gap-2.5">
                    <span className="mt-0.5 text-blush-dark">×</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-8 font-serif text-lg font-light italic text-champagne-dark">
            {dressCode.cultural}
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
