import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Lazily-created Supabase browser client.
 *
 * The app is designed to run WITHOUT Supabase configured — in that case
 * `getSupabase()` returns `null` and callers fall back to mocked behavior.
 *
 * To enable live persistence, set in `.env.local`:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(supabaseUrl as string, supabaseAnonKey as string, {
      // Never let Next.js cache Supabase responses. This keeps server-rendered
      // pages reading the LATEST wedding_settings (so admin edits appear live)
      // and is a harmless no-op in the browser.
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          fetch(input, { ...init, cache: "no-store" })
      }
    });
  }
  return client;
}
