import { cn } from "@/lib/cn";
import { CheckIcon } from "./icons";

export type GoalDotsProps = {
  /** Sessions done this week. */
  done: number;
  /** Sessions wanted this week (3 to 6, chosen by the learner). */
  goal: number;
  /** Accessible name, e.g. "Objectif de la semaine". */
  label: string;
  className?: string;
};

/**
 * The weekly goal as a row of dots, one per session: a checked sticker for each session done, a dashed circle for each one
 * to come. Going over the goal keeps every dot checked (no overflow, no pressure to do more).
 */
export function GoalDots({ done, goal, label, className }: GoalDotsProps) {
  const total = Math.max(1, Math.floor(goal));
  const reached = Math.min(total, Math.max(0, Math.floor(Number.isFinite(done) ? done : 0)));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={reached}
      aria-valuetext={`${reached} séance${reached > 1 ? "s" : ""} sur ${total}`}
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {Array.from({ length: total }, (_, index) => {
        const on = index < reached;
        return (
          <span
            key={index}
            aria-hidden="true"
            data-done={on}
            className={cn(
              "flex size-9 items-center justify-center rounded-full border-2",
              on
                ? "animate-pop border-outline bg-accent text-accent-ink shadow-sticker-sm"
                : "border-dashed border-line-strong bg-surface",
            )}
            style={
              on ? { animationDelay: `${index * 70}ms`, animationFillMode: "backwards" } : undefined
            }
          >
            {on && <CheckIcon width={20} height={20} strokeWidth={3} />}
          </span>
        );
      })}
    </div>
  );
}
