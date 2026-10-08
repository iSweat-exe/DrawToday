import { afterEach, describe, expect, it, vi } from "vitest";
import { getSiteUrl } from "./site";

describe("getSiteUrl", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("prefers NEXT_PUBLIC_SITE_URL and strips the trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://drawtoday.app/");
    expect(getSiteUrl()).toBe("https://drawtoday.app");
  });

  it("falls back to the Vercel production domain", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "drawtoday.vercel.app");
    expect(getSiteUrl()).toBe("https://drawtoday.vercel.app");
  });

  it("falls back to localhost", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});
