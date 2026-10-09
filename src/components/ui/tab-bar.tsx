"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";

export type TabBarItem = { href: string; label: string; icon: ReactNode };

export type TabBarProps = {
  items: ReadonlyArray<TabBarItem>;
  /** Which tab is active. Defaults to the one matching the current URL. */
  activeHref?: string;
  /** Called on a tap; call `event.preventDefault()` to stay on the page (style guide, tests). */
  onItemClick?: (item: TabBarItem, event: MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
};

/**
 * Tells whether a tab is the current page: the home tab (`/`) only on the exact path, the others on their path and
 * everything below it (`/parcours` is active on `/parcours/semaine-2`, but `/parcours-x` is not).
 * @param href - The tab link.
 * @param pathname - The current URL path.
 * @returns `true` when the tab is active.
 */
export function isTabActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The bottom navigation of the app: three to five tabs, an icon and a label each, large touch targets, a small pop on
 * the tab that becomes active, safe-area padding for the iPhone home indicator.
 */
export function TabBar({ items, activeHref, onItemClick, className }: TabBarProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className={cn(
        "sticky bottom-0 z-30 border-t border-line bg-background/90 pb-[max(env(safe-area-inset-bottom),0.5rem)] backdrop-blur",
        className,
      )}
    >
      <ul className="flex">
        {items.map((item) => {
          const active =
            activeHref !== undefined ? item.href === activeHref : isTabActive(item.href, pathname);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={(event) => {
                  if (!active) haptic("tap");
                  onItemClick?.(item, event);
                }}
                className={cn(
                  "pressable flex min-h-14 flex-col items-center justify-center gap-0.5 px-2 pt-2 text-xs font-semibold transition-colors duration-200",
                  active ? "text-accent" : "text-faint",
                )}
              >
                <span
                  className={cn("flex h-7 items-center justify-center", active && "animate-pop")}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
