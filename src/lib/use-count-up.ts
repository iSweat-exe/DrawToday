import { useEffect, useState } from "react";

/**
 * Easing for the count: fast at first, slow at the end (the number "lands").
 * @param progress - Progress of the animation, from 0 to 1.
 * @returns The eased progress, from 0 to 1.
 */
export function easeOutCubic(progress: number): number {
  const clamped = Math.min(1, Math.max(0, progress));
  return 1 - (1 - clamped) ** 3;
}

/**
 * Counts from 0 up to a number (an XP gain, a level), then stops. People who prefer reduced motion get the final number at once.
 * @param target - The number to reach.
 * @param durationMs - Duration of the count in milliseconds (default 800).
 * @returns The number to display right now.
 */
export function useCountUp(target: number, durationMs = 800): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const duration = reduce ? 0 : durationMs;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      setValue(Math.round(easeOutCubic(progress) * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}
