"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";

export type SegmentedOption<T extends string> = { value: T; label: string };

export type SegmentedControlProps<T extends string> = {
  /** Accessible name of the group (not displayed). */
  label: string;
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
};

/**
 * Two to four mutually exclusive choices with a sliding highlight (duration of a session, theme, objective per week…).
 * Arrow keys move the selection, as expected from a radio group.
 */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onValueChange,
  className,
}: SegmentedControlProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  function select(index: number) {
    const option = options[index];
    if (!option || option.value === value) return;
    haptic("tap");
    onValueChange(option.value);
    refs.current[index]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (step === 0) return;
    event.preventDefault();
    select((selected + step + options.length) % options.length);
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("relative flex rounded-control bg-foreground/10 p-1", className)}
    >
      <span
        aria-hidden="true"
        className="absolute top-1 bottom-1 left-1 rounded-[0.55rem] bg-background shadow-card transition-transform duration-300 ease-spring"
        style={{
          width: `calc((100% - 0.5rem) / ${options.length})`,
          transform: `translateX(${selected * 100}%)`,
        }}
      />
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={(node) => {
            refs.current[index] = node;
          }}
          type="button"
          role="radio"
          aria-checked={index === selected}
          tabIndex={index === selected ? 0 : -1}
          onClick={() => select(index)}
          onKeyDown={onKeyDown}
          className={cn(
            "relative z-10 min-h-control-sm flex-1 rounded-[0.55rem] px-3 text-sm font-semibold transition-colors duration-200 select-none",
            index === selected ? "text-foreground" : "text-muted",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
