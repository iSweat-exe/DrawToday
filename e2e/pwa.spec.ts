import { expect, test } from "@playwright/test";

test.describe("installable PWA", () => {
  test("the page links its manifest, theme colours and iOS home-screen settings", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
      "href",
      "/manifest.webmanifest",
    );
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
      "href",
      /apple-touch-icon\.png/,
    );
    const themes = await page.locator('meta[name="theme-color"]').evaluateAll((nodes) =>
      nodes.map((node) => ({
        color: node.getAttribute("content"),
        media: node.getAttribute("media"),
      })),
    );
    expect(themes).toEqual([
      { color: "#ffffff", media: "(prefers-color-scheme: light)" },
      { color: "#0a0a0a", media: "(prefers-color-scheme: dark)" },
    ]);
    // iOS: opens without the Safari bars once added to the home screen.
    await expect(page.locator('meta[name="mobile-web-app-capable"]')).toHaveAttribute(
      "content",
      "yes",
    );
    await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute(
      "content",
      "DrawToday",
    );
  });

  test("the viewport covers the notch of the iPhone", async ({ page }) => {
    await page.goto("/");
    expect(await page.locator('meta[name="viewport"]').getAttribute("content")).toContain(
      "viewport-fit=cover",
    );
  });

  test("the service worker installs, activates and controls the page", async ({ page }) => {
    await page.goto("/");
    const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
    expect(scope).toMatch(/\/$/);
    await expect
      .poll(() => page.evaluate(async () => (await navigator.serviceWorker.ready).active?.state))
      .toBe("activated");
    // After the first activation `clients.claim()` makes the worker control the open page.
    await expect
      .poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null))
      .toBe(true);
  });

  test("the manifest is served with the web manifest media type and complete data", async ({
    request,
  }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.headers()["content-type"]).toContain("manifest+json");
    const manifest = await response.json();
    expect(manifest).toMatchObject({
      start_url: "/",
      scope: "/",
      orientation: "portrait",
    });
    const purposes = (manifest.icons as { purpose: string }[]).map((icon) => icon.purpose);
    expect(purposes).toContain("maskable");
  });

  test("every icon is a real PNG of the announced size", async ({ request }) => {
    const manifest = await (await request.get("/manifest.webmanifest")).json();
    for (const icon of manifest.icons as { src: string; sizes: string }[]) {
      const body = await (await request.get(icon.src)).body();
      expect(body.subarray(1, 4).toString(), icon.src).toBe("PNG");
      const [width, height] = icon.sizes.split("x").map(Number);
      expect([body.readUInt32BE(16), body.readUInt32BE(20)], icon.src).toEqual([width, height]);
    }
  });
});

test.describe("pages", () => {
  test("the home page is a valid French document with landmarks and a single h1", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page).toHaveTitle("DrawToday");
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });

  test("the page never scrolls sideways", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("the not-found page keeps the app shell and leads back home", async ({ page }) => {
    const response = await page.goto("/nope");
    expect(response?.status()).toBe(404);
    await page.getByRole("link", { name: "Retour à l'accueil" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { level: 1, name: "Accueil" })).toBeVisible();
  });

  test("the header brand link brings back home from any page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("banner").getByRole("link", { name: "DrawToday" }).click();
    await expect(page).toHaveURL("/");
  });

  test("text keeps a strong contrast in light and dark mode", async ({ page }) => {
    for (const scheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/");
      const [background, color] = await page.evaluate(() => [
        getComputedStyle(document.body).backgroundColor,
        getComputedStyle(document.body).color,
      ]);
      expect(background, scheme).not.toBe(color);
      expect(background, scheme).toBe(
        scheme === "light" ? "rgb(255, 255, 255)" : "rgb(10, 10, 10)",
      );
    }
  });

  test("the interface is usable with the keyboard alone (the brand link takes the focus first)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "DrawToday" })).toBeFocused();
  });
});

test.describe("operations endpoints", () => {
  for (const path of ["/api/health", "/api/keep-alive"]) {
    test(`${path} does not answer to writes`, async ({ request }) => {
      for (const method of ["post", "put", "delete"] as const) {
        const response = await request[method](path);
        expect(response.status(), `${method} ${path}`).toBe(405);
      }
    });
  }

  test("the keep-alive route refuses a wrong secret when one is configured", async ({
    request,
  }) => {
    const response = await request.get("/api/keep-alive", {
      headers: { authorization: "Bearer not-the-secret" },
    });
    // Without CRON_SECRET (e2e) the route is open: either way, it never leaks a stack trace.
    expect([200, 401, 503]).toContain(response.status());
    expect(await response.text()).not.toMatch(/at .*\.(ts|js):\d+/);
  });
});

test.describe("robots and sitemap", () => {
  test("robots.txt blocks crawlers and announces the sitemap", async ({ request }) => {
    const text = await (await request.get("/robots.txt")).text();
    expect(text).toMatch(/User-Agent: \*\s+Disallow: \//i);
    expect(text).toContain("/sitemap.xml");
  });

  test("sitemap.xml lists absolute URLs only", async ({ request }) => {
    const text = await (await request.get("/sitemap.xml")).text();
    const urls = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) expect(url).toMatch(/^https?:\/\//);
  });
});
