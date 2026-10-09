"use client";

import { useRef, type CSSProperties } from "react";
import { makeConfetti } from "@/lib/confetti";

export type ConfettiProps = {
  /** The burst plays while true. Set it back to false in `onDone`. */
  active: boolean;
  /** Number of pieces (default 28). */
  count?: number;
  /** How far the pieces fly, in px (default 120). */
  spread?: number;
  /** Called once every piece has finished its animation. */
  onDone?: () => void;
};

/**
 * A burst of confetti around the point where it is placed (put it inside a `relative` parent). Pure CSS animation,
 * deterministic, hidden from screen readers and from people who prefer reduced motion. Use it for real achievements
 * (end of session, level up), never for routine actions.
 */
export function Confetti({ active, count = 28, spread = 120, onDone }: ConfettiProps) {
  const finished = useRef(0);
  if (!active) return null;
  const pieces = makeConfetti(count, spread);

  return (
    <span
      aria-hidden="true"
      data-testid="confetti"
      className="pointer-events-none absolute inset-0 overflow-visible motion-reduce:hidden"
    >
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="absolute top-1/2 left-1/2 animate-confetti rounded-[2px]"
          onAnimationEnd={() => {
            finished.current += 1;
            if (finished.current >= pieces.length) {
              finished.current = 0;
              onDone?.();
            }
          }}
          style={
            {
              width: piece.size,
              height: piece.size * 1.6,
              marginLeft: -piece.size / 2,
              marginTop: -piece.size,
              backgroundColor: piece.color,
              animationDelay: `${piece.delayMs}ms`,
              "--x": `${piece.x}px`,
              "--y": `${piece.y}px`,
              "--r": `${piece.rotation}deg`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
