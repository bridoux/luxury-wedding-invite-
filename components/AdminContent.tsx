"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMergedConfig, saveWeddingSettings, type SettingsOverrides } from "@/lib/settingsService";

/**
 * Admin "Content" editor — the array-heavy sections: Our Story, Gallery,
 * Dress Code, and Music. Writes to wedding_settings (admin RLS).
 */

interface StoryItem {
  title: string;
  titleFr: string;
  date: string;
  dateFr: string;
  text: string;
  textFr: string;
  image: string;
}
interface GalleryItem {
  src: string;
  caption: string;
  captionFr: string;
}
interface PaletteItem {
  name: string;
  nameFr: string;
  hex: string;
}
interface DressCode {
  formality: string;
  formalityFr: string;
  description: string;
  descriptionFr: string;
  cultural: string;
  culturalFr: string;
  palette: PaletteItem[];
  suggested: string[];
  suggestedFr: string[];
  avoid: string[];
  avoidFr: string[];
}

/** Read a possibly-missing string field. */
function s(o: Record<string, unknown>, k: string): string {
  const v = o[k];
  return typeof v === "string" ? v : "";
}
/** Read a possibly-missing string[] field. */
function sa(o: Record<string, unknown>, k: string): string[] {
  const v = o[k];
  return Array.isArray(v) ? v.map(String) : [];
}
interface Music {
  enabled: boolean;
  title: string;
  src: string;
}
interface ContentForm {
  story: StoryItem[];
  gallery: GalleryItem[];
  dressCode: DressCode;
  music: Music;
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input className="input-field" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function StringList({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <input className="input-field" value={it} onChange={(e) => onChange(items.map((x, xi) => (xi === i ? e.target.value : x)))} />
            <button type="button" onClick={() => onChange(items.filter((_, xi) => xi !== i))} className="rounded-lg border border-blush-dark/40 px-3 text-blush-dark" aria-label="Remove">✕</button>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...items, ""])} className="btn-outline px-4 py-2 text-xs">+ Add</button>
      </div>
    </div>
  );
}

function Group({ title, children, onAdd, addLabel }: { title: string; children: React.ReactNode; onAdd?: () => void; addLabel?: string }) {
  return (
    <section className="paper-plain p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-2xl font-light text-ink">{title}</h3>
        {onAdd && <button type="button" onClick={onAdd} className="btn-outline px-4 py-2 text-xs">{addLabel ?? "+ Add"}</button>}
      </div>
      {children}
    </section>
  );
}

