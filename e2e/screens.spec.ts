import { expect, test } from "@playwright/test";

// The four screens of the app are mock-ups with sample data (A-112). These tests keep them honest: they must fit a phone,
// be comfortable to touch, say that they are a preview, and react as the final app will.
const SCREENS = [
  { path: "/", title: "Accueil" },
  { path: "/parcours", title: "Parcours" },
  { path: "/carnet", title: "Carnet" },
  { path: "/profil", title: "Profil" },
] as const;

for (const { path, title } of SCREENS) {
  test.describe(`screen ${path}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
      // The controls only react once React has hydrated the page.
      await page.waitForLoadState("networkidle");
    });

    test("says that it shows sample data", async ({ page }) => {
      await expect(page.getByText("Aperçu · données d'exemple")).toBeVisible();
    });

    test("fits the screen: no horizontal scroll, in light and in dark", async ({ page }) => {
      for (const scheme of ["light", "dark"] as const) {
        await page.emulateMedia({ colorScheme: scheme });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(overflow, scheme).toBeLessThanOrEqual(0);
      }
    });

    test("every button, tab and choice is a comfortable touch target", async ({ page }) => {
      const controls = page.locator(
        "main button:visible, main [role='radio']:visible, main [role='switch']:visible, main a.btn:visible",
      );
      const count = await controls.count();
      for (let index = 0; index < count; index += 1) {
        const box = await controls.nth(index).boundingBox();
        const name = (await controls.nth(index).textContent())?.trim() ?? `control ${index}`;
        expect(box!.height, name).toBeGreaterThanOrEqual(39.5);
      }
    });

    test("has exactly one level-one heading and no empty link or button", async ({ page }) => {
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      const unnamed = await page.evaluate(
        () =>
          [...document.querySelectorAll("a, button")].filter(
            (element) =>
              !element.getAttribute("aria-label") &&
              !(element.textContent ?? "").trim() &&
              !element.getAttribute("aria-labelledby"),
          ).length,
      );
      expect(unnamed).toBe(0);
    });
  });
}

test.describe("home", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("the length of the session changes the blocks and the XP announced on the button", async ({
    page,
  }) => {
    const start = page.getByRole("button", { name: /Commencer/ });
    await expect(start).toContainText("+100 XP");
    await page.getByRole("radio", { name: "15 min" }).click();
    await expect(start).toContainText("+55 XP");
    await expect(page.getByRole("list", { name: "Les quatre blocs de la séance" })).toContainText(
      "8 min",
    );
  });

  test("starting the session says honestly that the player is not there yet", async ({ page }) => {
    await page.getByRole("button", { name: /Commencer/ }).click();
    await expect(page.getByRole("region", { name: "Notifications" })).toContainText(
      "arrive bientôt",
    );
  });

  test("the weekly goal shows three sessions of four", async ({ page }) => {
    const goal = page.getByRole("progressbar", { name: "Séances de la semaine" });
    await expect(goal).toHaveAttribute("aria-valuetext", "3 séances sur 4");
    await expect(page.getByText(/Plus que 1 séance/)).toBeVisible();
  });

  test("the tip explains its answer at once, whatever the answer", async ({ page }) => {
    await page.getByRole("button", { name: "Ronde" }).click();
    await expect(page.getByText(/Presque !/)).toBeVisible();
    await page.getByRole("button", { name: "Plate" }).click();
    await expect(page.getByText(/Bien vu !/)).toBeVisible();
  });
});

test.describe("path", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/parcours");
    await page.waitForLoadState("networkidle");
  });

  test("shows the eight weeks, the current one marked, and a week to come is not locked", async ({
    page,
  }) => {
    const weeks = page
      .getByRole("list", { name: "Les semaines du parcours" })
      .getByRole("listitem");
    await expect(weeks).toHaveCount(8);
    await expect(weeks.filter({ hasText: "En cours" })).toHaveAttribute("aria-current", "step");
    await expect(weeks.filter({ hasText: "À venir" })).toHaveCount(5);
    await expect(page.getByText(/verrouill/i)).toHaveCount(0);
  });

  test("switches to the map of skills with its stars of mastery", async ({ page }) => {
    await page.getByRole("radio", { name: "Compétences" }).click();
    await expect(page.getByRole("heading", { name: "Carte des compétences" })).toBeVisible();
    await expect(
      page.getByRole("img", { name: "Contrôle du trait : 3 étoiles sur 5" }),
    ).toBeVisible();
  });
});

test.describe("sketchbook", () => {
  test("filters the pages by type", async ({ page }) => {
    await page.goto("/carnet");
    await page.waitForLoadState("networkidle");
    const pages = page.getByRole("list", { name: "Les pages du carnet" }).getByRole("listitem");
    await expect(pages).toHaveCount(6);
    await page.getByRole("radio", { name: "Notes" }).click();
    await expect(pages).toHaveCount(1);
    await page.getByRole("radio", { name: "Séances" }).click();
    await expect(pages).toHaveCount(4);
  });

  test("shows the before and the after side by side", async ({ page }) => {
    await page.goto("/carnet");
    await expect(page.getByRole("heading", { name: "Avant / Après" })).toBeVisible();
    await expect(page.getByText("Jour 1")).toBeVisible();
  });
});

test.describe("profile", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/profil");
    await page.waitForLoadState("networkidle");
  });

  test("shows the level, the numbers and the badges below the account", async ({ page }) => {
    await expect(page.getByRole("img", { name: "Niveau 4, Premier trait" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Mes statistiques" })).toBeVisible();
    await expect(page.getByRole("img", { name: /: obtenu$/ })).toHaveCount(4);
    await expect(page.getByRole("img", { name: /: à obtenir$/ })).toHaveCount(4);
  });

  test("the settings react and say that nothing is saved yet", async ({ page }) => {
    await page.getByRole("radio", { name: "5", exact: true }).click();
    await expect(page.getByRole("radio", { name: "5", exact: true })).toBeChecked();
    await expect(page.getByRole("region", { name: "Notifications" })).toContainText(
      "rien n'est enregistré",
    );
    const pause = page.getByRole("switch", { name: /Mode pause/ });
    await pause.click();
    await expect(pause).toBeChecked();
  });
});
