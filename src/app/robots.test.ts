import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "./robots";
import sitemap from "./sitemap";

afterEach(() => vi.unstubAllEnvs());

describe("robots.txt", () => {
  it("blocks every crawler before launch", () => {
    expect(robots().rules).toEqual([{ userAgent: "*", disallow: "/" }]);
  });

  it("points to the sitemap and the host of the configured site", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://drawtoday.app/");
    expect(robots()).toMatchObject({
      sitemap: "https://drawtoday.app/sitemap.xml",
      host: "https://drawtoday.app",
    });
  });
});

describe("sitemap.xml", () => {
  it("lists only the public home page, with an absolute URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://drawtoday.app");
    expect(sitemap()).toEqual([
      { url: "https://drawtoday.app/", changeFrequency: "weekly", priority: 1 },
    ]);
  });

  it("never lists an authenticated route", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://drawtoday.app");
    for (const entry of sitemap()) {
      expect(entry.url).not.toMatch(/\/(profil|profile|settings|auth|api|design-system)/);
    }
  });
});
