"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";

export type TabBarItem = { href: string; label: string; icon: ReactNode };

export type TabBarProps = {
  items: ReadonlyArray<TabBarItem>;
  /** Accessible name of the landmark. Only one bar per page should keep the default: give any other its own. */
  label?: string;
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
 * The bottom navigation of the app: three to five tabs, an icon and a label each, large touch targets; the current tab
 * is a grape sticker that pops in, safe-area padding for the iPhone home indicator.
 */
export function TabBar({
  items,
  label = "Navigation principale",
  activeHref,
  onItemClick,
  className,
}: TabBarProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={label}
      className={cn(
        "sticky bottom-0 z-30 border-t-2 border-outline bg-card pb-[max(env(safe-area-inset-bottom),0.5rem)]",
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
                  "pressable flex min-h-14 flex-col items-center justify-center gap-0.5 px-2 pt-2 font-display text-xs font-semibold transition-colors duration-200",
                  active ? "text-foreground" : "text-faint",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-14 items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200",
                    active &&
                      "animate-pop border-outline bg-accent text-accent-ink shadow-sticker-sm",
                  )}
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
