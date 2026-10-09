"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";

export type SwitchProps = {
  label: string;
  description?: string;
  /** Controlled value. Leave it out to let the switch keep its own state. */
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

/** A row with a label and a sliding switch. The whole row is the touch target (48 px high), the thumb springs. */
export function Switch({
  label,
  description,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  className,
}: SwitchProps) {
  const [inner, setInner] = useState(defaultChecked);
  const descriptionId = useId();
  const isOn = checked ?? inner;

  function toggle() {
    const next = !isOn;
    if (checked === undefined) setInner(next);
    haptic(next ? "success" : "tap");
    onCheckedChange?.(next);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-describedby={description ? descriptionId : undefined}
      disabled={disabled}
      onClick={toggle}
      className={cn(
        "flex min-h-control w-full items-center justify-between gap-4 rounded-control px-1 text-left select-none disabled:opacity-60",
        className,
      )}
    >
      <span className="flex flex-col">
        <span className="font-display text-base font-semibold">{label}</span>
        {description && (
          <span id={descriptionId} className="text-sm text-muted">
            {description}
          </span>
        )}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "relative h-9 w-16 shrink-0 rounded-full border-2 border-outline shadow-sticker-sm transition-colors duration-200",
          isOn ? "bg-accent" : "bg-card",
        )}
      >
        <span
          className={cn(
            // The track is 60 × 32 px inside its border: a 24 px thumb at 4 px from the top and the left, moving by 28 px,
            // keeps exactly 4 px of room on every side, at rest and at the end of its travel.
            "absolute top-1 left-1 size-6 rounded-full border-2 border-outline transition-transform duration-300 ease-spring",
            isOn ? "translate-x-7 bg-reward" : "bg-foreground/20",
          )}
        />
      </span>
    </button>
  );
}
