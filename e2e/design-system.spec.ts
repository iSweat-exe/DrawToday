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
      "main button:visible, main a.card-link:visible, main [role='radio']:visible, main [role='switch']:visible",
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

test.describe("design system: interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/design-system");
    await expect(page.getByRole("heading", { level: 1, name: "Guide de style" })).toBeVisible();
    await page.waitForLoadState("networkidle");
  });

  test("the tab bar marks the chosen tab as the current page", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    await expect(nav.getByRole("link", { name: "Aujourd'hui" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await nav.getByRole("link", { name: "Carnet" }).click();
    await expect(nav.getByRole("link", { name: "Carnet" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Aujourd'hui" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  test("toasts stack (three at most), announce errors as alerts and disappear by themselves", async ({
    page,
  }) => {
    const region = page.getByRole("region", { name: "Notifications" });
    await page.getByRole("button", { name: "Erreur" }).click();
    await expect(region.getByRole("alert")).toContainText("Envoi impossible");
    await page.getByRole("button", { name: "Succès" }).click();
    await page.getByRole("button", { name: "Info" }).click();
    await page.getByRole("button", { name: "Info" }).click();
    await expect(region.getByText("Nouveau défi disponible")).toHaveCount(2);
    await expect(region.getByRole("alert")).toHaveCount(0); // the oldest one made room
    // They go away after a few seconds.
    await expect(region.getByText("Nouveau défi disponible")).toHaveCount(0, { timeout: 8000 });
  });

  test("the bottom sheet opens, closes with Escape, with the close button and with the backdrop", async ({
    page,
  }) => {
    const sheet = page.getByRole("dialog", { name: "Durée d'une séance" });
    const open = page.getByRole("button", { name: "Ouvrir la feuille" });

    await expect(sheet).toBeHidden();
    await open.click();
    await expect(sheet).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();

    await open.click();
    await sheet.getByRole("button", { name: "Fermer" }).click();
    await expect(sheet).toBeHidden();

    await open.click();
    await expect(sheet).toBeVisible();
    await page.mouse.click(5, 5); // the dimmed backdrop above the sheet
    await expect(sheet).toBeHidden();

    await open.click();
    await sheet.getByRole("button", { name: "C'est parti" }).click();
    await expect(sheet).toBeHidden();
  });

  test("the bottom sheet follows the finger: a long swipe down closes it, a short one brings it back", async ({
    page,
  }) => {
    const sheet = page.getByRole("dialog", { name: "Durée d'une séance" });
    const handle = sheet.getByTestId("sheet-handle");
    await page.getByRole("button", { name: "Ouvrir la feuille" }).click();
    await expect(sheet).toBeVisible();
    await page.waitForTimeout(400); // the opening animation

    const box = (await handle.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + 10;

    // Short, slow drag: springs back.
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + 15, { steps: 3 });
    await page.waitForTimeout(400);
    await page.mouse.up();
    await expect(sheet).toBeVisible();
    await page.waitForTimeout(500); // the spring back

    // Long drag: closes.
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + 400, { steps: 8 });
    await page.mouse.up();
    await expect(sheet).toBeHidden();
  });

  test("while the sheet is open, the page behind cannot be used", async ({ page }) => {
    await page.getByRole("button", { name: "Ouvrir la feuille" }).click();
    await expect(page.getByRole("dialog", { name: "Durée d'une séance" })).toBeVisible();
    // A modal dialog blocks every pointer interaction with the rest of the page.
    await expect(
      page.getByRole("button", { name: "Commencer la séance" }).click({ timeout: 1500 }),
    ).rejects.toThrow();
    expect(
      await page.evaluate(() => document.querySelector("dialog[open]")?.matches(":modal")),
    ).toBe(true);
  });

  test("the confetti burst shows pieces, then removes them", async ({ page }) => {
    await page.getByRole("button", { name: "Un petit feu d'artifice" }).click();
    const confetti = page.getByTestId("confetti");
    await expect(confetti).toBeAttached();
    await expect(confetti.locator("> *")).toHaveCount(28);
    await expect(confetti).toHaveCount(0, { timeout: 5000 });
  });

  test("the XP burst counts up to the earned amount", async ({ page }) => {
    await page.getByRole("button", { name: "Terminer une séance" }).click();
    const card = page.getByTestId("xp-card");
    await expect(card).toBeVisible();
    await expect(card.getByTestId("xp-amount")).toHaveText("+100 XP", { timeout: 5000 });
    await expect(card.getByRole("status")).toContainText("100");
  });

  test("with reduced motion, the animations are practically instant", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("button", { name: "Terminer une séance" }).click();
    await expect(page.getByTestId("xp-amount")).toHaveText("+100 XP");
    const duration = await page
      .getByTestId("xp-card")
      .evaluate((element) => getComputedStyle(element).animationDuration);
    expect(Number.parseFloat(duration)).toBeLessThan(0.001);
  });
});

