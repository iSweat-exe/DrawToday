import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Account } from "@/lib/auth/account";

let account: Account = { kind: "guest" };
vi.mock("@/lib/data/account", () => ({ getCurrentAccount: async () => account }));
vi.mock("./actions", () => ({ signInWithProvider: vi.fn(), signOut: vi.fn() }));

import { AccountCard } from "./account-card";

beforeEach(() => {
  account = { kind: "guest" };
});

describe("AccountCard", () => {
  it("explains the guest mode and offers to sign in with each provider", async () => {
    render(await AccountCard());
    expect(screen.getByText("Mode invité")).toBeVisible();
    expect(screen.getByText(/ne sont pas sauvegardés en ligne/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Continuer avec Discord" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Continuer avec GitHub" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Se déconnecter" })).toBeNull();
  });

  it("shows who is signed in and with what, and lets them sign out", async () => {
    account = { kind: "user", id: "abc", name: "Ada", avatarUrl: null, provider: "discord" };
    render(await AccountCard());
    expect(screen.getByRole("heading", { name: "Ada" })).toBeVisible();
    expect(screen.getByText("Connecté avec Discord")).toBeVisible();
    expect(screen.getByRole("button", { name: "Se déconnecter" })).toBeVisible();
    expect(screen.queryByText("Mode invité")).toBeNull();
    expect(screen.queryByRole("button", { name: /Continuer avec/ })).toBeNull();
  });

  it("does not claim a provider it does not know", async () => {
    account = { kind: "user", id: "abc", name: "Ada", avatarUrl: null, provider: null };
    render(await AccountCard());
    expect(screen.queryByText(/Connecté avec/)).toBeNull();
  });
});
