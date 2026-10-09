"use client";

import { useState } from "react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";

const GOALS = [
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
] as const;

const LENGTHS = [
  { value: "10", label: "10 min" },
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
] as const;

/**
 * The settings of the learner (docs/pedagogie/integration-app.md): sessions per week, default length, reminder and pause
 * mode. A mock-up (A-112): nothing is saved, each change only says so.
 */
export function SettingsCard() {
  const { toast } = useToast();
  const [goal, setGoal] = useState<(typeof GOALS)[number]["value"]>("4");
  const [length, setLength] = useState<(typeof LENGTHS)[number]["value"]>("30");
  const [reminder, setReminder] = useState(true);
  const [pause, setPause] = useState(false);

  const saved = () =>
    toast({
      title: "Réglage noté",
      description: "Aperçu : rien n'est enregistré pour l'instant.",
      tone: "info",
    });

  return (
    <section aria-labelledby="settings-title" className="flex flex-col gap-3">
      <h2 id="settings-title" className="section-title">
        Réglages
      </h2>
      <div className="card flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-2">
          <p className="font-display font-semibold">Séances par semaine</p>
          <SegmentedControl
            label="Séances par semaine"
            options={GOALS}
            value={goal}
            onValueChange={(value) => {
              setGoal(value);
              saved();
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-display font-semibold">Durée d&apos;une séance</p>
          <SegmentedControl
            label="Durée par défaut d'une séance"
            options={LENGTHS}
            value={length}
            onValueChange={(value) => {
              setLength(value);
              saved();
            }}
          />
        </div>
        <Switch
          label="Rappel quotidien"
          description="Un seul rappel par jour, à l'heure choisie"
          checked={reminder}
          onCheckedChange={(value) => {
            setReminder(value);
            saved();
          }}
        />
        <Switch
          label="Mode pause"
          description="Ta série est mise en attente jusqu'à 2 semaines, sans rien perdre"
          checked={pause}
          onCheckedChange={(value) => {
            setPause(value);
            saved();
          }}
        />
      </div>
    </section>
  );
}
