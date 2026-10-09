"use client";

import { useRef, type KeyboardEvent } from "react";
import { CheckIcon } from "@/components/ui/icons";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { ACCENT_LABELS, ACCENTS, MODE_LABELS, THEME_MODES, type Accent } from "@/lib/appearance";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";
import { useAppearance } from "@/lib/use-appearance";

const MODE_OPTIONS = THEME_MODES.map((value) => ({ value, label: MODE_LABELS[value] }));

/**
 * The look of the app, chosen by the learner and applied at once (ADR 0007): light, dark or the system, one of six color
 * themes (each shown in its own colors) and the retro touch. Saved on this device.
 */
export function AppearanceCard() {
  const { appearance, update } = useAppearance();
  const swatches = useRef<Array<HTMLButtonElement | null>>([]);

  function pick(accent: Accent, focusIndex?: number) {
    if (accent === appearance.accent) return;
    haptic("tap");
    update({ accent });
    if (focusIndex !== undefined) swatches.current[focusIndex]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (step === 0) return;
    event.preventDefault();
    const next = (index + step + ACCENTS.length) % ACCENTS.length;
    pick(ACCENTS[next]!, next);
  }

  return (
    <section aria-labelledby="appearance-title" className="flex flex-col gap-3">
      <h2 id="appearance-title" className="section-title">
        Apparence
      </h2>
      <div className="card flex flex-col gap-5 p-4">
        <div className="flex flex-col gap-2">
          <p className="font-display font-semibold">Mode</p>
          <SegmentedControl
            label="Mode d'affichage"
            options={MODE_OPTIONS}
            value={appearance.mode}
            onValueChange={(mode) => update({ mode })}
          />
          <p className="text-sm text-muted">Auto suit les réglages de ton téléphone.</p>
        </div>

        <div className="flex flex-col gap-2">
          <p id="accent-label" className="font-display font-semibold">
            Couleurs
          </p>
          <div
            role="radiogroup"
            aria-labelledby="accent-label"
            className="grid grid-cols-3 gap-x-3 gap-y-4"
          >
            {ACCENTS.map((accent, index) => {
              const selected = accent === appearance.accent;
              return (
                <button
                  key={accent}
                  ref={(node) => {
                    swatches.current[index] = node;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => pick(accent)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                  className="pressable flex min-h-tap flex-col items-center gap-1.5 rounded-control"
                >
                  {/* `data-swatch` lets this tile carry the whole palette of its own theme (paper, ink, accent),
                      whatever theme is active: a little sheet of paper with a dot of the accent color. */}
                  <span
                    data-swatch=""
                    data-accent={accent}
                    className={cn(
                      "flex size-14 items-center justify-center rounded-control border-2 border-outline bg-background shadow-sticker-sm transition-transform duration-300 ease-spring",
                      selected && "scale-110 ring-4 ring-accent/35",
                    )}
                  >
                    <span className="flex size-8 items-center justify-center rounded-full border-2 border-outline bg-accent text-accent-ink">
                      {selected && <CheckIcon width={18} height={18} strokeWidth={3} />}
                    </span>
                  </span>
                  <span
                    className={cn("font-display text-sm font-semibold", !selected && "text-muted")}
                  >
                    {ACCENT_LABELS[accent]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Switch
          label="Touche rétro"
          description="Police pixel, barres à blocs, petites fenêtres : un clin d'œil aux années 90"
          checked={appearance.retro}
          onCheckedChange={(retro) => update({ retro })}
        />
      </div>
    </section>
  );
}
