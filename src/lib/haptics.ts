/** Named vibration patterns, from the lightest tap to the biggest celebration. */
export type HapticPattern = "tap" | "success" | "warning" | "error" | "level-up";

/** Durations in milliseconds: a number is one pulse, an array alternates pulse and pause. */
export const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 8,
  success: [12, 40, 18],
  warning: [20, 30, 20],
  error: [40, 40, 40],
  "level-up": [15, 40, 15, 40, 60],
};

/**
 * Tells whether the device can vibrate. The Vibration API exists on Android browsers, never on iOS (Safari and every
 * other iOS browser, which all use WebKit): on iPhone, feedback is visual (and optionally audio), never haptic.
 * @returns `true` when `navigator.vibrate` is available.
 */
export function canVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

/**
 * Gives a short haptic feedback when the device supports it. It never throws and is a silent no-op on iOS, on
 * desktop, and for people who asked for reduced motion.
 * @param pattern - What kind of feedback to give (default: a light tap).
 * @returns `true` when a vibration was requested.
 */
export function haptic(pattern: HapticPattern = "tap"): boolean {
  if (!canVibrate()) return false;
  if (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  ) {
    return false;
  }
  try {
    return navigator.vibrate(HAPTIC_PATTERNS[pattern]);
  } catch {
    return false;
  }
}
