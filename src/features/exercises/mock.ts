/**
 * SAMPLE DATA for the screen mock-ups (A-112): it lets everyone see the final look of the app before the real content
 * exists. Nothing here comes from the database. Delete a mock when the real data replaces it; the names and numbers
 * follow `docs/pedagogie/` (parcours.md, competences.md, defis.md, gamification.md).
 */

export type SessionMinutes = "10" | "15" | "30" | "45";

/** The four blocks of a session, in minutes, for each length the learner can choose (`routine-quotidienne.md`). */
export const BLOCK_MINUTES: Record<SessionMinutes, [number, number, number, number]> = {
  "10": [2, 5, 2, 1],
  "15": [3, 8, 2, 2],
  "30": [6, 15, 7, 2],
  "45": [8, 25, 10, 2],
};

/** XP of a session: 3 per minute plus 10 for the review (`gamification.md`). */
export const SESSION_XP: Record<SessionMinutes, number> = {
  "10": 40,
  "15": 55,
  "30": 100,
  "45": 145,
};

export const SESSION_LENGTHS: ReadonlyArray<{ value: SessionMinutes; label: string }> = [
  { value: "10", label: "10 min" },
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
];

export const MOCK_TODAY = {
  title: "Des boîtes qui tournent",
  context: "Fondations · Semaine 3, séance 3",
  /** Names of the four blocks (warm-up, core, application, review) with their exercise. */
  blocks: [
    { name: "Échauffement", exercise: "W3 · Plans fantômes" },
    { name: "Cœur", exercise: "C3 · Boîtes tournées" },
    { name: "Application", exercise: "C2 · Boîtes en perspective" },
    { name: "Revue", exercise: "M1 · Trois questions" },
  ],
} as const;

export type WeekStatus = "done" | "current" | "next";

export type MockWeek = {
  number: number;
  title: string;
  /** Skills worked this week. */
  skills: string;
  status: WeekStatus;
  /** Sessions done out of 5 (4 guided sessions and the weekly challenge). */
  done: number;
  challenge: string;
  /** The mid-course and final assessments (M2). */
  assessment?: boolean;
};

export const MOCK_WEEKS: ReadonlyArray<MockWeek> = [
  {
    number: 1,
    title: "Le trait",
    skills: "C1 Trait",
    status: "done",
    done: 5,
    challenge: "D1 · Le trait sûr",
    assessment: true,
  },
  {
    number: 2,
    title: "Ellipses et boîtes",
    skills: "C2 Formes · C3 Construction",
    status: "done",
    done: 5,
    challenge: "D2 · Vingt boîtes",
  },
  {
    number: 3,
    title: "Perspective",
    skills: "C3 Construction",
    status: "current",
    done: 2,
    challenge: "D3 · Une ville de boîtes",
  },
  {
    number: 4,
    title: "Volumes",
    skills: "C5 Volume",
    status: "next",
    done: 0,
    challenge: "D4 · Nature morte en boîtes",
    assessment: true,
  },
  {
    number: 5,
    title: "Observation",
    skills: "C4 Observation",
    status: "next",
    done: 0,
    challenge: "D5 · Mon bureau",
  },
  {
    number: 6,
    title: "Lumière et valeurs",
    skills: "C6 Lumière",
    status: "next",
    done: 0,
    challenge: "D6 · Trio éclairé",
  },
  {
    number: 7,
    title: "Objets du quotidien",
    skills: "C8 Objets",
    status: "next",
    done: 0,
    challenge: "D7 · Nature morte de trois objets",
  },
  {
    number: 8,
    title: "Geste, composition et bilan",
    skills: "C7 · C9 · C10",
    status: "next",
    done: 0,
    challenge: "D8 · La nature morte finale",
    assessment: true,
  },
];

export type MockSkill = {
  code: string;
  name: string;
  /** Mastery stars, 0 to 5. */
  stars: number;
  hint: string;
};

export const MOCK_SKILLS: ReadonlyArray<MockSkill> = [
  { code: "C1", name: "Contrôle du trait", stars: 3, hint: "Prochain re-test dans 4 jours" },
  { code: "C2", name: "Ellipses et formes", stars: 2, hint: "Encore un défi pour la 3ᵉ étoile" },
  { code: "C3", name: "Construction et perspective", stars: 1, hint: "En cours cette semaine" },
  { code: "C4", name: "Observation et proportions", stars: 0, hint: "Semaine 5" },
  { code: "C5", name: "Volume", stars: 0, hint: "Semaine 4" },
  { code: "C6", name: "Lumière et valeurs", stars: 0, hint: "Semaine 6" },
  { code: "C8", name: "Objets du quotidien", stars: 0, hint: "Semaine 7" },
];

export const MOCK_CHALLENGE = {
  title: "Défi du jour",
  text: "Dessine l'objet le plus proche de toi en trois boîtes seulement.",
  minutes: 10,
  xp: 20,
} as const;
