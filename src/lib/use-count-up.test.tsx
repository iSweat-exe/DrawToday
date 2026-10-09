import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { easeOutCubic, useCountUp } from "./use-count-up";

const setReducedMotion = (reduced: boolean) =>
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: reduced }));

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

describe("easeOutCubic", () => {
  it("goes from 0 to 1 and is fast at first", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.8);
  });

  it("clamps its input", () => {
    expect(easeOutCubic(-4)).toBe(0);
    expect(easeOutCubic(9)).toBe(1);
  });
});

describe("useCountUp", () => {
  it("starts at 0, rises, and lands on the target", () => {
    const { result } = renderHook(() => useCountUp(100, 800));
    expect(result.current).toBe(0);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBeGreaterThan(0);
    expect(result.current).toBeLessThan(100);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(100);
  });

  it("never goes backwards while counting", () => {
    const { result } = renderHook(() => useCountUp(250, 600));
    let previous = 0;
    for (let step = 0; step < 12; step += 1) {
      act(() => {
        vi.advanceTimersByTime(60);
      });
      expect(result.current).toBeGreaterThanOrEqual(previous);
      previous = result.current;
    }
  });

  it("gives the final number at once to people who prefer reduced motion", () => {
    setReducedMotion(true);
    const { result } = renderHook(() => useCountUp(100, 800));
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current).toBe(100);
  });

  it("counts again towards a new target", () => {
    const { result, rerender } = renderHook(({ target }) => useCountUp(target, 300), {
      initialProps: { target: 10 },
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe(10);
    rerender({ target: 50 });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe(50);
  });

  it("stops its animation when the component goes away", () => {
    const cancel = vi.spyOn(window, "cancelAnimationFrame");
    const { unmount } = renderHook(() => useCountUp(100, 800));
    unmount();
    expect(cancel).toHaveBeenCalled();
  });
});
