import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Confetti } from "./confetti";
import { XpBurst } from "./xp-burst";

const setReducedMotion = (reduced: boolean) =>
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: reduced }));

describe("Confetti", () => {
  it("renders nothing while inactive", () => {
    const { container } = render(<Confetti active={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders its pieces, hidden from screen readers, when active", () => {
    render(<Confetti active count={10} />);
    const burst = screen.getByTestId("confetti");
    expect(burst).toHaveAttribute("aria-hidden", "true");
    expect(burst.children).toHaveLength(10);
  });

  it("has 28 pieces by default and none when asked for zero", () => {
    const { rerender } = render(<Confetti active />);
    expect(screen.getByTestId("confetti").children).toHaveLength(28);
    rerender(<Confetti active count={0} />);
    expect(screen.getByTestId("confetti").children).toHaveLength(0);
  });

  it("gives each piece its own destination and delay", () => {
    render(<Confetti active count={6} spread={100} />);
    const pieces = Array.from(screen.getByTestId("confetti").children) as HTMLElement[];
    expect(
      new Set(pieces.map((piece) => piece.style.getPropertyValue("--x"))).size,
    ).toBeGreaterThan(3);
    for (const piece of pieces) {
      expect(piece.style.getPropertyValue("--y")).toMatch(/px$/);
      expect(piece.style.getPropertyValue("--r")).toMatch(/deg$/);
    }
  });

  it("is hidden for people who prefer reduced motion", () => {
    render(<Confetti active count={3} />);
    expect(screen.getByTestId("confetti")).toHaveClass("motion-reduce:hidden");
  });

  it("calls onDone once, when the last piece has finished", () => {
    const onDone = vi.fn();
    render(<Confetti active count={4} onDone={onDone} />);
    const pieces = Array.from(screen.getByTestId("confetti").children);
    for (const piece of pieces.slice(0, 3)) fireEvent.animationEnd(piece);
    expect(onDone).not.toHaveBeenCalled();
    fireEvent.animationEnd(pieces[3]!);
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});

describe("XpBurst", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance", "Date"],
    });
    setReducedMotion(false);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("counts the XP up to the gained amount", () => {
    render(<XpBurst amount={100} caption="Séance terminée" />);
    expect(screen.getByTestId("xp-amount")).toHaveTextContent("+0 XP");
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId("xp-amount")).toHaveTextContent("+100 XP");
  });

  it("tells screen readers the final amount at once, once", () => {
    render(<XpBurst amount={150} caption="Défi terminé" />);
    expect(screen.getByRole("status")).toHaveTextContent("+150 XP, Défi terminé");
  });

  it("works without a caption", () => {
    render(<XpBurst amount={40} />);
    expect(screen.getByRole("status")).toHaveTextContent(/^\+40 XP$/);
  });

  it("plays a burst of confetti once, then removes it", () => {
    render(<XpBurst amount={100} />);
    const burst = screen.getByTestId("confetti");
    for (const piece of Array.from(burst.children)) fireEvent.animationEnd(piece);
    expect(screen.queryByTestId("confetti")).not.toBeInTheDocument();
  });

  it("gives the final number at once to people who prefer reduced motion", () => {
    setReducedMotion(true);
    render(<XpBurst amount={100} />);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByTestId("xp-amount")).toHaveTextContent("+100 XP");
  });
});
