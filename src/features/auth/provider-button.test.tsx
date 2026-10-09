import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const signInWithProvider = vi.fn();
vi.mock("./actions", () => ({ signInWithProvider: (data: FormData) => signInWithProvider(data) }));

import { ProviderButton } from "./provider-button";

describe("ProviderButton", () => {
  it("is named after the provider and hides its decorative logo", () => {
    render(<ProviderButton provider="github" />);
    const button = screen.getByRole("button", { name: "Continuer avec GitHub" });
    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("submits its provider to the server action", async () => {
    render(<ProviderButton provider="discord" />);
    await userEvent.click(screen.getByRole("button", { name: "Continuer avec Discord" }));
    expect(signInWithProvider).toHaveBeenCalledTimes(1);
    const data = signInWithProvider.mock.calls[0]?.[0] as FormData;
    expect(data.get("provider")).toBe("discord");
  });
});
