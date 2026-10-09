import { expect, test, type Page } from "@playwright/test";

// The learner chooses the look of the app (ADR 0007): light/dark, a color theme, and the retro touch. The choice is kept on
// the device and put on the page before the first paint.
const paper = (page: Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const accent = (page: Page) =>
  page.evaluate(() => {
    const probe = document.createElement("span");
    probe.className = "bg-accent";
    document.body.append(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  });

test.describe("appearance", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/profil");
    await page.waitForLoadState("networkidle");
  });

  test("offers the three modes, six color themes and the retro touch", async ({ page }) => {
    const card = page.locator("section[aria-labelledby='appearance-title']");
    await expect(
      card.getByRole("radiogroup", { name: "Mode d'affichage" }).getByRole("radio"),
    ).toHaveText(["Auto", "Clair", "Sombre"]);
    await expect(card.getByRole("radiogroup", { name: "Couleurs" }).getByRole("radio")).toHaveText([
      "Prune",
      "Corail",
      "Océan",
      "Bonbon",
      "Lagon",
      "Graphite",
    ]);
    await expect(card.getByRole("switch", { name: /Touche rétro/ })).toBeChecked();
  });

  test("dark and light override the phone's setting, and Auto follows it again", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    expect(await paper(page)).toBe("rgb(255, 246, 229)");

    await page.getByRole("radio", { name: "Sombre" }).click();
    expect(await paper(page)).toBe("rgb(23, 18, 43)");

    await page.emulateMedia({ colorScheme: "dark" });
    await page.getByRole("radio", { name: "Clair" }).click();
    expect(await paper(page)).toBe("rgb(255, 246, 229)");

    await page.getByRole("radio", { name: "Auto" }).click();
    expect(await paper(page)).toBe("rgb(23, 18, 43)");
  });

  test("each color theme changes the whole look: the accent, the paper and the text", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    const text = () => page.evaluate(() => getComputedStyle(document.body).color);
    const seen = new Set<string>();
    for (const [name, color, sheet, ink] of [
      ["Prune", "rgb(108, 59, 255)", "rgb(255, 246, 229)", "rgb(42, 31, 77)"],
      ["Corail", "rgb(204, 58, 26)", "rgb(255, 240, 230)", "rgb(59, 28, 20)"],
      ["Océan", "rgb(10, 101, 184)", "rgb(232, 243, 255)", "rgb(15, 39, 72)"],
      ["Bonbon", "rgb(189, 17, 122)", "rgb(255, 233, 243)", "rgb(74, 16, 52)"],
      ["Lagon", "rgb(0, 108, 121)", "rgb(226, 246, 243)", "rgb(6, 47, 53)"],
      ["Graphite", "rgb(61, 58, 82)", "rgb(240, 239, 244)", "rgb(31, 29, 41)"],
    ] as const) {
      await page.getByRole("radio", { name, exact: true }).click();
      expect(await accent(page), `${name}: accent`).toBe(color);
      expect(await paper(page), `${name}: paper`).toBe(sheet);
      expect(await text(), `${name}: text`).toBe(ink);
      seen.add(`${color}|${sheet}`);
    }
    expect(seen.size).toBe(6);
  });

  test("a color theme is complete in dark mode too: its own night paper", async ({ page }) => {
    await page.getByRole("radio", { name: "Sombre" }).click();
    await page.getByRole("radio", { name: "Océan", exact: true }).click();
    expect(await paper(page)).toBe("rgb(13, 26, 48)");
    expect(await accent(page)).toBe("rgb(98, 184, 255)");
  });

  test("no theme makes the page overflow or hides the navigation", async ({ page }) => {
    for (const name of ["Corail", "Océan", "Bonbon", "Lagon", "Graphite"]) {
      await page.getByRole("radio", { name, exact: true }).click();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, name).toBeLessThanOrEqual(0);
      await expect(page.getByRole("navigation", { name: "Navigation principale" })).toBeVisible();
    }
  });

  test("every theme tile shows its own paper and accent, whatever theme is active", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.getByRole("radio", { name: "Lagon" }).click();
    const tiles = await page.evaluate(() =>
      [...document.querySelectorAll("[data-swatch]")].map((tile) => [
        getComputedStyle(tile).backgroundColor,
        getComputedStyle(tile.firstElementChild!).backgroundColor,
      ]),
    );
    expect(tiles).toEqual([
      ["rgb(255, 246, 229)", "rgb(108, 59, 255)"],
      ["rgb(255, 240, 230)", "rgb(204, 58, 26)"],
      ["rgb(232, 243, 255)", "rgb(10, 101, 184)"],
      ["rgb(255, 233, 243)", "rgb(189, 17, 122)"],
      ["rgb(226, 246, 243)", "rgb(0, 108, 121)"],
      ["rgb(240, 239, 244)", "rgb(61, 58, 82)"],
    ]);
  });

  test("the choice is kept after a reload and is on the page before the app starts", async ({
    page,
  }) => {
    await page.getByRole("radio", { name: "Sombre" }).click();
    await page.getByRole("radio", { name: "Bonbon" }).click();
    await page.reload({ waitUntil: "commit" });
    // The init script of the <head> has already run: no flash of the default look.
    await page.waitForFunction(
      () => document.documentElement.getAttribute("data-theme") === "dark",
    );
    expect(await page.evaluate(() => document.documentElement.getAttribute("data-accent"))).toBe(
      "candy",
    );

    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("radio", { name: "Sombre" })).toBeChecked();
    await expect(page.getByRole("radio", { name: "Bonbon" })).toBeChecked();
  });

  test("the choice follows the learner from page to page", async ({ page }) => {
    await page.getByRole("radio", { name: "Graphite" }).click();
    await page
      .getByRole("navigation", { name: "Navigation principale" })
      .getByRole("link", { name: "Parcours" })
      .click();
    await expect(page.getByRole("heading", { level: 1, name: "Parcours" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.getAttribute("data-accent"))).toBe(
      "graphite",
    );
  });

  test("the browser bar takes the color of the chosen paper", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.getByRole("radio", { name: "Sombre" }).click();
    const colors = await page.evaluate(() =>
      [...document.querySelectorAll('meta[name="theme-color"]')].map(
        (meta) => (meta as HTMLMetaElement).content,
      ),
    );
    expect(colors.length).toBeGreaterThan(0);
    for (const color of colors) expect(color).toBe("#17122b");
  });

  test("a damaged choice in the storage never breaks the app", async ({ page }) => {
    await page.evaluate(() => localStorage.setItem("drawtoday-appearance", "{not json"));
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Profil" })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.getAttribute("data-theme")),
    ).toBeNull();
  });
});

