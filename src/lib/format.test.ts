import { describe, expect, it } from "vitest";
import { formatNumber } from "./format";

describe("formatNumber", () => {
  it("separates the thousands with a non-breaking space", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(1350)).toBe("1 350");
    expect(formatNumber(1234567)).toBe("1 234 567");
  });

  it("keeps the sign and drops the decimals", () => {
    expect(formatNumber(-12345)).toBe("-12 345");
    expect(formatNumber(2.9)).toBe("2");
    expect(formatNumber(-2.9)).toBe("-2");
  });

  it("shows 0 for anything that is not a number", () => {
    expect(formatNumber(Number.NaN)).toBe("0");
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe("0");
  });
});
