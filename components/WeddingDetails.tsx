"use client";

import SectionWrapper from "@/components/SectionWrapper";
import { CardCorners } from "@/components/Ornaments";
import { useLocalizedConfig } from "@/components/WeddingConfigProvider";
import { useT } from "@/components/LanguageProvider";

function EventPanel({
  kicker,
  title,
  time,
  venue,
  address,
  note
}: {
  kicker: string;
  title: string;
  time: string;
  venue: string;
  address: string;
  note: string;
}) {
  return (
    <div className="paper-card relative flex flex-col items-center px-7 py-12 text-center">
      <CardCorners />
      <div className="relative z-20 flex flex-col items-center">
        <p className="eyebrow-plain text-champagne-dark">{kicker}</p>
        <h3 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">{title}</h3>
        <span className="my-5 h-px w-16 bg-gold-rule" />
        <p className="font-serif text-2xl text-champagne-dark">{time}</p>
        <p className="mt-3 font-sans text-sm uppercase tracking-[0.18em] text-ink">{venue}</p>
        <p className="mt-1 font-sans text-sm text-ink-light">{address}</p>
        <p className="mt-5 max-w-xs font-serif text-base font-light italic text-ink-soft">
          {note}
        </p>
      </div>
    </div>
  );
}

export default function WeddingDetails() {
  const { ceremony, reception, dressCode, contact, date } = useLocalizedConfig();
  const t = useT();

  return (
    <SectionWrapper
      id="details"
      eyebrow={t.details.eyebrow}
      script={t.details.script}
      title={t.details.title}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <EventPanel
          kicker={t.details.ceremonyKicker}
          title={t.details.vows}
          time={`${date.display} · ${ceremony.time}`}
          venue={ceremony.venue}
          address={ceremony.address}
          note={ceremony.notes}
        />
        <EventPanel
          kicker={t.details.receptionKicker}
          title={t.details.celebration}
          time={`${date.display} · ${reception.time}`}
          venue={reception.venue}
          address={reception.address}
          note={reception.notes}
        />
      </div>

      {/* Refined info row — text columns with hairline gold separators (no icon tiles) */}
      <div className="mt-6 grid grid-cols-1 gap-y-8 rounded-lg bg-ivory-50/60 px-6 py-9 text-center sm:grid-cols-3 sm:divide-x sm:divide-champagne/25">
        <div className="px-4">
          <p className="eyebrow-plain text-[0.62rem]">{t.details.dressCode}</p>
          <p className="mt-3 font-serif text-xl text-ink">{dressCode.formality}</p>
          <a
            href="#dresscode"
            className="mt-2 inline-block font-sans text-xs uppercase tracking-[0.18em] text-champagne-dark underline-offset-4 hover:underline"
          >
            {t.details.seePalette}
          </a>
        </div>
        <div className="px-4">
          <p className="eyebrow-plain text-[0.62rem]">{t.details.contact}</p>
          <p className="mt-3 font-serif text-xl text-ink">{contact.name}</p>
          <a
            href={`tel:${contact.phone}`}
            className="mt-1 block font-sans text-sm text-ink-soft hover:text-champagne-dark"
          >
            {contact.phone}
          </a>
        </div>
        <div className="px-4">
          <p className="eyebrow-plain text-[0.62rem]">{t.details.goodToKnow}</p>
          <p className="mt-3 font-serif text-xl text-ink">{t.details.unplugged}</p>
          <p className="mt-1 font-sans text-sm text-ink-soft">{t.details.bePresent}</p>
        </div>
      </div>
    </SectionWrapper>
  );
}
