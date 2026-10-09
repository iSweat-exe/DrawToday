import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ImageViewer } from "./image-viewer";

vi.mock("@/lib/haptics", () => ({ haptic: vi.fn() }));

const SRC = "/images/exemple.svg";
const scale = () =>
  Number(screen.getByRole("img", { name: "Une boîte en perspective" }).dataset.scale);

function renderViewer(props: Partial<React.ComponentProps<typeof ImageViewer>> = {}) {
  return render(
    <ImageViewer open onClose={() => {}} src={SRC} alt="Une boîte en perspective" {...props} />,
  );
}

describe("ImageViewer", () => {
  it("is closed until it is opened", () => {
    const { container } = renderViewer({ open: false });
    expect(container.querySelector("dialog")).not.toHaveAttribute("open");
  });

  it("shows the image, fitted, in a labelled full-screen dialog", () => {
    const { container } = renderViewer();
    expect(container.querySelector("dialog")).toHaveAttribute("open");
    const image = screen.getByRole("img", { name: "Une boîte en perspective" });
    expect(image).toHaveAttribute("src", SRC);
    expect(scale()).toBe(1);
    expect(screen.getByRole("dialog", { name: /Visionneuse/ })).toBeInTheDocument();
  });

  it("zooms in and out with the buttons, for people who cannot pinch", async () => {
    renderViewer();
    await userEvent.click(screen.getByRole("button", { name: "Zoom avant" }));
    expect(scale()).toBe(1.5);
    await userEvent.click(screen.getByRole("button", { name: "Zoom avant" }));
    expect(scale()).toBe(2.25);
    await userEvent.click(screen.getByRole("button", { name: "Zoom arrière" }));
    expect(scale()).toBe(1.5);
  });

  it("never zooms out below the fitted size, nor in beyond five times", async () => {
    renderViewer();
    await userEvent.click(screen.getByRole("button", { name: "Zoom arrière" }));
    expect(scale()).toBe(1);
    for (let i = 0; i < 10; i += 1)
      await userEvent.click(screen.getByRole("button", { name: "Zoom avant" }));
    expect(scale()).toBe(5);
  });

  it("fits back to the screen with the fit button", async () => {
    renderViewer();
    await userEvent.click(screen.getByRole("button", { name: "Zoom avant" }));
    await userEvent.click(screen.getByRole("button", { name: "Ajuster à l'écran" }));
    expect(scale()).toBe(1);
  });

  it("zooms with the mouse wheel", () => {
    renderViewer();
    fireEvent.wheel(screen.getByTestId("viewer-stage"), { deltaY: -100, clientX: 10, clientY: 10 });
    expect(scale()).toBeGreaterThan(1);
    const zoomed = scale();
    fireEvent.wheel(screen.getByTestId("viewer-stage"), { deltaY: 100, clientX: 10, clientY: 10 });
    expect(scale()).toBeLessThan(zoomed);
  });

  it("zooms on a double tap and fits back on the next one", () => {
    renderViewer();
    const stage = screen.getByTestId("viewer-stage");
    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 50, clientY: 50 });
    fireEvent.pointerUp(stage, { pointerId: 1 });
    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 52, clientY: 51 });
    fireEvent.pointerUp(stage, { pointerId: 1 });
    expect(scale()).toBe(2.5);
    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 50, clientY: 50 });
    fireEvent.pointerUp(stage, { pointerId: 1 });
    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 50, clientY: 50 });
    fireEvent.pointerUp(stage, { pointerId: 1 });
    expect(scale()).toBe(1);
  });

  it("does not zoom on two taps that are far apart", () => {
    renderViewer();
    const stage = screen.getByTestId("viewer-stage");
    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 10, clientY: 10 });
    fireEvent.pointerUp(stage, { pointerId: 1 });
    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 200, clientY: 200 });
    fireEvent.pointerUp(stage, { pointerId: 1 });
    expect(scale()).toBe(1);
  });

  it("pinches with two fingers", () => {
    renderViewer();
    const stage = screen.getByTestId("viewer-stage");
    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerDown(stage, { pointerId: 2, clientX: 140, clientY: 100 });
    fireEvent.pointerMove(stage, { pointerId: 2, clientX: 220, clientY: 100 });
    // The fingers went from 40 px to 120 px apart: three times as big.
    expect(scale()).toBeCloseTo(3, 1);
    fireEvent.pointerUp(stage, { pointerId: 2 });
    fireEvent.pointerUp(stage, { pointerId: 1 });
  });

  it("does not move a fitted image when dragged", () => {
    renderViewer();
    const stage = screen.getByTestId("viewer-stage");
    const image = screen.getByRole("img", { name: "Une boîte en perspective" });
    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(stage, { pointerId: 1, clientX: 160, clientY: 140 });
    expect(image.style.transform).toContain("translate(0px, 0px)");
  });

  it("ignores moves of fingers that never touched", () => {
    renderViewer();
    fireEvent.pointerMove(screen.getByTestId("viewer-stage"), {
      pointerId: 9,
      clientX: 5,
      clientY: 5,
    });
    expect(scale()).toBe(1);
  });

  it("closes with its close button and reports it once", async () => {
    const onClose = vi.fn();
    const { container } = renderViewer({ onClose });
    await userEvent.click(screen.getByRole("button", { name: "Fermer" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(container.querySelector("dialog")).not.toHaveAttribute("open");
  });

  it("starts fitted again when it is reopened", async () => {
    const { rerender } = renderViewer();
    await userEvent.click(screen.getByRole("button", { name: "Zoom avant" }));
    rerender(
      <ImageViewer open={false} onClose={() => {}} src={SRC} alt="Une boîte en perspective" />,
    );
    rerender(<ImageViewer open onClose={() => {}} src={SRC} alt="Une boîte en perspective" />);
    expect(scale()).toBe(1);
  });
});
