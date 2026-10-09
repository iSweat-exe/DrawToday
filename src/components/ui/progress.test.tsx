import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "./progress-bar";
import { clampProgress, ProgressRing } from "./progress-ring";

describe("clampProgress", () => {
  it("keeps values between 0 and 1", () => {
    expect(clampProgress(0.4)).toBe(0.4);
    expect(clampProgress(-3)).toBe(0);
    expect(clampProgress(7)).toBe(1);
  });

  it("treats anything that is not a finite number as 0", () => {
    expect(clampProgress(Number.NaN)).toBe(0);
    expect(clampProgress(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("ProgressRing", () => {
  it("is a progressbar with a name and a percentage", () => {
    render(<ProgressRing value={0.6} label="Objectif de la semaine" />);
    const ring = screen.getByRole("progressbar", { name: "Objectif de la semaine" });
    expect(ring).toHaveAttribute("aria-valuenow", "60");
    expect(ring).toHaveAttribute("aria-valuemin", "0");
    expect(ring).toHaveAttribute("aria-valuemax", "100");
  });

  it("clamps out-of-range values", () => {
    const { rerender } = render(<ProgressRing value={3} label="x" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    rerender(<ProgressRing value={-1} label="x" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });

  it("draws an arc whose hidden part matches the progress", () => {
    const { container } = render(
      <ProgressRing value={0.25} label="x" size={100} strokeWidth={10} />,
    );
    const arc = container.querySelectorAll("circle")[1]!;
    const circumference = 2 * Math.PI * 45;
    expect(Number(arc.getAttribute("stroke-dasharray"))).toBeCloseTo(circumference);
    expect(Number(arc.getAttribute("stroke-dashoffset"))).toBeCloseTo(circumference * 0.75);
  });

  it("shows its content in the middle", () => {
    render(
      <ProgressRing value={0.5} label="x">
        3/6
      </ProgressRing>,
    );
    expect(screen.getByText("3/6")).toBeInTheDocument();
  });

  it("uses the reward color on request and the accent color otherwise", () => {
    const { container, rerender } = render(<ProgressRing value={0.5} label="x" />);
    expect(container.querySelectorAll("circle")[1]).toHaveClass("stroke-accent");
    rerender(<ProgressRing value={0.5} label="x" tone="reward" />);
    expect(container.querySelectorAll("circle")[1]).toHaveClass("stroke-reward");
  });

  it("has the size that was asked for", () => {
    render(<ProgressRing value={0.5} label="x" size={64} />);
    expect(screen.getByRole("progressbar")).toHaveStyle({ width: "64px", height: "64px" });
  });
});

describe("ProgressBar", () => {
  it("is a progressbar with a name and a percentage", () => {
    render(<ProgressBar value={0.42} label="XP du niveau" />);
    expect(screen.getByRole("progressbar", { name: "XP du niveau" })).toHaveAttribute(
      "aria-valuenow",
      "42",
    );
  });

  it("scales its fill to the progress, clamped", () => {
    const { container, rerender } = render(<ProgressBar value={0.5} label="x" />);
    const fill = () => container.querySelector<HTMLElement>(".origin-left")!;
    expect(fill().style.transform).toBe("scaleX(0.5)");
    rerender(<ProgressBar value={4} label="x" />);
    expect(fill().style.transform).toBe("scaleX(1)");
  });

  it("uses the reward color on request", () => {
    const { container } = render(<ProgressBar value={0.5} label="x" tone="reward" />);
    expect(container.querySelector(".origin-left")).toHaveClass("bg-reward");
  });
});
