import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { STAT_TONE_CLASSES, type StatTone } from "./stat-pill";

export type AchievementBadgeProps = {
  /** Name of the badge, e.g. "Semaine pleine". */
  name: string;
  /** An icon (24 px grid, `currentColor`). */
  icon: ReactNode;
  /** Earned (colorful, slightly tilted) or still to earn (a dashed outline, never hidden or shamed). */
  unlocked?: boolean;
  tone?: StatTone;
  /** Tilt of an earned badge, in degrees: stickers are never quite straight. */
  tilt?: number;
  className?: string;
};

/**
 * An achievement sticker. A badge says "you did something good": it never unlocks essential content and is never
 * random (docs/pedagogie/gamification.md). A badge still to earn stays visible, calm and dashed.
 */
export function AchievementBadge({
  name,
  icon,
  unlocked = false,
  tone = "reward",
  tilt = -4,
  className,
}: AchievementBadgeProps) {
  return (
    <figure
      role="img"
      aria-label={`${name} : ${unlocked ? "obtenu" : "à obtenir"}`}
      className={cn("flex w-full max-w-20 flex-col items-center gap-1.5 text-center", className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-16 items-center justify-center rounded-full border-2",
          unlocked
            ? cn("border-outline shadow-sticker", STAT_TONE_CLASSES[tone])
            : "border-dashed border-line-strong bg-surface text-faint",
        )}
        style={unlocked ? { rotate: `${tilt}deg` } : undefined}
      >
        <span className={cn("[&>svg]:size-8", !unlocked && "opacity-60")}>{icon}</span>
      </span>
      <figcaption
        aria-hidden="true"
        className={cn(
          "font-display text-xs leading-tight font-semibold",
          !unlocked && "text-faint",
        )}
      >
        {name}
      </figcaption>
    </figure>
  );
}
