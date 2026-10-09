import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_TOAST_DURATION,
  MAX_TOASTS,
  ToastProvider,
  useToast,
  type ToastOptions,
} from "./toast";

const vibrate = vi.fn();
vi.mock("@/lib/haptics", () => ({ haptic: (...args: unknown[]) => vibrate(...args) }));

function Trigger({ options, label = "Montrer" }: { options: ToastOptions; label?: string }) {
  const { toast } = useToast();
  return (
    <button type="button" onClick={() => toast(options)}>
      {label}
    </button>
  );
}

function renderWithToasts(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

const user = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

beforeEach(() => {
  // shouldAdvanceTime keeps user-event (which waits on timers) from hanging while we still control the clock.
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vibrate.mockClear();
});
afterEach(() => vi.useRealTimers());

describe("Toast", () => {
  it("has a named notifications region, empty at first", () => {
    renderWithToasts(<span>contenu</span>);
    expect(screen.getByRole("region", { name: "Notifications" })).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByText("contenu")).toBeInTheDocument();
  });

  it("shows a toast with its title and description", async () => {
    renderWithToasts(
      <Trigger
        options={{ title: "Séance enregistrée", description: "+100 XP", tone: "success" }}
      />,
    );
    await user().click(screen.getByRole("button", { name: "Montrer" }));
    const toast = screen.getByRole("status");
    expect(toast).toHaveTextContent("Séance enregistrée");
    expect(toast).toHaveTextContent("+100 XP");
  });

  it("announces errors as alerts", async () => {
    renderWithToasts(<Trigger options={{ title: "Échec de l'envoi", tone: "error" }} />);
    await user().click(screen.getByRole("button", { name: "Montrer" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Échec de l'envoi");
  });

  it("is an info toast by default", async () => {
    renderWithToasts(<Trigger options={{ title: "Info" }} />);
    await user().click(screen.getByRole("button", { name: "Montrer" }));
    expect(vibrate).toHaveBeenCalledWith("tap");
  });

  it.each([
    ["success", "success"],
    ["error", "error"],
    ["info", "tap"],
  ] as const)("gives a %s haptic for a %s toast", async (tone, pattern) => {
    renderWithToasts(<Trigger options={{ title: "x", tone }} />);
    await user().click(screen.getByRole("button", { name: "Montrer" }));
    expect(vibrate).toHaveBeenCalledWith(pattern);
  });

  it("disappears by itself after the default duration", async () => {
    renderWithToasts(<Trigger options={{ title: "Bientôt parti" }} />);
    await user().click(screen.getByRole("button", { name: "Montrer" }));
    act(() => {
      vi.advanceTimersByTime(DEFAULT_TOAST_DURATION - 100);
    });
    expect(screen.getByRole("status")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("respects a custom duration", async () => {
    renderWithToasts(<Trigger options={{ title: "Court", duration: 1000 }} />);
    await user().click(screen.getByRole("button", { name: "Montrer" }));
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("goes away at once when tapped", async () => {
    renderWithToasts(<Trigger options={{ title: "À fermer" }} />);
    const u = user();
    await u.click(screen.getByRole("button", { name: "Montrer" }));
    await u.click(screen.getByRole("status"));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it(`keeps at most ${MAX_TOASTS} toasts: the oldest leaves first`, async () => {
    function Many() {
      const { toast } = useToast();
      return (
        <button
          type="button"
          onClick={() => {
            for (const title of ["un", "deux", "trois", "quatre"]) toast({ title });
          }}
        >
          Plusieurs
        </button>
      );
    }
    renderWithToasts(<Many />);
    await user().click(screen.getByRole("button", { name: "Plusieurs" }));
    expect(screen.getAllByRole("status")).toHaveLength(MAX_TOASTS);
    expect(screen.queryByText("un")).not.toBeInTheDocument();
    expect(screen.getByText("quatre")).toBeInTheDocument();
  });

  it("returns an id and can dismiss a toast programmatically", async () => {
    function Programmatic() {
      const { toast, dismiss } = useToast();
      return (
        <button
          type="button"
          onClick={() => {
            const id = toast({ title: "Éphémère" });
            dismiss(id);
          }}
        >
          Aller-retour
        </button>
      );
    }
    renderWithToasts(<Programmatic />);
    await user().click(screen.getByRole("button", { name: "Aller-retour" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("keeps the other toasts when one disappears", async () => {
    renderWithToasts(
      <>
        <Trigger options={{ title: "Court", duration: 500 }} label="A" />
        <Trigger options={{ title: "Long", duration: 5000 }} label="B" />
      </>,
    );
    const u = user();
    await u.click(screen.getByRole("button", { name: "A" }));
    await u.click(screen.getByRole("button", { name: "B" }));
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.queryByText("Court")).not.toBeInTheDocument();
    expect(screen.getByText("Long")).toBeInTheDocument();
  });

  it("refuses to be used without a provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Trigger options={{ title: "x" }} />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});
