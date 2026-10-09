import { describe, expect, it } from "vitest";
import { callbackErrorCode, signInErrorMessage } from "./messages";

describe("signInErrorMessage", () => {
  it("has a message for each code the app produces", () => {
    for (const code of ["denied", "oauth", "provider"]) {
      expect(signInErrorMessage(code), code).toEqual(expect.any(String));
    }
  });

  it("says nothing for an unknown, repeated or missing code", () => {
    for (const code of ["", "other", "toString", "__proto__", ["oauth"], undefined]) {
      expect(signInErrorMessage(code), String(code)).toBeNull();
    }
  });
});

describe("callbackErrorCode", () => {
  it("tells a refusal from a failure", () => {
    expect(callbackErrorCode("access_denied")).toBe("denied");
    expect(callbackErrorCode("server_error")).toBe("oauth");
    expect(callbackErrorCode(null)).toBe("oauth");
  });
});
