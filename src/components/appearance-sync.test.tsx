import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { APPEARANCE_STORAGE_KEY } from "@/lib/appearance";
import { resetAppearanceStoreForTests } from "@/lib/appearance-store";
import { AppearanceSync } from "./appearance-sync";

const listeners = new Set<() => void>();
const matchMedia = vi.fn(() => ({
  addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
  removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
}));

beforeEach(() => {
  vi.stubGlobal("matchMedia", matchMedia);
  localStorage.clear();
  resetAppearanceStoreForTests();
});

afterEach(() => {
  vi.unstubAllGlobals();
  listeners.clear();
  for (const name of ["data-theme", "data-accent", "data-style"]) {
    document.documentElement.removeAttribute(name);
  }
});

describe("AppearanceSync", () => {
  it("renders nothing", () => {
    const { container } = render(<AppearanceSync />);
    expect(container).toBeEmptyDOMElement();
  });

  it("puts the saved look on the page when the app starts", () => {
    localStorage.setItem(
      APPEARANCE_STORAGE_KEY,
      JSON.stringify({ mode: "dark", accent: "candy", retro: true }),
    );
    render(<AppearanceSync />);
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement).toHaveAttribute("data-accent", "candy");
  });

  it("listens to the phone switching between light and dark, and stops when it goes away", () => {
    const { unmount } = render(<AppearanceSync />);
    expect(matchMedia).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
    expect(listeners.size).toBe(1);
    unmount();
    expect(listeners.size).toBe(0);
  });
});
