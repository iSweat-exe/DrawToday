import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "./manifest";

const config = manifest();

/** Width and height of a PNG, read from its IHDR chunk. */
function pngSize(path: string) {
  const buffer = readFileSync(join(process.cwd(), "public", path));
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

describe("web app manifest", () => {
  it("names the app", () => {
    expect(config.name).toBe("DrawToday");
    expect(config.short_name).toBe("DrawToday");
    // Home screens truncate long names (about 12 characters).
    expect(config.short_name!.length).toBeLessThanOrEqual(12);
    expect(config.description).toBeTruthy();
  });

  it("opens like an installed app, in portrait, from the root", () => {
    expect(config.display).toBe("standalone");
    expect(config.orientation).toBe("portrait");
    expect(config.start_url).toBe("/");
    expect(config.scope).toBe("/");
    expect(config.start_url!.startsWith(config.scope!)).toBe(true);
  });

  it("uses valid colours", () => {
    expect(config.background_color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(config.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("declares a 192 px and a 512 px icon, the sizes Chrome requires to install", () => {
    const sizes = config.icons!.map((icon) => icon.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
  });

  it("has a maskable icon, so Android does not crop the logo", () => {
    expect(config.icons!.some((icon) => icon.purpose === "maskable")).toBe(true);
  });

  it("only points to PNG files that exist, with the size they announce", () => {
    for (const icon of config.icons!) {
      expect(icon.type).toBe("image/png");
      const [width, height] = icon.sizes!.split("x").map(Number);
      expect(pngSize(icon.src), icon.src).toEqual({ width, height });
    }
  });

  it("has the iOS home-screen icon (180 px)", () => {
    expect(pngSize("icons/apple-touch-icon.png")).toEqual({ width: 180, height: 180 });
  });
});
