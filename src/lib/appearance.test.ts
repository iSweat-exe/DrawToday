import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ACCENT_LABELS,
  ACCENTS,
  appearanceAttributes,
  APPEARANCE_INIT_SCRIPT,
  APPEARANCE_STORAGE_KEY,
  applyAppearance,
  DEFAULT_APPEARANCE,
  MODE_LABELS,
  parseAppearance,
  THEME_MODES,
} from "./appearance";

const root = () => document.documentElement;

function clean() {
  for (const name of ["data-theme", "data-accent", "data-style"]) root().removeAttribute(name);
  root().style.removeProperty("--background");
  document.head.querySelectorAll("meta").forEach((meta) => meta.remove());
  localStorage.clear();
}

beforeEach(clean);
afterEach(clean);

describe("parseAppearance", () => {
  it("is the default look when nothing is stored", () => {
    expect(parseAppearance(null)).toEqual(DEFAULT_APPEARANCE);
    expect(parseAppearance(undefined)).toEqual(DEFAULT_APPEARANCE);
    expect(parseAppearance("")).toEqual(DEFAULT_APPEARANCE);
  });

  it("is the default look for anything that is not a choice, and never throws", () => {
    for (const raw of ["{", "null", "42", '"dark"', "[]", "true"]) {
      expect(parseAppearance(raw), raw).toEqual(DEFAULT_APPEARANCE);
    }
  });

  it("reads a valid choice", () => {
    expect(
      parseAppearance(JSON.stringify({ mode: "dark", accent: "coral", retro: false })),
    ).toEqual({
      mode: "dark",
      accent: "coral",
      retro: false,
    });
  });

  it("falls back value by value: a choice from another version never breaks the page", () => {
    expect(
      parseAppearance(JSON.stringify({ mode: "sepia", accent: "ocean", retro: "yes" })),
    ).toEqual({
      mode: "system",
      accent: "ocean",
      retro: true,
    });
    expect(parseAppearance(JSON.stringify({ accent: "hotpink" }))).toEqual(DEFAULT_APPEARANCE);
  });
});

describe("appearanceAttributes", () => {
  it("has no attribute for the default look", () => {
    expect(appearanceAttributes(DEFAULT_APPEARANCE)).toEqual({
      "data-theme": null,
      "data-accent": null,
      "data-style": null,
    });
  });

  it("maps each choice to its attribute", () => {
    expect(appearanceAttributes({ mode: "dark", accent: "candy", retro: false })).toEqual({
      "data-theme": "dark",
      "data-accent": "candy",
      "data-style": "classic",
    });
  });
});

describe("the lists", () => {
  it("starts with the default theme and the system mode, and labels everything in French", () => {
    expect(ACCENTS[0]).toBe(DEFAULT_APPEARANCE.accent);
    expect(THEME_MODES[0]).toBe(DEFAULT_APPEARANCE.mode);
    for (const accent of ACCENTS) expect(ACCENT_LABELS[accent]).toBeTruthy();
    for (const mode of THEME_MODES) expect(MODE_LABELS[mode]).toBeTruthy();
  });
});

describe("applyAppearance", () => {
  it("sets and removes the attributes of the page", () => {
    applyAppearance(root(), { mode: "light", accent: "ocean", retro: false });
    expect(root()).toHaveAttribute("data-theme", "light");
    expect(root()).toHaveAttribute("data-accent", "ocean");
    expect(root()).toHaveAttribute("data-style", "classic");

    applyAppearance(root(), DEFAULT_APPEARANCE);
    expect(root()).not.toHaveAttribute("data-theme");
    expect(root()).not.toHaveAttribute("data-accent");
    expect(root()).not.toHaveAttribute("data-style");
  });

  function addThemeColors() {
    document.head.innerHTML =
      '<meta name="theme-color" media="(prefers-color-scheme: light)" content="#fff6e5">' +
      '<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#17122b">';
    root().style.setProperty("--background", "#112233");
  }
  const colors = () =>
    [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')].map(
      (meta) => meta.content,
    );

  it("colors the browser bar like the paper when the mode is explicit", () => {
    addThemeColors();
    applyAppearance(root(), { ...DEFAULT_APPEARANCE, mode: "dark" });
    expect(colors()).toEqual(["#112233", "#112233"]);
  });

  it("colors the browser bar like the paper of a color theme, even when the mode is the system", () => {
    addThemeColors();
    applyAppearance(root(), { ...DEFAULT_APPEARANCE, accent: "ocean" });
    expect(colors()).toEqual(["#112233", "#112233"]);
  });

  it("gives the system colors back when the mode is the system", () => {
    addThemeColors();
    applyAppearance(root(), { ...DEFAULT_APPEARANCE, mode: "dark" });
    applyAppearance(root(), DEFAULT_APPEARANCE);
    expect(colors()).toEqual(["#fff6e5", "#17122b"]);
  });

  it("leaves the browser bar alone when the stylesheet gave no paper color", () => {
    addThemeColors();
    root().style.removeProperty("--background");
    applyAppearance(root(), { ...DEFAULT_APPEARANCE, mode: "light" });
    expect(colors()).toEqual(["#fff6e5", "#17122b"]);
  });
});

describe("the init script (runs before the first paint)", () => {
  const run = () => new Function(APPEARANCE_INIT_SCRIPT)();
  const attributes = () =>
    Object.fromEntries(
      ["data-theme", "data-accent", "data-style"].map((name) => [name, root().getAttribute(name)]),
    );

  it("does nothing when nothing is stored", () => {
    run();
    expect(attributes()).toEqual({ "data-theme": null, "data-accent": null, "data-style": null });
  });

  it("puts on the page exactly what parseAppearance + appearanceAttributes say, for any stored text", () => {
    const stored = [
      { mode: "dark", accent: "coral", retro: false },
      { mode: "light", accent: "grape", retro: true },
      { mode: "system", accent: "graphite" },
      { mode: "sepia", accent: "hotpink", retro: "no" },
      { retro: false },
      {},
    ].map((choice) => JSON.stringify(choice));
    stored.push("{", "null", "42", "[]");

    for (const raw of stored) {
      clean();
      localStorage.setItem(APPEARANCE_STORAGE_KEY, raw);
      run();
      expect(attributes(), raw).toEqual(appearanceAttributes(parseAppearance(raw)));
    }
  });

  it("never throws, even when the storage is not available", () => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error("blocked");
    };
    try {
      expect(run).not.toThrow();
    } finally {
      Storage.prototype.getItem = original;
    }
  });

  it("is small: it blocks the first paint", () => {
    expect(APPEARANCE_INIT_SCRIPT.length).toBeLessThan(500);
  });
});
