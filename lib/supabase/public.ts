import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

let client: SupabaseClient | null = null;

/** Every public CMS read is tagged so admin saves can expire it immediately (see revalidatePublic). */
export const CMS_CACHE_TAG = "cms";

const taggedFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, next: { revalidate: 3600, tags: [CMS_CACHE_TAG] } });

/**
 * Cookie-free anonymous client for public reads.
 *
 * Because it never touches request cookies, pages that use it can be statically
 * generated and revalidated (ISR). It only ever sees rows that RLS exposes to
 * `anon`, i.e. published content. Returns null when Supabase is not configured
 * so the site can still build and render empty states.
 */
export function getPublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: taggedFetch },
    });
  }
  return client;
}
