"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { appUrl } from "@/lib/appUrl";

/**
 * Admin guest manager — add / edit / delete the real guest list that drives
 * personalized invite links (/invite/[guest_code]). Admin-only via RLS.
 */

interface GuestRow {
  id: string;
  guest_code: string;
  full_name: string;
  party_label: string | null;
  email: string | null;
  phone: string | null;
  max_guests: number;
  greeting: string | null;
  rsvp_status: string;
  invite_status: string;
}

const CODE_RE = /^[a-z0-9][a-z0-9-]{1,48}$/;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function inviteUrl(code: string): string {
  // Always build invite links against the canonical site, not whatever deploy
  // (preview / localhost) the admin happens to be viewing.
  return appUrl(`/invite/${code}`);
}

export default function AdminGuests() {
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // new-guest form
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [codeEdited, setCodeEdited] = useState(false);
  const [maxGuests, setMaxGuests] = useState(2);
  const [email, setEmail] = useState("");
  const [greeting, setGreeting] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setErr("Supabase is not configured.");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("guests")
      .select("id,guest_code,full_name,party_label,email,phone,max_guests,greeting,rsvp_status,invite_status")
      .order("full_name");
    if (error) setErr(error.message);
    setGuests((data as GuestRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addGuest = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const finalCode = (codeEdited ? code : slugify(name)).trim();
    if (!name.trim()) return setErr("Name is required.");
    if (!CODE_RE.test(finalCode)) return setErr("Invite code must be lowercase letters, numbers and dashes (2–49 chars).");
    setAdding(true);
    setErr(null);
    const { error } = await supabase.from("guests").insert({
      guest_code: finalCode,
      full_name: name.trim(),
      party_label: name.trim(),
      max_guests: maxGuests,
      email: email.trim() || null,
      greeting: greeting.trim() || null
    });
    if (error) {
      setErr(error.message.includes("duplicate") ? `Invite code "${finalCode}" is already taken.` : error.message);
    } else {
      setName("");
      setCode("");
      setCodeEdited(false);
      setMaxGuests(2);
      setEmail("");
      setGreeting("");
      await load();
    }
    setAdding(false);
  };

  const updateGuest = async (id: string, patch: Partial<GuestRow>) => {
    const supabase = getSupabase();
    if (!supabase) return;
    setGuests((gs) => gs.map((g) => (g.id === id ? { ...g, ...patch } : g)));
    const { error } = await supabase.from("guests").update(patch).eq("id", id);
    if (error) setErr(error.message);
  };

  const deleteGuest = async (id: string, label: string) => {
    const supabase = getSupabase();
    if (!supabase) return;
    if (!window.confirm(`Remove ${label}? This cannot be undone.`)) return;
    const { error } = await supabase.from("guests").delete().eq("id", id);
    if (error) setErr(error.message);
    else setGuests((gs) => gs.filter((g) => g.id !== id));
  };

  const copyLink = async (code: string) => {
    try {
      await navigator.clipboard.writeText(inviteUrl(code));
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-champagne/30 border-t-champagne" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {err && <p className="rounded-lg bg-blush-light/60 px-4 py-2 font-sans text-sm text-blush-dark">{err}</p>}

      {/* Add guest */}
      <section className="paper-plain p-6">
        <h3 className="mb-4 font-serif text-2xl font-light text-ink">Add a guest / party</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">Name (person or family) *</span>
            <input
              className="input-field"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!codeEdited) setCode(slugify(e.target.value));
              }}
              placeholder="e.g. The Okafor Family"
            />
          </label>
          <label className="block">
            <span className="field-label">Invite code (link)</span>
            <input
              className="input-field"
              value={codeEdited ? code : slugify(name)}
              onChange={(e) => {
                setCodeEdited(true);
                setCode(slugify(e.target.value));
              }}
              placeholder="auto-generated"
            />
          </label>
          <label className="block">
            <span className="field-label">Max guests</span>
            <input type="number" min={1} max={20} className="input-field" value={maxGuests} onChange={(e) => setMaxGuests(Number(e.target.value) || 1)} />
          </label>
          <label className="block">
            <span className="field-label">Email (optional)</span>
            <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block sm:col-span-2">
            <span className="field-label">Personal greeting (optional)</span>
            <input className="input-field" value={greeting} onChange={(e) => setGreeting(e.target.value)} placeholder="Shown on their invitation" />
          </label>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button type="button" onClick={addGuest} disabled={adding || !name.trim()} className="btn-gold disabled:opacity-60">
            {adding ? "Adding…" : "Add Guest"}
          </button>
          {name && (
            <span className="font-sans text-xs text-ink-light">
              Link: <span className="font-mono text-champagne-dark">/invite/{codeEdited ? code : slugify(name)}</span>
            </span>
          )}
        </div>
      </section>

      {/* Guest list */}
      <section className="paper-plain overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-3">
          <h3 className="font-serif text-2xl font-light text-ink">Guests</h3>
          <span className="font-sans text-xs uppercase tracking-wider text-ink-light">{guests.length} parties</span>
        </div>

        {guests.length === 0 ? (
          <p className="px-6 pb-6 font-sans text-sm text-ink-light">No guests yet. Add your first above.</p>
        ) : (
          <div className="divide-y divide-champagne/10">
            {guests.map((g) => (
              <div key={g.id} className="grid gap-3 p-5 sm:grid-cols-[1.4fr_1fr_auto_auto] sm:items-end">
                <label className="block">
                  <span className="field-label">Name</span>
                  <input
                    className="input-field"
                    defaultValue={g.party_label ?? g.full_name}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v && v !== (g.party_label ?? g.full_name)) updateGuest(g.id, { party_label: v, full_name: v });
                    }}
                  />
                </label>
                <label className="block">
                  <span className="field-label">Max guests</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    className="input-field"
                    defaultValue={g.max_guests}
                    onBlur={(e) => {
                      const v = Number(e.target.value) || 1;
                      if (v !== g.max_guests) updateGuest(g.id, { max_guests: v });
                    }}
                  />
                </label>
                <div className="flex flex-col gap-1">
                  <span className="field-label">Status</span>
                  <span className="rounded-full bg-champagne/15 px-3 py-1.5 text-center font-sans text-xs capitalize text-champagne-dark">
                    {g.rsvp_status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => copyLink(g.guest_code)} className="btn-outline px-4 py-2 text-xs">
                    {copied === g.guest_code ? "Copied!" : "Copy link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteGuest(g.id, g.party_label ?? g.full_name)}
                    aria-label="Delete guest"
                    className="rounded-full border border-blush-dark/40 px-3 py-2 font-sans text-xs text-blush-dark transition-colors hover:bg-blush-light/40"
                  >
                    ✕
                  </button>
                </div>
                <p className="font-mono text-xs text-ink-light sm:col-span-4">/invite/{g.guest_code}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="font-sans text-xs text-ink-light">
        Tip: the 3 starter guests (amara, the-bennetts, james) are samples — delete them once your real list is in.
      </p>
    </div>
  );
}
