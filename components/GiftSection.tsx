"use client";

import SectionWrapper from "@/components/SectionWrapper";
import { CardCorners } from "@/components/Ornaments";
import { useLocalizedConfig } from "@/components/WeddingConfigProvider";
import { useT } from "@/components/LanguageProvider";

export default function GiftSection() {
  const { gift } = useLocalizedConfig();
  const t = useT();

  return (
    <SectionWrapper id="gift" eyebrow={t.gift.eyebrow} script={t.gift.script} title={t.gift.title}>
      <div className="paper-card relative mx-auto max-w-2xl px-8 py-12 text-center sm:px-12">
        <CardCorners />
        <p className="relative z-20 mx-auto max-w-xl font-serif text-2xl font-light leading-relaxed text-ink-soft">
          {gift.message}
        </p>

        <div className="gold-divider" />

        <div className="grid gap-4 text-left sm:grid-cols-2">
          {/* Registry */}
          <div className="rounded-2xl bg-ivory-200/60 p-5">
            <h3 className="font-serif text-xl text-ink">{gift.registryName}</h3>
            {gift.registryUrl ? (
              <a
                href={gift.registryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline mt-3"
              >
                {t.gift.registry}
              </a>
            ) : (
              <p className="mt-2 font-sans text-sm text-ink-light">{t.gift.comingSoon}</p>
            )}
          </div>

          {/* Cash fund */}
          {gift.cashFund.enabled && (
            <div className="rounded-2xl bg-blush-light/40 p-5">
              <h3 className="font-serif text-xl text-ink">{gift.cashFund.title}</h3>
              <p className="mt-2 font-sans text-sm text-ink-soft">
                {gift.cashFund.description}
              </p>
            </div>
          )}

          {/* Bank / payment */}
          {gift.bank.enabled && (
            <div className="rounded-2xl bg-sage-light/25 p-5 sm:col-span-2">
              <h3 className="font-serif text-xl text-ink">{t.gift.bank}</h3>
              <p className="mt-1 font-sans text-sm text-ink-soft">
                <span className="font-medium">{gift.bank.accountName}</span> · {gift.bank.details}
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 font-sans text-xs uppercase tracking-[0.2em] text-ink-light">
          {gift.privacyNote}
        </p>
      </div>
    </SectionWrapper>
  );
}
