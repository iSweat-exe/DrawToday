import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Account } from "@/lib/auth/account";

let account: Account = { kind: "guest" };
vi.mock("@/lib/data/account", () => ({ getCurrentAccount: async () => account }));

import { AccountChip } from "./account-chip";

beforeEach(() => {
  account = { kind: "guest" };
});

describe("AccountChip", () => {
  it("invites a guest to sign in, without prefetching the sign-in page", async () => {
    render(await AccountChip());
    const link = screen.getByRole("link", { name: "Se connecter" });
    expect(link).toHaveAttribute("href", "/connexion");
    expect(link).not.toHaveAttribute("data-prefetch");
  });

  it("shows a signed-in user's picture as a link to their profile", async () => {
    account = {
      kind: "user",
      id: "abc",
      name: "Ada Lovelace",
      avatarUrl: null,
      provider: "github",
    };
    render(await AccountChip());
    const link = screen.getByRole("link", { name: "Mon profil (Ada Lovelace)" });
    expect(link).toHaveAttribute("href", "/profil");
    expect(link).toHaveClass("size-tap");
    expect(screen.queryByRole("link", { name: "Se connecter" })).toBeNull();
  });
});
