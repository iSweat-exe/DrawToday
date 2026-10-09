import { WindowCard } from "@/components/ui/window-card";
import { Sketch } from "./sketch";

/**
 * The before/after of the test M2 (docs/pedagogie/gamification.md): the most motivating screen for a beginner, so it gets
 * the place of honor. Sample drawings for now (A-112), the learner's photos later (A-074).
 */
export function BeforeAfterCard() {
  return (
    <WindowCard title="avant-apres.bmp" aria-labelledby="compare-title">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <h2 id="compare-title" className="text-xl font-semibold">
            Avant / Après
          </h2>
          <p className="text-sm text-muted">
            Les boîtes à main levée, il y a 15 jours et aujourd&apos;hui
          </p>
        </div>
        <span className="chip chip-accent shrink-0">+2 progrès</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <figure className="flex flex-col gap-1.5">
          <div className="rounded-control border-2 border-outline p-1 shadow-sticker-sm">
            <Sketch kind="box" rough />
          </div>
          <figcaption className="text-center font-display text-sm font-semibold text-muted">
            Jour 1
          </figcaption>
        </figure>
        <figure className="flex flex-col gap-1.5">
          <div className="rounded-control border-2 border-outline p-1 shadow-sticker-sm">
            <Sketch kind="box" />
          </div>
          <figcaption className="text-center font-display text-sm font-semibold">
            Aujourd&apos;hui
          </figcaption>
        </figure>
      </div>
      <p className="text-sm text-muted">
        Tes arêtes convergent mieux et tes traits sont plus sûrs : le trait ne tremble presque plus.
      </p>
    </WindowCard>
  );
}
