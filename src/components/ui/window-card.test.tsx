import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "./progress-bar";
import { WindowCard } from "./window-card";

describe("WindowCard", () => {
  it("is a section named by the heading inside, and shows its content", () => {
    render(
      <WindowCard title="conseil.txt" aria-labelledby="t">
        <h2 id="t">Un conseil</h2>
        <p>Le texte</p>
      </WindowCard>,
    );
    expect(screen.getByRole("region", { name: "Un conseil" })).toBeInTheDocument();
    expect(screen.getByText("Le texte")).toBeVisible();
  });

  it("has a decorative title bar that screen readers skip (the heading says it all)", () => {
    const { container } = render(
      <WindowCard title="conseil.txt" aria-labelledby="t">
        <h2 id="t">Un conseil</h2>
      </WindowCard>,
    );
    const bar = container.querySelector(".window-bar")!;
    expect(bar).toHaveAttribute("aria-hidden", "true");
    expect(bar).toHaveTextContent("conseil.txt");
    expect(screen.queryByText("conseil.txt")).toBeInTheDocument();
    expect(screen.getByRole("region")).not.toHaveAccessibleName("conseil.txt");
  });

  it("takes classes for the card and for its content", () => {
    const { container } = render(
      <WindowCard title="x" aria-labelledby="t" className="extra" bodyClassName="gap-3">
        <h2 id="t">T</h2>
      </WindowCard>,
    );
    expect(container.firstElementChild).toHaveClass("card", "extra");
    expect(container.querySelector(".window-bar")!.nextElementSibling).toHaveClass("gap-3", "p-4");
  });
});

describe("ProgressBar blocks", () => {
  it("has a block overlay that is decoration and does not block touches", () => {
    const { container } = render(<ProgressBar value={0.4} label="XP" />);
    const blocks = container.querySelector(".progress-blocks")!;
    expect(blocks).toHaveAttribute("aria-hidden", "true");
    expect(blocks).toHaveClass("pointer-events-none");
    expect(screen.getByRole("progressbar", { name: "XP" })).toHaveAttribute("aria-valuenow", "40");
  });
});
