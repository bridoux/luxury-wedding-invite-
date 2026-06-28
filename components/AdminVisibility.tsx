"use client";

import { useState } from "react";
import { useWeddingConfig } from "@/components/WeddingConfigProvider";
import { saveWeddingSettings } from "@/lib/settingsService";
import { resolveVisibility, VISIBILITY_SECTIONS, type SectionVisibility } from "@/lib/visibility";

export default function AdminVisibility() {
  const config = useWeddingConfig();
  const [vis, setVis] = useState<SectionVisibility>(() =>
    resolveVisibility((config as { visibility?: unknown }).visibility)
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const toggle = (key: keyof SectionVisibility) => {
    setMsg(null);
    setErr(null);
    setVis((v) => ({ ...v, [key]: !v[key] }));
  };

  const save = async () => {
    setBusy(true);
    setErr(null);
    setMsg(null);
    const { error } = await saveWeddingSettings({ visibility: vis });
    if (error) setErr(error);
    else setMsg("Saved. Hidden sections are now off for guests (refresh the invitation to see).");
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      {err && <p className="rounded-lg bg-blush-light/60 px-4 py-2 font-sans text-sm text-blush-dark">{err}</p>}
      {msg && <p className="rounded-lg bg-sage-light/50 px-4 py-2 font-sans text-sm text-sage-dark">{msg}</p>}

      <section className="paper-plain p-6">
        <h3 className="mb-1 font-serif text-2xl font-light text-ink">Sections</h3>
        <p className="mb-5 font-sans text-sm text-ink-light">
          Turn off any section you don&apos;t want to show. The invitation header and RSVP always stay on.
        </p>

        <div className="divide-y divide-champagne/10">
          {VISIBILITY_SECTIONS.map(({ key, label, hint }) => {
            const on = vis[key];
            return (
              <div key={key} className="flex items-center justify-between gap-4 py-3.5">
                <div>
                  <p className="font-serif text-lg text-ink">{label}</p>
                  <p className="font-sans text-xs text-ink-light">{hint}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  aria-label={`${on ? "Hide" : "Show"} ${label}`}
                  onClick={() => toggle(key)}
                  className={`relative h-7 w-12 flex-none rounded-full transition-colors duration-200 ${
                    on ? "bg-champagne" : "bg-ink/15"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      on ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex justify-end">
        <button type="button" onClick={save} disabled={busy} className="btn-gold disabled:opacity-60">
          {busy ? "Saving…" : "Save sections"}
        </button>
      </div>
    </div>
  );
}
