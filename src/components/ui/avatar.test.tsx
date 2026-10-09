import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./avatar";

describe("Avatar", () => {
  it("shows the picture and is announced as the person's name", () => {
    const { container } = render(
      <Avatar name="Ada Lovelace" src="https://cdn.discordapp.com/a.png" />,
    );
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toBeVisible();
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://cdn.discordapp.com/a.png",
    );
    expect(container.querySelector("img")).toHaveAttribute("referrerpolicy", "no-referrer");
  });

  it("shows the initials without a picture", () => {
    render(<Avatar name="Ada Lovelace" />);
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toHaveTextContent("AL");
  });

  it("falls back to the initials when the picture fails to load", () => {
    const { container } = render(
      <Avatar name="Ada Lovelace" src="https://cdn.discordapp.com/gone.png" />,
    );
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toHaveTextContent("AL");
  });

  it("tries a new picture after a failed one", () => {
    const { container, rerender } = render(
      <Avatar name="Ada" src="https://cdn.discordapp.com/gone.png" />,
    );
    fireEvent.error(container.querySelector("img")!);
    rerender(<Avatar name="Ada" src="https://cdn.discordapp.com/new.png" />);
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://cdn.discordapp.com/new.png",
    );
  });

  it("has three sizes, the default being a 44 px touch target", () => {
    const { rerender } = render(<Avatar name="Ada" />);
    expect(screen.getByRole("img")).toHaveClass("size-11");
    rerender(<Avatar name="Ada" size="sm" />);
    expect(screen.getByRole("img")).toHaveClass("size-9");
    rerender(<Avatar name="Ada" size="lg" />);
    expect(screen.getByRole("img")).toHaveClass("size-20");
  });
});
