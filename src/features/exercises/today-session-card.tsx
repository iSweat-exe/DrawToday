"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClockIcon } from "@/components/ui/icons";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { WindowCard } from "@/components/ui/window-card";
import { STAT_TONE_CLASSES, type StatTone } from "@/components/ui/stat-pill";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import {
  BLOCK_MINUTES,
  MOCK_TODAY,
  SESSION_LENGTHS,
  SESSION_XP,
  type SessionMinutes,
} from "./mock";

/** One color per block of the session, so the four steps are told apart at a glance. */
const BLOCK_TONES: StatTone[] = ["ember", "reward", "sky", "accent"];

/**
 * The card of the day: the next session of the path, its four blocks, the length the learner picks and the way in. Sample
 * data for now (A-112): the button only says that the session player is not there yet.
 */
export function TodaySessionCard() {
  const [length, setLength] = useState<SessionMinutes>("30");
  const { toast } = useToast();
  const minutes = BLOCK_MINUTES[length];

  return (
    <WindowCard title="aujourd'hui.exe" aria-labelledby="today-title">
      <div className="flex flex-col gap-1.5">
        <span className="chip chip-accent self-start">Séance du jour</span>
        <h2 id="today-title" className="text-2xl leading-tight font-bold">
          {MOCK_TODAY.title}
        </h2>
        <p className="text-sm text-muted">{MOCK_TODAY.context}</p>
      </div>

      <ol aria-label="Les quatre blocs de la séance" className="flex flex-col gap-2.5">
        {MOCK_TODAY.blocks.map((block, index) => (
          <li key={block.name} className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-outline font-display font-bold",
                STAT_TONE_CLASSES[BLOCK_TONES[index] ?? "accent"],
              )}
            >
              {index + 1}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-display font-semibold">{block.name}</span>
              <span className="truncate text-sm text-muted">{block.exercise}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-muted">
              <ClockIcon width={16} height={16} />
              {minutes[index]} min
            </span>
          </li>
        ))}
      </ol>

      <SegmentedControl
        label="Durée de la séance"
        options={SESSION_LENGTHS}
        value={length}
        onValueChange={setLength}
      />

      <Button
        className="w-full"
        onClick={() =>
          toast({
            title: "Aperçu de l'application",
            description: "Le lecteur de séance arrive bientôt.",
            tone: "info",
          })
        }
      >
        Commencer · +{SESSION_XP[length]} XP
      </Button>
    </WindowCard>
  );
}
