"use client";

import { useEffect } from "react";

/**
 * Registers the service worker for PWA / offline support.
 * Only runs in the browser, in production-capable contexts.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Skip on localhost/dev: a caching SW on a reused local origin serves stale
    // assets across rebuilds and breaks hydration. The PWA/offline cache is only
    // needed on the deployed (HTTPS) site.
    const host = window.location.hostname;
    const isLocal = host === "localhost" || host === "127.0.0.1" || host === "[::1]";
    if (isLocal) {
      // Proactively clean up any SW already installed during earlier local runs.
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      if (window.caches) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
      return;
    }

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("SW registration failed:", err));
    };

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
