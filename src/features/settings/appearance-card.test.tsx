import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ACCENT_LABELS, ACCENTS, APPEARANCE_STORAGE_KEY } from "@/lib/appearance";
import { resetAppearanceStoreForTests } from "@/lib/appearance-store";
import { AppearanceCard } from "./appearance-card";

vi.mock("@/lib/haptics", () => ({ haptic: vi.fn() }));

const root = () => document.documentElement;

function clean() {
  localStorage.clear();
  resetAppearanceStoreForTests();
  for (const name of ["data-theme", "data-accent", "data-style"]) root().removeAttribute(name);
}

beforeEach(clean);
afterEach(clean);

describe("AppearanceCard: mode", () => {
  it("offers Auto, Clair and Sombre, starting on Auto", () => {
    render(<AppearanceCard />);
    const modes = within(screen.getByRole("radiogroup", { name: "Mode d'affichage" }));
    expect(modes.getAllByRole("radio").map((radio) => radio.textContent)).toEqual([
      "Auto",
      "Clair",
      "Sombre",
    ]);
    expect(modes.getByRole("radio", { name: "Auto" })).toBeChecked();
  });

  it("applies the chosen mode to the page at once and keeps it", async () => {
    render(<AppearanceCard />);
    await userEvent.click(screen.getByRole("radio", { name: "Sombre" }));
    expect(root()).toHaveAttribute("data-theme", "dark");
    expect(JSON.parse(localStorage.getItem(APPEARANCE_STORAGE_KEY)!).mode).toBe("dark");

    await userEvent.click(screen.getByRole("radio", { name: "Auto" }));
    expect(root()).not.toHaveAttribute("data-theme");
  });
});

describe("AppearanceCard: color themes", () => {
  const themes = () => within(screen.getByRole("radiogroup", { name: "Couleurs" }));

  it("shows every theme in its own colors, the default one being chosen", () => {
    const { container } = render(<AppearanceCard />);
    expect(
      themes()
        .getAllByRole("radio")
        .map((radio) => radio.textContent),
    ).toEqual(ACCENTS.map((accent) => ACCENT_LABELS[accent]));
    expect(themes().getByRole("radio", { name: "Prune" })).toBeChecked();
    const dots = [...container.querySelectorAll("[data-swatch]")].map((dot) =>
      dot.getAttribute("data-accent"),
    );
    expect(dots).toEqual([...ACCENTS]);
  });

  it("applies the chosen theme to the page, and the default theme means no attribute", async () => {
    render(<AppearanceCard />);
    await userEvent.click(themes().getByRole("radio", { name: "Corail" }));
    expect(root()).toHaveAttribute("data-accent", "coral");
    expect(themes().getByRole("radio", { name: "Corail" })).toBeChecked();
    expect(themes().getByRole("radio", { name: "Prune" })).not.toBeChecked();

    await userEvent.click(themes().getByRole("radio", { name: "Prune" }));
    expect(root()).not.toHaveAttribute("data-accent");
  });

  it("moves the choice with the arrow keys, around the list, like a radio group", async () => {
    render(<AppearanceCard />);
    themes().getByRole("radio", { name: "Prune" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(themes().getByRole("radio", { name: "Corail" })).toBeChecked();
    expect(themes().getByRole("radio", { name: "Corail" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(themes().getByRole("radio", { name: "Graphite" })).toBeChecked();
    expect(root()).toHaveAttribute("data-accent", "graphite");
  });

  it("lets only the chosen theme take the focus with Tab", () => {
    render(<AppearanceCard />);
    const tabbable = themes()
      .getAllByRole("radio")
      .filter((radio) => radio.tabIndex === 0);
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveAccessibleName("Prune");
  });

  it("ignores the other keys", async () => {
    render(<AppearanceCard />);
    themes().getByRole("radio", { name: "Prune" }).focus();
    await userEvent.keyboard("a");
    expect(themes().getByRole("radio", { name: "Prune" })).toBeChecked();
  });
});

describe("AppearanceCard: retro touch", () => {
  it("is on by default, and turning it off puts the classic style on the page", async () => {
    render(<AppearanceCard />);
    const retro = screen.getByRole("switch", { name: /Touche rétro/ });
    expect(retro).toBeChecked();
    await userEvent.click(retro);
    expect(retro).not.toBeChecked();
    expect(root()).toHaveAttribute("data-style", "classic");
    await userEvent.click(retro);
    expect(root()).not.toHaveAttribute("data-style");
  });
});

describe("AppearanceCard: a saved choice", () => {
  it("is shown once the page is on the client", () => {
    localStorage.setItem(
      APPEARANCE_STORAGE_KEY,
      JSON.stringify({ mode: "dark", accent: "lagoon", retro: false }),
    );
    render(<AppearanceCard />);
    expect(screen.getByRole("radio", { name: "Sombre" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Lagon" })).toBeChecked();
    expect(screen.getByRole("switch", { name: /Touche rétro/ })).not.toBeChecked();
  });
});
