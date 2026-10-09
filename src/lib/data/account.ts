import { cookies } from "next/headers";
import { cache } from "react";
import { type Account, accountFromClaims, GUEST } from "@/lib/auth/account";
import { createClient } from "@/lib/supabase/server";

/**
 * Tells who is using the app for the current request. Deduplicated per request, so the header, the page and an
 * action can all ask without checking the session twice. Without a session cookie nothing leaves the server.
 * @returns The signed-in user, or the guest (also when the session is invalid or Supabase is unreachable).
 */
export const getCurrentAccount = cache(async (): Promise<Account> => {
  try {
    const supabase = createClient(await cookies());
    const { data } = await supabase.auth.getClaims();
    return accountFromClaims(data?.claims);
  } catch {
    return GUEST;
  }
});
