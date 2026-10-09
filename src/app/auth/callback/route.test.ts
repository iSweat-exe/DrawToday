import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.fn();
vi.mock("next/headers", () => ({ cookies: async () => ({}) }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({ auth: { exchangeCodeForSession } }),
}));

import { GET } from "./route";

const call = (query: string) => GET(new NextRequest(`http://localhost:3000/auth/callback${query}`));
const location = (response: Response) => new URL(response.headers.get("location")!);

beforeEach(() => vi.clearAllMocks());

describe("GET /auth/callback", () => {
  it("trades the code for a session and goes home", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });
    const response = await call("?code=abc");
    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(location(response).pathname).toBe("/");
  });

  it("goes back to the sign-in page when the code is refused", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: { message: "invalid grant" } });
    const url = location(await call("?code=stale"));
    expect(url.pathname + url.search).toBe("/connexion?error=oauth");
  });

  it("tells a refusal at the provider from a failure, without calling Supabase", async () => {
    const denied = location(await call("?error=access_denied&error_description=nope"));
    expect(denied.search).toBe("?error=denied");
    const failed = location(await call("?error=server_error"));
    expect(failed.search).toBe("?error=oauth");
    const empty = location(await call(""));
    expect(empty.search).toBe("?error=oauth");
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("never echoes what the provider wrote in the redirect", async () => {
    const response = await call("?error=access_denied&error_description=%3Cscript%3E");
    expect(response.headers.get("location")).not.toContain("script");
  });
});
