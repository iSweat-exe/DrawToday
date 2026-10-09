import { expect, test } from "@playwright/test";

// The shell of the app: top bar and tab bar. Runs as a guest (no session), without a reachable database.
test.describe("app shell: top bar and tab bar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("the four tabs are there, the current one is marked", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    await expect(nav.getByRole("link")).toHaveText(["Aujourd'hui", "Parcours", "Carnet", "Profil"]);
    await expect(nav.getByRole("link", { name: "Aujourd'hui" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("a tab opens its page and becomes the current one", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    for (const [tab, title] of [
      ["Parcours", "Parcours"],
      ["Carnet", "Carnet"],
      ["Profil", "Profil"],
    ]) {
      await nav.getByRole("link", { name: tab }).click();
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
      await expect(nav.getByRole("link", { name: tab })).toHaveAttribute("aria-current", "page");
    }
  });

  test("the tab bar stays at the bottom of the screen and the top bar at the top, while the page scrolls", async ({
    page,
  }) => {
    await page.evaluate(() => {
      const filler = document.createElement("div");
      filler.style.height = "3000px";
      document.querySelector("main")!.append(filler);
    });
    await page.mouse.wheel(0, 1500);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);

    const viewport = page.viewportSize()!;
    const top = (await page.getByRole("banner").boundingBox())!;
    const bottom = (await page
      .getByRole("navigation", { name: "Navigation principale" })
      .boundingBox())!;
    expect(top.y).toBeLessThanOrEqual(1);
    expect(bottom.y + bottom.height).toBeGreaterThanOrEqual(viewport.height - 1);
  });

  test("every tab is a comfortable touch target", async ({ page }) => {
    const links = page.getByRole("navigation", { name: "Navigation principale" }).getByRole("link");
    for (let index = 0; index < (await links.count()); index += 1) {
      const box = (await links.nth(index).boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(43.5);
      expect(box.width).toBeGreaterThanOrEqual(43.5);
    }
  });

  test("the brand leads home from any page", async ({ page }) => {
    await page.goto("/carnet");
    await page.getByRole("banner").getByRole("link", { name: "DrawToday" }).click();
    await expect(page).toHaveURL("/");
  });
});
