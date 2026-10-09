/** Sign-in providers of the app. Each one must also be enabled in `supabase/config.toml` and on the hosted project. */
export const OAUTH_PROVIDERS = ["discord", "github"] as const;

export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

/** Display names, as the providers write them. */
export const PROVIDER_LABELS: Record<OAuthProvider, string> = {
  discord: "Discord",
  github: "GitHub",
};

/**
 * Tells whether a value received from the outside (a form field, a JWT claim) is a provider we support.
 * @param value - Anything.
 * @returns `true` when `value` is one of {@link OAUTH_PROVIDERS}.
 */
export function isOAuthProvider(value: unknown): value is OAuthProvider {
  return typeof value === "string" && (OAUTH_PROVIDERS as readonly string[]).includes(value);
}
