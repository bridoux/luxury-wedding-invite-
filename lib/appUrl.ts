/**
 * Canonical public origin for building shareable links and auth redirects.
 *
 * Order of preference:
 *  1. NEXT_PUBLIC_SITE_URL — set in Vercel to the production domain. This makes
 *     guest invite links and magic-link / sign-up redirects always point at the
 *     canonical site, no matter which deploy (preview, branch, etc.) the admin
 *     is currently viewing.
 *  2. window.location.origin — local development, where the env var is unset.
 *  3. The production placeholder — server-side fallback when neither is available.
 *
 * Note: this does NOT control where Supabase actually sends auth emails. Supabase
 * only honors a redirect that is on its allow-list (Auth → URL Configuration);
 * otherwise it falls back to the project's Site URL. Keep those in sync with this.
 */
const PLACEHOLDER_ORIGIN = "https://ruthericvowrenewal.xyz";

/**
 * Normalize a configured site URL into a valid absolute origin. Tolerates a
 * missing scheme (prepends https://) and trailing slashes; returns null if it
 * still can't be parsed — so a malformed env var can never crash `new URL()`
 * at build time.
 */
function normalizeOrigin(value: string): string | null {
  let v = value.trim().replace(/\/+$/, "");
  if (!v) return null;
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  try {
    return new URL(v).origin;
  } catch {
    return null;
  }
}

export function getAppOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    const normalized = normalizeOrigin(configured);
    if (normalized) return normalized;
  }
  if (typeof window !== "undefined") return window.location.origin;
  return PLACEHOLDER_ORIGIN;
}

/** Build an absolute app URL for the given path (e.g. appUrl("/admin")). */
export function appUrl(path = "/"): string {
  const origin = getAppOrigin();
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}
