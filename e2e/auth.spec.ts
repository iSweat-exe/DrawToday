import { expect, test } from "@playwright/test";

// Next.js adds its own `role="alert"` (route announcer): the error message of the page is looked up inside `main`.
// Sign-in with Discord and GitHub, and the guest mode. The database is unreachable on purpose (placeholder Supabase
// URL, see playwright.config.ts): everyone is a guest here, and the provider's page is replaced by a stub.
test.describe("guest mode", () => {
  test("a guest is invited to sign in from the top bar", async ({ page }) => {
    await page.goto("/");
    const signIn = page.getByRole("banner").getByRole("link", { name: "Se connecter" });
    await expect(signIn).toBeVisible();
    await signIn.click();
    await expect(page).toHaveURL("/connexion");
    await expect(
      page.getByRole("heading", { level: 1, name: "Bienvenue sur DrawToday" }),
    ).toBeVisible();
  });

  test("the sign-in page offers Discord, GitHub and the guest mode, and no tab bar", async ({
    page,
  }) => {
    await page.goto("/connexion");
    await expect(page.getByRole("button", { name: "Continuer avec Discord" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continuer avec GitHub" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Continuer en invité" })).toBeVisible();
    await expect(page.getByText(/ne sont pas sauvegardés en ligne/)).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Navigation principale" })).toHaveCount(0);
  });

  test("continuing as a guest opens the app, still as a guest", async ({ page }) => {
    await page.goto("/connexion");
    await page.getByRole("link", { name: "Continuer en invité" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { level: 1, name: "Accueil" })).toBeVisible();
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Se connecter" }),
    ).toBeVisible();
  });

  test("the profile of a guest says that nothing is saved online", async ({ page }) => {
    await page.goto("/profil");
    await expect(page.getByText("Mode invité")).toBeVisible();
    await expect(page.getByText(/ne sont pas\s+sauvegardés en ligne/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Continuer avec GitHub" })).toBeVisible();
  });

  test("the sign-in page is not indexed", async ({ page }) => {
    await page.goto("/connexion");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});

test.describe("sign-in with a provider", () => {
  for (const [label, provider] of [
    ["Discord", "discord"],
    ["GitHub", "github"],
  ] as const) {
    test(`${label}: the server action sends the browser to the provider through Supabase`, async ({
      page,
    }) => {
      // Stands in for the hosted Supabase project and the provider: records where the browser was sent.
      let target: URL | undefined;
      await page.route("https://placeholder.supabase.co/**", (route) => {
        target = new URL(route.request().url());
        return route.fulfill({ contentType: "text/html", body: "<h1>provider</h1>" });
      });

      await page.goto("/connexion");
      await page.waitForLoadState("networkidle");
      await page.getByRole("button", { name: `Continuer avec ${label}` }).click();

      await expect(page.getByRole("heading", { name: "provider" })).toBeVisible();
      expect(target?.pathname).toBe("/auth/v1/authorize");
      expect(target?.searchParams.get("provider")).toBe(provider);
      expect(target?.searchParams.get("redirect_to")).toMatch(/\/auth\/callback$/);
      expect(target?.searchParams.get("code_challenge")).toBeTruthy();
    });
  }
});

test.describe("callback", () => {
  test("a refusal at the provider comes back to the sign-in page with a calm message", async ({
    page,
  }) => {
    await page.goto("/auth/callback?error=access_denied&error_description=anything");
    await expect(page).toHaveURL("/connexion?error=denied");
    await expect(page.locator("main [role=alert]")).toHaveText(/Connexion annulée/);
  });

  test("a code that Supabase refuses shows a failure, without a detail", async ({ page }) => {
    // The placeholder project is unreachable: the exchange fails, as it would with an expired code.
    await page.goto("/auth/callback?code=expired");
    await expect(page).toHaveURL("/connexion?error=oauth");
    await expect(page.locator("main [role=alert]")).toHaveText(/La connexion a échoué/);
  });

  test("an unknown error code shows nothing", async ({ page }) => {
    await page.goto("/connexion?error=%3Cscript%3E");
    await expect(page.getByRole("button", { name: "Continuer avec Discord" })).toBeVisible();
    await expect(page.locator("main [role=alert]")).toHaveCount(0);
  });
});
