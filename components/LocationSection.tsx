"use client";

import SectionWrapper from "@/components/SectionWrapper";
import { useLocalizedConfig } from "@/components/WeddingConfigProvider";
import { useT } from "@/components/LanguageProvider";

/**
 * Build the embeddable map from the address link the admin actually edits, so
 * the preview always tracks it. Prefers the @lat,lng baked into a Google Maps
 * place URL (most precise), then a `q=` param, then the typed address, and only
 * falls back to a stored embed URL as a last resort.
 */
function buildMapEmbed(loc: {
  googleMapsUrl?: string;
  googleMapsEmbed?: string;
  fullAddress?: string;
  primaryVenue?: string;
}): string {
  const url = loc.googleMapsUrl ?? "";
  const coords = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coords) return `https://www.google.com/maps?q=${coords[1]},${coords[2]}&output=embed`;
  const qParam = url.match(/[?&]q=([^&]+)/);
  if (qParam) return `https://www.google.com/maps?q=${qParam[1]}&output=embed`;
  const query = (loc.fullAddress || loc.primaryVenue || "").trim();
  if (query) return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  return loc.googleMapsEmbed ?? "";
}

export default function LocationSection() {
  const { location } = useLocalizedConfig();
  const t = useT();
  const mapEmbed = buildMapEmbed(location);

  return (
    <SectionWrapper id="location" eyebrow={t.location.eyebrow} script={t.location.script} title={t.location.title}>
      <div className="glass-card overflow-hidden">
        {/* Embedded map */}
        <div className="relative h-64 w-full bg-sage-light/40 sm:h-80">
          <iframe
            title={`Map to ${location.primaryVenue}`}
            src={mapEmbed}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        <div className="p-6 sm:p-8">
          <h3 className="font-serif text-3xl font-light text-ink">
            {location.primaryVenue}
          </h3>
          <p className="mt-1 font-sans text-sm text-ink-soft">{location.fullAddress}</p>

          <a
            href={location.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold mt-5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 21s7-6.4 7-11a7 7 0 10-14 0c0 4.6 7 11 7 11z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            {t.cta.openInMaps}
          </a>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-ivory-200/60 p-4">
              <h4 className="font-sans text-xs uppercase tracking-[0.2em] text-champagne-dark">
                {t.location.parking}
              </h4>
              <p className="mt-1 font-serif text-lg font-light text-ink-soft">
                {location.parking}
              </p>
            </div>
            <div className="rounded-2xl bg-ivory-200/60 p-4">
              <h4 className="font-sans text-xs uppercase tracking-[0.2em] text-champagne-dark">
                {t.location.travel}
              </h4>
              <p className="mt-1 font-serif text-lg font-light text-ink-soft">
                {location.travel}
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
