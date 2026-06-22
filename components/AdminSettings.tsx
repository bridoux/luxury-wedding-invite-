"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMergedConfig, saveWeddingSettings, type SettingsOverrides } from "@/lib/settingsService";

/**
 * Admin "Wedding Details" editor — reads the merged config to prefill, writes
 * each section back to wedding_settings (RLS allows only admins to upsert).
 */

type Form = {
  couple: { partnerOne: string; partnerTwo: string; hashtag: string };
  date: { display: string; dayOfWeek: string; shortDisplay: string; iso: string };
  invitation: { intro: string; introFr: string; message: string; messageFr: string; teaser: string; teaserFr: string };
  ceremony: { time: string; venue: string; address: string; notes: string; notesFr: string };
  reception: { time: string; venue: string; address: string; notes: string; notesFr: string };
  location: { primaryVenue: string; fullAddress: string; googleMapsUrl: string; parking: string; parkingFr: string; travel: string; travelFr: string };
  gift: { message: string; messageFr: string; registryName: string; registryUrl: string };
  contact: { name: string; phone: string; email: string };
  rsvp: { deadlineDisplay: string };
};

// Read a possibly-missing French companion field off the merged config.
function fr(section: Record<string, unknown>, key: string): string {
  const v = section[key];
  return typeof v === "string" ? v : "";
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea = false
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {textarea ? (
        <textarea className="input-field resize-none" rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="input-field" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="paper-plain p-6">
      <h3 className="mb-4 font-serif text-2xl font-light text-ink">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export default function AdminSettings() {
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const c = await getMergedConfig();
      const inv = c.invitation as Record<string, unknown>;
      const cer = c.ceremony as Record<string, unknown>;
      const rec = c.reception as Record<string, unknown>;
      const loc = c.location as Record<string, unknown>;
      const gft = c.gift as Record<string, unknown>;
      setForm({
        couple: { partnerOne: c.couple.partnerOne, partnerTwo: c.couple.partnerTwo, hashtag: c.couple.hashtag },
        date: { display: c.date.display, dayOfWeek: c.date.dayOfWeek, shortDisplay: c.date.shortDisplay, iso: c.date.iso.slice(0, 16) },
        invitation: { intro: c.invitation.intro, introFr: fr(inv, "introFr"), message: c.invitation.message, messageFr: fr(inv, "messageFr"), teaser: c.invitation.teaser, teaserFr: fr(inv, "teaserFr") },
        ceremony: { time: c.ceremony.time, venue: c.ceremony.venue, address: c.ceremony.address, notes: c.ceremony.notes, notesFr: fr(cer, "notesFr") },
        reception: { time: c.reception.time, venue: c.reception.venue, address: c.reception.address, notes: c.reception.notes, notesFr: fr(rec, "notesFr") },
        location: { primaryVenue: c.location.primaryVenue, fullAddress: c.location.fullAddress, googleMapsUrl: c.location.googleMapsUrl, parking: c.location.parking, parkingFr: fr(loc, "parkingFr"), travel: c.location.travel, travelFr: fr(loc, "travelFr") },
        gift: { message: c.gift.message, messageFr: fr(gft, "messageFr"), registryName: c.gift.registryName, registryUrl: c.gift.registryUrl },
        contact: { name: c.contact.name, phone: c.contact.phone, email: c.contact.email },
        rsvp: { deadlineDisplay: c.rsvp.deadlineDisplay }
      });
    })();
  }, []);

  const set = <S extends keyof Form, K extends keyof Form[S]>(section: S, key: K) => (v: string) =>
    setForm((f) => (f ? { ...f, [section]: { ...f[section], [key]: v } } : f));

  const save = async () => {
    if (!form) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    // Normalise the datetime-local back to a seconds-precision ISO string.
    const payload: SettingsOverrides = {
      ...form,
      date: { ...form.date, iso: form.date.iso.length === 16 ? `${form.date.iso}:00` : form.date.iso }
    };
    const { error } = await saveWeddingSettings(payload);
    if (error) {
      setErr(error);
    } else {
      setMsg("Saved. Your changes are now live on the invitation.");
      router.refresh(); // re-run server components so the live config updates
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-sans text-sm text-ink-soft">
          Edit your wedding details below. Changes save to the database and appear on the public invitation.
        </p>
        <button type="button" onClick={save} disabled={busy} className="btn-gold disabled:opacity-60">
          {busy ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {err && <p className="rounded-lg bg-blush-light/60 px-4 py-2 font-sans text-sm text-blush-dark">{err}</p>}
      {msg && <p className="rounded-lg bg-sage-light/30 px-4 py-2 font-sans text-sm text-ink-soft">{msg}</p>}

      <Group title="The Couple">
        <Field label="Partner One" value={form.couple.partnerOne} onChange={set("couple", "partnerOne")} />
        <Field label="Partner Two" value={form.couple.partnerTwo} onChange={set("couple", "partnerTwo")} />
        <Field label="Hashtag" value={form.couple.hashtag} onChange={set("couple", "hashtag")} />
      </Group>

      <Group title="Date">
        <Field label="Date & time" type="datetime-local" value={form.date.iso} onChange={set("date", "iso")} />
        <Field label="Display date (e.g. August 18, 2026)" value={form.date.display} onChange={set("date", "display")} />
        <Field label="Day of week" value={form.date.dayOfWeek} onChange={set("date", "dayOfWeek")} />
        <Field label="Short date (e.g. 18.08.2026)" value={form.date.shortDisplay} onChange={set("date", "shortDisplay")} />
      </Group>

      <Group title="Invitation Message">
        <Field label="Intro line" value={form.invitation.intro} onChange={set("invitation", "intro")} />
        <Field label="Intro line (FR)" value={form.invitation.introFr} onChange={set("invitation", "introFr")} />
        <Field label="Teaser" value={form.invitation.teaser} onChange={set("invitation", "teaser")} />
        <Field label="Teaser (FR)" value={form.invitation.teaserFr} onChange={set("invitation", "teaserFr")} />
        <div className="sm:col-span-2">
          <Field label="Main message" textarea value={form.invitation.message} onChange={set("invitation", "message")} />
        </div>
        <div className="sm:col-span-2">
          <Field label="Main message (FR)" textarea value={form.invitation.messageFr} onChange={set("invitation", "messageFr")} />
        </div>
      </Group>

      <Group title="Ceremony">
        <Field label="Time" value={form.ceremony.time} onChange={set("ceremony", "time")} />
        <Field label="Venue" value={form.ceremony.venue} onChange={set("ceremony", "venue")} />
        <Field label="Address" value={form.ceremony.address} onChange={set("ceremony", "address")} />
        <Field label="Notes" value={form.ceremony.notes} onChange={set("ceremony", "notes")} />
        <Field label="Notes (FR)" value={form.ceremony.notesFr} onChange={set("ceremony", "notesFr")} />
      </Group>

      <Group title="Reception">
        <Field label="Time" value={form.reception.time} onChange={set("reception", "time")} />
        <Field label="Venue" value={form.reception.venue} onChange={set("reception", "venue")} />
        <Field label="Address" value={form.reception.address} onChange={set("reception", "address")} />
        <Field label="Notes" value={form.reception.notes} onChange={set("reception", "notes")} />
        <Field label="Notes (FR)" value={form.reception.notesFr} onChange={set("reception", "notesFr")} />
      </Group>

      <Group title="Location">
        <Field label="Primary venue" value={form.location.primaryVenue} onChange={set("location", "primaryVenue")} />
        <Field label="Full address" value={form.location.fullAddress} onChange={set("location", "fullAddress")} />
        <div className="sm:col-span-2">
          <Field label="Google Maps URL" value={form.location.googleMapsUrl} onChange={set("location", "googleMapsUrl")} />
        </div>
        <Field label="Parking notes" textarea value={form.location.parking} onChange={set("location", "parking")} />
        <Field label="Parking notes (FR)" textarea value={form.location.parkingFr} onChange={set("location", "parkingFr")} />
        <Field label="Travel & stay notes" textarea value={form.location.travel} onChange={set("location", "travel")} />
        <Field label="Travel & stay notes (FR)" textarea value={form.location.travelFr} onChange={set("location", "travelFr")} />
      </Group>

      <Group title="Gifts">
        <div className="sm:col-span-2">
          <Field label="Gift message" textarea value={form.gift.message} onChange={set("gift", "message")} />
        </div>
        <div className="sm:col-span-2">
          <Field label="Gift message (FR)" textarea value={form.gift.messageFr} onChange={set("gift", "messageFr")} />
        </div>
        <Field label="Registry name" value={form.gift.registryName} onChange={set("gift", "registryName")} />
        <Field label="Registry URL" value={form.gift.registryUrl} onChange={set("gift", "registryUrl")} />
      </Group>

      <Group title="Contact & RSVP">
        <Field label="Contact name" value={form.contact.name} onChange={set("contact", "name")} />
        <Field label="Contact phone" value={form.contact.phone} onChange={set("contact", "phone")} />
        <Field label="Contact email" value={form.contact.email} onChange={set("contact", "email")} />
        <Field label="RSVP deadline (display)" value={form.rsvp.deadlineDisplay} onChange={set("rsvp", "deadlineDisplay")} />
      </Group>

      <div className="flex justify-end">
        <button type="button" onClick={save} disabled={busy} className="btn-gold disabled:opacity-60">
          {busy ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
