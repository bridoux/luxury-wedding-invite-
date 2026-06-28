/* ──────────────────────────────────────────────────────────────
 * Lightweight service worker for PWA installability + offline fallback.
 * Strategy:
 *   - Precache the offline page + core assets on install.
 *   - Network-first for navigations, falling back to /offline when offline.
 *   - Stale-while-revalidate for static assets (images, fonts, etc.): serve the
 *     cached copy instantly, then refresh it from the network in the background
 *     so updated/replaced images appear on the next visit.
 * ────────────────────────────────────────────────────────────── */

// Bump this version whenever the caching strategy changes — the activate handler
// deletes every cache that doesn't match, clearing previously stale assets.
const CACHE = "wedding-pwa-v2";
const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Navigation requests → network first, offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((res) => res || new Response("Offline", { status: 503 }))
      )
    );
    return;
  }

  // Static assets → stale-while-revalidate: serve cache immediately, refresh in
  // the background so changed/replaced files (e.g. photos) update next load.
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const network = fetch(request)
            .then((res) => {
              if (res && res.ok) cache.put(request, res.clone());
              return res;
            })
            .catch(() => cached);
          return cached || network;
        })
      )
    );
  }
});
