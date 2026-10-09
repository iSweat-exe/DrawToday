import { MasteryStars } from "@/components/ui/mastery-stars";
import type { MockSkill } from "./mock";

/** A skill of the skills map: its code, its name, a short hint and the stars of mastery. */
export function SkillRow({ skill }: { skill: MockSkill }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-control border-2 border-outline bg-card font-display font-bold shadow-sticker-sm"
      >
        {skill.code}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-display leading-tight font-semibold">{skill.name}</span>
        <span className="truncate text-sm text-muted">{skill.hint}</span>
      </div>
      <MasteryStars value={skill.stars} label={skill.name} size={17} />
    </li>
  );
}
