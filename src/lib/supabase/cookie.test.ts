import { describe, expect, it } from "vitest";
import { AUTH_COOKIE_NAME, authCookieOptions } from "./cookie";

describe("auth cookie", () => {
  it("has a fixed name that does not depend on the Supabase project", () => {
    expect(AUTH_COOKIE_NAME).toBe("drawtoday-auth");
    expect(AUTH_COOKIE_NAME).not.toMatch(/^sb-/);
  });

  it("is what every client receives", () => {
    expect(authCookieOptions).toEqual({ name: AUTH_COOKIE_NAME });
  });
});
