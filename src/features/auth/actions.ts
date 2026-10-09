"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isOAuthProvider } from "@/lib/auth/providers";
import { getSiteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

/**
 * Starts the sign-in with a provider (PKCE flow): Supabase gives the provider's authorization URL, and the browser
 * comes back on `/auth/callback` with a one-time code. The provider comes from a form, so it is validated here.
 * @param formData - Must carry a `provider` field naming a supported provider.
 */
export async function signInWithProvider(formData: FormData): Promise<void> {
  const provider = formData.get("provider");
  if (!isOAuthProvider(provider)) redirect("/connexion?error=provider");

  const supabase = createClient(await cookies());
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    // Must be in the redirect allow-list of the Supabase project (`additional_redirect_urls`).
    options: { redirectTo: `${getSiteUrl()}/auth/callback`, skipBrowserRedirect: true },
  });
  if (error || !data.url) redirect("/connexion?error=oauth");

  redirect(data.url);
}

/**
 * Signs out of this device only (the other devices of the user stay signed in) and goes back to the home page,
 * as a guest.
 */
export async function signOut(): Promise<void> {
  const supabase = createClient(await cookies());
  await supabase.auth.signOut({ scope: "local" });
  redirect("/");
}
