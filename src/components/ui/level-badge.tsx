import { cn } from "@/lib/cn";

export type LevelBadgeProps = {
  /** The level, from 1. */
  level: number;
  /** The title of the level (e.g. "Main sûre"), shown under the seal and announced with it. */
  title?: string;
  /** Width of the seal in px. */
  size?: number;
  className?: string;
};

const POINTS = 10;

/** The outline of a scalloped seal: alternating outer and inner radius, as SVG polygon points. */
function sealPoints(outer: number, inner: number): string {
  const center = 50;
  return Array.from({ length: POINTS * 2 }, (_, index) => {
    const angle = (Math.PI * index) / POINTS - Math.PI / 2;
    const radius = index % 2 === 0 ? outer : inner;
    return `${(center + radius * Math.cos(angle)).toFixed(2)},${(center + radius * Math.sin(angle)).toFixed(2)}`;
  }).join(" ");
}

const SEAL = sealPoints(46, 38.5);

/**
 * The level of the learner: a scalloped seal with the number, like a sticker on a sketchbook, and the title of the level
 * under it. Pure SVG, so it also works in Server Components.
 */
export function LevelBadge({ level, title, size = 64, className }: LevelBadgeProps) {
  return (
    <figure
      role="img"
      aria-label={title ? `Niveau ${level}, ${title}` : `Niveau ${level}`}
      className={cn("inline-flex flex-col items-center gap-1", className)}
    >
      <span
        className="relative inline-flex"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className="drop-shadow-[2px_2px_0_var(--outline)]"
        >
          <polygon
            points={SEAL}
            fill="var(--accent)"
            stroke="var(--outline)"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <circle
            cx="50"
            cy="50"
            r="30"
            fill="none"
            stroke="var(--accent-ink)"
            strokeWidth="2"
            strokeDasharray="3 5"
            opacity="0.7"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-pixel text-3xl font-bold text-accent-ink tabular-nums">
          {level}
        </span>
      </span>
      {title && (
        <figcaption aria-hidden="true" className="font-display text-sm font-semibold">
          {title}
        </figcaption>
      )}
    </figure>
  );
}
