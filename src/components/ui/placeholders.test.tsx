import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./empty-state";
import {
  BookIcon,
  CheckIcon,
  ChevronRightIcon,
  ClockIcon,
  CloseIcon,
  FlameIcon,
  HomeIcon,
  LightbulbIcon,
  PlusIcon,
  RouteIcon,
  StarIcon,
  TargetIcon,
  UserIcon,
} from "./icons";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("is hidden from screen readers and has the requested size", () => {
    const { container } = render(<Skeleton width={120} height="2rem" />);
    const block = container.firstElementChild as HTMLElement;
    expect(block).toHaveAttribute("aria-hidden", "true");
    expect(block).toHaveClass("skeleton");
    expect(block.style.width).toBe("120px");
    expect(block.style.height).toBe("2rem");
  });

  it("can be a circle", () => {
    const { container } = render(<Skeleton circle width={40} height={40} />);
    expect(container.firstElementChild).toHaveClass("rounded-full");
  });
});

describe("EmptyState", () => {
  it("shows a title, a description and an action", () => {
    render(
      <EmptyState
        title="Aucun dessin pour l'instant"
        description="Fais ta première séance pour remplir ton carnet."
        action={<button type="button">Commencer</button>}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Aucun dessin pour l'instant" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Fais ta première séance pour remplir ton carnet."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Commencer" })).toBeInTheDocument();
  });

  it("only needs a title", () => {
    render(<EmptyState title="Rien ici" />);
    expect(screen.getByRole("heading", { name: "Rien ici" })).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows its icon", () => {
    render(<EmptyState title="Rien" icon={<span data-testid="icon" />} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});

describe("icons", () => {
  it.each([
    ["HomeIcon", HomeIcon],
    ["RouteIcon", RouteIcon],
    ["BookIcon", BookIcon],
    ["UserIcon", UserIcon],
    ["CheckIcon", CheckIcon],
    ["CloseIcon", CloseIcon],
    ["PlusIcon", PlusIcon],
    ["StarIcon", StarIcon],
    ["FlameIcon", FlameIcon],
    ["ClockIcon", ClockIcon],
    ["ChevronRightIcon", ChevronRightIcon],
    ["LightbulbIcon", LightbulbIcon],
    ["TargetIcon", TargetIcon],
  ])("%s is a decorative 24 px svg that follows the text color", (_name, Icon) => {
    const { container } = render(<Icon />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("stroke", "currentColor");
    expect(svg).toHaveAttribute("width", "24");
  });

  it("accepts a size and a class", () => {
    const { container } = render(<StarIcon width={32} height={32} className="text-reward" />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveClass("text-reward");
  });
});
