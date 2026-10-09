"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/ui/confetti";
import { EmptyState } from "@/components/ui/empty-state";
import {
  BookIcon,
  CheckIcon,
  FlameIcon,
  HomeIcon,
  RouteIcon,
  StarIcon,
  UserIcon,
} from "@/components/ui/icons";
import { ImageViewer } from "@/components/ui/image-viewer";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ProgressRing } from "@/components/ui/progress-ring";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { TabBar, type TabBarItem } from "@/components/ui/tab-bar";
import { useToast } from "@/components/ui/toast";
import { XpBurst } from "@/components/ui/xp-burst";

const DURATIONS = [
  { value: "10", label: "10 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
] as const;

type Duration = (typeof DURATIONS)[number]["value"];

const TABS: TabBarItem[] = [
  { href: "/design-system#aujourdhui", label: "Aujourd'hui", icon: <HomeIcon /> },
  { href: "/design-system#parcours", label: "Parcours", icon: <RouteIcon /> },
  { href: "/design-system#carnet", label: "Carnet", icon: <BookIcon /> },
  { href: "/design-system#profil", label: "Profil", icon: <UserIcon /> },
];

/** Interactive tour of the shared components, used as a living style guide and by the end-to-end tests. */
export function DesignSystemDemo() {
  const [duration, setDuration] = useState<Duration>("30");
  const [reminder, setReminder] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sessions, setSessions] = useState(2);
  const [tab, setTab] = useState(TABS[0]!.href);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [burst, setBurst] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const { toast } = useToast();

  function save() {
    setSaving(true);
    setTimeout(() => setSaving(false), 900);
  }

  return (
    <div className="flex flex-col gap-section">
      <section aria-labelledby="ds-buttons" className="flex flex-col gap-3">
        <h2 id="ds-buttons" className="section-title">
          Boutons
        </h2>
        <Button>Commencer la séance</Button>
        <Button variant="secondary">Plus tard</Button>
        <Button variant="outline">Voir le parcours</Button>
        <Button variant="ghost">Passer</Button>
        <Button variant="danger">Supprimer</Button>
        <Button size="sm" variant="secondary">
          Compact
        </Button>
        <Button loading={saving} onClick={save}>
          {saving ? "Enregistrement" : "Enregistrer"}
        </Button>
      </section>

      <section aria-labelledby="ds-controls" className="card flex flex-col gap-4 p-4">
        <h2 id="ds-controls" className="section-title">
          Réglages
        </h2>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Durée d&apos;une séance</p>
          <SegmentedControl
            label="Durée d'une séance"
            options={DURATIONS}
            value={duration}
            onValueChange={setDuration}
          />
          <p className="text-sm text-muted" data-testid="duration-output">
            Séance de {duration} minutes
          </p>
        </div>
        <Switch
          label="Rappel quotidien"
          description="Une notification par jour, à l'heure choisie"
          checked={reminder}
          onCheckedChange={setReminder}
        />
      </section>

      <section aria-labelledby="ds-progress" className="card flex flex-col gap-4 p-4">
        <h2 id="ds-progress" className="section-title">
          Progression
        </h2>
        <div className="flex items-center gap-4">
          <ProgressRing value={sessions / 5} label="Objectif de la semaine" size={96}>
            <span>{sessions}/5</span>
          </ProgressRing>
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-sm font-medium">Objectif de la semaine</p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setSessions((n) => Math.min(5, n + 1))}
            >
              Séance faite
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 font-semibold">
              <StarIcon width={18} height={18} className="text-reward" /> Niveau 4
            </span>
            <span className="text-muted">850 / 1200 XP</span>
          </div>
          <ProgressBar value={850 / 1200} label="XP du niveau" tone="reward" />
        </div>
      </section>

      <section aria-labelledby="ds-chips" className="flex flex-col gap-3">
        <h2 id="ds-chips" className="section-title">
          Pastilles et cartes
        </h2>
        <div className="flex flex-wrap gap-2">
          <span className="chip chip-accent">
            <FlameIcon width={14} height={14} className="mr-1" /> 3 semaines
          </span>
          <span className="chip">
            <CheckIcon width={14} height={14} className="mr-1" /> Terminé
          </span>
        </div>
        <a href="#ds-chips" className="card-link flex min-h-tap items-center px-4 py-3 font-medium">
          Une carte qui réagit au toucher
        </a>
      </section>

      <section aria-labelledby="ds-feedback" className="flex flex-col gap-3">
        <h2 id="ds-feedback" className="section-title">
          Retours et célébrations
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <Button
            size="sm"
            variant="secondary"
            haptic={false}
            onClick={() =>
              toast({ title: "Séance enregistrée", description: "+100 XP", tone: "success" })
            }
          >
            Succès
          </Button>
          <Button
            size="sm"
            variant="secondary"
            haptic={false}
            onClick={() =>
              toast({
                title: "Envoi impossible",
                description: "Réessaie dans un instant",
                tone: "error",
              })
            }
          >
            Erreur
          </Button>
          <Button
            size="sm"
            variant="secondary"
            haptic={false}
            onClick={() => toast({ title: "Nouveau défi disponible" })}
          >
            Info
          </Button>
        </div>
        <div className="relative">
          <Button className="w-full" variant="outline" onClick={() => setConfetti(true)}>
            Un petit feu d&apos;artifice
          </Button>
          <Confetti active={confetti} onDone={() => setConfetti(false)} />
        </div>
        <Button
          className="w-full"
          variant="outline"
          haptic="success"
          onClick={() => setBurst((n) => n + 1)}
        >
          Terminer une séance
        </Button>
        {burst > 0 && (
          <div className="card" data-testid="xp-card">
            <XpBurst key={burst} amount={100} caption="Séance terminée" />
          </div>
        )}
      </section>

      <section aria-labelledby="ds-overlays" className="flex flex-col gap-3">
        <h2 id="ds-overlays" className="section-title">
          Feuille et visionneuse
        </h2>
        <Button variant="secondary" onClick={() => setSheetOpen(true)}>
          Ouvrir la feuille
        </Button>
        <button
          type="button"
          onClick={() => setViewerOpen(true)}
          className="card-link flex min-h-tap flex-col gap-2 p-3 text-left"
          aria-label="Agrandir l'exemple de dessin"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- a small static SVG */}
          <img src="/images/exemple-boite.svg" alt="" className="w-full rounded-control" />
          <span className="text-sm font-medium text-accent">
            Toucher pour agrandir (pincer, double toucher)
          </span>
        </button>
      </section>

      <section aria-labelledby="ds-tabs" className="flex flex-col gap-3">
        <h2 id="ds-tabs" className="section-title">
          Barre d&apos;onglets
        </h2>
        <div className="card overflow-hidden">
          <TabBar
            items={TABS}
            activeHref={tab}
            onItemClick={(item, event) => {
              event.preventDefault();
              setTab(item.href);
            }}
          />
        </div>
      </section>

      <section aria-labelledby="ds-loading" className="flex flex-col gap-3">
        <h2 id="ds-loading" className="section-title">
          Chargement et états vides
        </h2>
        <div className="card flex items-center gap-3 p-4">
          <Skeleton circle width={48} height={48} />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton width="70%" />
            <Skeleton width="40%" height="0.75rem" />
          </div>
        </div>
        <div className="card">
          <EmptyState
            icon={<StarIcon width={28} height={28} />}
            title="Ton carnet est vide"
            description="Termine ta première séance pour y garder une trace de ton dessin."
            action={<Button size="sm">Commencer</Button>}
          />
        </div>
      </section>
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Durée d'une séance">
        <p className="text-muted">
          Choisis la durée qui te convient aujourd&apos;hui : tu peux changer à chaque séance.
        </p>
        <SegmentedControl
          label="Durée (feuille)"
          options={DURATIONS}
          value={duration}
          onValueChange={setDuration}
        />
        <Button onClick={() => setSheetOpen(false)}>C&apos;est parti</Button>
      </BottomSheet>
      <ImageViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        src="/images/exemple-boite.svg"
        alt="Une boîte en perspective avec ses lignes de construction"
      />
    </div>
  );
}
