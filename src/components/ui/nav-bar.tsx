import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { PencilIcon } from "./icons";

export type NavBarProps = {
  /** What sits on the right: the account button, a page action. */
  actions?: ReactNode;
  className?: string;
};

/**
 * The top bar of the app: the brand on the left (back to the home page), the actions on the right. It stays at the top
 * while the page scrolls, and looks like the {@link TabBar} at the bottom (same inked border, same card surface).
 * Safe-area padding keeps it clear of the notch when the app runs full screen.
 */
export function NavBar({ actions, className }: NavBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b-2 border-outline bg-card pt-[env(safe-area-inset-top)]",
        className,
      )}
    >
      <div className="flex min-h-14 items-center justify-between gap-3 px-gutter">
        {/* Links are not prefetched by default (docs/performance.md): only the tab bar's are. */}
        <Link
          href="/"
          prefetch={false}
          className="pressable flex min-h-tap items-center gap-2 font-display text-xl font-bold tracking-tight"
        >
          <span
            aria-hidden="true"
            className="flex size-9 -rotate-6 items-center justify-center rounded-control border-2 border-outline bg-accent text-accent-ink shadow-sticker-sm"
          >
            <PencilIcon width={18} height={18} />
          </span>
          DrawToday
        </Link>
        {actions}
      </div>
    </header>
  );
}
