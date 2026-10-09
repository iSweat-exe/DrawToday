import { LevelBadge } from "@/components/ui/level-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatNumber } from "@/lib/format";
import { MOCK_PROGRESS } from "./mock";

/** The level of the learner: the seal, the title, the XP and the way to the next level. Discreet by design. */
export function LevelCard({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const { level, levelTitle, xp, levelStartXp, nextLevelXp } = MOCK_PROGRESS;
  const span = nextLevelXp - levelStartXp;
  const into = xp - levelStartXp;
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <section aria-labelledby="level-title" className="card flex items-center gap-4 p-4">
      <LevelBadge level={level} title={levelTitle} size={72} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Heading id="level-title" className="text-xl font-semibold">
          {formatNumber(xp)} XP
        </Heading>
        <ProgressBar
          value={into / span}
          label={`Progression vers le niveau ${level + 1}`}
          tone="reward"
        />
        <p className="text-sm text-muted">
          {formatNumber(into)} / {formatNumber(span)} XP pour le niveau {level + 1}
        </p>
      </div>
    </section>
  );
}
