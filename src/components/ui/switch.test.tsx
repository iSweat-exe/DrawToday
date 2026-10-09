import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Switch } from "./switch";

const vibrate = vi.fn();
vi.mock("@/lib/haptics", () => ({ haptic: (...args: unknown[]) => vibrate(...args) }));

beforeEach(() => vibrate.mockClear());

describe("Switch", () => {
  it("is a switch, off by default, named by its label", () => {
    render(<Switch label="Rappel quotidien" />);
    const control = screen.getByRole("switch", { name: /Rappel quotidien/ });
    expect(control).toHaveAttribute("aria-checked", "false");
  });

  it("starts on with defaultChecked and toggles on click (uncontrolled)", async () => {
    render(<Switch label="Sons" defaultChecked />);
    const control = screen.getByRole("switch");
    expect(control).toHaveAttribute("aria-checked", "true");
    await userEvent.click(control);
    expect(control).toHaveAttribute("aria-checked", "false");
    await userEvent.click(control);
    expect(control).toHaveAttribute("aria-checked", "true");
  });

  it("reports the new value, and gives a success haptic when it turns on, a tap when it turns off", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="Sons" onCheckedChange={onCheckedChange} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(vibrate).toHaveBeenLastCalledWith("success");
    await userEvent.click(screen.getByRole("switch"));
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    expect(vibrate).toHaveBeenLastCalledWith("tap");
  });

  it("follows the checked prop when controlled and does not change by itself", async () => {
    const onCheckedChange = vi.fn();
    const { rerender } = render(
      <Switch label="Sons" checked={false} onCheckedChange={onCheckedChange} />,
    );
    const control = screen.getByRole("switch");
    await userEvent.click(control);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(control).toHaveAttribute("aria-checked", "false");
    rerender(<Switch label="Sons" checked onCheckedChange={onCheckedChange} />);
    expect(control).toHaveAttribute("aria-checked", "true");
  });

  it("describes itself with its description", () => {
    render(<Switch label="Rappel" description="Une fois par jour, à l'heure choisie" />);
    expect(screen.getByRole("switch")).toHaveAccessibleDescription(
      "Une fois par jour, à l'heure choisie",
    );
  });

  it("cannot be toggled when disabled", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="Sons" disabled onCheckedChange={onCheckedChange} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("can be toggled with the keyboard", async () => {
    render(<Switch label="Sons" />);
    await userEvent.tab();
    await userEvent.keyboard(" ");
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });
});
