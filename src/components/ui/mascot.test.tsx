import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./empty-state";
import { Mascot, type MascotMood } from "./mascot";
import { MascotMessage } from "./mascot-message";

const MOODS: MascotMood[] = ["happy", "cheer", "wink", "sleepy"];

describe("Mascot", () => {
  it("is decoration by default: hidden from screen readers", () => {
    const { container } = render(<Mascot />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
    expect(svg).toHaveAttribute("data-mood", "happy");
  });

  it("has an accessible name when it carries a meaning", () => {
    render(<Mascot mood="cheer" label="Mine est ravie" />);
    expect(screen.getByRole("img", { name: "Mine est ravie" })).toBeInTheDocument();
  });

  it("has a face for every mood, and only the joyful one sparkles", () => {
    for (const mood of MOODS) {
      const { container, unmount } = render(<Mascot mood={mood} />);
      expect(container.querySelector("svg")).toHaveAttribute("data-mood", mood);
      expect(container.querySelectorAll(".animate-twinkle").length > 0).toBe(mood === "cheer");
      unmount();
    }
  });

  it("keeps its proportions when resized", () => {
    const { container } = render(<Mascot size={120} />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("width", "120");
    expect(Number(svg.getAttribute("height"))).toBeCloseTo(142);
  });

  it("floats unless told not to (reduced motion also stops it, globally)", () => {
    const { container, rerender } = render(<Mascot />);
    expect(container.querySelector(".animate-bob")).not.toBeNull();
    rerender(<Mascot animated={false} />);
    expect(container.querySelector(".animate-bob")).toBeNull();
  });

  it("never looks sad: there is no such mood", () => {
    expect(MOODS).not.toContain("sad");
  });
});

describe("MascotMessage", () => {
  it("shows what the mascot says as plain text next to a decorative mascot", () => {
    const { container } = render(<MascotMessage mood="cheer">Bravo !</MascotMessage>);
    expect(screen.getByText("Bravo !")).toBeVisible();
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("svg")).toHaveAttribute("data-mood", "cheer");
  });
});

describe("EmptyState with the mascot", () => {
  it("shows the mascot instead of the icon", () => {
    const { container } = render(
      <EmptyState title="Rien ici" mascot="sleepy" icon={<span data-testid="icon" />} />,
    );
    expect(container.querySelector("svg")).toHaveAttribute("data-mood", "sleepy");
    expect(screen.queryByTestId("icon")).toBeNull();
  });
});
