/* ──────────────────────────────────────────────────────────────
 * Lightweight service worker for PWA installability + offline fallback.
 * Strategy:
 *   - Precache the offline page + core assets on install.
 *   - Network-first for navigations, falling back to /offline when offline.
 *   - Cache-first for static assets (images, fonts, etc.).
 * ────────────────────────────────────────────────────────────── */

const CACHE = "wedding-pwa-v1";
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

  // Static assets → cache first, then network (and cache it).
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
            return res;
          })
      )
    );
  }
});
