import { describe, expect, it } from "vitest";
import { shouldDismissSheet } from "./sheet-gesture";

describe("shouldDismissSheet", () => {
  it("does not close when the sheet was not pulled down", () => {
    expect(shouldDismissSheet(0, 100, 400)).toBe(false);
    expect(shouldDismissSheet(-50, 100, 400)).toBe(false);
  });

  it("closes when it was pulled down by more than a third of its height", () => {
    expect(shouldDismissSheet(150, 2000, 400)).toBe(true);
  });

  it("springs back when the pull was short and slow", () => {
    expect(shouldDismissSheet(60, 1000, 400)).toBe(false);
    expect(shouldDismissSheet(133, 1000, 400)).toBe(false);
  });

  it("closes on a fast flick, even a short one", () => {
    expect(shouldDismissSheet(60, 60, 400)).toBe(true);
  });

  it("ignores a fast but tiny movement", () => {
    expect(shouldDismissSheet(20, 10, 400)).toBe(false);
  });

  it("treats an instantaneous drag as a flick", () => {
    expect(shouldDismissSheet(80, 0, 400)).toBe(true);
  });

  it("still works when the height is unknown", () => {
    expect(shouldDismissSheet(80, 50, 0)).toBe(true);
    expect(shouldDismissSheet(80, 5000, 0)).toBe(false);
  });
});
