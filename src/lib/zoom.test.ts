import { describe, expect, it } from "vitest";
import {
  clampScale,
  clampView,
  distanceBetween,
  DOUBLE_TAP_SCALE,
  doubleTapScale,
  MAX_SCALE,
  pinchScale,
  zoomAround,
} from "./zoom";

describe("clampScale", () => {
  it("keeps the scale between 1 and the maximum", () => {
    expect(clampScale(2)).toBe(2);
    expect(clampScale(0.2)).toBe(1);
    expect(clampScale(99)).toBe(MAX_SCALE);
  });

  it("falls back to 1 for values that are not numbers", () => {
    expect(clampScale(Number.NaN)).toBe(1);
    expect(clampScale(Number.POSITIVE_INFINITY)).toBe(1);
  });
});

describe("clampView", () => {
  it("keeps a fitted image centred, whatever the drag", () => {
    expect(clampView({ scale: 1, x: 120, y: -40 }, 400, 800)).toEqual({ scale: 1, x: 0, y: 0 });
  });

  it("lets a zoomed image move until its edge reaches the edge of the screen", () => {
    // At 3×, a 400 px wide viewport shows the centre third: the image can move by (3 - 1) * 400 / 2 = 400 px.
    expect(clampView({ scale: 3, x: 999, y: 0 }, 400, 800)).toEqual({ scale: 3, x: 400, y: 0 });
    expect(clampView({ scale: 3, x: -999, y: -999 }, 400, 800)).toEqual({
      scale: 3,
      x: -400,
      y: -800,
    });
    expect(clampView({ scale: 3, x: 150, y: -300 }, 400, 800)).toEqual({
      scale: 3,
      x: 150,
      y: -300,
    });
  });

  it("also clamps the scale", () => {
    expect(clampView({ scale: 50, x: 0, y: 0 }, 100, 100).scale).toBe(MAX_SCALE);
  });

  it("copes with an empty viewport (nothing is rendered yet)", () => {
    expect(clampView({ scale: 2, x: 10, y: 10 }, 0, 0)).toEqual({ scale: 2, x: 0, y: 0 });
  });

  it("uses the displayed size of the image: a wide, short image stays centred vertically until it is taller than the screen", () => {
    const content = { width: 400, height: 300 };
    // 300 * 2 = 600 < 800: no vertical drag at all; horizontally 400 * 2 - 400 = 400 → ±200.
    expect(clampView({ scale: 2, x: 999, y: 999 }, 400, 800, content)).toEqual({
      scale: 2,
      x: 200,
      y: 0,
    });
    // 300 * 5 = 1500 > 800: it can move by (1500 - 800) / 2.
    expect(clampView({ scale: 5, x: 0, y: -999 }, 400, 800, content).y).toBe(-350);
  });
});

describe("pinchScale", () => {
  it("doubles the scale when the fingers move twice as far apart", () => {
    expect(pinchScale(1, 100, 200)).toBe(2);
    expect(pinchScale(2, 100, 150)).toBe(3);
  });

  it("shrinks it when the fingers come together, down to 1", () => {
    expect(pinchScale(2, 200, 100)).toBe(1);
    expect(pinchScale(1.5, 200, 50)).toBe(1);
  });

  it("never goes past the maximum", () => {
    expect(pinchScale(4, 100, 900)).toBe(MAX_SCALE);
  });

  it("keeps the start scale when the start distance is 0", () => {
    expect(pinchScale(2, 0, 100)).toBe(2);
  });
});

describe("zoomAround", () => {
  it("zooms on the centre without moving the image", () => {
    expect(zoomAround({ scale: 1, x: 0, y: 0 }, 2, 0, 0)).toEqual({ scale: 2, x: 0, y: 0 });
  });

  it("keeps the point under the finger in place", () => {
    const next = zoomAround({ scale: 1, x: 0, y: 0 }, 2, 100, 50);
    // A point at (100, 50) from the centre, after a 2× zoom, would be at (200, 100): the image shifts back by (100, 50).
    expect(next).toEqual({ scale: 2, x: -100, y: -50 });
  });

  it("works when the image is already moved and zoomed", () => {
    const next = zoomAround({ scale: 2, x: -100, y: 0 }, 4, 0, 0);
    expect(next).toEqual({ scale: 4, x: -200, y: 0 });
  });

  it("clamps the scale it is asked for", () => {
    expect(zoomAround({ scale: 1, x: 0, y: 0 }, 100, 0, 0).scale).toBe(MAX_SCALE);
  });
});

describe("doubleTapScale", () => {
  it("zooms in from a fitted image", () => {
    expect(doubleTapScale(1)).toBe(DOUBLE_TAP_SCALE);
    expect(doubleTapScale(1.03)).toBe(DOUBLE_TAP_SCALE);
  });

  it("goes back to fitted from a zoomed image", () => {
    expect(doubleTapScale(2)).toBe(1);
    expect(doubleTapScale(MAX_SCALE)).toBe(1);
  });
});

describe("distanceBetween", () => {
  it("is the straight-line distance", () => {
    expect(distanceBetween(0, 0, 3, 4)).toBe(5);
    expect(distanceBetween(10, 10, 10, 10)).toBe(0);
  });
});
