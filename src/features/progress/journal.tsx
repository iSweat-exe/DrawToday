"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PlusIcon } from "@/components/ui/icons";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useToast } from "@/components/ui/toast";
import { BeforeAfterCard } from "./before-after-card";
import { ENTRY_FILTERS, MOCK_ENTRIES, type EntryFilter } from "./mock";
import { Sketch } from "./sketch";

/** The sketchbook: the before/after, a filter, and the grid of the pages (sessions and free notes). Sample data (A-112). */
export function Journal() {
  const [filter, setFilter] = useState<EntryFilter>("all");
  const { toast } = useToast();
  const entries = MOCK_ENTRIES.filter((entry) => filter === "all" || entry.type === filter);

  return (
    <>
      <BeforeAfterCard />

      <Button
        variant="outline"
        className="w-full"
        onClick={() =>
          toast({
            title: "Aperçu de l'application",
            description: "Les nouvelles pages de carnet arrivent bientôt.",
            tone: "info",
          })
        }
      >
        <PlusIcon width={20} height={20} />
        Nouvelle page de carnet
      </Button>

      <SegmentedControl
        label="Filtrer le carnet"
        options={ENTRY_FILTERS}
        value={filter}
        onValueChange={setFilter}
      />

      {entries.length === 0 ? (
        <EmptyState mascot="sleepy" title="Rien ici pour l'instant" />
      ) : (
        <ul aria-label="Les pages du carnet" className="grid grid-cols-2 gap-3">
          {entries.map((entry) => (
            <li key={entry.id} className="card flex flex-col gap-2 p-2.5">
              <Sketch kind={entry.kind} />
              <div className="flex flex-col px-0.5">
                <h3 className="text-base leading-tight font-semibold">{entry.title}</h3>
                <p className="text-xs text-muted">{entry.date}</p>
                <p className="text-xs font-semibold text-muted">{entry.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
