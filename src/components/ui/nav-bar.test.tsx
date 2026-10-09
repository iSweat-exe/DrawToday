import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NavBar } from "./nav-bar";

describe("NavBar", () => {
  it("is the banner of the page, with the brand as a link home", () => {
    render(<NavBar />);
    const brand = within(screen.getByRole("banner")).getByRole("link", { name: "DrawToday" });
    expect(brand).toHaveAttribute("href", "/");
  });

  it("does not prefetch the home page (saves a request on every page)", () => {
    render(<NavBar />);
    expect(screen.getByRole("link", { name: "DrawToday" })).not.toHaveAttribute("data-prefetch");
  });

  it("shows the actions next to the brand", () => {
    render(<NavBar actions={<button type="button">Se connecter</button>} />);
    expect(
      within(screen.getByRole("banner")).getByRole("button", { name: "Se connecter" }),
    ).toBeVisible();
  });

  it("keeps the touch target of the brand at 44 px or more, and hides its decorative logo", () => {
    render(<NavBar />);
    const brand = screen.getByRole("link", { name: "DrawToday" });
    expect(brand).toHaveClass("min-h-tap");
    expect(brand.querySelector("[aria-hidden='true']")).not.toBeNull();
  });

  it("sticks to the top and clears the notch", () => {
    render(<NavBar className="extra" />);
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("sticky", "top-0", "extra");
    expect(header.className).toContain("safe-area-inset-top");
  });
});
