"use client";

import type { ButtonHTMLAttributes, MouseEvent } from "react";
import { cn } from "@/lib/cn";
import { haptic as vibrate, type HapticPattern } from "@/lib/haptics";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** `md` is the 48 px control, `sm` the 40 px compact one. */
  size?: "md" | "sm";
  /** Shows a spinner, disables the button and announces the busy state. */
  loading?: boolean;
  /** Vibration played on press (Android only); `false` for none. */
  haptic?: HapticPattern | false;
};

/**
 * The button of the app: press feedback (a small scale-down), optional haptic tap, loading state. Uses the shared `.btn`
 * classes, so it looks the same as a link styled with them.
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  haptic = "tap",
  className,
  disabled,
  onClick,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (haptic) vibrate(haptic);
    onClick?.(event);
  }

  return (
    <button
      {...rest}
      type={type}
      className={cn("btn", `btn-${variant}`, size === "sm" && "btn-sm", className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onClick={handleClick}
    >
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
