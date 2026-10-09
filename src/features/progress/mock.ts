/**
 * SAMPLE DATA for the screen mock-ups (A-112). Nothing here comes from the database; delete it when the real progress
 * replaces it. Numbers follow `docs/pedagogie/gamification.md`: the XP needed to reach level n is 50 × (n − 1) × (n + 4).
 */

export const MOCK_PROGRESS = {
  weekSeries: 3,
  xp: 1350,
  level: 4,
  levelTitle: "Premier trait",
  /** XP needed to reach the current level, and the next one. */
  levelStartXp: 1200,
  nextLevelXp: 1800,
  weeklyGoal: 4,
  weeklyDone: 3,
  sessionsTotal: 17,
  minutesTotal: 410,
} as const;

export type MockBadge = {
  id: string;
  name: string;
  icon: "pencil" | "flame" | "star" | "check" | "target" | "route";
  tone: "reward" | "ember" | "accent" | "sky";
  unlocked: boolean;
  tilt?: number;
};

export const MOCK_BADGES: ReadonlyArray<MockBadge> = [
  {
    id: "first",
    name: "Première séance",
    icon: "pencil",
    tone: "reward",
    unlocked: true,
    tilt: -5,
  },
  {
    id: "full-week",
    name: "Semaine pleine",
    icon: "flame",
    tone: "ember",
    unlocked: true,
    tilt: 4,
  },
  { id: "steady-line", name: "Trait sûr", icon: "check", tone: "sky", unlocked: true, tilt: -3 },
  {
    id: "min-session",
    name: "Séance minimale",
    icon: "star",
    tone: "accent",
    unlocked: true,
    tilt: 5,
  },
  { id: "four-weeks", name: "Quatre semaines", icon: "flame", tone: "ember", unlocked: false },
  { id: "boxes", name: "Boîtes", icon: "target", tone: "reward", unlocked: false },
  { id: "new-eye", name: "Œil neuf", icon: "route", tone: "sky", unlocked: false },
  { id: "open-sketchbook", name: "Carnet ouvert", icon: "pencil", tone: "accent", unlocked: false },
];

export type SketchKind = "hand" | "lines" | "box" | "sphere" | "cylinder";

export type MockEntry = {
  id: string;
  title: string;
  date: string;
  kind: SketchKind;
  /** `session` is a guided session, `note` a free sketchbook page, `compare` a before/after test (M2). */
  type: "session" | "note" | "compare";
  detail: string;
};

export const MOCK_ENTRIES: ReadonlyArray<MockEntry> = [
  {
    id: "e1",
    title: "Boîtes en perspective",
    date: "Hier",
    kind: "box",
    type: "session",
    detail: "30 min · +100 XP",
  },
  {
    id: "e2",
    title: "Carnet libre : mon mug",
    date: "Il y a 2 jours",
    kind: "cylinder",
    type: "note",
    detail: "20 min · +60 XP",
  },
  {
    id: "e3",
    title: "Cercles et ellipses",
    date: "Il y a 5 jours",
    kind: "sphere",
    type: "session",
    detail: "30 min · +100 XP",
  },
  {
    id: "e4",
    title: "Contour aveugle : ma main",
    date: "Il y a 12 jours",
    kind: "hand",
    type: "session",
    detail: "30 min · +100 XP",
  },
  {
    id: "e5",
    title: "Traits fantômes",
    date: "Il y a 14 jours",
    kind: "lines",
    type: "session",
    detail: "30 min · +100 XP",
  },
  {
    id: "e6",
    title: "Test de départ",
    date: "Il y a 15 jours",
    kind: "box",
    type: "compare",
    detail: "Avant / après",
  },
];

export const ENTRY_FILTERS = [
  { value: "all", label: "Tout" },
  { value: "session", label: "Séances" },
  { value: "note", label: "Notes" },
] as const;

export type EntryFilter = (typeof ENTRY_FILTERS)[number]["value"];
