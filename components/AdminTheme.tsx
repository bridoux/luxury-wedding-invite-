"use client";

import { useEffect, useState } from "react";
import { useWeddingConfig } from "@/components/WeddingConfigProvider";
import { saveWeddingSettings } from "@/lib/settingsService";
import {
  DEFAULT_THEME,
  applyThemeBase,
  themeCssVars,
  type ThemeColors,
  type ThemeBaseField
} from "@/lib/theme";

const BASE_FIELDS: { field: ThemeBaseField; label: string; hint: string }[] = [
  { field: "background", label: "Interface background", hint: "Page & card surfaces" },
  { field: "primary", label: "Accent / gold", hint: "Buttons, borders, dividers, eyebrows" },
  { field: "script", label: "Script text", hint: "The cursive names (e.g. Ruth & Eric)" },
  { field: "text", label: "Body text", hint: "Headings & paragraphs" }
];

// Swatches showing the shades derived from the base colors.
const DERIVED: { key: keyof ThemeColors; label: string }[] = [
  { key: "surface", label: "Surface" },
  { key: "primaryLight", label: "Accent light" },
  { key: "primaryDark", label: "Accent dark" },
  { key: "primaryDeep", label: "Accent deep" },
  { key: "textSoft", label: "Text soft" },
  { key: "textLight", label: "Text light" }
];

function isHex(v: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);
}

export default function AdminTheme() {
  const config = useWeddingConfig();
  const saved = (config.theme as ThemeColors) ?? DEFAULT_THEME;
  const [theme, setTheme] = useState<ThemeColors>(saved);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Live-preview by writing the variables onto :root while editing. On leaving
  // the tab, revert to the saved (server-injected) theme.
  useEffect(() => {
    const root = document.documentElement;
    const vars = themeCssVars(theme);
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
    return () => {
      for (const k of Object.keys(vars)) root.style.removeProperty(k);
    };
  }, [theme]);

  const setBase = (field: ThemeBaseField, value: string) => {
    setMsg(null);
    setErr(null);
    setTheme((t) => applyThemeBase(t, field, value));
  };

  const save = async () => {
    setBusy(true);
    setErr(null);
    setMsg(null);
    const { error } = await saveWeddingSettings({ theme });
    if (error) setErr(error);
    else setMsg("Theme saved. Guests will see it on their next visit; refresh to preview the rest of the site.");
    setBusy(false);
  };

  const resetDefaults = () => {
    setTheme(DEFAULT_THEME);
    setMsg(null);
    setErr(null);
  };

  return (
    <div className="space-y-6">
      {err && <p className="rounded-lg bg-blush-light/60 px-4 py-2 font-sans text-sm text-blush-dark">{err}</p>}
      {msg && <p className="rounded-lg bg-sage-light/50 px-4 py-2 font-sans text-sm text-sage-dark">{msg}</p>}

      <section className="paper-plain p-6">
        <h3 className="mb-1 font-serif text-2xl font-light text-ink">Colors</h3>
        <p className="mb-5 font-sans text-sm text-ink-light">
          Pick the four core colors. Accent and text shades are derived automatically. Changes preview live here; click
          Save to apply them for guests.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          {BASE_FIELDS.map(({ field, label, hint }) => {
            const value = theme[field];
            return (
              <div key={field} className="rounded-xl border border-champagne/20 bg-ivory/40 p-4">
                <span className="field-label">{label}</span>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={isHex(value) ? value : "#000000"}
                    onChange={(e) => setBase(field, e.target.value)}
                    aria-label={`${label} color`}
                    className="h-10 w-12 cursor-pointer rounded-md border border-champagne/30 bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTheme((t) => ({ ...t, [field]: v }));
                      if (isHex(v)) setBase(field, v);
                    }}
                    className="input-field font-mono text-sm uppercase"
                    spellCheck={false}
                  />
                </div>
                <p className="mt-1 font-sans text-xs text-ink-light">{hint}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <span className="field-label">Derived shades</span>
          <div className="flex flex-wrap gap-3">
            {DERIVED.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="h-7 w-7 rounded-full border border-ink/10"
                  style={{ backgroundColor: theme[key] }}
                  aria-hidden
                />
                <span className="font-sans text-xs text-ink-light">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live preview */}
      <section className="paper-plain p-6">
        <h3 className="mb-4 font-serif text-2xl font-light text-ink">Preview</h3>
        <div className="rounded-xl bg-romantic-gradient p-8 text-center">
          <p className="eyebrow-plain text-[0.62rem]">You are invited</p>
          <p className="script mt-2 text-5xl">{config.couple?.combined ?? "Ruth & Eric"}</p>
          <div className="gold-divider" />
          <p className="lead mx-auto max-w-md">A preview of how your colors look together.</p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button type="button" className="btn-gold">Open Invitation</button>
            <button type="button" className="btn-outline px-6 py-2.5 text-xs">Details</button>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={busy} className="btn-gold disabled:opacity-60">
          {busy ? "Saving…" : "Save theme"}
        </button>
        <button type="button" onClick={resetDefaults} disabled={busy} className="btn-outline px-6 py-2.5 text-xs">
          Reset to default
        </button>
      </div>
    </div>
  );
}
