"use client";

import { useState } from "react";
import { ProgressRing } from "@/components/ui/progress-ring";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { MOCK_SKILLS, MOCK_WEEKS } from "./mock";
import { SkillRow } from "./skill-row";
import { WeekCard } from "./week-card";

const VIEWS = [
  { value: "weeks", label: "Semaines" },
  { value: "skills", label: "Compétences" },
] as const;

type View = (typeof VIEWS)[number]["value"];

/** The path "Fondations": where the learner is, the weeks, and the map of skills with their stars of mastery. */
export function PathView() {
  const [view, setView] = useState<View>("weeks");
  const sessionsDone = MOCK_WEEKS.reduce((sum, week) => sum + week.done, 0);
  const sessionsTotal = MOCK_WEEKS.length * 5;
  const current = MOCK_WEEKS.find((week) => week.status === "current");

  return (
    <>
      <section aria-labelledby="path-title" className="card flex items-center gap-4 p-4">
        <ProgressRing
          value={sessionsDone / sessionsTotal}
          label="Avancement du parcours Fondations"
          size={92}
        >
          <span className="text-base">
            {sessionsDone}/{sessionsTotal}
          </span>
        </ProgressRing>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 id="path-title" className="text-2xl leading-tight font-bold">
            Fondations
          </h2>
          <p className="text-sm text-muted">8 semaines · {sessionsTotal} séances</p>
          {current && <span className="chip chip-accent self-start">Semaine {current.number}</span>}
        </div>
      </section>

      <SegmentedControl
        label="Affichage du parcours"
        options={VIEWS}
        value={view}
        onValueChange={setView}
      />

      {view === "weeks" ? (
        <ol aria-label="Les semaines du parcours" className="flex flex-col gap-3">
          {MOCK_WEEKS.map((week) => (
            <WeekCard key={week.number} week={week} />
          ))}
        </ol>
      ) : (
        <section aria-labelledby="skills-title" className="flex flex-col gap-3">
          <h2 id="skills-title" className="section-title">
            Carte des compétences
          </h2>
          <ul className="card divide-y divide-line">
            {MOCK_SKILLS.map((skill) => (
              <SkillRow key={skill.code} skill={skill} />
            ))}
          </ul>
          <p className="px-1 text-sm text-muted">
            Les étoiles mesurent ce que tu sais faire. Elles se gagnent avec les défis et les
            re-tests espacés.
          </p>
        </section>
      )}
    </>
  );
}
