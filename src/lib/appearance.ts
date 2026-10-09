/**
 * The look the learner chose: light or dark (or follow the phone), a color theme, and the retro touch. Pure code: the
 * storage and the DOM are in `appearance-store.ts`. The values map to attributes of `<html>` that `globals.css` styles
 * (ADR 0007):
 *  - `data-theme="light" | "dark"` (absent = follow the system),
 *  - `data-accent="<theme>"` (absent = the default theme, `grape`),
 *  - `data-style="classic"` (absent = with the retro touch).
 */
export const THEME_MODES = ["system", "light", "dark"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

/** The color themes. The first one is the default and has no attribute. Keep in sync with `globals.css` (tested). */
export const ACCENTS = ["grape", "coral", "ocean", "candy", "lagoon", "graphite"] as const;
export type Accent = (typeof ACCENTS)[number];

export const ACCENT_LABELS: Record<Accent, string> = {
  grape: "Prune",
  coral: "Corail",
  ocean: "Océan",
  candy: "Bonbon",
  lagoon: "Lagon",
  graphite: "Graphite",
};

export const MODE_LABELS: Record<ThemeMode, string> = {
  system: "Auto",
  light: "Clair",
  dark: "Sombre",
};

export type Appearance = {
  mode: ThemeMode;
  accent: Accent;
  /** Pixel font, blocky progress bars, little windows: a nod to the 90s that can be switched off. */
  retro: boolean;
};

export const DEFAULT_APPEARANCE: Appearance = { mode: "system", accent: "grape", retro: true };

/** Where the choice is kept (the device, for now: a guest has no account). */
export const APPEARANCE_STORAGE_KEY = "drawtoday-appearance";

/**
 * Reads a stored choice, whatever it looks like: unknown or missing values fall back to the defaults, one by one, so a
 * choice written by an older or a newer version of the app never breaks the page.
 * @param raw - The stored text, or nothing.
 * @returns A complete, valid appearance.
 */
export function parseAppearance(raw: string | null | undefined): Appearance {
  if (!raw) return DEFAULT_APPEARANCE;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return DEFAULT_APPEARANCE;
  }
  if (typeof data !== "object" || data === null) return DEFAULT_APPEARANCE;
  const { mode, accent, retro } = data as Record<string, unknown>;
  return {
    mode: THEME_MODES.find((candidate) => candidate === mode) ?? DEFAULT_APPEARANCE.mode,
    accent: ACCENTS.find((candidate) => candidate === accent) ?? DEFAULT_APPEARANCE.accent,
    retro: typeof retro === "boolean" ? retro : DEFAULT_APPEARANCE.retro,
  };
}

/**
 * The attributes of `<html>` for an appearance; `null` means "remove the attribute" (the default).
 * @param appearance - The choice to translate.
 */
export function appearanceAttributes(appearance: Appearance): Record<string, string | null> {
  return {
    "data-theme": appearance.mode === "system" ? null : appearance.mode,
    "data-accent": appearance.accent === DEFAULT_APPEARANCE.accent ? null : appearance.accent,
    "data-style": appearance.retro ? null : "classic",
  };
}

/**
 * Puts an appearance on the page: the attributes of the root element, and the color of the browser bar (`theme-color`),
 * which follows the paper when the learner chose a mode or a color theme (each theme has its own paper) and goes back to
 * the system values otherwise.
 * @param root - The `<html>` element.
 * @param appearance - The choice to apply.
 */
export function applyAppearance(root: HTMLElement, appearance: Appearance): void {
  for (const [name, value] of Object.entries(appearanceAttributes(appearance))) {
    if (value === null) root.removeAttribute(name);
    else root.setAttribute(name, value);
  }
  const paper = getComputedStyle(root).getPropertyValue("--background").trim();
  const customized =
    appearance.mode !== "system" || appearance.accent !== DEFAULT_APPEARANCE.accent;
  const explicit = customized && paper !== "";
  for (const meta of root.ownerDocument.querySelectorAll<HTMLMetaElement>(
    'meta[name="theme-color"]',
  )) {
    if (meta.dataset.original === undefined) meta.dataset.original = meta.content;
    meta.content = explicit ? paper : (meta.dataset.original ?? meta.content);
  }
}

/**
 * Runs in the `<head>`, before the first paint, so that a chosen theme never flashes the default one. It mirrors
 * `parseAppearance` + `appearanceAttributes` in a few bytes (tested against them); it must stay free of imports.
 */
export const APPEARANCE_INIT_SCRIPT = `(function(){try{var r=localStorage.getItem(${JSON.stringify(
  APPEARANCE_STORAGE_KEY,
)});if(!r)return;var p=JSON.parse(r),e=document.documentElement;if(p.mode==="light"||p.mode==="dark")e.setAttribute("data-theme",p.mode);if(${JSON.stringify(
  ACCENTS,
)}.indexOf(p.accent)>0)e.setAttribute("data-accent",p.accent);if(p.retro===false)e.setAttribute("data-style","classic")}catch(x){}})()`;
