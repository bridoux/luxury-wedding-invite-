# Luxury Wedding Invitation PWA — Ruth & Eric 💛

A premium, mobile-first, interactive digital wedding invitation that feels like a
luxury Canva-designed card brought to life — with real app functionality: RSVP,
countdown, gallery lightbox, personalized guest links, admin dashboard, and full
PWA / offline support.

Built with **Next.js 14 (App Router) · React · TypeScript · Tailwind CSS ·
Framer Motion · React Hook Form · Supabase (optional)**.

---

## 1. What was created

A complete, runnable invitation experience:

| Area | Details |
|---|---|
| **Opening envelope** | Animated full-screen monogram intro with "Open Invitation" |
| **Invitation hero** | Names, date, message, CTAs (RSVP / Details / Location / Add to Calendar) |
| **Countdown** | Live animated days/hours/minutes/seconds to the wedding date |
| **Our Story** | Scroll-reveal romantic timeline |
| **Wedding Details** | Elegant icon cards (ceremony, reception, dress code, contact, timing) |
| **Location** | Embedded map + Open in Google Maps + parking/travel notes |
| **Dress Code** | Colour palette circles, suggested attire, what to avoid |
| **Gallery** | Responsive grid with animated lightbox (keyboard + swipe nav) |
| **Gift / Registry** | Registry, honeymoon fund, bank contribution, privacy note |
| **RSVP** | Validated multi-field form, conditional fields, success state, Supabase-ready |
| **Thank-you** | Confirmation summary + add-to-calendar |
| **Admin dashboard** | `/admin` placeholder with mock stats, meal chart, guest table, CSV export |
| **Guest links** | `/invite/[guestCode]` personalized greeting (mock data, Supabase-ready) |
| **Navigation** | Floating bottom nav + full-screen menu overlay (no boring navbar) |
| **PWA** | Manifest, service worker, offline page, installable, Apple web-app tags |
| **Ambience** | Floating petals, glassmorphism cards, gold dividers, background music toggle |

Everything respects `prefers-reduced-motion` and is keyboard accessible.

---

## 2. File structure

```
luxury-wedding-pwa/
├── app/
│   ├── layout.tsx              # Fonts, metadata, PWA tags, SW registration
│   ├── globals.css             # Design system (Tailwind + custom components)
│   ├── page.tsx                # Home → full InvitationExperience
│   ├── loading.tsx             # Branded loading state
│   ├── error.tsx               # Error boundary
│   ├── not-found.tsx           # 404
│   ├── offline/page.tsx        # PWA offline fallback
│   ├── rsvp/page.tsx           # Standalone RSVP (redirects to thank-you)
│   ├── thank-you/page.tsx      # Confirmation page
│   ├── admin/page.tsx          # Admin dashboard (placeholder)
│   └── invite/[guestCode]/page.tsx   # Personalized guest invite
├── components/                 # All UI components (see spec §17)
├── lib/
│   ├── config.ts               # ⭐ SINGLE source of truth for ALL content
│   ├── supabaseClient.ts       # Lazy Supabase client (optional)
│   ├── rsvpService.ts          # Submit RSVP (Supabase or mock fallback)
│   ├── mockGuests.ts           # Local guest data + getGuestByCode()
│   └── calendar.ts             # Google Calendar + .ics generation
├── types/                      # guest.ts, rsvp.ts
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   ├── icons/                  # icon.svg (+ add icon-192/512.png)
│   └── images/                 # Drop real photos here
├── supabase/schema.sql         # Run in Supabase to enable persistence
└── .env.example                # Copy to .env.local for Supabase
```

---

## 3. Run locally

```bash
cd luxury-wedding-pwa
npm install
npm run dev
```

Open http://localhost:3000. The app runs fully **without any backend** — RSVP
submissions are gracefully mocked and show a success state.

Useful routes:
- `/` — full invitation
- `/invite/amara` — personalized guest link (try `amara`, `the-bennetts`, `james`)
- `/invite/unknown` — graceful fallback
- `/rsvp` — standalone RSVP → `/thank-you`
- `/admin` — admin dashboard

---

## 4. Configure Supabase later (optional)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql`.
3. Copy `.env.example` → `.env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Restart the dev server. RSVPs now persist to the `rsvps` table.

When the env vars are absent, the app automatically falls back to mock mode —
no code changes needed.

---

## 5. Deploy to Vercel

1. Push this folder to a Git repo (GitHub/GitLab/Bitbucket).
2. Import it at [vercel.com/new](https://vercel.com/new).
3. (Optional) add the two `NEXT_PUBLIC_SUPABASE_*` env vars in project settings.
4. Deploy. No secrets are hardcoded; the build is production-ready.

---

## 6. What to customize manually

- **`lib/config.ts`** — names, date, venues, story, gallery, dress code, gifts,
  contact, maps URL, music. This is the main thing to edit.
- **`public/images/`** — add real photos (`story-*.jpg`, `gallery-*.jpg`).
- **`public/icons/`** — add `icon-192.png` & `icon-512.png` for best install UX.
- **`public/audio/theme.mp3`** — add to enable the music toggle.
- **Google Maps** — swap `location.googleMapsEmbed` / `googleMapsUrl` for your venue.
- **Guests** — edit `lib/mockGuests.ts` (or move to Supabase `guests` table).

---

## 7. Recommended next steps

1. Wire the `/admin` dashboard to live Supabase queries (replace mock data).
2. Add **Supabase Auth** to protect `/admin` (current gate is a placeholder).
3. Generate unique invite links + QR codes for venue check-in.
4. Track `opened_at` on the guests table when an invite link is viewed.
5. Add real PNG app icons + an Open Graph share image.
6. Optional: email confirmations via a Supabase Edge Function on RSVP insert.

---

*Made with love for Ruth & Eric · August 18, 2026* ✨
