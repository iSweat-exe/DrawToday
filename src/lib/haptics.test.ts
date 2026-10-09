import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { canVibrate, haptic, HAPTIC_PATTERNS } from "./haptics";

const setReducedMotion = (reduced: boolean) =>
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: reduced,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );

beforeEach(() => setReducedMotion(false));
afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(navigator, "vibrate");
});

describe("canVibrate", () => {
  it("is false where the Vibration API does not exist (iOS, desktop)", () => {
    expect(canVibrate()).toBe(false);
  });

  it("is true where navigator.vibrate exists (Android)", () => {
    Object.defineProperty(navigator, "vibrate", { value: vi.fn(), configurable: true });
    expect(canVibrate()).toBe(true);
  });
});

describe("haptic", () => {
  it("does nothing, without throwing, when the device cannot vibrate", () => {
    expect(haptic("success")).toBe(false);
  });

  it("vibrates with the pattern of the requested kind", () => {
    const vibrate = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, "vibrate", { value: vibrate, configurable: true });
    expect(haptic("level-up")).toBe(true);
    expect(vibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS["level-up"]);
  });

  it("defaults to a light tap", () => {
    const vibrate = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, "vibrate", { value: vibrate, configurable: true });
    haptic();
    expect(vibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.tap);
  });

  it("stays silent for people who prefer reduced motion", () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, "vibrate", { value: vibrate, configurable: true });
    setReducedMotion(true);
    expect(haptic("tap")).toBe(false);
    expect(vibrate).not.toHaveBeenCalled();
  });

  it("never throws when the browser refuses to vibrate", () => {
    Object.defineProperty(navigator, "vibrate", {
      value: () => {
        throw new Error("blocked");
      },
      configurable: true,
    });
    expect(haptic("error")).toBe(false);
  });

  it("keeps every pattern short (nothing above a third of a second per pulse)", () => {
    for (const pattern of Object.values(HAPTIC_PATTERNS)) {
      for (const duration of [pattern].flat()) expect(duration).toBeLessThanOrEqual(333);
    }
  });
});
