import { CheckIcon, StarIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { MockWeek, WeekStatus } from "./mock";

const STATUS_LABEL: Record<WeekStatus, string> = {
  done: "Terminée",
  current: "En cours",
  next: "À venir",
};

/** Sessions of a week: four guided sessions, then the weekly challenge (`parcours.md`). */
const SESSIONS_PER_WEEK = 5;

/**
 * A week of the path. A week to come is calm and dashed but never locked: the path is a queue, not a calendar, so a missed
 * day skips nothing.
 */
export function WeekCard({ week }: { week: MockWeek }) {
  const { number, title, skills, status, done, challenge, assessment } = week;

  return (
    <li
      aria-current={status === "current" ? "step" : undefined}
      className={cn(
        "card flex flex-col gap-3 p-4",
        status === "current" && "ring-4 ring-accent/35",
        status === "next" && "border-dashed bg-surface shadow-none",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-outline font-display text-xl font-bold",
            status === "done" && "bg-success text-accent-ink shadow-sticker-sm",
            status === "current" && "bg-accent text-accent-ink shadow-sticker-sm",
            status === "next" && "border-dashed bg-card text-faint",
          )}
        >
          {status === "done" ? <CheckIcon width={22} height={22} strokeWidth={3} /> : number}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="text-lg leading-tight font-semibold">
            Semaine {number} · {title}
          </h3>
          <p className="text-sm text-muted">{skills}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div
          role="img"
          aria-label={`${done} séance${done > 1 ? "s" : ""} sur ${SESSIONS_PER_WEEK}`}
          className="flex items-center gap-1.5"
        >
          {Array.from({ length: SESSIONS_PER_WEEK }, (_, index) => {
            const isChallenge = index === SESSIONS_PER_WEEK - 1;
            const on = index < done;
            return (
              <span
                key={index}
                aria-hidden="true"
                className={cn(
                  "flex items-center justify-center rounded-full border-2",
                  isChallenge ? "size-7" : "size-5",
                  on
                    ? cn("border-outline", isChallenge ? "bg-reward text-reward-ink" : "bg-accent")
                    : "border-dashed border-line-strong text-faint",
                )}
              >
                {isChallenge && (
                  <StarIcon width={14} height={14} fill={on ? "currentColor" : "none"} />
                )}
              </span>
            );
          })}
        </div>
        <div className="flex items-center gap-1.5">
          {assessment && <span className="chip">Bilan</span>}
          <span className={cn("chip", status === "current" && "chip-accent")}>
            {STATUS_LABEL[status]}
          </span>
        </div>
      </div>

      <p className="text-sm text-muted">Défi : {challenge}</p>
    </li>
  );
}
