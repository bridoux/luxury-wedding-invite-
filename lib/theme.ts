/**
 * Runtime theming.
 *
 * The whole palette is exposed as CSS custom properties in *channel* form
 * ("R G B"), so Tailwind tokens can be defined as `rgb(var(--c-x) / <alpha-value>)`
 * and opacity utilities (e.g. `bg-champagne/15`) keep working. The admin saves a
 * small set of base colors; dependent shades are derived from them.
 */

export interface ThemeColors {
  // Interface / surfaces (the "beige")
  background: string; // page background
  surface: string; // cards / paper
  bg200: string; // subtle fills
  bg300: string; // borders / track
  // Accent (the "gold")
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryDeep: string;
  goldSoft: string;
  // Script font color (decoupled so it can be e.g. black)
  script: string;
  // Text
  text: string;
  textSoft: string;
  textLight: string;
  // Tertiary status hues (rarely re-themed)
  blush: string;
  blushLight: string;
  blushDark: string;
  sage: string;
  sageLight: string;
  sageDark: string;
}

/** The shipped palette — exact current values, so defaults render unchanged. */
export const DEFAULT_THEME: ThemeColors = {
  background: "#F3EAD6",
  surface: "#FBF6EA",
  bg200: "#E9DBC1",
  bg300: "#DECBAB",
  primary: "#B98A5E",
  primaryLight: "#D7AA7E",
  primaryDark: "#8A5A36",
  primaryDeep: "#5C3922",
  goldSoft: "#D0A878",
  script: "#8A5A36",
  text: "#3A2620",
  textSoft: "#5A4636",
  textLight: "#8A7257",
  blush: "#C99A72",
  blushLight: "#EEDFC6",
  blushDark: "#8A4B33",
  sage: "#9A7B5C",
  sageLight: "#E4D5BC",
  sageDark: "#6E4A30"
};

/** The four colors surfaced as pickers in the admin dashboard. */
export type ThemeBaseField = "background" | "primary" | "script" | "text";

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function toRgb(hex: string): Rgb {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return { r: Number.isNaN(r) ? 0 : r, g: Number.isNaN(g) ? 0 : g, b: Number.isNaN(b) ? 0 : b };
}

const clamp = (n: number): number => Math.max(0, Math.min(255, Math.round(n)));

function toHex({ r, g, b }: Rgb): string {
  return "#" + [r, g, b].map((x) => clamp(x).toString(16).padStart(2, "0")).join("");
}

/** Mix `amt` (0..1) of `other` into `hex`. */
function mix(hex: string, other: string, amt: number): string {
  const a = toRgb(hex);
  const b = toRgb(other);
  return toHex({ r: a.r + (b.r - a.r) * amt, g: a.g + (b.g - a.g) * amt, b: a.b + (b.b - a.b) * amt });
}

const lighten = (hex: string, amt: number): string => mix(hex, "#ffffff", amt);
const darken = (hex: string, amt: number): string => mix(hex, "#000000", amt);

/** Channel string ("185 138 94") for use inside rgb(var(--x) / a). */
function channels(hex: string): string {
  const { r, g, b } = toRgb(hex);
  return `${clamp(r)} ${clamp(g)} ${clamp(b)}`;
}

/**
 * Apply one base color and recompute the shades derived from it. Tertiary hues
 * (blush / sage) are left untouched.
 */
export function applyThemeBase(theme: ThemeColors, field: ThemeBaseField, value: string): ThemeColors {
  switch (field) {
    case "background":
      return {
        ...theme,
        background: value,
        surface: lighten(value, 0.5),
        bg200: darken(value, 0.06),
        bg300: darken(value, 0.13)
      };
    case "primary":
      return {
        ...theme,
        primary: value,
        primaryLight: lighten(value, 0.22),
        primaryDark: darken(value, 0.25),
        primaryDeep: darken(value, 0.5),
        goldSoft: lighten(value, 0.1)
      };
    case "text":
      return {
        ...theme,
        text: value,
        textSoft: mix(value, theme.background, 0.22),
        textLight: mix(value, theme.background, 0.45)
      };
    case "script":
      return { ...theme, script: value };
    default:
      return theme;
  }
}

/** Map a ThemeColors to the CSS custom properties consumed by Tailwind + globals.css. */
export function themeCssVars(t: ThemeColors): Record<string, string> {
  return {
    "--c-bg": channels(t.background),
    "--c-surface": channels(t.surface),
    "--c-bg-200": channels(t.bg200),
    "--c-bg-300": channels(t.bg300),
    "--c-primary": channels(t.primary),
    "--c-primary-light": channels(t.primaryLight),
    "--c-primary-dark": channels(t.primaryDark),
    "--c-primary-deep": channels(t.primaryDeep),
    "--c-gold-soft": channels(t.goldSoft),
    "--c-script": channels(t.script),
    "--c-text": channels(t.text),
    "--c-text-soft": channels(t.textSoft),
    "--c-text-light": channels(t.textLight),
    "--c-blush": channels(t.blush),
    "--c-blush-light": channels(t.blushLight),
    "--c-blush-dark": channels(t.blushDark),
    "--c-sage": channels(t.sage),
    "--c-sage-light": channels(t.sageLight),
    "--c-sage-dark": channels(t.sageDark)
  };
}

/** Inline `:root { ... }` declaration body. Output is digits/spaces only — safe to inline. */
export function themeCssText(t: ThemeColors): string {
  return Object.entries(themeCssVars(t))
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}
