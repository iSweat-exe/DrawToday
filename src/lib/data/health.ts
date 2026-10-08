import { createPublicClient } from "@/lib/supabase/public";

/**
 * Pings the database with the cheapest possible call (`public.keep_alive()`, no table involved).
 * Used by the daily keep-alive cron and by the public health check.
 * @returns `true` when PostgREST and Postgres answered, `false` on any error (never throws).
 */
export async function pingDatabase(): Promise<boolean> {
  try {
    const { data, error } = await createPublicClient().rpc("keep_alive");
    return !error && data === true;
  } catch {
    return false;
  }
}
