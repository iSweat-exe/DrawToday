import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Mascot, type MascotMood } from "./mascot";

export type EmptyStateProps = {
  title: string;
  description?: string;
  /** An icon or illustration shown above the title. */
  icon?: ReactNode;
  /** Mine, the mascot, shown above the title instead of an icon (a friendlier empty screen). */
  mascot?: MascotMood;
  /** A call to action (usually a `Button` or a link styled with `.btn`). */
  action?: ReactNode;
  className?: string;
};

/** What a list shows when it has nothing yet: a friendly message and the next step, never a blank screen. */
export function EmptyState({
  title,
  description,
  icon,
  mascot,
  action,
  className,
}: EmptyStateProps) {
  return (
    <section className={cn("flex flex-col items-center gap-3 px-4 py-10 text-center", className)}>
      {mascot && <Mascot mood={mascot} size={88} />}
      {!mascot && icon && (
        <div className="flex size-16 items-center justify-center rounded-full border-2 border-outline bg-reward text-reward-ink shadow-sticker animate-pop">
          {icon}
        </div>
      )}
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && <p className="max-w-xs text-sm text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </section>
  );
}
