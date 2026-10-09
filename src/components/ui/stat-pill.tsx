import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type StatTone = "ember" | "reward" | "accent" | "sky";

export type StatPillProps = {
  /** An icon (24 px grid, `currentColor`). */
  icon: ReactNode;
  /** The number or short text shown, e.g. `3` or `850`. */
  value: string | number;
  /** Full sentence for screen readers, e.g. "3 semaines de suite". */
  label: string;
  tone?: StatTone;
  className?: string;
};

/** Fill and icon color of each tone (shared with the achievement badge). */
export const STAT_TONE_CLASSES: Record<StatTone, string> = {
  ember: "bg-ember text-reward-ink",
  reward: "bg-reward text-reward-ink",
  accent: "bg-accent text-accent-ink",
  sky: "bg-sky text-accent-ink",
};

/**
 * A small sticker with an icon and a number: the series of weeks (flame), the XP (star), the level. Discreet by design:
 * it informs, it never nags (no countdown, no loss warning).
 */
export function StatPill({ icon, value, label, tone = "reward", className }: StatPillProps) {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-2 border-outline bg-card py-0.5 pr-3 pl-0.5 font-display text-base font-semibold shadow-sticker-sm",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-7 items-center justify-center rounded-full border-2 border-outline",
          STAT_TONE_CLASSES[tone],
        )}
      >
        {icon}
      </span>
      <span aria-hidden="true" className="tabular-nums">
        {value}
      </span>
    </span>
  );
}
