import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { PreviewNotice } from "@/components/preview-notice";
import { ToastProvider } from "@/components/ui/toast";
import { ChallengeCard } from "./exercises/challenge-card";
import { MOCK_SKILLS, MOCK_WEEKS } from "./exercises/mock";
import { PathView } from "./exercises/path-view";
import { SkillRow } from "./exercises/skill-row";
import { TodaySessionCard } from "./exercises/today-session-card";
import { WeekCard } from "./exercises/week-card";
import { BadgeGrid } from "./progress/badge-grid";
import { BeforeAfterCard } from "./progress/before-after-card";
import { Journal } from "./progress/journal";
import { LevelCard } from "./progress/level-card";
import { Sketch } from "./progress/sketch";
import { StatsGrid } from "./progress/stats-grid";
import { WeeklyGoalCard } from "./progress/weekly-goal-card";
import { SettingsCard } from "./settings/settings-card";
import { TipCard } from "./tips/tip-card";

vi.mock("@/lib/haptics", () => ({ haptic: vi.fn() }));

const withToasts = (ui: ReactNode) => render(<ToastProvider>{ui}</ToastProvider>);

describe("PreviewNotice", () => {
  it("says that the data is a sample", () => {
    render(<PreviewNotice />);
    expect(screen.getByText(/données d'exemple/)).toBeVisible();
  });
});

describe("TodaySessionCard", () => {
  it("shows the session, its four blocks and the XP of the chosen length", async () => {
    withToasts(<TodaySessionCard />);
    expect(screen.getByRole("heading", { name: "Des boîtes qui tournent" })).toBeVisible();
    const blocks = within(screen.getByRole("list", { name: "Les quatre blocs de la séance" }));
    expect(blocks.getAllByRole("listitem")).toHaveLength(4);
    expect(blocks.getByText("6 min")).toBeVisible();
    expect(screen.getByRole("button", { name: /Commencer · \+100 XP/ })).toBeVisible();

    await userEvent.click(screen.getByRole("radio", { name: "15 min" }));
    expect(blocks.getByText("8 min")).toBeVisible();
    expect(screen.getByRole("button", { name: /\+55 XP/ })).toBeVisible();
  });

  it("says honestly that the session player is not there yet", async () => {
    withToasts(<TodaySessionCard />);
    await userEvent.click(screen.getByRole("button", { name: /Commencer/ }));
    expect(screen.getByRole("status")).toHaveTextContent("arrive bientôt");
  });
});

describe("WeeklyGoalCard and LevelCard", () => {
  it("says what is left to do for the weekly goal, never a warning", () => {
    render(<WeeklyGoalCard />);
    expect(screen.getByRole("progressbar", { name: "Séances de la semaine" })).toHaveAttribute(
      "aria-valuenow",
      "3",
    );
    expect(screen.getByText(/Plus que 1 séance pour/)).toBeVisible();
    expect(screen.getByText("+50 XP")).toBeVisible();
  });

  it("shows the level, the XP and the way to the next level", () => {
    render(<LevelCard />);
    expect(screen.getByRole("img", { name: "Niveau 4, Premier trait" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "1 350 XP" })).toBeVisible();
    expect(screen.getByText("150 / 600 XP pour le niveau 5")).toBeVisible();
    expect(
      screen.getByRole("progressbar", { name: "Progression vers le niveau 5" }),
    ).toHaveAttribute("aria-valuenow", "25");
  });

  it("can use a lower heading level where it sits under another section", () => {
    render(<LevelCard headingLevel={3} />);
    expect(screen.getByRole("heading", { level: 3 })).toBeVisible();
  });
});

describe("ChallengeCard", () => {
  it("shows the challenge with its duration and XP, and answers when accepted", async () => {
    withToasts(<ChallengeCard />);
    expect(screen.getByText("10 min · +20 XP")).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Relever le défi" }));
    expect(screen.getByRole("status")).toHaveTextContent("Défi accepté");
  });
});

describe("TipCard", () => {
  it("explains the answer at once, with the same kind words whatever was chosen", async () => {
    render(<TipCard />);
    expect(screen.queryByRole("status")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Plate" }));
    expect(screen.getByRole("status")).toHaveTextContent("Bien vu !");
    expect(screen.getByRole("status")).toHaveTextContent("l'ellipse est aplatie");

    await userEvent.click(screen.getByRole("button", { name: "Ronde" }));
    expect(screen.getByRole("status")).toHaveTextContent("Presque !");
    expect(screen.getByRole("status")).toHaveTextContent("l'ellipse est aplatie");
    expect(screen.getByRole("button", { name: "Ronde" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Plate" })).toHaveAttribute("aria-pressed", "false");
  });
});

describe("WeekCard", () => {
  const week = (status: "done" | "current" | "next") =>
    MOCK_WEEKS.find((item) => item.status === status)!;

  it("marks the current week as the current step", () => {
    render(
      <ul>
        <WeekCard week={week("current")} />
      </ul>,
    );
    expect(screen.getByRole("listitem")).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("En cours")).toBeVisible();
    expect(screen.getByRole("img", { name: "2 séances sur 5" })).toBeVisible();
  });

  it("shows a finished week as done, with a check", () => {
    render(
      <ul>
        <WeekCard week={week("done")} />
      </ul>,
    );
    expect(screen.getByText("Terminée")).toBeVisible();
    expect(screen.getByRole("img", { name: "5 séances sur 5" })).toBeVisible();
    expect(screen.getByRole("listitem")).not.toHaveAttribute("aria-current");
  });

  it("shows a week to come as calm and open, never as locked", () => {
    render(
      <ul>
        <WeekCard week={week("next")} />
      </ul>,
    );
    const item = screen.getByRole("listitem");
    expect(item).toHaveClass("border-dashed");
    expect(screen.getByText("À venir")).toBeVisible();
    expect(screen.getByRole("img", { name: "0 séance sur 5" })).toBeVisible();
    expect(item.textContent ?? "").not.toMatch(/verrouill|bloqu/i);
  });

  it("flags the weeks with an assessment", () => {
    render(
      <ul>
        <WeekCard week={MOCK_WEEKS[0]!} />
      </ul>,
    );
    expect(screen.getByText("Bilan")).toBeVisible();
  });
});

describe("SkillRow", () => {
  it("names the skill and its stars", () => {
    const skill = MOCK_SKILLS[0]!;
    render(
      <ul>
        <SkillRow skill={skill} />
      </ul>,
    );
    expect(screen.getByText(skill.name)).toBeVisible();
    expect(
      screen.getByRole("img", { name: `${skill.name} : ${skill.stars} étoiles sur 5` }),
    ).toBeVisible();
  });
});

describe("PathView", () => {
  it("shows the progress of the path and the weeks first", () => {
    render(<PathView />);
    expect(
      screen.getByRole("progressbar", { name: "Avancement du parcours Fondations" }),
    ).toHaveAttribute("aria-valuenow", "30");
    expect(screen.getByText("12/40")).toBeVisible();
    expect(
      within(screen.getByRole("list", { name: "Les semaines du parcours" })).getAllByRole(
        "listitem",
      ),
    ).toHaveLength(8);
  });

  it("switches to the map of skills and back", async () => {
    render(<PathView />);
    await userEvent.click(screen.getByRole("radio", { name: "Compétences" }));
    expect(screen.getByRole("heading", { name: "Carte des compétences" })).toBeVisible();
    expect(screen.queryByRole("list", { name: "Les semaines du parcours" })).toBeNull();
    expect(screen.getAllByText(/^C\d+$/)).toHaveLength(MOCK_SKILLS.length);

    await userEvent.click(screen.getByRole("radio", { name: "Semaines" }));
    expect(screen.getByRole("list", { name: "Les semaines du parcours" })).toBeVisible();
  });
});

describe("Sketch and BeforeAfterCard", () => {
  it("describes each drawing", () => {
    const { rerender } = render(<Sketch kind="sphere" />);
    expect(screen.getByRole("img", { name: "Une sphère éclairée" })).toBeInTheDocument();
    for (const [kind, name] of [
      ["box", "Une boîte en perspective"],
      ["lines", "Traits à main levée"],
      ["cylinder", "Un mug dessiné"],
      ["hand", "Le contour d'une main"],
    ] as const) {
      rerender(<Sketch kind={kind} />);
      expect(screen.getByRole("img", { name })).toBeInTheDocument();
    }
  });

  it("draws a wobbly « before » that differs from the « after »", () => {
    const { container, rerender } = render(<Sketch kind="box" />);
    const clean = container.innerHTML;
    rerender(<Sketch kind="box" rough />);
    expect(container.innerHTML).not.toBe(clean);
  });

  it("puts the two drawings side by side with their captions", () => {
    render(<BeforeAfterCard />);
    expect(screen.getByRole("heading", { name: "Avant / Après" })).toBeVisible();
    expect(screen.getByText("Jour 1")).toBeVisible();
    expect(screen.getByText("Aujourd'hui")).toBeVisible();
    expect(screen.getAllByRole("img")).toHaveLength(2);
  });
});

describe("Journal", () => {
  it("lists every page, then filters by type", async () => {
    withToasts(<Journal />);
    const pages = () =>
      within(screen.getByRole("list", { name: "Les pages du carnet" })).getAllByRole("listitem");
    expect(pages()).toHaveLength(6);

    await userEvent.click(screen.getByRole("radio", { name: "Notes" }));
    expect(pages()).toHaveLength(1);
    expect(screen.getByText("Carnet libre : mon mug")).toBeVisible();

    await userEvent.click(screen.getByRole("radio", { name: "Séances" }));
    expect(pages()).toHaveLength(4);
  });

  it("says that new pages are not there yet", async () => {
    withToasts(<Journal />);
    await userEvent.click(screen.getByRole("button", { name: "Nouvelle page de carnet" }));
    expect(screen.getByRole("status")).toHaveTextContent("arrivent bientôt");
  });
});

describe("StatsGrid and BadgeGrid", () => {
  it("shows the four numbers with their labels", () => {
    render(<StatsGrid />);
    const stats = within(screen.getByRole("heading", { name: "Mes statistiques" }).parentElement!);
    expect(stats.getByText("séances").previousElementSibling).toHaveTextContent("17");
    expect(stats.getByText("minutes de pratique").previousElementSibling).toHaveTextContent("410");
    expect(stats.getByText("badges").previousElementSibling).toHaveTextContent("4/8");
  });

  it("shows earned and still-to-earn badges, each with a spoken state", () => {
    render(<BadgeGrid />);
    expect(screen.getByText("4 sur 8")).toBeVisible();
    expect(screen.getAllByRole("img", { name: /: obtenu$/ })).toHaveLength(4);
    expect(screen.getAllByRole("img", { name: /: à obtenir$/ })).toHaveLength(4);
  });
});

describe("SettingsCard", () => {
  it("starts on the defaults of the docs: 4 sessions of 30 minutes, reminder on, pause off", () => {
    withToasts(<SettingsCard />);
    expect(screen.getByRole("radio", { name: "4" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "30 min" })).toBeChecked();
    expect(screen.getByRole("switch", { name: /Rappel quotidien/ })).toBeChecked();
    expect(screen.getByRole("switch", { name: /Mode pause/ })).not.toBeChecked();
  });

  it("changes a setting and says that nothing is saved yet", async () => {
    withToasts(<SettingsCard />);
    await userEvent.click(screen.getByRole("radio", { name: "5" }));
    expect(screen.getByRole("radio", { name: "5" })).toBeChecked();
    expect(screen.getByRole("status")).toHaveTextContent("rien n'est enregistré");

    await userEvent.click(screen.getByRole("switch", { name: /Mode pause/ }));
    expect(screen.getByRole("switch", { name: /Mode pause/ })).toBeChecked();
  });
});
