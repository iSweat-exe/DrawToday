import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import ErrorPage from "./error";
import GlobalError from "./global-error";
import NotFound from "./not-found";

afterEach(() => vi.restoreAllMocks());

describe("route error boundary", () => {
  it("tells the learner something went wrong and offers to retry", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const reset = vi.fn();
    render(<ErrorPage error={new Error("boom")} reset={reset} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Une erreur est survenue" }),
    ).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("logs only the digest when there is one, never the message", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = Object.assign(new Error("secret user data"), { digest: "abc123" });
    render(<ErrorPage error={error} reset={() => {}} />);
    expect(log).toHaveBeenCalledWith("Route error:", "abc123");
    expect(JSON.stringify(log.mock.calls)).not.toContain("secret user data");
  });

  it("falls back to the message when there is no digest", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ErrorPage error={new Error("client side")} reset={() => {}} />);
    expect(log).toHaveBeenCalledWith("Route error:", "client side");
  });

  it("does not show the technical error to the learner", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ErrorPage error={new Error("stack trace here")} reset={() => {}} />);
    expect(screen.queryByText(/stack trace here/)).toBeNull();
  });
});

describe("global error boundary", () => {
  it("renders its own page, in French, with a retry button", () => {
    const html = renderToStaticMarkup(<GlobalError reset={() => {}} />);
    expect(html).toMatch(/^<html lang="fr">/);
    expect(html).toContain("<body");
    expect(html).toContain("Une erreur est survenue");
    expect(html).toContain("Réessayer");
  });
});

describe("not found page", () => {
  it("says the page does not exist and links back home", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { level: 1, name: "Page introuvable" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Retour à l'accueil" })).toHaveAttribute("href", "/");
  });
});
