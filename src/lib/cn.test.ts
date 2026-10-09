import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins class names with a single space", () => {
    expect(cn("btn", "btn-primary")).toBe("btn btn-primary");
  });

  it("ignores false, null, undefined and empty strings", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("returns an empty string when nothing is left", () => {
    expect(cn(false, undefined)).toBe("");
    expect(cn()).toBe("");
  });
});
