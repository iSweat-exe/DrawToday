"use client";

import { useState } from "react";
import { LightbulbIcon } from "@/components/ui/icons";
import { WindowCard } from "@/components/ui/window-card";
import { cn } from "@/lib/cn";

/**
 * Sample "tip card" (A-050): one idea in under 120 words and a two-choice question with an immediate explanation, from
 * `docs/pedagogie/integration-app.md`. Sample data for now (A-112).
 */
const TIP = {
  title: "L'ellipse d'un cylindre",
  idea: "Plus un cercle est proche du niveau de tes yeux, plus il paraît aplati. Au niveau exact des yeux, l'ellipse devient une simple ligne.",
  question: "Un cylindre est juste au niveau de tes yeux. Son ellipse est…",
  answers: [
    { id: "flat", label: "Plate", correct: true },
    { id: "round", label: "Ronde", correct: false },
  ],
  explanation: "Plate : plus on est proche du niveau des yeux, plus l'ellipse est aplatie.",
} as const;

/** A tip with a question: the answer is explained at once, whatever is chosen (no score, no penalty). */
export function TipCard() {
  const [picked, setPicked] = useState<string | null>(null);
  const answer = TIP.answers.find((candidate) => candidate.id === picked);

  return (
    <WindowCard title="conseil.txt" aria-labelledby="tip-title" bodyClassName="gap-3">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 rotate-6 items-center justify-center rounded-full border-2 border-outline bg-sky text-accent-ink shadow-sticker-sm"
        >
          <LightbulbIcon width={24} height={24} />
        </span>
        <div className="flex flex-col">
          <span className="section-title px-0">Conseil du jour</span>
          <h2 id="tip-title" className="text-xl font-semibold">
            {TIP.title}
          </h2>
        </div>
      </div>
      <p className="text-base text-muted">{TIP.idea}</p>

      <div role="group" aria-labelledby="tip-question" className="flex flex-col gap-2">
        <p id="tip-question" className="font-display font-semibold">
          {TIP.question}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {TIP.answers.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              aria-pressed={picked === candidate.id}
              onClick={() => setPicked(candidate.id)}
              className={cn(
                "btn btn-sm",
                picked === candidate.id
                  ? candidate.correct
                    ? "bg-success text-accent-ink"
                    : "bg-card text-foreground"
                  : "btn-secondary",
              )}
            >
              {candidate.label}
            </button>
          ))}
        </div>
        {answer && (
          <p
            role="status"
            className="alert rounded-control border-outline bg-surface text-foreground"
          >
            <strong>{answer.correct ? "Bien vu ! " : "Presque ! "}</strong>
            {TIP.explanation}
          </p>
        )}
      </div>
    </WindowCard>
  );
}
