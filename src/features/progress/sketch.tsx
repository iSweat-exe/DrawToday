import { cn } from "@/lib/cn";
import type { SketchKind } from "./mock";

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Hand-drawn looking pictures of the exercises, standing in for the learner's real drawings in the mock-ups. */
function Drawing({ kind, rough }: { kind: SketchKind; rough: boolean }) {
  switch (kind) {
    case "lines":
      return (
        <g {...STROKE}>
          <path d="M14 22 Q44 19 74 22 T106 21" />
          <path d="M14 34 Q40 32 70 35 T106 33" />
          <path d="M14 46 Q46 44 72 46 T106 47" />
          <path d="M14 58 Q42 61 68 58 T106 59" />
          <path d="M14 70 Q48 67 76 70 T106 69" />
        </g>
      );
    case "box":
      // The "before": wobbly lines that overshoot, edges that do not meet and do not converge.
      if (rough) {
        return (
          <g {...STROKE} strokeWidth={2.2}>
            <path
              d="M33 37 Q50 26 68 19 Q82 26 96 36 Q80 44 62 50 Q46 42 33 37"
              fill="var(--reward)"
              fillOpacity="0.4"
            />
            <path d="M34 36 Q31 52 37 68 Q50 74 66 82" />
            <path d="M64 47 Q67 62 63 78" />
            <path d="M95 33 Q99 50 93 64 Q80 70 66 80" />
            <path d="M30 40 L40 34" strokeWidth="1.6" />
          </g>
        );
      }
      return (
        <g {...STROKE}>
          <path d="M36 34 L64 22 L92 32 L64 46 Z" fill="var(--reward)" fillOpacity="0.55" />
          <path d="M36 34 L36 66 L64 78 L64 46" />
          <path d="M92 32 L92 63 L64 78" fill="var(--accent)" fillOpacity="0.25" />
        </g>
      );
    case "sphere":
      return (
        <g {...STROKE}>
          <ellipse
            cx="64"
            cy="76"
            rx="26"
            ry="5"
            fill="currentColor"
            fillOpacity="0.15"
            stroke="none"
          />
          <circle cx="60" cy="42" r="27" fill="var(--accent)" fillOpacity="0.18" />
          <path d="M72 22 Q84 38 74 58" strokeWidth="2" />
          <path d="M76 26 Q88 40 78 54" strokeWidth="2" />
          <path d="M48 30 Q52 26 58 25" strokeWidth="2" />
        </g>
      );
    case "cylinder":
      return (
        <g {...STROKE}>
          <ellipse cx="56" cy="28" rx="24" ry="8" fill="var(--sky)" fillOpacity="0.25" />
          <path d="M32 28 L33 62 Q56 74 79 62 L80 28" fill="var(--sky)" fillOpacity="0.12" />
          <path d="M80 36 Q98 36 96 50 Q94 62 78 58" />
        </g>
      );
    case "hand":
      return (
        <g {...STROKE}>
          <path d="M40 78 Q34 60 38 48 L38 30 Q38 24 44 24 Q50 24 50 30 L50 42 L50 20 Q50 14 56 14 Q62 14 62 20 L62 42 L62 22 Q62 16 68 16 Q74 16 74 22 L74 46 L75 32 Q75 26 81 27 Q86 28 85 34 L84 58 Q84 74 70 80 Z" />
        </g>
      );
  }
}

const LABELS: Record<SketchKind, string> = {
  lines: "Traits à main levée",
  box: "Une boîte en perspective",
  sphere: "Une sphère éclairée",
  cylinder: "Un mug dessiné",
  hand: "Le contour d'une main",
};

export type SketchProps = {
  kind: SketchKind;
  /** Make the drawing a little wobbly and pale: the "before" of a before/after. */
  rough?: boolean;
  className?: string;
};

/** A small drawing on paper, with an accessible description. Placeholder for the learner's photos. */
export function Sketch({ kind, rough = false, className }: SketchProps) {
  return (
    <svg
      viewBox="0 0 120 90"
      role="img"
      aria-label={LABELS[kind]}
      className={cn(
        "aspect-[4/3] w-full rounded-control bg-background text-foreground",
        rough && "opacity-80",
        className,
      )}
      style={rough ? { transform: "rotate(-1.5deg)" } : undefined}
    >
      <Drawing kind={kind} rough={rough} />
    </svg>
  );
}
