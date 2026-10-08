import { expect, test } from "@playwright/test";

// Smoke tests run against a production build with placeholder Supabase variables (see playwright.config.ts): the
// database is unreachable on purpose, so every test must pass without it. Add the critical user journeys
// (sign-in, doing an exercise, watching a video) next to this file as the features land.
test.describe("app shell", () => {
  test("serves the home page with the brand in the header", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Accueil" })).toBeVisible();
    await expect(page.getByRole("banner").getByRole("link", { name: "DrawToday" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  test("an unknown route shows the not-found page", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page introuvable" })).toBeVisible();
  });

  test("the page can be zoomed (accessibility: zoom is never disabled)", async ({ page }) => {
    await page.goto("/");
    const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
    expect(viewport).toContain("width=device-width");
    expect(viewport).not.toContain("user-scalable=no");
    expect(viewport).not.toContain("maximum-scale");
  });

  test("on a touch screen text fields stay at 16 px, so iOS never zooms in on focus", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "touch screens only");
    await page.goto("/");
    const size = await page.evaluate(() => {
      const input = document.createElement("input");
      input.type = "text";
      document.body.append(input);
      return getComputedStyle(input).fontSize;
    });
    expect(size).toBe("16px");
  });
});

test.describe("PWA and SEO files", () => {
  test("exposes a valid web app manifest", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.ok()).toBe(true);
    const manifest = await response.json();
    expect(manifest.name).toBe("DrawToday");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
  });

  test("every icon of the manifest exists", async ({ request }) => {
    const manifest = await (await request.get("/manifest.webmanifest")).json();
    for (const icon of manifest.icons as { src: string }[]) {
      expect((await request.get(icon.src)).ok(), icon.src).toBe(true);
    }
  });

  test("serves the service worker without caching", async ({ request }) => {
    const response = await request.get("/sw.js");
    expect(response.ok()).toBe(true);
    expect(response.headers()["cache-control"]).toContain("no-cache");
  });

  test("icons are cacheable for a day, not revalidated on every load", async ({ request }) => {
    const response = await request.get("/icons/icon-192.png");
    expect(response.ok()).toBe(true);
    expect(response.headers()["cache-control"]).toContain("max-age=86400");
  });

  test("serves robots.txt and sitemap.xml", async ({ request }) => {
    expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /");
    expect(await (await request.get("/sitemap.xml")).text()).toContain("<urlset");
  });
});

test.describe("operations endpoints", () => {
  test("the keep-alive route answers with JSON and is never cached", async ({ request }) => {
    const response = await request.get("/api/keep-alive");
    // 200 when the database answers, 503 when it cannot be reached (the e2e environment has no database).
    expect([200, 503]).toContain(response.status());
    expect(response.headers()["cache-control"]).toBe("no-store");
    expect(await response.json()).toHaveProperty("ok");
  });

  test("the health route exposes nothing but a status and is never cached", async ({ request }) => {
    const response = await request.get("/api/health");
    expect([200, 503]).toContain(response.status());
    expect(response.headers()["cache-control"]).toBe("no-store");
    const body = await response.json();
    expect(Object.keys(body)).toEqual(["status"]);
    expect(["ok", "down"]).toContain(body.status);
  });
});

test.describe("security headers", () => {
  test("sends the baseline security headers", async ({ request }) => {
    const headers = (await request.get("/")).headers();
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["content-security-policy"]).toContain("object-src 'none'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBeTruthy();
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["strict-transport-security"]).toContain("max-age=");
  });

  test("renders pages without CSP violations", async ({ page }) => {
    const violations: string[] = [];
    page.on("console", (message) => {
      if (message.text().includes("Content Security Policy")) violations.push(message.text());
    });
    await page.goto("/");
    await page.goto("/this-page-does-not-exist");
    expect(violations).toEqual([]);
  });
});
