import { expect, test } from "@playwright/test";

test.describe("design system: style guide page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/design-system");
    await expect(page.getByRole("heading", { level: 1, name: "Guide de style" })).toBeVisible();
    // The controls only react once React has hydrated the page.
    await page.waitForLoadState("networkidle");
  });

  test("is not indexed by search engines", async ({ page }) => {
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("every button and control is a comfortable touch target (at least 40 px, 44 px for the main ones)", async ({
    page,
  }) => {
    const controls = page.locator(
      "main button, main a.card-link, main [role='radio'], main [role='switch']",
    );
    const count = await controls.count();
    expect(count).toBeGreaterThan(8);
    for (let index = 0; index < count; index += 1) {
      const box = await controls.nth(index).boundingBox();
      const name = (await controls.nth(index).textContent())?.trim() ?? `control ${index}`;
      expect(box, name).not.toBeNull();
      expect(box!.height, `${name}: height`).toBeGreaterThanOrEqual(39.5);
    }
    // The primary action is the full 48 px control.
    const primary = await page.getByRole("button", { name: "Commencer la séance" }).boundingBox();
    expect(primary!.height).toBeGreaterThanOrEqual(47.5);
  });

  test("a button gives instant visual feedback while pressed (it shrinks slightly)", async ({
    page,
  }) => {
    const button = page.getByRole("button", { name: "Commencer la séance" });
    const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    // The press animation lasts 150 ms: wait for it. Tailwind 4 animates the `scale` property (not `transform`).
    const scale = () => button.evaluate((element) => Number(getComputedStyle(element).scale));
    await expect.poll(scale).toBeLessThan(1);
    expect(await scale()).toBeGreaterThan(0.9);
    await page.mouse.up();
  });

  test("the loading button is busy, then comes back", async ({ page }) => {
    const save = page.getByRole("button", { name: "Enregistrer" });
    await save.click();
    const busy = page.getByRole("button", { name: "Enregistrement" });
    await expect(busy).toBeDisabled();
    await expect(busy).toHaveAttribute("aria-busy", "true");
    await expect(page.getByRole("button", { name: "Enregistrer" })).toBeEnabled();
  });

  test("the segmented control changes the chosen duration, with the mouse and the keyboard", async ({
    page,
  }) => {
    const group = page.getByRole("radiogroup", { name: "Durée d'une séance" });
    await expect(page.getByTestId("duration-output")).toHaveText("Séance de 30 minutes");
    await group.getByRole("radio", { name: "45 min" }).click();
    await expect(page.getByTestId("duration-output")).toHaveText("Séance de 45 minutes");
    await expect(group.getByRole("radio", { name: "45 min" })).toBeChecked();
    await page.keyboard.press("ArrowRight");
    await expect(group.getByRole("radio", { name: "10 min" })).toBeChecked();
    await expect(page.getByTestId("duration-output")).toHaveText("Séance de 10 minutes");
  });

  test("the switch toggles", async ({ page }) => {
    const reminder = page.getByRole("switch", { name: /Rappel quotidien/ });
    await expect(reminder).toBeChecked();
    await reminder.click();
    await expect(reminder).not.toBeChecked();
    await reminder.click();
    await expect(reminder).toBeChecked();
  });

  test("the weekly goal ring fills when a session is done, up to its maximum", async ({ page }) => {
    const ring = page.getByRole("progressbar", { name: "Objectif de la semaine" });
    await expect(ring).toHaveAttribute("aria-valuenow", "40");
    const done = page.getByRole("button", { name: "Séance faite" });
    await done.click();
    await expect(ring).toHaveAttribute("aria-valuenow", "60");
    for (let i = 0; i < 6; i += 1) await done.click();
    await expect(ring).toHaveAttribute("aria-valuenow", "100");
  });

  test("the XP bar shows its value", async ({ page }) => {
    await expect(page.getByRole("progressbar", { name: "XP du niveau" })).toHaveAttribute(
      "aria-valuenow",
      "71",
    );
  });

  test("shows the loading placeholders and the empty state", async ({ page }) => {
    await expect(page.locator(".skeleton")).toHaveCount(3);
    await expect(page.getByRole("heading", { name: "Ton carnet est vide" })).toBeVisible();
  });

  test("has no horizontal scroll (nothing overflows the phone screen)", async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("respects reduced motion: no animation lasts more than a blink", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    const longest = await page.evaluate(() =>
      Math.max(
        ...Array.from(document.querySelectorAll("*")).map((element) =>
          Math.max(
            ...getComputedStyle(element)
              .animationDuration.split(",")
              .map((value) => parseFloat(value) || 0),
          ),
        ),
      ),
    );
    expect(longest).toBeLessThan(0.05);
  });

  test("works in dark mode (the page background and the text keep a strong contrast)", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.reload();
    const [background, color] = await page.evaluate(() => [
      getComputedStyle(document.body).backgroundColor,
      getComputedStyle(document.body).color,
    ]);
    expect(background).toBe("rgb(10, 10, 10)");
    expect(color).toBe("rgb(237, 237, 237)");
  });
});
