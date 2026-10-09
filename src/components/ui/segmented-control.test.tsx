import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "./segmented-control";

vi.mock("@/lib/haptics", () => ({ haptic: vi.fn() }));

const OPTIONS = [
  { value: "10", label: "10 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
] as const;

function Harness({ initial = "30" }: { initial?: (typeof OPTIONS)[number]["value"] }) {
  const [value, setValue] = useState<(typeof OPTIONS)[number]["value"]>(initial);
  return (
    <SegmentedControl
      label="Durée de la séance"
      options={OPTIONS}
      value={value}
      onValueChange={setValue}
    />
  );
}

describe("SegmentedControl", () => {
  it("is a named radio group with one checked option", () => {
    render(<Harness />);
    expect(screen.getByRole("radiogroup", { name: "Durée de la séance" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: "30 min" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "10 min" })).not.toBeChecked();
  });

  it("selects an option on click and reports it", async () => {
    const onValueChange = vi.fn();
    render(
      <SegmentedControl label="Durée" options={OPTIONS} value="30" onValueChange={onValueChange} />,
    );
    await userEvent.click(screen.getByRole("radio", { name: "45 min" }));
    expect(onValueChange).toHaveBeenCalledWith("45");
  });

  it("does not report a click on the option that is already selected", async () => {
    const onValueChange = vi.fn();
    render(
      <SegmentedControl label="Durée" options={OPTIONS} value="30" onValueChange={onValueChange} />,
    );
    await userEvent.click(screen.getByRole("radio", { name: "30 min" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("only the selected option is in the tab order", () => {
    render(<Harness />);
    expect(screen.getByRole("radio", { name: "30 min" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("radio", { name: "10 min" })).toHaveAttribute("tabindex", "-1");
  });

  it("moves with the arrow keys and wraps around", async () => {
    render(<Harness initial="45" />);
    screen.getByRole("radio", { name: "45 min" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "10 min" })).toBeChecked();
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("radio", { name: "45 min" })).toBeChecked();
    await userEvent.keyboard("{ArrowUp}");
    expect(screen.getByRole("radio", { name: "30 min" })).toBeChecked();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "45 min" })).toBeChecked();
  });

  it("ignores other keys", async () => {
    render(<Harness />);
    screen.getByRole("radio", { name: "30 min" }).focus();
    await userEvent.keyboard("a");
    expect(screen.getByRole("radio", { name: "30 min" })).toBeChecked();
  });

  it("slides its highlight to the selected option", () => {
    const { container, rerender } = render(
      <SegmentedControl label="Durée" options={OPTIONS} value="10" onValueChange={() => {}} />,
    );
    const highlight = () => container.querySelector<HTMLElement>('[aria-hidden="true"]')!;
    expect(highlight().style.transform).toBe("translateX(0%)");
    rerender(
      <SegmentedControl label="Durée" options={OPTIONS} value="45" onValueChange={() => {}} />,
    );
    expect(highlight().style.transform).toBe("translateX(200%)");
  });

  it("falls back to the first option when the value is unknown", () => {
    render(
      <SegmentedControl
        label="Durée"
        options={OPTIONS}
        value={"999" as (typeof OPTIONS)[number]["value"]}
        onValueChange={() => {}}
      />,
    );
    expect(screen.getByRole("radio", { name: "10 min" })).toBeChecked();
  });
});
