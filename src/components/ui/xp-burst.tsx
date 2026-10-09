"use client";

import { useState } from "react";
import { useCountUp } from "@/lib/use-count-up";
import { Confetti } from "./confetti";
import { StarIcon } from "./icons";

export type XpBurstProps = {
  /** XP gained: counts up from 0, with a burst of confetti. */
  amount: number;
  /** Short line under the number (e.g. "Séance terminée"). */
  caption?: string;
};

/**
 * The reward moment at the end of a session: a star pops, the XP count up and a burst of confetti plays once.
 * Announced politely to screen readers with the final value only.
 */
export function XpBurst({ amount, caption }: XpBurstProps) {
  const shown = useCountUp(amount);
  const [playing, setPlaying] = useState(true);

  return (
    <div className="relative flex flex-col items-center gap-1 py-6 text-center">
      <Confetti active={playing} onDone={() => setPlaying(false)} />
      <span className="flex size-16 animate-pop items-center justify-center rounded-full bg-reward text-reward-ink shadow-pop">
        <StarIcon width={32} height={32} />
      </span>
      <p
        className="mt-2 text-4xl font-bold tabular-nums"
        aria-hidden="true"
        data-testid="xp-amount"
      >
        +{shown} XP
      </p>
      <p className="sr-only" role="status">
        {`+${amount} XP`}
        {caption ? `, ${caption}` : ""}
      </p>
      {caption && (
        <p className="text-sm text-muted" aria-hidden="true">
          {caption}
        </p>
      )}
    </div>
  );
}
