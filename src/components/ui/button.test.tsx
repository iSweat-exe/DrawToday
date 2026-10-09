import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Button } from "./button";

const vibrate = vi.fn();
vi.mock("@/lib/haptics", () => ({ haptic: (...args: unknown[]) => vibrate(...args) }));

beforeEach(() => vibrate.mockClear());

describe("Button", () => {
  it("renders a primary medium button by default, with type=button", () => {
    render(<Button>Commencer</Button>);
    const button = screen.getByRole("button", { name: "Commencer" });
    expect(button).toHaveClass("btn", "btn-primary");
    expect(button).not.toHaveClass("btn-sm");
    expect(button).toHaveAttribute("type", "button");
  });

  it.each(["secondary", "outline", "danger", "ghost"] as const)(
    "applies the %s variant",
    (variant) => {
      render(<Button variant={variant}>Ok</Button>);
      expect(screen.getByRole("button")).toHaveClass(`btn-${variant}`);
    },
  );

  it("applies the compact size and extra classes", () => {
    render(
      <Button size="sm" className="w-full">
        Ok
      </Button>,
    );
    expect(screen.getByRole("button")).toHaveClass("btn-sm", "w-full");
  });

  it("calls onClick and gives a light haptic tap by default", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Ok</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(vibrate).toHaveBeenCalledWith("tap");
  });

  it("uses the requested haptic pattern, or none with haptic={false}", async () => {
    const { rerender } = render(<Button haptic="success">Ok</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(vibrate).toHaveBeenLastCalledWith("success");
    vibrate.mockClear();
    rerender(<Button haptic={false}>Ok</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(vibrate).not.toHaveBeenCalled();
  });

  it("is disabled, busy and shows a spinner while loading, and ignores clicks", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Envoi
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Envoi" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button.querySelector(".spinner")).not.toBeNull();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("is not busy when it is not loading", () => {
    render(<Button>Ok</Button>);
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy");
  });

  it("respects the disabled attribute", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Ok
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("can be a submit button", () => {
    render(<Button type="submit">Envoyer</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
