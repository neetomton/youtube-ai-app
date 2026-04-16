export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Returns true when Supabase environment variables are configured. Phase 2
 * code degrades gracefully when the user has not yet set up a Supabase project
 * — the dashboard remains accessible but no auth is enforced.
 */
export function isSupabaseConfigured() {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}
