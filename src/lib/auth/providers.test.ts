import { describe, expect, it } from "vitest";
import { isOAuthProvider, OAUTH_PROVIDERS, PROVIDER_LABELS } from "./providers";

describe("isOAuthProvider", () => {
  it("accepts the supported providers", () => {
    expect(isOAuthProvider("discord")).toBe(true);
    expect(isOAuthProvider("github")).toBe(true);
  });

  it("refuses anything else, whatever its type", () => {
    for (const value of ["google", "Discord", "", " github", null, undefined, 1, {}, ["github"]]) {
      expect(isOAuthProvider(value), String(value)).toBe(false);
    }
  });

  it("has a display label for every provider", () => {
    for (const provider of OAUTH_PROVIDERS) expect(PROVIDER_LABELS[provider]).toBeTruthy();
  });
});
