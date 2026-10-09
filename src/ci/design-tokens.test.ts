// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACCENTS } from "../lib/appearance";

// Guards the design system (ADR 0003, 0006): the dark values are written twice in globals.css and must stay identical,
// and every text color of the playful palette must stay readable on the surfaces it is used on (WCAG AA, 4.5:1).
const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

type Tokens = Record<string, string>;

function declarations(block: string): Tokens {
  const tokens: Tokens = {};
  for (const match of block.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    tokens[match[1]!] = match[2]!.replace(/\/\*.*?\*\//g, "").trim();
  }
  return tokens;
}

function blockAfter(marker: string): string {
  const start = css.indexOf(marker);
  expect(start, marker).toBeGreaterThanOrEqual(0);
  const open = css.indexOf("{", start);
  return css.slice(open + 1, css.indexOf("}", open));
}

const light = declarations(blockAfter("\n:root {"));
const systemDark = declarations(blockAfter(':root:not([data-theme="light"])'));
const forcedDark = declarations(blockAfter(':root[data-theme="dark"]'));

type Rgb = [number, number, number];

function rgb(hex: string): Rgb {
  expect(hex, "a hex color").toMatch(/^#[0-9a-f]{6}$/i);
  return [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16)) as Rgb;
}

/** `color-mix(in srgb, A p%, transparent)` drawn over a background: a plain alpha blend. */
function over(foreground: Rgb, background: Rgb, alpha: number): Rgb {
  return foreground.map((value, i) => value * alpha + background[i]! * (1 - alpha)) as Rgb;
}

function luminance([r, g, b]: Rgb): number {
  const [lr, lg, lb] = [r, g, b].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr! + 0.7152 * lg! + 0.0722 * lb!;
}

function contrast(a: Rgb, b: Rgb): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high! + 0.05) / (low! + 0.05);
}

/** The opacity of a derived text token such as `color-mix(in srgb, var(--foreground) 72%, transparent)`. */
function mixPercent(token: string): number {
  const match = css.match(
    new RegExp(`${token}:\\s*color-mix\\(in srgb, var\\(--foreground\\) (\\d+)%`),
  );
  expect(match, token).not.toBeNull();
  return Number(match![1]) / 100;
}

describe("design tokens: the dark theme", () => {
  it("is written twice (system preference and forced) with identical values", () => {
    expect(Object.keys(systemDark).length).toBeGreaterThan(8);
    expect(forcedDark).toEqual(systemDark);
  });

  it("redefines every color that the light theme sets, except the ones that are the same in both", () => {
    // The retro tokens are not colors of a theme: they only change with the style (tested below).
    const sameInBoth = [
      "--reward-ink",
      "--font-retro",
      "--bevel-light",
      "--bevel-dark",
      "--segment-gap",
    ];
    for (const name of Object.keys(light)) {
      if (sameInBoth.includes(name)) continue;
      expect(systemDark, name).toHaveProperty(name);
    }
  });
});

type Mode = "light" | "dark";

