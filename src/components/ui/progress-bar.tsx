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

/** A horizontal progress bar (XP of the level): a chunky inked track that fills on first render, with a glossy highlight and, with the retro touch, blocks like a 90s installer. Pure CSS. */
export function ProgressBar({ value, label, tone = "accent", className }: ProgressBarProps) {
  const progress = clampProgress(value);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      className={cn(
        "relative h-5 w-full overflow-hidden rounded-full border-2 border-outline bg-card",
        className,
      )}
    >
      <div
        className={cn(
          "relative h-full w-full origin-left overflow-hidden rounded-full border-r-2 border-outline animate-bar-fill",
          tone === "reward" ? "bg-reward" : "bg-accent",
        )}
        style={{ transform: `scaleX(${progress})` }}
      >
        <span className="absolute inset-x-1 top-0.5 h-1 rounded-full bg-white/45" />
      </div>
      {/* The retro touch: gaps over the bar make it a row of blocks. Not scaled with the fill, so the blocks keep their size. */}
      <span aria-hidden="true" className="progress-blocks pointer-events-none absolute inset-0" />
    </div>
  );
}
