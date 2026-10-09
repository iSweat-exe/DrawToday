import { cn } from "@/lib/cn";
import { clampProgress } from "./progress-ring";

export type ProgressBarProps = {
  /** Progress from 0 to 1 (values outside are clamped). */
  value: number;
  /** Accessible name, e.g. "XP du niveau". */
  label: string;
  tone?: "accent" | "reward";
  className?: string;
};

/** A horizontal progress bar (XP of the level). It fills on first render and a light sweeps over it: pure CSS. */
export function ProgressBar({ value, label, tone = "accent", className }: ProgressBarProps) {
  const progress = clampProgress(value);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      className={cn("h-3 w-full overflow-hidden rounded-full bg-foreground/10", className)}
    >
      <div
        className={cn(
          "relative h-full w-full origin-left overflow-hidden rounded-full animate-bar-fill",
          tone === "reward" ? "bg-reward" : "bg-accent",
        )}
        style={{ transform: `scaleX(${progress})` }}
      >
        <span className="absolute inset-y-0 left-0 w-1/3 animate-shine bg-white/35" />
      </div>
    </div>
  );
}
