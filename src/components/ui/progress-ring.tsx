import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ProgressRingProps = {
  /** Progress from 0 to 1 (values outside are clamped). */
  value: number;
  /** Accessible name, e.g. "Objectif de la semaine". */
  label: string;
  /** Diameter in px. */
  size?: number;
  strokeWidth?: number;
  /** Color of the arc: `accent` (default) or `reward` (XP, achievements). */
  tone?: "accent" | "reward";
  /** Shown in the middle of the ring (a number, an icon…). */
  children?: ReactNode;
  className?: string;
};

/** Clamps a progress value to the 0–1 range; anything that is not a number counts as 0. */
export function clampProgress(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

/**
 * A circular progress indicator (weekly goal, level…). The arc fills with an animation on first render: it is pure CSS,
 * so the component also works in Server Components.
 */
export function ProgressRing({
  value,
  label,
  size = 96,
  strokeWidth = 10,
  tone = "accent",
  children,
  className,
}: ProgressRingProps) {
  const progress = clampProgress(value);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-foreground/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          style={{ "--ring-circumference": circumference } as CSSProperties}
          className={cn("animate-ring-fill", tone === "reward" ? "stroke-reward" : "stroke-accent")}
        />
      </svg>
      {children !== undefined && (
        <div className="absolute inset-0 flex items-center justify-center text-center font-semibold">
          {children}
        </div>
      )}
    </div>
  );
}