/** `light-dark(#aaa, #bbb)` split in its two colors. */
function pair(value: string): { light: Rgb; dark: Rgb } {
  const match = value.match(/^light-dark\((#[0-9a-f]{6}),\s*(#[0-9a-f]{6})\)$/i);
  expect(match, value).not.toBeNull();
  return { light: rgb(match![1]!), dark: rgb(match![2]!) };
}

/** The tokens a color theme sets (the others, signal colors and rewards, are shared by every theme). */
const THEMED = [
  "--background",
  "--card",
  "--foreground",
  "--ink",
  "--outline",
  "--accent",
  "--accent-ink",
] as const;

const themes = Object.fromEntries(
  ACCENTS.map((name) => {
    const tokens = declarations(blockAfter(`[data-accent="${name}"] {`));
    return [name, Object.fromEntries(THEMED.map((token) => [token, pair(tokens[token]!)]))];
  }),
) as Record<(typeof ACCENTS)[number], Record<(typeof THEMED)[number], { light: Rgb; dark: Rgb }>>;

/** Every palette the app can show: the base one, then each theme, in light and in dark. */
const PALETTES: Array<{ label: string; mode: Mode; get: (token: string) => Rgb }> = [];
for (const mode of ["light", "dark"] as const) {
  const base = mode === "light" ? light : { ...light, ...systemDark };
  PALETTES.push({ label: `base, ${mode}`, mode, get: (token) => rgb(base[token]!) });
  for (const accent of ACCENTS) {
    PALETTES.push({
      label: `${accent}, ${mode}`,
      mode,
      get: (token) =>
        (THEMED as readonly string[]).includes(token)
          ? themes[accent][token as (typeof THEMED)[number]][mode]
          : rgb(base[token]!),
    });
  }
}

describe.each(PALETTES)("design tokens: contrast of $label", ({ mode, get }) => {
  it("reads the body text, the muted text and the faint text on the paper and on cards", () => {
    for (const surface of ["--background", "--card"]) {
      const bg = get(surface);
      const text = get("--foreground");
      expect(contrast(text, bg), `text on ${surface}`).toBeGreaterThanOrEqual(7);
      expect(
        contrast(over(text, bg, mixPercent("--color-muted")), bg),
        `muted on ${surface}`,
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrast(over(text, bg, mixPercent("--color-faint")), bg),
        `faint on ${surface}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("reads the text on filled buttons and stickers", () => {
    expect(contrast(get("--accent-ink"), get("--accent"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(get("--reward-ink"), get("--reward"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(get("--reward-ink"), get("--ember"))).toBeGreaterThanOrEqual(4.5);
    // Toasts print their icon on these.
    expect(contrast(get("--accent-ink"), get("--success"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(get("--accent-ink"), get("--danger"))).toBeGreaterThanOrEqual(4.5);
  });

  it("reads the colored text (links, errors, success, warnings) on the paper and on cards", () => {
    for (const surface of ["--background", "--card"]) {
      for (const token of ["--accent", "--danger", "--success", "--warning"]) {
        expect(contrast(get(token), get(surface)), `${token} on ${surface}`).toBeGreaterThanOrEqual(
          4.5,
        );
      }
    }
  });

  it("keeps the outline of the stickers visible by day, and darker than the paper by night", () => {
    const outline = get("--outline");
    if (mode === "light") {
      // Graphics need 3:1 (WCAG 1.4.11) on the surfaces next to them.
      expect(contrast(outline, get("--background"))).toBeGreaterThanOrEqual(3);
      expect(contrast(outline, get("--card"))).toBeGreaterThanOrEqual(3);
    } else {
      // By night the outline is depth, not a line: the controls are told apart by their fill and their text (checked
      // above), so it only has to be darker than what it surrounds, and the cards lighter than the paper.
      expect(luminance(outline)).toBeLessThan(luminance(get("--background")));
      expect(luminance(get("--card"))).toBeGreaterThan(luminance(get("--background")));
    }
  });

  it("keeps the face of the mascot readable on its yellow body (the ink against the reward)", () => {
    expect(contrast(get("--ink"), get("--reward"))).toBeGreaterThanOrEqual(4.5);
  });
});

describe("design tokens: the identity is its own", () => {
  it("does not use a green as the primary color (the app is not a copy of another one)", () => {
    for (const theme of [light, systemDark]) {
      const [r, g, b] = rgb(theme["--accent"]!);
      expect(g > r && g > b, "accent is green").toBe(false);
    }
  });
});

describe("design tokens: the color themes (ADR 0007)", () => {
  it("has a block for every theme of the list in the code, and none more", () => {
    const named = [...css.matchAll(/:is\(:root, \[data-swatch\]\)\[data-accent="(\w+)"\]/g)].map(
      (match) => match[1],
    );
    expect(named).toEqual([...ACCENTS]);
  });

  it("keeps the default theme identical to the base colors", () => {
    for (const token of THEMED) {
      expect(themes.grape[token].light, `${token}, light`).toEqual(rgb(light[token]!));
      expect(themes.grape[token].dark, `${token}, dark`).toEqual(rgb(systemDark[token]!));
    }
  });

  it("gives every theme its own paper and its own accent, so that a theme is a real change of look", () => {
    for (const mode of ["light", "dark"] as const) {
      for (const token of ["--background", "--accent"] as const) {
        const values = ACCENTS.map((accent) => themes[accent][token][mode].join(","));
        expect(new Set(values).size, `${token}, ${mode}`).toBe(ACCENTS.length);
      }
    }
  });

  it("gives the retro touch an off switch for every one of its tokens", () => {
    const classic = declarations(blockAfter(':root[data-style="classic"]'));
    for (const token of ["--font-retro", "--bevel-light", "--bevel-dark", "--segment-gap"]) {
      expect(light, token).toHaveProperty(token);
      expect(classic, token).toHaveProperty(token);
      expect(classic[token], token).not.toBe(light[token]);
    }
  });
});
