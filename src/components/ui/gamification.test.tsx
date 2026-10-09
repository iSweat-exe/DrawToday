import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AchievementBadge } from "./achievement-badge";
import { GoalDots } from "./goal-dots";
import { FlameIcon, StarIcon } from "./icons";
import { LevelBadge } from "./level-badge";
import { clampStars, MasteryStars } from "./mastery-stars";
import { StatPill } from "./stat-pill";

describe("StatPill", () => {
  it("is announced as one sentence, not as an icon and a number", () => {
    render(<StatPill icon={<FlameIcon />} value={3} label="3 semaines de suite" tone="ember" />);
    const pill = screen.getByRole("img", { name: "3 semaines de suite" });
    expect(pill).toHaveTextContent("3");
    expect(pill.querySelector(".bg-ember")).not.toBeNull();
  });

  it("has a tone for each kind of number", () => {
    for (const [tone, cls] of [
      ["reward", "bg-reward"],
      ["accent", "bg-accent"],
      ["sky", "bg-sky"],
    ] as const) {
      const { container, unmount } = render(
        <StatPill icon={<StarIcon />} value="1" label="x" tone={tone} />,
      );
      expect(container.querySelector(`.${cls}`), tone).not.toBeNull();
      unmount();
    }
  });
});

describe("LevelBadge", () => {
  it("announces the level and its title together", () => {
    render(<LevelBadge level={4} title="Premier trait" />);
    expect(screen.getByRole("img", { name: "Niveau 4, Premier trait" })).toBeInTheDocument();
  });

  it("works without a title", () => {
    render(<LevelBadge level={12} />);
    expect(screen.getByRole("img", { name: "Niveau 12" })).toHaveTextContent("12");
  });

  it("draws a closed ten-point seal", () => {
    const { container } = render(<LevelBadge level={1} />);
    const points = container.querySelector("polygon")!.getAttribute("points")!.split(" ");
    expect(points).toHaveLength(20);
  });
});

describe("GoalDots", () => {
  it("shows one dot per session of the goal and checks the ones done", () => {
    const { container } = render(<GoalDots done={2} goal={4} label="Objectif de la semaine" />);
    const bar = screen.getByRole("progressbar", { name: "Objectif de la semaine" });
    expect(bar).toHaveAttribute("aria-valuenow", "2");
    expect(bar).toHaveAttribute("aria-valuemax", "4");
    expect(bar).toHaveAttribute("aria-valuetext", "2 séances sur 4");
    expect(container.querySelectorAll("[data-done='true']")).toHaveLength(2);
    expect(container.querySelectorAll("[data-done='false']")).toHaveLength(2);
  });

  it("says 'séance' in the singular for one", () => {
    render(<GoalDots done={1} goal={3} label="x" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "1 séance sur 3");
  });

  it("never goes over the goal, nor below zero, and survives nonsense", () => {
    for (const [done, expected] of [
      [9, "3"],
      [-2, "0"],
      [Number.NaN, "0"],
      [1.9, "1"],
    ] as const) {
      const { unmount } = render(<GoalDots done={done} goal={3} label="x" />);
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", expected);
      unmount();
    }
  });

  it("has at least one dot, even for a silly goal", () => {
    const { container } = render(<GoalDots done={0} goal={0} label="x" />);
    expect(container.querySelectorAll("[data-done]")).toHaveLength(1);
  });
});

describe("MasteryStars", () => {
  it("announces the skill and the number of stars", () => {
    render(<MasteryStars value={3} label="Perspective" />);
    expect(screen.getByRole("img", { name: "Perspective : 3 étoiles sur 5" })).toBeInTheDocument();
  });

  it("uses the singular for one star and for none", () => {
    const { unmount } = render(<MasteryStars value={1} label="Ombres" />);
    expect(screen.getByRole("img", { name: "Ombres : 1 étoile sur 5" })).toBeInTheDocument();
    unmount();
    render(<MasteryStars value={0} label="Ombres" />);
    expect(screen.getByRole("img", { name: "Ombres : 0 étoile sur 5" })).toBeInTheDocument();
  });

  it("fills as many stars as earned", () => {
    const { container } = render(<MasteryStars value={4} label="x" />);
    expect(container.querySelectorAll("[data-earned='true']")).toHaveLength(4);
    expect(container.querySelectorAll("[data-earned='false']")).toHaveLength(1);
  });

  it("clamps the value", () => {
    expect(clampStars(7, 5)).toBe(5);
    expect(clampStars(-1, 5)).toBe(0);
    expect(clampStars(2.8, 5)).toBe(2);
    expect(clampStars(Number.NaN, 5)).toBe(0);
  });
});

describe("AchievementBadge", () => {
  it("says whether it is earned", () => {
    const { rerender } = render(
      <AchievementBadge name="Semaine pleine" icon={<FlameIcon />} unlocked />,
    );
    expect(screen.getByRole("img", { name: "Semaine pleine : obtenu" })).toBeInTheDocument();
    rerender(<AchievementBadge name="Semaine pleine" icon={<FlameIcon />} />);
    expect(screen.getByRole("img", { name: "Semaine pleine : à obtenir" })).toBeInTheDocument();
  });

  it("tilts an earned badge like a sticker, and keeps a badge to earn straight and dashed", () => {
    const { container, rerender } = render(
      <AchievementBadge name="A" icon={<FlameIcon />} unlocked tilt={5} />,
    );
    const disc = container.querySelector("figure > span") as HTMLElement;
    expect(disc.style.rotate).toBe("5deg");
    rerender(<AchievementBadge name="A" icon={<FlameIcon />} />);
    const idle = container.querySelector("figure > span") as HTMLElement;
    expect(idle.style.rotate).toBe("");
    expect(idle).toHaveClass("border-dashed");
  });
});
