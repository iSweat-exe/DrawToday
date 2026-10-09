import { describe, expect, it } from "vitest";
import {
  BLOCK_MINUTES,
  MOCK_SKILLS,
  MOCK_TODAY,
  MOCK_WEEKS,
  SESSION_LENGTHS,
  SESSION_XP,
} from "./exercises/mock";
import { ENTRY_FILTERS, MOCK_BADGES, MOCK_ENTRIES, MOCK_PROGRESS } from "./progress/mock";

// The sample data of the mock-ups (A-112) must not contradict the rules of docs/pedagogie/: otherwise the screens would
// show a game that cannot exist.

/** XP needed to reach level n (docs/pedagogie/gamification.md). */
const xpToReach = (n: number) => 50 * (n - 1) * (n + 4);

describe("sample progress", () => {
  const { level, xp, levelStartXp, nextLevelXp, weeklyGoal, weeklyDone } = MOCK_PROGRESS;

  it("follows the level curve: 50 × (n − 1) × (n + 4)", () => {
    expect(levelStartXp).toBe(xpToReach(level));
    expect(nextLevelXp).toBe(xpToReach(level + 1));
  });

  it("has an XP total that really belongs to the level it shows", () => {
    expect(xp).toBeGreaterThanOrEqual(levelStartXp);
    expect(xp).toBeLessThan(nextLevelXp);
  });

  it("uses the title of its level range (levels 1 to 4: « Premier trait »)", () => {
    expect(level).toBeLessThanOrEqual(4);
    expect(MOCK_PROGRESS.levelTitle).toBe("Premier trait");
  });

  it("has a weekly goal between 3 and 6 sessions, not yet over", () => {
    expect(weeklyGoal).toBeGreaterThanOrEqual(3);
    expect(weeklyGoal).toBeLessThanOrEqual(6);
    expect(weeklyDone).toBeLessThanOrEqual(weeklyGoal);
  });
});

describe("sample sessions", () => {
  it("offers the four lengths of the app and gives each its XP: 3 per minute + 10 for the review", () => {
    expect(SESSION_LENGTHS.map((length) => length.value)).toEqual(["10", "15", "30", "45"]);
    for (const { value } of SESSION_LENGTHS) {
      expect(SESSION_XP[value], value).toBe(3 * Number(value) + 10);
    }
  });

  it("splits every length into four blocks that add up to it", () => {
    for (const { value } of SESSION_LENGTHS) {
      const blocks = BLOCK_MINUTES[value];
      expect(blocks, value).toHaveLength(4);
      expect(
        blocks.reduce((sum, minutes) => sum + minutes, 0),
        value,
      ).toBe(Number(value));
    }
  });

  it("has the four blocks: warm-up, core, application, review", () => {
    expect(MOCK_TODAY.blocks.map((block) => block.name)).toEqual([
      "Échauffement",
      "Cœur",
      "Application",
      "Revue",
    ]);
  });
});

describe("sample path", () => {
  it("has the eight weeks of « Fondations », numbered in order", () => {
    expect(MOCK_WEEKS.map((week) => week.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("has exactly one current week, after the finished ones and before the ones to come", () => {
    const order = MOCK_WEEKS.map((week) => week.status);
    expect(order.filter((status) => status === "current")).toHaveLength(1);
    const ranks = order.map((status) => ({ done: 0, current: 1, next: 2 })[status]);
    expect(ranks).toEqual([...ranks].sort());
  });

  it("counts five sessions in a finished week (four guided, one challenge) and none in a week to come", () => {
    for (const week of MOCK_WEEKS) {
      if (week.status === "done") expect(week.done, String(week.number)).toBe(5);
      if (week.status === "next") expect(week.done, String(week.number)).toBe(0);
      if (week.status === "current") {
        expect(week.done).toBeGreaterThan(0);
        expect(week.done).toBeLessThan(5);
      }
    }
  });

  it("puts the assessments in weeks 1, 4 and 8, as parcours.md says", () => {
    expect(MOCK_WEEKS.filter((week) => week.assessment).map((week) => week.number)).toEqual([
      1, 4, 8,
    ]);
  });

  it("says in the card of the day which week and session the learner is on", () => {
    const current = MOCK_WEEKS.find((week) => week.status === "current")!;
    expect(MOCK_TODAY.context).toContain(`Semaine ${current.number}, séance ${current.done + 1}`);
  });

  it("has stars between 0 and 5 for each skill, without duplicates", () => {
    const codes = MOCK_SKILLS.map((skill) => skill.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const skill of MOCK_SKILLS) {
      expect(skill.stars).toBeGreaterThanOrEqual(0);
      expect(skill.stars).toBeLessThanOrEqual(5);
    }
  });
});

describe("sample sketchbook and badges", () => {
  it("has at least one page for each filter, so no filter shows an empty screen", () => {
    for (const filter of ENTRY_FILTERS) {
      if (filter.value === "all") continue;
      expect(
        MOCK_ENTRIES.some((entry) => entry.type === filter.value),
        filter.value,
      ).toBe(true);
    }
  });

  it("has unique ids", () => {
    for (const list of [MOCK_ENTRIES, MOCK_BADGES]) {
      const ids = list.map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("shows some badges earned and some still to earn", () => {
    expect(MOCK_BADGES.some((badge) => badge.unlocked)).toBe(true);
    expect(MOCK_BADGES.some((badge) => !badge.unlocked)).toBe(true);
  });
});
