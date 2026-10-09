import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BottomSheet } from "./bottom-sheet";

vi.mock("@/lib/haptics", () => ({ haptic: vi.fn() }));

const dialog = (container: HTMLElement) => container.querySelector("dialog")!;

function mockHeight(element: HTMLElement, height: number) {
  element.getBoundingClientRect = () => ({
    height,
    width: 360,
    top: 0,
    left: 0,
    right: 360,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
}

describe("BottomSheet", () => {
  it("is closed until it is opened", () => {
    const { container } = render(
      <BottomSheet open={false} onClose={() => {}} title="Durée">
        <p>Contenu</p>
      </BottomSheet>,
    );
    expect(dialog(container)).not.toHaveAttribute("open");
  });

  it("opens as a modal dialog named by its title", () => {
    const { container } = render(
      <BottomSheet open onClose={() => {}} title="Durée">
        <p>Contenu</p>
      </BottomSheet>,
    );
    expect(dialog(container)).toHaveAttribute("open");
    expect(screen.getByRole("dialog", { name: "Durée" })).toBeInTheDocument();
    expect(screen.getByText("Contenu")).toBeInTheDocument();
  });

  it("opens and closes when the open prop changes, without reporting a close it asked for itself", () => {
    const onClose = vi.fn();
    const { container, rerender } = render(
      <BottomSheet open={false} onClose={onClose} title="Durée">
        x
      </BottomSheet>,
    );
    rerender(
      <BottomSheet open onClose={onClose} title="Durée">
        x
      </BottomSheet>,
    );
    expect(dialog(container)).toHaveAttribute("open");
    rerender(
      <BottomSheet open={false} onClose={onClose} title="Durée">
        x
      </BottomSheet>,
    );
    expect(dialog(container)).not.toHaveAttribute("open");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes with its close button and reports it once", async () => {
    const onClose = vi.fn();
    const { container } = render(
      <BottomSheet open onClose={onClose} title="Durée">
        x
      </BottomSheet>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Fermer" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(dialog(container)).not.toHaveAttribute("open");
  });

  it("closes when the dim background is tapped, but not when its content is", async () => {
    const onClose = vi.fn();
    const { container } = render(
      <BottomSheet open onClose={onClose} title="Durée">
        <button type="button">Choisir</button>
      </BottomSheet>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Choisir" }));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(dialog(container));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("reports a close that comes from the browser (the Escape key fires the close event)", () => {
    const onClose = vi.fn();
    const { container } = render(
      <BottomSheet open onClose={onClose} title="Durée">
        x
      </BottomSheet>,
    );
    dialog(container).close();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when pulled down far enough", () => {
    const onClose = vi.fn();
    const { container } = render(
      <BottomSheet open onClose={onClose} title="Durée">
        x
      </BottomSheet>,
    );
    mockHeight(dialog(container), 300);
    const handle = screen.getByTestId("sheet-handle");
    fireEvent.pointerDown(handle, { pointerId: 1, clientY: 100 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientY: 150 });
    expect(dialog(container).style.transform).toBe("translateY(50px)");
    fireEvent.pointerUp(handle, { pointerId: 1, clientY: 260 });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(dialog(container)).not.toHaveAttribute("open");
    expect(dialog(container).style.transform).toBe("");
  });

  it("springs back when released early", () => {
    const onClose = vi.fn();
    const { container } = render(
      <BottomSheet open onClose={onClose} title="Durée">
        x
      </BottomSheet>,
    );
    mockHeight(dialog(container), 300);
    const handle = screen.getByTestId("sheet-handle");
    fireEvent.pointerDown(handle, { pointerId: 1, clientY: 100 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientY: 110 });
    fireEvent.pointerUp(handle, { pointerId: 1, clientY: 110 });
    expect(onClose).not.toHaveBeenCalled();
    expect(dialog(container)).toHaveAttribute("open");
    expect(dialog(container).style.transform).toBe("");
    expect(dialog(container).style.transition).toContain("transform");
  });

  it("never moves up when dragged upwards", () => {
    const { container } = render(
      <BottomSheet open onClose={() => {}} title="Durée">
        x
      </BottomSheet>,
    );
    const handle = screen.getByTestId("sheet-handle");
    fireEvent.pointerDown(handle, { pointerId: 1, clientY: 200 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientY: 120 });
    expect(dialog(container).style.transform).toBe("translateY(0px)");
  });

  it("ignores a move that does not belong to a drag", () => {
    const { container } = render(
      <BottomSheet open onClose={() => {}} title="Durée">
        x
      </BottomSheet>,
    );
    fireEvent.pointerMove(screen.getByTestId("sheet-handle"), { pointerId: 1, clientY: 300 });
    expect(dialog(container).style.transform).toBe("");
  });

  it("accepts an extra class", () => {
    const { container } = render(
      <BottomSheet open onClose={() => {}} title="Durée" className="extra">
        x
      </BottomSheet>,
    );
    expect(dialog(container)).toHaveClass("extra");
  });
});
