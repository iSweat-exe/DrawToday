import { GoalDots } from "@/components/ui/goal-dots";
import { MOCK_PROGRESS } from "./mock";

/** The weekly goal: one dot per session wanted, checked when done, and what is left to do (never a warning). */
export function WeeklyGoalCard() {
  const { weeklyDone, weeklyGoal } = MOCK_PROGRESS;
  const left = Math.max(0, weeklyGoal - weeklyDone);

  return (
    <section aria-labelledby="goal-title" className="card flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="goal-title" className="text-xl font-semibold">
          Objectif de la semaine
        </h2>
        <span className="chip">
          {weeklyDone}/{weeklyGoal}
        </span>
      </div>
      <GoalDots done={weeklyDone} goal={weeklyGoal} label="Séances de la semaine" />
      <p className="text-sm text-muted">
        {left > 0 ? (
          <>
            Plus que {left} séance{left > 1 ? "s" : ""} pour l&apos;atteindre et gagner{" "}
            <strong className="text-foreground">+50 XP</strong>.
          </>
        ) : (
          <>Objectif atteint, bravo ! Les séances en plus sont du bonus.</>
        )}
      </p>
    </section>
  );
}
