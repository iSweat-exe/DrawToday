import { beforeEach, describe, expect, it, vi } from "vitest";

const signInWithOAuth = vi.fn();
const signOutSession = vi.fn();
const redirect = vi.fn((url: string) => {
  // The real `redirect` never returns: it throws to stop the action.
  throw new Error(`NEXT_REDIRECT ${url}`);
});

vi.mock("next/headers", () => ({ cookies: async () => ({}) }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => redirect(url) }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({ auth: { signInWithOAuth, signOut: signOutSession } }),
}));
vi.mock("@/lib/site", () => ({ getSiteUrl: () => "https://drawtoday.test" }));

import { signInWithProvider, signOut } from "./actions";

const form = (provider?: string) => {
  const data = new FormData();
  if (provider !== undefined) data.set("provider", provider);
  return data;
};

beforeEach(() => vi.clearAllMocks());

describe("signInWithProvider", () => {
  it("sends the user to the provider's authorization page, with the callback as return URL", async () => {
    signInWithOAuth.mockResolvedValue({
      data: { url: "https://project.supabase.co/auth/v1/authorize?provider=github" },
      error: null,
    });
    await expect(signInWithProvider(form("github"))).rejects.toThrow(
      "NEXT_REDIRECT https://project.supabase.co/auth/v1/authorize?provider=github",
    );
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "github",
      options: { redirectTo: "https://drawtoday.test/auth/callback", skipBrowserRedirect: true },
    });
  });

  it("refuses a provider that is not supported, without calling Supabase", async () => {
    for (const value of ["google", "", undefined]) {
      await expect(signInWithProvider(form(value))).rejects.toThrow(
        "NEXT_REDIRECT /connexion?error=provider",
      );
    }
    expect(signInWithOAuth).not.toHaveBeenCalled();
  });

  it("comes back to the sign-in page when Supabase refuses (provider disabled, misconfigured)", async () => {
    signInWithOAuth.mockResolvedValue({ data: { url: null }, error: { message: "disabled" } });
    await expect(signInWithProvider(form("discord"))).rejects.toThrow(
      "NEXT_REDIRECT /connexion?error=oauth",
    );
  });

  it("comes back to the sign-in page when Supabase gives no URL", async () => {
    signInWithOAuth.mockResolvedValue({ data: { url: null }, error: null });
    await expect(signInWithProvider(form("discord"))).rejects.toThrow(
      "NEXT_REDIRECT /connexion?error=oauth",
    );
  });
});

describe("signOut", () => {
  it("ends the session of this device only, then goes home", async () => {
    signOutSession.mockResolvedValue({ error: null });
    await expect(signOut()).rejects.toThrow("NEXT_REDIRECT /");
    expect(signOutSession).toHaveBeenCalledWith({ scope: "local" });
  });
});
