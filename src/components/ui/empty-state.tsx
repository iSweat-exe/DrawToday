import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type EmptyStateProps = {
  title: string;
  description?: string;
  /** An icon or illustration shown above the title. */
  icon?: ReactNode;
  /** A call to action (usually a `Button` or a link styled with `.btn`). */
  action?: ReactNode;
  className?: string;
};

/** What a list shows when it has nothing yet: a friendly message and the next step, never a blank screen. */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <section className={cn("flex flex-col items-center gap-3 px-4 py-10 text-center", className)}>
      {icon && (
        <div className="flex size-16 items-center justify-center rounded-full bg-accent/15 text-accent animate-pop">
          {icon}
        </div>
      )}
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="max-w-xs text-sm text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </section>
  );
}
