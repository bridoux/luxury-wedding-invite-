"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { appUrl } from "@/lib/appUrl";
import { useWeddingConfig } from "@/components/WeddingConfigProvider";
import AdminSettings from "@/components/AdminSettings";
import AdminGuests from "@/components/AdminGuests";
import AdminContent from "@/components/AdminContent";
import AdminTheme from "@/components/AdminTheme";
import AdminVisibility from "@/components/AdminVisibility";

/**
 * Admin dashboard.
 *  - Supabase configured → Supabase Auth login → claim_admin() → live data.
 *  - Not configured       → graceful mock view (so the route still renders).
 *
 * RLS does the real protection: only users in admin_users (granted via
 * claim_admin for allow-listed emails) can read guests/rsvps.
 */

interface GuestRow {
  guest_code: string;
  full_name: string;
  party_label: string | null;
  max_guests: number;
  invite_status: string;
  rsvp_status: string;
  opened_at: string | null;
}

interface RsvpRow {
  full_name: string;
  email: string | null;
  attendance_status: "attending" | "not_attending" | "maybe";
  guest_count: number;
  meal_preference: string | null;
  dietary_restrictions: string | null;
  accommodation_needed: boolean;
  message: string | null;
  guest_code: string | null;
  created_at: string;
}

type Phase = "loading" | "login" | "denied" | "ready";