test.describe("the retro touch", () => {
  const windowBars = (page: Page) =>
    page.evaluate(() =>
      [...document.querySelectorAll(".window-bar")].map((bar) => getComputedStyle(bar).display),
    );
  const labelFont = (page: Page) =>
    page.evaluate(() => getComputedStyle(document.querySelector(".section-title")!).fontFamily);

  test("is there by default: little windows, a pixel font for labels, bevelled buttons", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(await windowBars(page)).toEqual(["flex", "flex"]);
    await expect(page.getByText("aujourd'hui.exe")).toBeVisible();
    await expect(page.getByText("conseil.txt")).toBeVisible();
    expect(
      await page.evaluate(() => getComputedStyle(document.querySelector(".btn")!).boxShadow),
    ).toContain("inset");
  });

  test("can be turned off: no title bars, no pixel font, no bevel, no gaps in the bars", async ({
    page,
  }) => {
    await page.goto("/profil");
    await page.waitForLoadState("networkidle");
    expect(await labelFont(page)).toMatch(/pixelify/i);

    await page.getByRole("switch", { name: /Touche rétro/ }).click();
    expect(await labelFont(page)).not.toMatch(/pixelify/i);
    const bevel = await page.evaluate(() => {
      const button = document.querySelector(".btn")!;
      return getComputedStyle(button).boxShadow;
    });
    expect(bevel).not.toMatch(/inset rgba?\(255, 255, 255, 0\.4\)/);
    const gap = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--segment-gap").trim(),
    );
    expect(gap).toBe("transparent");

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(await windowBars(page)).toEqual(["none", "none"]);
  });

  test("turns the progress bar into blocks", async ({ page }) => {
    await page.goto("/profil");
    await page.waitForLoadState("networkidle");
    const blocks = page.locator(".progress-blocks").first();
    await expect(blocks).toBeAttached();
    const image = await blocks.evaluate((element) => getComputedStyle(element).backgroundImage);
    expect(image).toContain("repeating-linear-gradient");
  });
});
