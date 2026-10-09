import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type WindowCardProps = {
  /** Text of the title bar, in the spirit of a file name (`conseil.txt`). Decoration: hidden from screen readers. */
  title: string;
  /** Id of the heading inside, which names the section. */
  "aria-labelledby": string;
  children: ReactNode;
  /** Classes of the card itself. */
  className?: string;
  /** Classes of the content under the title bar (default: a column with a 16 px gap and 16 px padding). */
  bodyClassName?: string;
};

/**
 * A card with the title bar of a little 90s window: three squares, a name, a close box. It is the retro touch of the
 * app (ADR 0007): used on a few key cards only, never on every one, and hidden when the learner turns the retro touch off.
 */
export function WindowCard({
  title,
  "aria-labelledby": labelledBy,
  children,
  className,
  bodyClassName,
}: WindowCardProps) {
  return (
    <section aria-labelledby={labelledBy} className={cn("card overflow-hidden", className)}>
      <div aria-hidden="true" className="window-bar">
        <span className="flex gap-1">
          <span className="size-2.5 border-2 border-outline bg-reward" />
          <span className="size-2.5 border-2 border-outline bg-ember" />
          <span className="size-2.5 border-2 border-outline bg-card" />
        </span>
        <span className="min-w-0 flex-1 truncate">{title}</span>
        <span className="flex size-5 items-center justify-center border-2 border-outline bg-card text-xs leading-none text-foreground">
          ×
        </span>
      </div>
      <div className={cn("flex flex-col gap-4 p-4", bodyClassName)}>{children}</div>
    </section>
  );
}
