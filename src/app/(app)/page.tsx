import { PreviewNotice } from "@/components/preview-notice";
import { FlameIcon, StarIcon } from "@/components/ui/icons";
import { MascotMessage } from "@/components/ui/mascot-message";
import { StatPill } from "@/components/ui/stat-pill";
import { ChallengeCard } from "@/features/exercises/challenge-card";
import { TodaySessionCard } from "@/features/exercises/today-session-card";
import { LevelCard } from "@/features/progress/level-card";
import { MOCK_PROGRESS } from "@/features/progress/mock";
import { WeeklyGoalCard } from "@/features/progress/weekly-goal-card";
import { TipCard } from "@/features/tips/tip-card";
import { formatNumber } from "@/lib/format";

/**
 * Home ("Aujourd'hui"): the session of the day, the weekly goal, the level, the challenge and a tip. A mock-up with sample
 * data (A-112) to show the look of the finished app; the pieces are replaced one by one by the real features.
 */
export default function HomePage() {
  const { weekSeries, xp } = MOCK_PROGRESS;

  return (
    <>
      <h1 className="page-title">Accueil</h1>
      <PreviewNotice />
      <div className="flex flex-wrap gap-2">
        <StatPill
          tone="ember"
          icon={<FlameIcon width={16} height={16} fill="currentColor" />}
          value={weekSeries}
          label={`${weekSeries} semaines de suite`}
        />
        <StatPill
          tone="reward"
          icon={<StarIcon width={16} height={16} fill="currentColor" />}
          value={formatNumber(xp)}
          label={`${formatNumber(xp)} points d'expérience`}
        />
      </div>
      <MascotMessage mood="happy">
        Plus qu&apos;une séance pour ton objectif de la semaine !
      </MascotMessage>
      <TodaySessionCard />
      <WeeklyGoalCard />
      <LevelCard />
      <ChallengeCard />
      <TipCard />
    </>
  );
}
