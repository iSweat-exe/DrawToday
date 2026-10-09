"use client";

import { Button } from "@/components/ui/button";
import { ClockIcon, TargetIcon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";
import { MOCK_CHALLENGE } from "./mock";

/** The optional daily challenge card (10 minutes, a few XP). Sample data for now (A-112). */
export function ChallengeCard() {
  const { toast } = useToast();

  return (
    <section
      aria-labelledby="challenge-title"
      className="card flex flex-col gap-3 bg-reward p-4 text-reward-ink"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 -rotate-6 items-center justify-center rounded-full border-2 border-outline bg-card text-foreground shadow-sticker-sm"
        >
          <TargetIcon width={24} height={24} />
        </span>
        <div className="flex flex-col">
          <h2 id="challenge-title" className="text-xl font-semibold">
            {MOCK_CHALLENGE.title}
          </h2>
          <p className="flex items-center gap-1 text-sm font-semibold">
            <ClockIcon width={16} height={16} />
            {MOCK_CHALLENGE.minutes} min · +{MOCK_CHALLENGE.xp} XP
          </p>
        </div>
      </div>
      <p className="text-base">{MOCK_CHALLENGE.text}</p>
      <Button
        variant="secondary"
        size="sm"
        className="self-start"
        onClick={() =>
          toast({
            title: "Défi accepté",
            description: "Bonne chance, Mine te regarde !",
            tone: "success",
          })
        }
      >
        Relever le défi
      </Button>
    </section>
  );
}
