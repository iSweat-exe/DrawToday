import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Mascot, type MascotMood } from "./mascot";

export type MascotMessageProps = {
  /** What Mine says: one or two short sentences, warm and never guilt-tripping. */
  children: ReactNode;
  mood?: MascotMood;
  /** Mascot width in px. */
  size?: number;
  className?: string;
};

/**
 * The mascot with a speech bubble: a welcome, a tip, a congratulation. The mascot is decoration, the bubble is the
 * content (read as plain text by screen readers).
 */
export function MascotMessage({
  children,
  mood = "happy",
  size = 76,
  className,
}: MascotMessageProps) {
  return (
    <div className={cn("flex items-end gap-3", className)}>
      <Mascot mood={mood} size={size} />
      <div className="relative mb-3 min-w-0 flex-1 rounded-card border-2 border-outline bg-card px-4 py-3 shadow-card">
        {/* The tail of the bubble: a rotated square that shares its outline. */}
        <span
          aria-hidden="true"
          className="absolute top-1/2 -left-[9px] size-4 -translate-y-1/2 rotate-45 border-b-2 border-l-2 border-outline bg-card"
        />
        <div className="relative font-display text-base font-medium">{children}</div>
      </div>
    </div>
  );
}
