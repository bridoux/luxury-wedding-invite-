/**
 * Per-section visibility. Admins can hide any of these optional sections; the
 * core flow (hero + RSVP) always shows. Stored as the "visibility" wedding_settings
 * row and merged like other content; defaults to everything visible.
 */
export interface SectionVisibility {
  countdown: boolean;
  story: boolean;
  details: boolean;
  location: boolean;
  dressCode: boolean;
  gallery: boolean;
  gift: boolean;
  music: boolean;
}

export const DEFAULT_VISIBILITY: SectionVisibility = {
  countdown: true,
  story: true,
  details: true,
  location: true,
  dressCode: true,
  gallery: true,
  gift: true,
  music: true
};

/** Order + copy for the admin toggles. */
export const VISIBILITY_SECTIONS: { key: keyof SectionVisibility; label: string; hint: string }[] = [
  { key: "countdown", label: "Countdown", hint: "Days-until timer + teaser line" },
  { key: "story", label: "Our Story", hint: "Timeline of your moments" },
  { key: "details", label: "Wedding Details", hint: "Ceremony & reception times and venues" },
  { key: "location", label: "Location & Map", hint: "Embedded map, address, parking, travel" },
  { key: "dressCode", label: "Dress Code", hint: "Attire, colour palette, suggestions" },
  { key: "gallery", label: "Gallery", hint: "Photo carousel" },
  { key: "gift", label: "Gifts & Registry", hint: "Registry / honeymoon fund / bank details" },
  { key: "music", label: "Background Music", hint: "The floating music toggle button" }
];

/** Normalize a possibly-partial stored value to a full visibility object. */
export function resolveVisibility(value: unknown): SectionVisibility {
  if (!value || typeof value !== "object") return DEFAULT_VISIBILITY;
  const v = value as Record<string, unknown>;
  const out = { ...DEFAULT_VISIBILITY };
  for (const k of Object.keys(DEFAULT_VISIBILITY) as (keyof SectionVisibility)[]) {
    if (typeof v[k] === "boolean") out[k] = v[k] as boolean;
  }
  return out;
}
