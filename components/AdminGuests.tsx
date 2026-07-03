"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { appUrl } from "@/lib/appUrl";
import { parseGuestFile, type ParsedImport } from "@/lib/guestImport";

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

  // bulk import (CSV / Excel)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [importPreview, setImportPreview] = useState<ParsedImport | null>(null);
  const [importFileName, setImportFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  // manual RSVP entry (admin-recorded responses)
  const [rsvpEdits, setRsvpEdits] = useState<Record<string, { status: string; count: number }>>({});
  const [rsvpSavingId, setRsvpSavingId] = useState<string | null>(null);

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

  // ── Manual RSVP (record a response on a guest's behalf) ──────
  const REAL_STATUSES = ["attending", "not_attending", "maybe"];
  const baseRsvp = (g: GuestRow) => ({
    status: REAL_STATUSES.includes(g.rsvp_status) ? g.rsvp_status : "",
    count: g.max_guests
  });
  const rsvpFor = (g: GuestRow) => rsvpEdits[g.id] ?? baseRsvp(g);

  const saveManualRsvp = async (g: GuestRow) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { status, count } = rsvpFor(g);
    if (!status) {
      setErr("Choose an attendance status first.");
      return;
    }
    setErr(null);
    setRsvpSavingId(g.id);
    // Same upsert RPC the public form uses → updates (not duplicates) and syncs status.
    const { error } = await supabase.rpc("submit_rsvp", {
      p_guest_code: g.guest_code,
      p_full_name: g.party_label ?? g.full_name,
      p_email: g.email ?? null,
      p_phone: g.phone ?? null,
      p_attendance_status: status,
      p_guest_count: Math.max(0, Math.min(20, count || 0)),
      p_additional_guest_names: null,
      p_meal_preference: null,
      p_dietary_restrictions: null,
      p_accommodation_needed: false,
      p_message: null,
      p_consent_updates: false
    });
    if (error) {
      setErr(error.message);
    } else {
      setRsvpEdits((m) => {
        const next = { ...m };
        delete next[g.id];
        return next;
      });
      await load();
    }
    setRsvpSavingId(null);
  };

  const handleFile = async (file: File) => {
    setErr(null);
    setImportMsg(null);
    setImportPreview(null);
    setParsing(true);
    try {
      const parsed = await parseGuestFile(file);
      setImportFileName(file.name);
      setImportPreview(parsed);
      if (parsed.valid.length === 0) {
        setErr("No valid guest rows found. Make sure there's a name column (or one column of names).");
      }
    } catch (e) {
      setErr(e instanceof Error ? `Could not read that file: ${e.message}` : "Could not read that file.");
    } finally {
      setParsing(false);
    }
  };

  const cancelImport = () => {
    setImportPreview(null);
    setImportFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const confirmImport = async () => {
    const supabase = getSupabase();
    if (!supabase || !importPreview) return;
    setImporting(true);
    setErr(null);
    const rows = importPreview.valid;
    const CHUNK = 500;
    let saved = 0;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const batch = rows.slice(i, i + CHUNK);
      // upsert on guest_code so re-importing updates matching parties instead of erroring
      const { error } = await supabase.from("guests").upsert(batch, { onConflict: "guest_code" });
      if (error) {
        setErr(`Import stopped after ${saved} saved: ${error.message}`);
        setImporting(false);
        await load();
        return;
      }
      saved += batch.length;
    }
    setImporting(false);
    setImportMsg(`Imported ${saved} ${saved === 1 ? "party" : "parties"}.`);
    cancelImport();
    await load();
  };

  const downloadTemplate = () => {
    const csv =
      "name,max_guests,email,phone,greeting\n" +
      'The Okafor Family,4,okafor@example.com,+2250700000000,"We can\'t wait to celebrate with you!"\n' +
      "Amara Johnson,1,amara@example.com,,\n";
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "guest-list-template.csv";
    a.click();
    URL.revokeObjectURL(url);
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

      {/* Bulk import */}
      <section className="paper-plain p-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="font-serif text-2xl font-light text-ink">Import from CSV or Excel</h3>
          <button
            type="button"
            onClick={downloadTemplate}
            className="font-sans text-xs uppercase tracking-[0.15em] text-champagne-dark underline-offset-4 hover:underline"
          >
            Download template
          </button>
        </div>
        <p className="mb-4 font-sans text-sm text-ink-light">
          Upload a <span className="font-mono text-xs">.csv</span> or <span className="font-mono text-xs">.xlsx</span> file.
          Recognized columns: <span className="font-mono text-xs">name</span> (required),{" "}
          <span className="font-mono text-xs">max_guests</span>, <span className="font-mono text-xs">email</span>,{" "}
          <span className="font-mono text-xs">phone</span>, <span className="font-mono text-xs">greeting</span>. Invite codes are
          generated from names automatically. Re-importing updates parties with matching invite codes.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
          className="block w-full cursor-pointer rounded-lg border border-champagne/30 bg-ivory/40 px-3 py-2 font-sans text-sm text-ink-soft file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-champagne/20 file:px-3 file:py-1.5 file:font-sans file:text-xs file:uppercase file:tracking-wider file:text-champagne-dark"
        />

        {parsing && <p className="mt-3 font-sans text-sm text-ink-light">Reading file…</p>}
        {importMsg && (
          <p className="mt-3 rounded-lg bg-sage-light/50 px-4 py-2 font-sans text-sm text-sage-dark">{importMsg}</p>
        )}

        {importPreview && (
          <div className="mt-5 rounded-xl border border-champagne/20 bg-ivory/40 p-5">
            <p className="font-sans text-sm text-ink-soft">
              <span className="font-semibold text-ink">{importPreview.valid.length}</span> ready to import
              {importPreview.skipped.length > 0 && (
                <>
                  {" · "}
                  <span className="text-blush-dark">{importPreview.skipped.length} skipped</span>
                </>
              )}{" "}
              <span className="text-ink-light">from {importFileName}</span>
            </p>
            {importPreview.assumedNoHeader && (
              <p className="mt-1 font-sans text-xs text-ink-light">
                No header row detected — treated the first column as names.
              </p>
            )}

            {importPreview.valid.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse font-sans text-xs">
                  <thead>
                    <tr className="text-left text-ink-light">
                      <th className="py-1 pr-4 font-medium">Name</th>
                      <th className="py-1 pr-4 font-medium">Max</th>
                      <th className="py-1 pr-4 font-medium">Email</th>
                      <th className="py-1 font-medium">Invite code</th>
                    </tr>
                  </thead>
                  <tbody className="text-ink-soft">
                    {importPreview.valid.slice(0, 8).map((g) => (
                      <tr key={g.guest_code} className="border-t border-champagne/10">
                        <td className="py-1 pr-4">{g.full_name}</td>
                        <td className="py-1 pr-4">{g.max_guests}</td>
                        <td className="py-1 pr-4">{g.email ?? "—"}</td>
                        <td className="py-1 font-mono text-champagne-dark">{g.guest_code}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {importPreview.valid.length > 8 && (
                  <p className="mt-2 font-sans text-xs text-ink-light">…and {importPreview.valid.length - 8} more.</p>
                )}
              </div>
            )}

            {importPreview.skipped.length > 0 && (
              <p className="mt-3 font-sans text-xs text-blush-dark">
                Skipped rows:{" "}
                {importPreview.skipped
                  .slice(0, 5)
                  .map((s) => `row ${s.row} (${s.reason})`)
                  .join(", ")}
                {importPreview.skipped.length > 5 && ` …+${importPreview.skipped.length - 5} more`}
              </p>
            )}

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={confirmImport}
                disabled={importing || importPreview.valid.length === 0}
                className="btn-gold disabled:opacity-60"
              >
                {importing ? "Importing…" : `Import ${importPreview.valid.length} ${importPreview.valid.length === 1 ? "party" : "parties"}`}
              </button>
              <button type="button" onClick={cancelImport} disabled={importing} className="btn-outline px-5 py-2 text-xs">
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Guest list */}
      <section className="paper-plain overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-3">
          <h3 className="font-serif text-2xl font-light text-ink">Guests</h3>
          <span className="font-sans text-xs uppercase tracking-wider text-ink-light">
            {guests.length} {guests.length === 1 ? "party" : "parties"} · {guests.reduce((sum, g) => sum + (g.max_guests || 0), 0)} guests
          </span>
        </div>

        {guests.length === 0 ? (
          <p className="px-6 pb-6 font-sans text-sm text-ink-light">No guests yet. Add your first above.</p>
        ) : (
          <div className="divide-y divide-champagne/10">
            {guests.map((g) => (
              <div key={g.id} className="space-y-3 p-5">
                <div className="grid gap-3 sm:grid-cols-[1.5fr_0.7fr_auto] sm:items-end">
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
                  <div className="flex items-center gap-2 sm:justify-end">
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
                </div>

                {/* Manual RSVP */}
                <div className="flex flex-wrap items-end gap-2 rounded-lg bg-ivory-50/50 p-3">
                  <label className="block">
                    <span className="field-label">RSVP (manual)</span>
                    <select
                      className="input-field"
                      value={rsvpFor(g).status}
                      onChange={(e) =>
                        setRsvpEdits((m) => ({ ...m, [g.id]: { ...(m[g.id] ?? baseRsvp(g)), status: e.target.value } }))
                      }
                    >
                      <option value="">Pending</option>
                      <option value="attending">Attending</option>
                      <option value="not_attending">Can&apos;t attend</option>
                      <option value="maybe">Maybe</option>
                    </select>
                  </label>
                  <label className="block w-24">
                    <span className="field-label">Headcount</span>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      className="input-field"
                      value={rsvpFor(g).count}
                      onChange={(e) =>
                        setRsvpEdits((m) => ({ ...m, [g.id]: { ...(m[g.id] ?? baseRsvp(g)), count: Number(e.target.value) || 0 } }))
                      }
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => saveManualRsvp(g)}
                    disabled={rsvpSavingId === g.id || !rsvpFor(g).status}
                    className="btn-gold px-5 py-2 text-xs disabled:opacity-60"
                  >
                    {rsvpSavingId === g.id ? "Saving…" : "Save RSVP"}
                  </button>
                  <span className="rounded-full bg-champagne/15 px-3 py-1.5 text-center font-sans text-xs capitalize text-champagne-dark">
                    {g.rsvp_status.replace("_", " ")}
                  </span>
                  <span className="ml-auto self-center font-mono text-xs text-ink-light">/invite/{g.guest_code}</span>
                </div>
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
