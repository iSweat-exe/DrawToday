import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { callbackErrorCode } from "@/features/auth/messages";
import { createClient } from "@/lib/supabase/server";

/**
 * Where a provider sends the user back after the consent screen: trades the one-time `code` for a session (the
 * cookies are written by the Supabase client), then goes home. Every failure goes back to the sign-in page with a
 * code, never with a detail: the provider's message is not ours to show.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const fail = (error: string) =>
    NextResponse.redirect(new URL(`/connexion?error=${error}`, request.url));

  if (!code) return fail(callbackErrorCode(searchParams.get("error")));

  const supabase = createClient(await cookies());
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return fail("oauth");

  return NextResponse.redirect(new URL("/", request.url));
}
