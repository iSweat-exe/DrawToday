import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AppLayout from "./layout";
import HomePage from "./page";

describe("home page", () => {
  it("has one level-one heading and a short welcome message", () => {
    render(<HomePage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Accueil" })).toBeVisible();
    expect(screen.getByText(/exercices, conseils et vidéos/)).toBeVisible();
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
});
