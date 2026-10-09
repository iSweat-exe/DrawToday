import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Account } from "@/lib/auth/account";

let account: Account = { kind: "guest" };
vi.mock("@/lib/data/account", () => ({ getCurrentAccount: async () => account }));
vi.mock("./actions", () => ({ signInWithProvider: vi.fn(), signOut: vi.fn() }));

import { LoginPanel } from "./login-panel";

const renderPanel = async (params: Record<string, string | string[] | undefined> = {}) =>
  render(await LoginPanel({ searchParams: Promise.resolve(params) }));

beforeEach(() => {
  account = { kind: "guest" };
});

describe("LoginPanel", () => {
  it("offers Discord, GitHub and the guest mode", async () => {
    await renderPanel();
    expect(screen.getByRole("button", { name: "Continuer avec Discord" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Continuer avec GitHub" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Continuer en invité" })).toHaveAttribute("href", "/");
    expect(screen.getByText(/restent sur cet appareil/)).toBeVisible();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("posts the provider to the server action in a hidden field", async () => {
    const { container } = await renderPanel();
    const providers = [...container.querySelectorAll<HTMLInputElement>("input[name=provider]")];
    expect(providers.map((input) => input.value)).toEqual(["discord", "github"]);
  });

  it("announces the error of a failed attempt", async () => {
    await renderPanel({ error: "oauth" });
    expect(screen.getByRole("alert")).toHaveTextContent("La connexion a échoué");
  });

  it("ignores an error code it does not know", async () => {
    await renderPanel({ error: "<script>" });
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("does not offer to sign in again to someone who already is", async () => {
    account = { kind: "user", id: "abc", name: "Ada", avatarUrl: null, provider: "github" };
    await renderPanel();
    expect(screen.getByText("Ada")).toBeVisible();
    expect(screen.getByRole("link", { name: "Aller à l'accueil" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("button", { name: "Se déconnecter" })).toBeVisible();
    expect(screen.queryByRole("button", { name: /Continuer avec/ })).toBeNull();
  });
});
