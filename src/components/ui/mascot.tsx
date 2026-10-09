import { cn } from "@/lib/cn";

/** The moods of Mine. There is no sad one: the app never scolds (docs/pedagogie/gamification.md, principle 3). */
export type MascotMood = "happy" | "cheer" | "wink" | "sleepy";

export type MascotProps = {
  mood?: MascotMood;
  /** Width in px; the height follows. */
  size?: number;
  /** Gently floats up and down (stopped for people who prefer reduced motion). */
  animated?: boolean;
  /** Accessible name. Leave it out when the mascot only decorates a text that already says everything. */
  label?: string;
  className?: string;
};

/** Left and right arm, by mood: down by the sides, raised in joy, one waving, one resting. */
const ARMS: Record<MascotMood, { left: string; right: string }> = {
  happy: { left: "M36 74 Q24 80 20 92", right: "M84 74 Q96 80 100 92" },
  cheer: { left: "M36 70 Q22 62 20 46", right: "M84 70 Q98 62 100 46" },
  wink: { left: "M36 74 Q24 80 20 92", right: "M84 70 Q98 62 100 48" },
  sleepy: { left: "M36 76 Q28 86 26 98", right: "M84 76 Q92 86 94 98" },
};

function Eyes({ mood }: { mood: MascotMood }) {
  if (mood === "sleepy") {
    return (
      <g fill="none" stroke="var(--ink)" strokeWidth="3.5" strokeLinecap="round">
        <path d="M44 69 Q50 74 56 69" />
        <path d="M64 69 Q70 74 76 69" />
      </g>
    );
  }
  return (
    <g>
      <ellipse cx="50" cy="68" rx="4.5" ry="6" fill="var(--ink)" />
      <circle cx="51.6" cy="65.6" r="1.7" fill="#fff" />
      {mood === "wink" ? (
        <path
          d="M64 68 Q70 63 76 68"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      ) : (
        <>
          <ellipse cx="70" cy="68" rx="4.5" ry="6" fill="var(--ink)" />
          <circle cx="71.6" cy="65.6" r="1.7" fill="#fff" />
        </>
      )}
    </g>
  );
}

function Mouth({ mood }: { mood: MascotMood }) {
  if (mood === "cheer") {
    return (
      <g>
        <path
          d="M51 79 Q60 96 69 79 Z"
          fill="var(--ink)"
          stroke="var(--ink)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M55 88 Q60 84 65 88 Q60 93 55 88 Z" fill="#ff7a8a" />
      </g>
    );
  }
  if (mood === "sleepy") {
    return <ellipse cx="60" cy="83" rx="3" ry="3.4" fill="var(--ink)" />;
  }
  return (
    <path
      d="M52 80 Q60 89 68 80"
      fill="none"
      stroke="var(--ink)"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
  );
}

/** A little four-point sparkle, for the joyful mood. */
function Sparkle({ x, y, color, delay }: { x: number; y: number; color: string; delay: string }) {
  return (
    <path
      d={`M${x} ${y - 7} Q${x} ${y} ${x + 7} ${y} Q${x} ${y} ${x} ${y + 7} Q${x} ${y} ${x - 7} ${y} Q${x} ${y} ${x} ${y - 7} Z`}
      fill={color}
      stroke="var(--outline)"
      strokeWidth="1.5"
      strokeLinejoin="round"
      className="origin-center animate-twinkle"
      style={{ transformBox: "fill-box", animationDelay: delay }}
    />
  );
}

/**
 * Mine, the pencil mascot of DrawToday: a yellow pencil standing on its tip, with a face and two stick arms. Drawn with
 * the design tokens (ink outline, reward yellow, ember eraser), so it follows light and dark. It cheers for finished
 * sessions and sleeps on empty screens; it never looks sad or disappointed.
 */
export function Mascot({
  mood = "happy",
  size = 96,
  animated = true,
  label,
  className,
}: MascotProps) {
  const arms = ARMS[mood];
  return (
    <svg
      viewBox="0 0 120 142"
      width={size}
      height={(size * 142) / 120}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      data-mood={mood}
      className={cn("shrink-0 overflow-visible", className)}
    >
      <ellipse cx="60" cy="138" rx="22" ry="3.5" fill="var(--outline)" opacity="0.2" />
      <g className={cn(animated && "animate-bob")}>
        <g fill="none" stroke="var(--outline)" strokeWidth="4.5" strokeLinecap="round">
          <path d={arms.left} />
          <path d={arms.right} />
        </g>
        {/* Wood and graphite. */}
        <path
          d="M36 102 L60 133 L84 102 Z"
          fill="#f6d2a8"
          stroke="var(--outline)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path d="M52.5 122.5 L60 133 L67.5 122.5 Q60 126 52.5 122.5 Z" fill="var(--ink)" />
        {/* Body. */}
        <rect
          x="36"
          y="40"
          width="48"
          height="62"
          fill="var(--reward)"
          stroke="var(--outline)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <rect x="41" y="45" width="5" height="52" rx="2.5" fill="#fff" opacity="0.4" />
        {/* Metal band and eraser. */}
        <rect
          x="36"
          y="27"
          width="48"
          height="13"
          fill="#cfc8e6"
          stroke="var(--outline)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path d="M36 33.5 H84" stroke="var(--ink)" strokeWidth="2" opacity="0.35" />
        <path
          d="M36 27 V19 a10 10 0 0 1 10 -10 H74 a10 10 0 0 1 10 10 V27 Z"
          fill="var(--ember)"
          stroke="var(--outline)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Face. */}
        <circle cx="43" cy="80" r="4.2" fill="var(--ember)" opacity="0.5" />
        <circle cx="77" cy="80" r="4.2" fill="var(--ember)" opacity="0.5" />
        <Eyes mood={mood} />
        <Mouth mood={mood} />
        {mood === "cheer" && (
          <>
            <Sparkle x={12} y={22} color="var(--reward)" delay="0ms" />
            <Sparkle x={108} y={18} color="var(--sky)" delay="400ms" />
            <Sparkle x={104} y={62} color="var(--ember)" delay="800ms" />
          </>
        )}
        {mood === "sleepy" && (
          <text
            x="92"
            y="34"
            fill="var(--foreground)"
            fontFamily="var(--font-fredoka), sans-serif"
            fontWeight="700"
            fontSize="18"
            opacity="0.75"
          >
            z
          </text>
        )}
      </g>
    </svg>
  );
}