// ── Mock data (only used when Supabase isn't configured) ───────────────
const MOCK_GUESTS: GuestRow[] = [
  { guest_code: "amara", full_name: "Amara Okafor", party_label: "Amara Okafor", max_guests: 2, invite_status: "opened", rsvp_status: "attending", opened_at: new Date().toISOString() },
  { guest_code: "the-bennetts", full_name: "The Bennett Family", party_label: "The Bennett Family", max_guests: 4, invite_status: "sent", rsvp_status: "pending", opened_at: null },
  { guest_code: "james", full_name: "James Carter", party_label: "James Carter", max_guests: 1, invite_status: "responded", rsvp_status: "attending", opened_at: new Date().toISOString() }
];
const MOCK_RSVPS: RsvpRow[] = [
  { full_name: "Amara Okafor", email: "amara@example.com", attendance_status: "attending", guest_count: 2, meal_preference: "Beef Tenderloin", dietary_restrictions: null, accommodation_needed: false, message: "So happy for you both! 💛", guest_code: "amara", created_at: new Date().toISOString() },
  { full_name: "James Carter", email: "james@example.com", attendance_status: "attending", guest_count: 1, meal_preference: "Pan-Seared Salmon", dietary_restrictions: "Gluten-free", accommodation_needed: true, message: "Wouldn't miss it.", guest_code: "james", created_at: new Date().toISOString() }
];

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="paper-card relative px-5 py-6">
      <p className="font-sans text-xs uppercase tracking-[0.2em] text-ink-light">{label}</p>
      <p className={`mt-2 font-serif text-4xl font-light ${accent}`}>{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const weddingConfig = useWeddingConfig();
  const [tab, setTab] = useState<"overview" | "guests" | "settings" | "content" | "design" | "sections">("overview");
  const [phase, setPhase] = useState<Phase>(isSupabaseConfigured ? "loading" : "ready");
  const [session, setSession] = useState<Session | null>(null);
  const [guests, setGuests] = useState<GuestRow[]>(isSupabaseConfigured ? [] : MOCK_GUESTS);
  const [rsvps, setRsvps] = useState<RsvpRow[]>(isSupabaseConfigured ? [] : MOCK_RSVPS);
  const [loadError, setLoadError] = useState<string | null>(null);
  const mockMode = !isSupabaseConfigured;

  const loadData = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const [g, r] = await Promise.all([
      supabase.from("guests").select("guest_code,full_name,party_label,max_guests,invite_status,rsvp_status,opened_at").order("full_name"),
      supabase.from("rsvps").select("full_name,email,attendance_status,guest_count,meal_preference,dietary_restrictions,accommodation_needed,message,guest_code,created_at").order("created_at", { ascending: false })
    ]);
    if (g.error) setLoadError(g.error.message);
    if (r.error) setLoadError(r.error.message);
    setGuests((g.data as GuestRow[]) ?? []);
    setRsvps((r.data as RsvpRow[]) ?? []);
  }, []);

  const claimAndLoad = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data: isAdmin, error } = await supabase.rpc("claim_admin");
    if (error || !isAdmin) {
      setPhase("denied");
      return;
    }
    await loadData();
    setPhase("ready");
  }, [loadData]);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return; // mock mode

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) void claimAndLoad();
      else setPhase("login");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) void claimAndLoad();
      else setPhase("login");
    });
    return () => sub.subscription.unsubscribe();
  }, [claimAndLoad]);

  // ── derived stats ────────────────────────────────────────────────────
  const responses = rsvps.length;
  const attending = rsvps.filter((r) => r.attendance_status === "attending");
  const notAttending = rsvps.filter((r) => r.attendance_status === "not_attending").length;
  const maybe = rsvps.filter((r) => r.attendance_status === "maybe").length;
  const headcount = attending.reduce((sum, r) => sum + (r.guest_count || 0), 0);
  const pending = guests.filter((g) => g.rsvp_status === "pending").length;
  const opened = guests.filter((g) => g.invite_status !== "sent" || g.opened_at).length;

  const meals = Object.entries(
    rsvps.reduce<Record<string, number>>((acc, r) => {
      if (r.meal_preference) acc[r.meal_preference] = (acc[r.meal_preference] || 0) + (r.guest_count || 1);
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);
  const maxMeal = Math.max(1, ...meals.map(([, n]) => n));

  const messages = rsvps.filter((r) => r.message);

  const exportCsv = () => {
    const header = ["full_name", "email", "attendance_status", "guest_count", "meal_preference", "dietary_restrictions", "accommodation_needed", "guest_code", "message", "created_at"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = rsvps.map((r) => [r.full_name, r.email, r.attendance_status, r.guest_count, r.meal_preference, r.dietary_restrictions, r.accommodation_needed, r.guest_code, r.message, r.created_at].map(esc).join(","));
    const csv = [header.join(","), ...rows].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `rsvps-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const signOut = async () => {
    await getSupabase()?.auth.signOut();
  };

  // ── render states ────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-ivory">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-champagne/30 border-t-champagne" />
      </main>
    );
  }

  if (phase === "login") return <LoginCard />;

  if (phase === "denied") {
    return (
      <main className="flex min-h-[100svh] flex-col items-center justify-center bg-ivory px-6 text-center">
        <h1 className="font-serif text-3xl text-ink">Not authorized</h1>
        <p className="mt-2 max-w-sm font-sans text-sm text-ink-soft">
          {session?.user?.email
            ? `${session.user.email} is signed in but isn't an admin for this wedding.`
            : "This account isn't an admin."}
        </p>
        <button type="button" onClick={signOut} className="btn-outline mt-6">
          Sign out
        </button>
      </main>
    );
  }

  // phase === "ready"
  return (
    <div className="mx-auto min-h-[100svh] w-full max-w-6xl px-5 py-10 sm:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow-plain text-[0.62rem]">Admin Dashboard</p>
          <h1 className="mt-1 font-serif text-4xl font-light text-ink">{weddingConfig.couple.combined}</h1>
          {mockMode ? (
            <p className="mt-1 font-sans text-xs text-champagne-dark">Demo data — connect Supabase to go live.</p>
          ) : (
            <p className="mt-1 font-sans text-xs text-ink-light">{session?.user?.email}</p>
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={exportCsv} className="btn-outline">⬇ Export CSV</button>
          {!mockMode && (
            <button type="button" onClick={signOut} className="btn-outline">Sign out</button>
          )}
        </div>
      </header>

      {loadError && (
        <p className="mb-6 rounded-lg bg-blush-light/60 px-4 py-2 font-sans text-sm text-blush-dark">{loadError}</p>
      )}

      {/* Tabs */}
      <div className="mb-8 flex gap-2 border-b border-champagne/20">
        {([["overview", "Overview"], ["guests", "Guests"], ["settings", "Wedding Details"], ["content", "Content"], ["design", "Design"], ["sections", "Sections"]] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`-mb-px border-b-2 px-4 py-2 font-sans text-sm uppercase tracking-[0.15em] transition-colors ${
              tab === id ? "border-champagne text-ink" : "border-transparent text-ink-light hover:text-ink-soft"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "guests" && <AdminGuests />}

      {tab === "content" && <AdminContent />}

      {tab === "settings" && <AdminSettings />}

      {tab === "design" && <AdminTheme />}

      {tab === "sections" && <AdminVisibility />}

      {tab === "overview" && (
      <>
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Invited (parties)" value={guests.length} accent="text-ink" />
        <StatCard label="Attending (headcount)" value={headcount} accent="text-sage-dark" />
        <StatCard label="Can't Attend" value={notAttending} accent="text-blush-dark" />
        <StatCard label="Pending" value={pending} accent="text-champagne-dark" />
      </section>

      <section className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Responses" value={responses} accent="text-ink" />
        <StatCard label="Maybe" value={maybe} accent="text-ink-soft" />
        <StatCard label="Invites Opened" value={opened} accent="text-ink-soft" />
        <StatCard label="Guests (rows)" value={guests.length} accent="text-ink-soft" />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Meal preferences */}
        <section className="paper-card relative p-6">
          <h2 className="mb-4 font-serif text-2xl font-light text-ink">Meal Preferences</h2>
          {meals.length === 0 ? (
            <p className="font-sans text-sm text-ink-light">No meal selections yet.</p>
          ) : (
            <ul className="space-y-3">
              {meals.map(([name, count]) => (
                <li key={name}>
                  <div className="flex justify-between font-sans text-sm text-ink-soft">
                    <span>{name}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-ivory-200">
                    <div className="h-full rounded-full bg-gradient-to-r from-champagne-dark to-champagne-light" style={{ width: `${(count / maxMeal) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Messages */}
        <section className="paper-card relative p-6">
          <h2 className="mb-4 font-serif text-2xl font-light text-ink">Guest Messages</h2>
          {messages.length === 0 ? (
            <p className="font-sans text-sm text-ink-light">No messages yet.</p>
          ) : (
            <ul className="max-h-80 space-y-4 overflow-y-auto pr-1">
              {messages.map((m, i) => (
                <li key={i} className="rounded-lg bg-ivory-50/70 p-4">
                  <p className="font-serif text-lg text-ink">{m.full_name}</p>
                  <p className="font-sans text-sm text-ink-soft">“{m.message}”</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Guest list */}
      <section className="paper-plain mt-6 overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-3">
          <h2 className="font-serif text-2xl font-light text-ink">Guest List</h2>
          <span className="font-sans text-xs uppercase tracking-wider text-ink-light">{guests.length} parties</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm">
            <thead className="border-y border-champagne/20 bg-ivory-200/40 text-xs uppercase tracking-wider text-ink-light">
              <tr>
                <th className="px-6 py-3">Guest</th>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Max</th>
                <th className="px-6 py-3">Opened</th>
                <th className="px-6 py-3">RSVP</th>
                <th className="px-6 py-3">Invite Link</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((g) => (
                <tr key={g.guest_code} className="border-b border-champagne/10">
                  <td className="px-6 py-3 text-ink">{g.party_label ?? g.full_name}</td>
                  <td className="px-6 py-3 font-mono text-xs text-ink-soft">{g.guest_code}</td>
                  <td className="px-6 py-3 text-ink-soft">{g.max_guests}</td>
                  <td className="px-6 py-3 text-ink-soft">{g.opened_at ? "✓" : "—"}</td>
                  <td className="px-6 py-3">
                    <span className="rounded-full bg-champagne/15 px-3 py-1 text-xs capitalize text-champagne-dark">{g.rsvp_status.replace("_", " ")}</span>
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-champagne-dark">/invite/{g.guest_code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-dashed border-champagne/40 bg-ivory-50/50 p-6">
        <h2 className="font-serif text-xl text-ink">Coming soon</h2>
        <ul className="mt-2 grid gap-1 font-sans text-sm text-ink-soft sm:grid-cols-2">
          <li>• Add / edit guests inline</li>
          <li>• Unique invite-link + QR generation</li>
          <li>• QR check-in at the venue</li>
          <li>• Email reminders to pending guests</li>
        </ul>
      </section>
      </>
      )}
    </div>
  );
}

// ── Login card (email/password + magic link) ─────────────────────────────
function LoginCard() {
  const weddingConfig = useWeddingConfig();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const signInPassword = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setErr(error.message);
    setBusy(false);
  };

  const signUp = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: appUrl("/admin") }
    });
    if (error) setErr(error.message);
    else setMsg("Account created. Check your email to confirm, then sign in.");
    setBusy(false);
  };

  const magicLink = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: appUrl("/admin") }
    });
    if (error) setErr(error.message);
    else setMsg("Magic link sent. Check your email and click it to sign in.");
    setBusy(false);
  };

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-romantic-gradient px-6">
      <div className="paper-card relative w-full max-w-sm px-8 py-10">
        <div className="relative z-20">
          <p className="eyebrow-plain text-center text-[0.62rem]">Admin Access</p>
          <h1 className="mt-2 text-center font-serif text-3xl font-light text-ink">{weddingConfig.couple.combined}</h1>
          <div className="gold-divider" />

          <label htmlFor="admin-email" className="field-label">Email</label>
          <input id="admin-email" type="email" autoComplete="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />

          <label htmlFor="admin-pw" className="field-label mt-4">Password</label>
          <input id="admin-pw" type="password" autoComplete="current-password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

          {err && <p className="mt-3 rounded-lg bg-blush-light/60 px-3 py-2 text-center font-sans text-xs text-blush-dark">{err}</p>}
          {msg && <p className="mt-3 rounded-lg bg-sage-light/30 px-3 py-2 text-center font-sans text-xs text-ink-soft">{msg}</p>}

          <button type="button" onClick={signInPassword} disabled={busy || !email} className="btn-gold mt-5 w-full disabled:opacity-60">
            {busy ? "…" : "Sign In"}
          </button>

          <div className="mt-4 flex items-center justify-between gap-3 text-center">
            <button type="button" onClick={magicLink} disabled={busy || !email} className="flex-1 font-sans text-xs uppercase tracking-[0.15em] text-champagne-dark underline-offset-4 hover:underline disabled:opacity-50">
              Email me a link
            </button>
            <button type="button" onClick={signUp} disabled={busy || !email || !password} className="flex-1 font-sans text-xs uppercase tracking-[0.15em] text-ink-soft underline-offset-4 hover:underline disabled:opacity-50">
              Create account
            </button>
          </div>

          <p className="mt-6 text-center font-sans text-[0.65rem] text-ink-light">
            Only allow-listed wedding owners gain admin access.
          </p>
        </div>
      </div>
    </main>
  );
}
