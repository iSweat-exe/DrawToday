import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HomeIcon, UserIcon } from "./icons";
import { isTabActive, TabBar, type TabBarItem } from "./tab-bar";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
const vibrate = vi.fn();
vi.mock("@/lib/haptics", () => ({ haptic: (...args: unknown[]) => vibrate(...args) }));

const ITEMS: TabBarItem[] = [
  { href: "/", label: "Aujourd'hui", icon: <HomeIcon /> },
  { href: "/parcours", label: "Parcours", icon: <HomeIcon /> },
  { href: "/carnet", label: "Carnet", icon: <HomeIcon /> },
  { href: "/profil", label: "Profil", icon: <UserIcon /> },
];

beforeEach(() => {
  pathname = "/";
  vibrate.mockClear();
});

describe("isTabActive", () => {
  it("matches the home tab on the exact path only", () => {
    expect(isTabActive("/", "/")).toBe(true);
    expect(isTabActive("/", "/parcours")).toBe(false);
  });

  it("matches a tab on its path and everything below it", () => {
    expect(isTabActive("/parcours", "/parcours")).toBe(true);
    expect(isTabActive("/parcours", "/parcours/semaine-2")).toBe(true);
  });

  it("does not match a different path that merely starts the same way", () => {
    expect(isTabActive("/parcours", "/parcours-x")).toBe(false);
    expect(isTabActive("/parcours", "/")).toBe(false);
  });
});

describe("TabBar", () => {
  it("is a named navigation with one link per tab", () => {
    render(<TabBar items={ITEMS} />);
    const nav = screen.getByRole("navigation", { name: "Navigation principale" });
    expect(nav).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(4);
    expect(screen.getByRole("link", { name: "Carnet" })).toHaveAttribute("href", "/carnet");
  });

  it("marks the tab of the current page", () => {
    pathname = "/parcours/semaine-2";
    render(<TabBar items={ITEMS} />);
    expect(screen.getByRole("link", { name: "Parcours" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Aujourd'hui" })).not.toHaveAttribute("aria-current");
  });

  it("lets the caller choose the active tab", () => {
    render(<TabBar items={ITEMS} activeHref="/profil" />);
    expect(screen.getByRole("link", { name: "Profil" })).toHaveAttribute("aria-current", "page");
    expect(
      screen.getAllByRole("link").filter((link) => link.hasAttribute("aria-current")),
    ).toHaveLength(1);
  });

  it("makes the active tab pop and colors it with the accent", () => {
    render(<TabBar items={ITEMS} activeHref="/carnet" />);
    const active = screen.getByRole("link", { name: "Carnet" });
    expect(active).toHaveClass("text-accent");
    expect(active.firstElementChild).toHaveClass("animate-pop");
    expect(screen.getByRole("link", { name: "Profil" })).toHaveClass("text-faint");
  });

  it("gives every tab a comfortable touch target", () => {
    render(<TabBar items={ITEMS} />);
    for (const link of screen.getAllByRole("link")) expect(link).toHaveClass("min-h-14");
  });

  it("taps lightly when going to another tab, and tells the caller", async () => {
    const onItemClick = vi.fn((_item: TabBarItem, event: { preventDefault: () => void }) =>
      event.preventDefault(),
    );
    render(<TabBar items={ITEMS} activeHref="/" onItemClick={onItemClick} />);
    await userEvent.click(screen.getByRole("link", { name: "Parcours" }));
    expect(vibrate).toHaveBeenCalledWith("tap");
    expect(onItemClick).toHaveBeenCalledTimes(1);
    expect(onItemClick.mock.calls[0]![0]).toMatchObject({ href: "/parcours" });
  });

  it("stays quiet when the active tab is tapped again", async () => {
    render(
      <TabBar
        items={ITEMS}
        activeHref="/"
        onItemClick={(_item, event) => event.preventDefault()}
      />,
    );
    await userEvent.click(screen.getByRole("link", { name: "Aujourd'hui" }));
    expect(vibrate).not.toHaveBeenCalled();
  });
});
