import { beforeEach, describe, expect, it, vi } from "vitest";

const getClaims = vi.fn();
vi.mock("next/headers", () => ({ cookies: async () => ({}) }));
vi.mock("@/lib/supabase/server", () => ({ createClient: () => ({ auth: { getClaims } }) }));
// `cache` is per request on the server; here it would keep the first answer for the whole file.
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  cache: <T>(fn: T) => fn,
}));

import { getCurrentAccount } from "./account";

beforeEach(() => vi.clearAllMocks());

describe("getCurrentAccount", () => {
  it("is the signed-in user when the session is valid", async () => {
    getClaims.mockResolvedValue({
      data: { claims: { sub: "abc", user_metadata: { name: "Ada" } } },
      error: null,
    });
    expect(await getCurrentAccount()).toMatchObject({ kind: "user", id: "abc", name: "Ada" });
  });

  it("is a guest without a session", async () => {
    getClaims.mockResolvedValue({ data: null, error: null });
    expect(await getCurrentAccount()).toEqual({ kind: "guest" });
  });

  it("is a guest, and never throws, when Supabase fails", async () => {
    getClaims.mockRejectedValue(new Error("network"));
    expect(await getCurrentAccount()).toEqual({ kind: "guest" });
  });
});
