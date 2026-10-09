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
        <span className="text-base font-medium">{label}</span>
        {description && (
          <span id={descriptionId} className="text-sm text-muted">
            {description}
          </span>
        )}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "relative h-8 w-14 shrink-0 rounded-full transition-colors duration-200",
          isOn ? "bg-accent" : "bg-line-strong",
        )}
      >
        <span
          className={cn(
            "absolute top-1 left-1 size-6 rounded-full bg-white shadow-card transition-transform duration-300 ease-spring",
            isOn && "translate-x-6",
          )}
        />
      </span>
    </button>
  );
}
