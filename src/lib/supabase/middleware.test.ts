import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getClaims = vi.fn();
const createServerClient = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: (...args: unknown[]) => {
    createServerClient(...args);
    return { auth: { getClaims } };
  },
}));

import { updateSession } from "./middleware";

beforeEach(() => {
  vi.clearAllMocks();
  getClaims.mockResolvedValue({ data: { claims: null } });
});

describe("updateSession", () => {
  it("validates the session so that Supabase can refresh the cookies", async () => {
    await updateSession(new NextRequest("http://localhost/"));
    expect(getClaims).toHaveBeenCalledTimes(1);
  });

  it("uses the fixed cookie name the proxy matcher relies on", async () => {
    await updateSession(new NextRequest("http://localhost/"));
    expect(createServerClient.mock.calls[0]?.[2]).toMatchObject({
      cookieOptions: { name: "drawtoday-auth" },
    });
  });

  it("lets the request through", async () => {
    const response = await updateSession(new NextRequest("http://localhost/"));
    expect(response.status).toBe(200);
  });
});