export default function AdminContent() {
  const router = useRouter();
  const [form, setForm] = useState<ContentForm | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const c = await getMergedConfig();
      const dc = c.dressCode as Record<string, unknown>;
      setForm({
        story: c.story.map((item) => {
          const o = item as Record<string, unknown>;
          return { title: item.title, titleFr: s(o, "titleFr"), date: item.date, dateFr: s(o, "dateFr"), text: item.text, textFr: s(o, "textFr"), image: item.image };
        }),
        gallery: c.gallery.map((g) => {
          const o = g as Record<string, unknown>;
          return { src: g.src, caption: g.caption, captionFr: s(o, "captionFr") };
        }),
        dressCode: {
          formality: c.dressCode.formality,
          formalityFr: s(dc, "formalityFr"),
          description: c.dressCode.description,
          descriptionFr: s(dc, "descriptionFr"),
          cultural: c.dressCode.cultural,
          culturalFr: s(dc, "culturalFr"),
          palette: c.dressCode.palette.map((p) => {
            const o = p as Record<string, unknown>;
            return { name: p.name, nameFr: s(o, "nameFr"), hex: p.hex };
          }),
          suggested: [...c.dressCode.suggested],
          suggestedFr: sa(dc, "suggestedFr"),
          avoid: [...c.dressCode.avoid],
          avoidFr: sa(dc, "avoidFr")
        },
        music: { enabled: c.music.enabled, title: c.music.title, src: c.music.src }
      });
    })();
  }, []);

  const save = async () => {
    if (!form) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    const payload: SettingsOverrides = {
      story: form.story,
      gallery: form.gallery,
      dressCode: form.dressCode,
      music: form.music
    };
    const { error } = await saveWeddingSettings(payload);
    if (error) setErr(error);
    else {
      setMsg("Saved. Your content is now live on the invitation.");
      router.refresh();
    }
    setBusy(false);
  };

  if (!form) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-champagne/30 border-t-champagne" />
      </div>
    );
  }

  const patch = (p: Partial<ContentForm>) => setForm((f) => (f ? { ...f, ...p } : f));
  const patchDress = (p: Partial<DressCode>) => setForm((f) => (f ? { ...f, dressCode: { ...f.dressCode, ...p } } : f));
  const patchMusic = (p: Partial<Music>) => setForm((f) => (f ? { ...f, music: { ...f.music, ...p } } : f));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-sans text-sm text-ink-soft">Edit your story, gallery, dress code and music. Images accept a URL or a /images/&hellip; path.</p>
        <button type="button" onClick={save} disabled={busy} className="btn-gold disabled:opacity-60">{busy ? "Saving…" : "Save Changes"}</button>
      </div>
      {err && <p className="rounded-lg bg-blush-light/60 px-4 py-2 font-sans text-sm text-blush-dark">{err}</p>}
      {msg && <p className="rounded-lg bg-sage-light/30 px-4 py-2 font-sans text-sm text-ink-soft">{msg}</p>}

      {/* Our Story */}
      <Group title="Our Story" addLabel="+ Add moment" onAdd={() => patch({ story: [...form.story, { title: "", titleFr: "", date: "", dateFr: "", text: "", textFr: "", image: "" }] })}>
        <div className="space-y-5">
          {form.story.map((s, i) => (
            <div key={i} className="rounded-lg border border-champagne/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-sans text-xs uppercase tracking-wider text-ink-light">Moment {i + 1}</span>
                <button type="button" onClick={() => patch({ story: form.story.filter((_, xi) => xi !== i) })} className="text-sm text-blush-dark">Remove</button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Title" value={s.title} onChange={(v) => patch({ story: form.story.map((x, xi) => (xi === i ? { ...x, title: v } : x)) })} />
                <Input label="Title (FR)" value={s.titleFr} onChange={(v) => patch({ story: form.story.map((x, xi) => (xi === i ? { ...x, titleFr: v } : x)) })} />
                <Input label="Date label" value={s.date} onChange={(v) => patch({ story: form.story.map((x, xi) => (xi === i ? { ...x, date: v } : x)) })} />
                <Input label="Date label (FR)" value={s.dateFr} onChange={(v) => patch({ story: form.story.map((x, xi) => (xi === i ? { ...x, dateFr: v } : x)) })} />
                <div className="sm:col-span-2">
                  <Input label="Image (URL or /images/…)" value={s.image} onChange={(v) => patch({ story: form.story.map((x, xi) => (xi === i ? { ...x, image: v } : x)) })} />
                </div>
                <label className="block sm:col-span-2">
                  <span className="field-label">Text</span>
                  <textarea className="input-field resize-none" rows={2} value={s.text} onChange={(e) => patch({ story: form.story.map((x, xi) => (xi === i ? { ...x, text: e.target.value } : x)) })} />
                </label>
                <label className="block sm:col-span-2">
                  <span className="field-label">Text (FR)</span>
                  <textarea className="input-field resize-none" rows={2} value={s.textFr} onChange={(e) => patch({ story: form.story.map((x, xi) => (xi === i ? { ...x, textFr: e.target.value } : x)) })} />
                </label>
              </div>
            </div>
          ))}
        </div>
      </Group>

      {/* Gallery */}
      <Group title="Gallery" addLabel="+ Add photo" onAdd={() => patch({ gallery: [...form.gallery, { src: "", caption: "", captionFr: "" }] })}>
        <div className="space-y-3">
          {form.gallery.map((g, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-[1.6fr_1fr_1fr_auto] sm:items-end">
              <Input label="Image (URL or /images/…)" value={g.src} onChange={(v) => patch({ gallery: form.gallery.map((x, xi) => (xi === i ? { ...x, src: v } : x)) })} />
              <Input label="Caption" value={g.caption} onChange={(v) => patch({ gallery: form.gallery.map((x, xi) => (xi === i ? { ...x, caption: v } : x)) })} />
              <Input label="Caption (FR)" value={g.captionFr} onChange={(v) => patch({ gallery: form.gallery.map((x, xi) => (xi === i ? { ...x, captionFr: v } : x)) })} />
              <button type="button" onClick={() => patch({ gallery: form.gallery.filter((_, xi) => xi !== i) })} className="rounded-lg border border-blush-dark/40 px-3 py-2 text-blush-dark" aria-label="Remove">✕</button>
            </div>
          ))}
        </div>
      </Group>

      {/* Dress Code */}
      <Group title="Dress Code">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Formality" value={form.dressCode.formality} onChange={(v) => patchDress({ formality: v })} />
          <Input label="Formality (FR)" value={form.dressCode.formalityFr} onChange={(v) => patchDress({ formalityFr: v })} />
          <Input label="Cultural note" value={form.dressCode.cultural} onChange={(v) => patchDress({ cultural: v })} />
          <Input label="Cultural note (FR)" value={form.dressCode.culturalFr} onChange={(v) => patchDress({ culturalFr: v })} />
          <label className="block sm:col-span-2">
            <span className="field-label">Description</span>
            <textarea className="input-field resize-none" rows={2} value={form.dressCode.description} onChange={(e) => patchDress({ description: e.target.value })} />
          </label>
          <label className="block sm:col-span-2">
            <span className="field-label">Description (FR)</span>
            <textarea className="input-field resize-none" rows={2} value={form.dressCode.descriptionFr} onChange={(e) => patchDress({ descriptionFr: e.target.value })} />
          </label>
        </div>
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="field-label">Colour palette</span>
            <button type="button" onClick={() => patchDress({ palette: [...form.dressCode.palette, { name: "", nameFr: "", hex: "#B98A5E" }] })} className="btn-outline px-4 py-2 text-xs">+ Add colour</button>
          </div>
          <div className="space-y-2">
            {form.dressCode.palette.map((p, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(p.hex) ? p.hex : "#B98A5E"} onChange={(e) => patchDress({ palette: form.dressCode.palette.map((x, xi) => (xi === i ? { ...x, hex: e.target.value } : x)) })} className="h-10 w-12 rounded border border-champagne/30" />
                <input className="input-field flex-1" placeholder="Colour name" value={p.name} onChange={(e) => patchDress({ palette: form.dressCode.palette.map((x, xi) => (xi === i ? { ...x, name: e.target.value } : x)) })} />
                <input className="input-field flex-1" placeholder="Nom (FR)" value={p.nameFr} onChange={(e) => patchDress({ palette: form.dressCode.palette.map((x, xi) => (xi === i ? { ...x, nameFr: e.target.value } : x)) })} />
                <input className="input-field w-28" value={p.hex} onChange={(e) => patchDress({ palette: form.dressCode.palette.map((x, xi) => (xi === i ? { ...x, hex: e.target.value } : x)) })} />
                <button type="button" onClick={() => patchDress({ palette: form.dressCode.palette.filter((_, xi) => xi !== i) })} className="rounded-lg border border-blush-dark/40 px-3 py-2 text-blush-dark" aria-label="Remove">✕</button>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <StringList label="Suggested attire" items={form.dressCode.suggested} onChange={(v) => patchDress({ suggested: v })} />
          <StringList label="Suggested attire (FR)" items={form.dressCode.suggestedFr} onChange={(v) => patchDress({ suggestedFr: v })} />
          <StringList label="Kindly avoid" items={form.dressCode.avoid} onChange={(v) => patchDress({ avoid: v })} />
          <StringList label="Kindly avoid (FR)" items={form.dressCode.avoidFr} onChange={(v) => patchDress({ avoidFr: v })} />
        </div>
      </Group>

      {/* Music */}
      <Group title="Music">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-3 sm:col-span-2">
            <input type="checkbox" className="h-5 w-5 accent-champagne" checked={form.music.enabled} onChange={(e) => patchMusic({ enabled: e.target.checked })} />
            <span className="font-sans text-sm text-ink-soft">Show the background-music toggle</span>
          </label>
          <Input label="Track title" value={form.music.title} onChange={(v) => patchMusic({ title: v })} />
          <Input label="Audio file (URL or /audio/…)" value={form.music.src} onChange={(v) => patchMusic({ src: v })} />
        </div>
      </Group>

      <div className="flex justify-end">
        <button type="button" onClick={save} disabled={busy} className="btn-gold disabled:opacity-60">{busy ? "Saving…" : "Save Changes"}</button>
      </div>
    </div>
  );
}
