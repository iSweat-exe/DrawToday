import { isOAuthProvider, type OAuthProvider } from "./providers";

/**
 * Who is using the app. A **guest** has no session: they can read the public content, but nothing is saved in the
 * cloud (what they do stays on their device). A **user** signed in with a provider.
 */
export type Account =
  | { kind: "guest" }
  | {
      kind: "user";
      id: string;
      name: string;
      /** Always an `https` URL on one of {@link AVATAR_HOSTS} (the only image origins the CSP allows), or `null`. */
      avatarUrl: string | null;
      provider: OAuthProvider | null;
    };

export const GUEST: Account = { kind: "guest" };

/**
 * Origins serving the profile pictures of the providers. They must also be listed in the `img-src` of the CSP
 * (`next.config.ts`, checked by `src/ci/next-config.test.ts`).
 */
export const AVATAR_HOSTS = ["cdn.discordapp.com", "avatars.githubusercontent.com"] as const;

const FALLBACK_NAME = "Artiste";

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function firstText(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") return value.trim();
  }
  return undefined;
}

function safeAvatarUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    const allowed = (AVATAR_HOSTS as readonly string[]).includes(url.hostname);
    return url.protocol === "https:" && allowed ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Builds the account from the (already verified) claims of a Supabase session.
 * @param claims - The JWT claims returned by `supabase.auth.getClaims()`, or anything when there is no session.
 * @returns The signed-in user, or the guest when the claims carry no user id.
 */
export function accountFromClaims(claims: unknown): Account {
  const { sub, app_metadata, user_metadata } = asRecord(claims);
  if (typeof sub !== "string" || sub === "") return GUEST;

  const meta = asRecord(user_metadata);
  const provider = asRecord(app_metadata).provider;
  return {
    kind: "user",
    id: sub,
    // Discord keeps the chosen display name in `custom_claims.global_name`; GitHub in `name` / `user_name`.
    name:
      firstText(
        asRecord(meta.custom_claims).global_name,
        meta.full_name,
        meta.name,
        meta.user_name,
        meta.preferred_username,
      ) ?? FALLBACK_NAME,
    avatarUrl: safeAvatarUrl(meta.avatar_url),
    provider: isOAuthProvider(provider) ? provider : null,
  };
}

/**
 * Initials shown in an avatar when there is no picture.
 * @param name - A display name.
 * @returns One or two upper-case letters (or digits), `?` when the name has none.
 */
export function initialsOf(name: string): string {
  const words = name.match(/[\p{L}\p{N}]+/gu) ?? [];
  const letters = words.length > 1 ? [words[0], words[1]] : [words[0]];
  const initials = letters
    .map((word) => (word ? Array.from(word)[0] : ""))
    .join("")
    .toUpperCase();
  return initials || "?";
}
