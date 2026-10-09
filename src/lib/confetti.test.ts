import { describe, expect, it } from "vitest";
import { CONFETTI_COLORS, makeConfetti } from "./confetti";

describe("makeConfetti", () => {
  it("makes the requested number of pieces, with distinct ids", () => {
    const pieces = makeConfetti(24);
    expect(pieces).toHaveLength(24);
    expect(new Set(pieces.map((piece) => piece.id)).size).toBe(24);
  });

  it("is deterministic: the same call always gives the same burst", () => {
    expect(makeConfetti(12, 100)).toEqual(makeConfetti(12, 100));
  });

  it("gives nothing for a zero, negative or fractional-below-one count", () => {
    expect(makeConfetti(0)).toEqual([]);
    expect(makeConfetti(-5)).toEqual([]);
    expect(makeConfetti(0.9)).toEqual([]);
  });

  it("keeps every piece within the spread (plus the upward bias)", () => {
    for (const piece of makeConfetti(60, 100)) {
      expect(Math.hypot(piece.x, piece.y + 30)).toBeLessThanOrEqual(101);
    }
  });

  it("flies in all directions, not only one", () => {
    const pieces = makeConfetti(30, 100);
    expect(pieces.some((piece) => piece.x > 20)).toBe(true);
    expect(pieces.some((piece) => piece.x < -20)).toBe(true);
    expect(pieces.some((piece) => piece.y > 0)).toBe(true);
    expect(pieces.some((piece) => piece.y < -20)).toBe(true);
  });

  it("uses the theme colors only, and staggers the start by at most 120 ms", () => {
    for (const piece of makeConfetti(40)) {
      expect(CONFETTI_COLORS).toContain(piece.color);
      expect(piece.delayMs).toBeLessThanOrEqual(120);
      expect(piece.size).toBeGreaterThanOrEqual(6);
    }
  });

  it("turns each piece by at most one turn and a half either way", () => {
    for (const piece of makeConfetti(40)) {
      expect(Math.abs(piece.rotation)).toBeLessThanOrEqual(360);
    }
  });
});
