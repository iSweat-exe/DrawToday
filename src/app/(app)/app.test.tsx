import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import AppLayout from "./layout";
import SketchbookPage from "./carnet/page";
import HomePage from "./page";
import PathPage from "./parcours/page";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
// The account button reads the session on the server (async component): its own tests cover it.
vi.mock("@/features/auth/account-chip", () => ({
  AccountChip: () => <button type="button">account</button>,
}));

const renderWithToasts = (page: ReactNode) => render(<ToastProvider>{page}</ToastProvider>);

describe("home page", () => {
  it("has one level-one heading, says it is a preview, and greets the learner", () => {
    renderWithToasts(<HomePage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Accueil" })).toBeVisible();
    expect(screen.getByText(/données d'exemple/)).toBeVisible();
    expect(screen.getByText(/Plus qu'une séance pour ton objectif/)).toBeVisible();
  });

  it("shows the series, the XP, the session of the day, the weekly goal, the level, the challenge and a tip", () => {
    renderWithToasts(<HomePage />);
    expect(screen.getByRole("img", { name: "3 semaines de suite" })).toBeVisible();
    expect(screen.getByRole("img", { name: /points d'expérience/ })).toBeVisible();
    for (const name of [
      "Des boîtes qui tournent",
      "Objectif de la semaine",
      "Défi du jour",
      "L'ellipse d'un cylindre",
    ]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeVisible();
    }
    expect(screen.getByRole("img", { name: "Niveau 4, Premier trait" })).toBeVisible();
  });
});

describe.each([
  ["path", <PathPage key="p" />, "Parcours", "Fondations"],
  ["sketchbook", <SketchbookPage key="s" />, "Carnet", "Avant / Après"],
] as Array<[string, ReactNode, string, string]>)("%s page", (_name, page, title, firstSection) => {
  it("has one level-one heading, a preview notice and its first section", () => {
    renderWithToasts(page);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: title })).toBeVisible();
    expect(screen.getByText(/données d'exemple/)).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: firstSection })).toBeVisible();
  });
});

describe("app layout", () => {
  const renderLayout = () =>
    render(
      <AppLayout params={Promise.resolve({})}>
        <p>content</p>
      </AppLayout>,
    );

  it("has a header with a link to the home page and a main area with the content", () => {
    renderLayout();
    const header = screen.getByRole("banner");
    expect(within(header).getByRole("link", { name: "DrawToday" })).toHaveAttribute("href", "/");
    expect(within(screen.getByRole("main")).getByText("content")).toBeVisible();
  });

  it("does not prefetch the home page from the header (saves requests on every page)", () => {
    renderLayout();
    // Next.js renders `prefetch={false}` links as plain anchors without the prefetch marker.
    expect(screen.getByRole("link", { name: "DrawToday" })).not.toHaveAttribute("data-prefetch");
  });

  it("keeps the header before the content, so keyboard and screen reader users meet the brand first", () => {
    renderLayout();
    const header = screen.getByRole("banner");
    const main = screen.getByRole("main");
    expect(header.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("puts the account button in the header", () => {
    renderLayout();
    expect(
      within(screen.getByRole("banner")).getByRole("button", { name: "account" }),
    ).toBeVisible();
  });

  it("has the four tabs after the content, the current one being marked", () => {
    renderLayout();
    const nav = screen.getByRole("navigation", { name: "Navigation principale" });
    const main = screen.getByRole("main");
    expect(main.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/",
      "/parcours",
      "/carnet",
      "/profil",
    ]);
    expect(links.map((link) => link.textContent)).toEqual([
      "Aujourd'hui",
      "Parcours",
      "Carnet",
      "Profil",
    ]);
    expect(within(nav).getByRole("link", { name: "Aujourd'hui" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