test.describe("design system: image viewer", () => {
  const scaleOf = async (page: import("@playwright/test").Page) =>
    Number(
      await page
        .getByRole("dialog", { name: /Visionneuse/ })
        .locator("img")
        .getAttribute("data-scale"),
    );

  test.beforeEach(async ({ page }) => {
    await page.goto("/design-system");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Agrandir l'exemple de dessin" }).click();
    await expect(page.getByRole("dialog", { name: /Visionneuse/ })).toBeVisible();
  });

  test("opens full screen and closes with Escape and with the close button", async ({ page }) => {
    const viewer = page.getByRole("dialog", { name: /Visionneuse/ });
    expect(await scaleOf(page)).toBe(1);
    await page.keyboard.press("Escape");
    await expect(viewer).toBeHidden();
    await page.getByRole("button", { name: "Agrandir l'exemple de dessin" }).click();
    await viewer.getByRole("button", { name: "Fermer" }).click();
    await expect(viewer).toBeHidden();
  });

  test("double click zooms in on the spot, and again zooms back out", async ({ page }) => {
    const stage = page.getByTestId("viewer-stage");
    await stage.dblclick();
    await expect.poll(() => scaleOf(page)).toBe(2.5);
    await stage.dblclick();
    await expect.poll(() => scaleOf(page)).toBe(1);
  });

  test("the buttons zoom by steps, never past the limits, and fit brings the image back", async ({
    page,
  }) => {
    const viewer = page.getByRole("dialog", { name: /Visionneuse/ });
    const zoomIn = viewer.getByRole("button", { name: "Zoom avant" });
    await zoomIn.click();
    await expect.poll(() => scaleOf(page)).toBe(1.5);
    for (let index = 0; index < 8; index += 1) await zoomIn.click();
    await expect.poll(() => scaleOf(page)).toBe(5);
    await viewer.getByRole("button", { name: "Zoom arrière" }).click();
    await expect.poll(() => scaleOf(page)).toBeLessThan(5);
    await viewer.getByRole("button", { name: "Ajuster à l'écran" }).click();
    await expect.poll(() => scaleOf(page)).toBe(1);
    // Zooming out from the fitted view stays at the fitted size.
    await viewer.getByRole("button", { name: "Zoom arrière" }).click();
    await expect.poll(() => scaleOf(page)).toBe(1);
  });

  test("the mouse wheel zooms in and out", async ({ page }) => {
    const stage = page.getByTestId("viewer-stage");
    const box = (await stage.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, -200);
    await expect.poll(() => scaleOf(page)).toBeGreaterThan(1);
    await page.mouse.wheel(0, 2000);
    await expect.poll(() => scaleOf(page)).toBe(1);
  });

  test("a zoomed image can be dragged but never leaves the screen", async ({ page }) => {
    const viewer = page.getByRole("dialog", { name: /Visionneuse/ });
    const image = viewer.locator("img");
    for (let index = 0; index < 3; index += 1) {
      await viewer.getByRole("button", { name: "Zoom avant" }).click();
    }
    await expect.poll(() => scaleOf(page)).toBeGreaterThan(3);
    const stageBox = (await viewer.getByTestId("viewer-stage").boundingBox())!;
    const cx = stageBox.x + stageBox.width / 2;
    const cy = stageBox.y + stageBox.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 3000, cy + 3000, { steps: 6 });
    await page.mouse.up();
    const imageBox = (await image.boundingBox())!;
    // Dragged as far as possible: an edge of the image reaches the middle of the screen at most.
    expect(imageBox.x).toBeLessThanOrEqual(stageBox.x + 1);
    expect(imageBox.y).toBeLessThanOrEqual(stageBox.y + 1);
    expect(imageBox.x + imageBox.width).toBeGreaterThanOrEqual(stageBox.x + stageBox.width - 1);
    expect(imageBox.y + imageBox.height).toBeGreaterThanOrEqual(stageBox.y + stageBox.height - 1);
  });

  test("a two-finger pinch zooms in, then out", async ({ page, browserName }) => {
    test.skip(
      browserName !== "chromium",
      "touch events are driven with the Chrome DevTools protocol",
    );
    const stage = page.getByTestId("viewer-stage");
    const box = (await stage.boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const client = await page.context().newCDPSession(page);
    const touch = async (
      type: "touchStart" | "touchMove" | "touchEnd",
      spread: number,
    ): Promise<void> => {
      await client.send("Input.dispatchTouchEvent", {
        type,
        touchPoints:
          type === "touchEnd"
            ? []
            : [
                { x: cx - spread, y: cy, id: 1 },
                { x: cx + spread, y: cy, id: 2 },
              ],
      });
    };
    await touch("touchStart", 40);
    for (const spread of [60, 80, 100, 120]) await touch("touchMove", spread);
    await touch("touchEnd", 0);
    await expect.poll(() => scaleOf(page)).toBeGreaterThan(2.5);

    const zoomed = await scaleOf(page);
    await touch("touchStart", 120);
    for (const spread of [90, 60, 40]) await touch("touchMove", spread);
    await touch("touchEnd", 0);
    await expect.poll(() => scaleOf(page)).toBeLessThan(zoomed);
  });
});
