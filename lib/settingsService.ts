import { weddingConfig, type WeddingConfig } from "@/lib/config";
import { getSupabase } from "@/lib/supabaseClient";
import type { Lang } from "@/lib/i18n";

/**
 * Swap couple-authored prose to French when lang === "fr", falling back to the
 * English field whenever a `*Fr` companion is empty. Returns the same shape, so
 * components can read `.message` / `.notes` / `story[].text` etc. unchanged.
 */
export function localizeConfig(c: WeddingConfig, lang: Lang): WeddingConfig {
  if (lang !== "fr") return c;
  const f = c as unknown as Record<string, Record<string, unknown>> & {
    story: Record<string, unknown>[];
  };
  const pick = (en: unknown, fr: unknown): string => (typeof fr === "string" && fr ? fr : (en as string));
  const arr = (en: unknown, fr: unknown): unknown =>
    Array.isArray(fr) && fr.length ? fr : en;

  return {
    ...c,
    invitation: {
      ...c.invitation,
      intro: pick(f.invitation.intro, f.invitation.introFr),
      message: pick(f.invitation.message, f.invitation.messageFr),
      teaser: pick(f.invitation.teaser, f.invitation.teaserFr)
    },
    ceremony: { ...c.ceremony, notes: pick(f.ceremony.notes, f.ceremony.notesFr) },
    reception: { ...c.reception, notes: pick(f.reception.notes, f.reception.notesFr) },
    location: {
      ...c.location,
      parking: pick(f.location.parking, f.location.parkingFr),
      travel: pick(f.location.travel, f.location.travelFr)
    },
    dressCode: {
      ...c.dressCode,
      formality: pick(f.dressCode.formality, f.dressCode.formalityFr),
      description: pick(f.dressCode.description, f.dressCode.descriptionFr),
      cultural: pick(f.dressCode.cultural, f.dressCode.culturalFr),
      suggested: arr(c.dressCode.suggested, f.dressCode.suggestedFr),
      avoid: arr(c.dressCode.avoid, f.dressCode.avoidFr),
      palette: (f.dressCode.palette as Record<string, unknown>[]).map((p) => ({
        ...p,
        name: pick(p.name, p.nameFr)
      }))
    },
    gift: { ...c.gift, message: pick(f.gift.message, f.gift.messageFr) },
    story: f.story.map((s) => ({
      ...s,
      title: pick(s.title, s.titleFr),
      date: pick(s.date, s.dateFr),
      text: pick(s.text, s.textFr)
    })),
    gallery: (f.gallery as unknown as Record<string, unknown>[]).map((g) => ({
      ...g,
      caption: pick(g.caption, g.captionFr)
    }))
  } as unknown as WeddingConfig;
}

/**
 * Bridges editable `wedding_settings` rows ⇄ the static `lib/config.ts` defaults.
 *
 * Each editable section is stored as one row in `wedding_settings`
 * (key = section name, value = JSONB). The public site deep-merges those rows
 * over the defaults; the admin editor writes them back.
 */

// Sections the admin can edit (must mirror keys in weddingConfig).
// Object sections are shallow-merged; array sections (story, gallery) are
// replaced wholesale when an override is present.
export const EDITABLE_SECTIONS = [
  "couple",
  "date",
  "invitation",
  "ceremony",
  "reception",
  "location",
  "gift",
  "contact",
  "rsvp",
  "dressCode",
  "music",
  "story",
  "gallery",
  "theme",
  "visibility"
] as const;

// A section value may be an object (key/value) or an array (story/gallery).
export type SettingsOverrides = Record<string, unknown>;

/** Read all public settings rows (anon-readable). Returns {} on any failure. */
export async function fetchPublicSettings(): Promise<SettingsOverrides> {
  const supabase = getSupabase();
  if (!supabase) return {};
  try {
    const { data, error } = await supabase
      .from("wedding_settings")
      .select("key,value")
      .eq("is_public", true);
    if (error || !data) return {};
    const out: SettingsOverrides = {};
    for (const row of data as { key: string; value: Record<string, unknown> }[]) {
      out[row.key] = row.value;
    }
    return out;
  } catch {
    return {};
  }
}

/** Merge overrides on top of the static defaults (objects shallow, arrays replaced). */
export function mergeConfig(overrides: SettingsOverrides): WeddingConfig {
  const defaults = weddingConfig as unknown as Record<string, unknown>;
  const c: Record<string, unknown> = { ...defaults };

  for (const key of EDITABLE_SECTIONS) {
    const ov = overrides[key];
    if (ov === undefined || ov === null) continue;
    const def = defaults[key];
    if (Array.isArray(def)) {
      if (Array.isArray(ov)) c[key] = ov;
    } else if (typeof def === "object" && def !== null && typeof ov === "object" && !Array.isArray(ov)) {
      c[key] = { ...(def as Record<string, unknown>), ...(ov as Record<string, unknown>) };
    }
  }

  // Keep derived couple fields consistent with the edited names.
  const couple = { ...(c.couple as Record<string, unknown>) };
  const one = String(couple.partnerOne ?? "");
  const two = String(couple.partnerTwo ?? "");
  if (one && two) {
    couple.combined = `${one} & ${two}`;
    const coupleOv = overrides.couple as Record<string, unknown> | undefined;
    if (!coupleOv?.initials) couple.initials = `${one[0]} & ${two[0]}`;
  }
  c.couple = couple;

  return c as unknown as WeddingConfig;
}

/** Server/client-safe: returns the merged config (defaults if no Supabase). */
export async function getMergedConfig(): Promise<WeddingConfig> {
  return mergeConfig(await fetchPublicSettings());
}

/** Admin-only: upsert the provided sections. RLS enforces admin via is_admin(). */
export async function saveWeddingSettings(
  sections: SettingsOverrides
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Supabase is not configured." };
  const rows = Object.entries(sections).map(([key, value]) => ({
    key,
    value,
    is_public: true
  }));
  const { error } = await supabase
    .from("wedding_settings")
    .upsert(rows, { onConflict: "key" });
  return { error: error?.message };
}
