import type { ReactNode } from "react";
import { AchievementBadge } from "@/components/ui/achievement-badge";
import {
  CheckIcon,
  FlameIcon,
  PencilIcon,
  RouteIcon,
  StarIcon,
  TargetIcon,
} from "@/components/ui/icons";
import { MOCK_BADGES, type MockBadge } from "./mock";

const ICONS: Record<MockBadge["icon"], ReactNode> = {
  pencil: <PencilIcon />,
  flame: <FlameIcon fill="currentColor" />,
  star: <StarIcon fill="currentColor" />,
  check: <CheckIcon strokeWidth={3} />,
  target: <TargetIcon />,
  route: <RouteIcon />,
};

/** The badges, earned ones colorful and tilted, the others calm and dashed. Sample data (A-112). */
export function BadgeGrid() {
  const earned = MOCK_BADGES.filter((badge) => badge.unlocked).length;

  return (
    <section aria-labelledby="badges-title" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 id="badges-title" className="section-title">
          Mes badges
        </h2>
        <span className="text-sm font-semibold text-muted">
          {earned} sur {MOCK_BADGES.length}
        </span>
      </div>
      <ul className="card grid grid-cols-4 gap-x-2 gap-y-4 p-4">
        {MOCK_BADGES.map((badge) => (
          <li key={badge.id} className="flex justify-center">
            <AchievementBadge
              name={badge.name}
              icon={ICONS[badge.icon]}
              tone={badge.tone}
              unlocked={badge.unlocked}
              tilt={badge.tilt}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
