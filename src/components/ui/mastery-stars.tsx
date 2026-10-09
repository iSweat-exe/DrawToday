import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { StarIcon } from "./icons";

export type MasteryStarsProps = {
  /** Stars earned, from 0 to `max` (the mastery of a skill, docs/pedagogie/competences.md). */
  value: number;
  /** Number of stars (default 5). */
  max?: number;
  /** What is rated, e.g. "Perspective" : announced as "Perspective : 3 étoiles sur 5". */
  label: string;
  size?: number;
  className?: string;
};

/** Clamps the number of stars to a whole number between 0 and `max`; anything that is not a number counts as 0. */
export function clampStars(value: number, max: number): number {
  return Number.isFinite(value) ? Math.min(max, Math.max(0, Math.floor(value))) : 0;
}

/**
 * The mastery of a skill, as stars: sunny and outlined when earned, a faint outline otherwise. The earned stars pop in
 * one after the other. It measures the *quality* of what the learner can do (the XP measure the effort).
 */
export function MasteryStars({ value, max = 5, label, size = 24, className }: MasteryStarsProps) {
  const earned = clampStars(value, max);
  return (
    <span
      role="img"
      aria-label={`${label} : ${earned} ${earned > 1 ? "étoiles" : "étoile"} sur ${max}`}
      className={cn("inline-flex items-center gap-0.5", className)}
    >
      {Array.from({ length: max }, (_, index) => {
        const on = index < earned;
        return (
          <StarIcon
            key={index}
            width={size}
            height={size}
            data-earned={on}
            fill={on ? "var(--reward)" : "none"}
            stroke={on ? "var(--outline)" : "currentColor"}
            strokeWidth={on ? 2.2 : 1.8}
            className={cn(on ? "animate-pop" : "text-line-strong")}
            style={
              on
                ? ({
                    animationDelay: `${index * 90}ms`,
                    animationFillMode: "backwards",
                  } as CSSProperties)
                : undefined
            }
          />
        );
      })}
    </span>
  );
}
