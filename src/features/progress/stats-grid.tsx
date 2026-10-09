import { formatNumber } from "@/lib/format";
import { MOCK_BADGES, MOCK_PROGRESS } from "./mock";

/** The numbers of the learner, in four tiles. Sample data (A-112). */
export function StatsGrid() {
  const { sessionsTotal, minutesTotal, weekSeries } = MOCK_PROGRESS;
  const earned = MOCK_BADGES.filter((badge) => badge.unlocked).length;
  const tiles = [
    { value: formatNumber(sessionsTotal), label: "séances" },
    { value: formatNumber(minutesTotal), label: "minutes de pratique" },
    { value: formatNumber(weekSeries), label: "semaines de suite" },
    { value: `${earned}/${MOCK_BADGES.length}`, label: "badges" },
  ];

  return (
    <section aria-labelledby="stats-title" className="flex flex-col gap-3">
      <h2 id="stats-title" className="section-title">
        Mes statistiques
      </h2>
      <dl className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="card flex flex-col items-center gap-0.5 px-2 py-3 text-center"
          >
            <dd className="order-1 font-pixel text-4xl font-bold tabular-nums">{tile.value}</dd>
            <dt className="order-2 text-sm text-muted">{tile.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
