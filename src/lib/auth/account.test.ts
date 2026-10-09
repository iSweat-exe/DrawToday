import { describe, expect, it } from "vitest";
import { accountFromClaims, GUEST, initialsOf } from "./account";

const discordClaims = {
  sub: "11111111-1111-1111-1111-111111111111",
  app_metadata: { provider: "discord" },
  user_metadata: {
    full_name: "leonard",
    avatar_url: "https://cdn.discordapp.com/avatars/1/abc.png",
    custom_claims: { global_name: "Léonard" },
  },
};

describe("accountFromClaims", () => {
  it("is a guest without a session, whatever the claims look like", () => {
    for (const claims of [null, undefined, {}, "x", 3, { sub: "" }, { sub: 5 }]) {
      expect(accountFromClaims(claims), String(claims)).toEqual(GUEST);
    }
  });

  it("builds a user from a Discord session, preferring the chosen display name", () => {
    expect(accountFromClaims(discordClaims)).toEqual({
      kind: "user",
      id: "11111111-1111-1111-1111-111111111111",
      name: "Léonard",
      avatarUrl: "https://cdn.discordapp.com/avatars/1/abc.png",
      provider: "discord",
    });
  });

  it("builds a user from a GitHub session", () => {
    const account = accountFromClaims({
      sub: "abc",
      app_metadata: { provider: "github" },
      user_metadata: {
        user_name: "octocat",
        avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
      },
    });
    expect(account).toMatchObject({ kind: "user", name: "octocat", provider: "github" });
  });

  it("falls back to a neutral name when the provider gives none", () => {
    expect(accountFromClaims({ sub: "abc", user_metadata: { name: "   " } })).toMatchObject({
      name: "Artiste",
      avatarUrl: null,
      provider: null,
    });
  });

  it("ignores an unknown provider", () => {
    expect(accountFromClaims({ sub: "abc", app_metadata: { provider: "email" } })).toMatchObject({
      provider: null,
    });
  });

  it("drops a picture the CSP would block anyway (other host, http, not a URL, not a string)", () => {
    for (const avatar_url of [
      "https://evil.example/a.png",
      "http://cdn.discordapp.com/a.png",
      "https://cdn.discordapp.com.evil.example/a.png",
      "javascript:alert(1)",
      "not a url",
      42,
    ]) {
      const account = accountFromClaims({ sub: "abc", user_metadata: { avatar_url } });
      expect(account, String(avatar_url)).toMatchObject({ avatarUrl: null });
    }
  });
});

describe("initialsOf", () => {
  it("takes the first letter of the first two words", () => {
    expect(initialsOf("Ada Lovelace")).toBe("AL");
    expect(initialsOf("jean-claude van damme")).toBe("JC");
  });

  it("takes one letter from a single word, and keeps accented and non-latin letters", () => {
    expect(initialsOf("octocat")).toBe("O");
    expect(initialsOf("élodie")).toBe("É");
    expect(initialsOf("太郎")).toBe("太");
  });

  it("does not split an emoji or another astral character in two", () => {
    expect(initialsOf("𝓐lice")).toBe("𝓐");
  });

  it("has a placeholder for a name with no letter", () => {
    expect(initialsOf("")).toBe("?");
    expect(initialsOf("!!!")).toBe("?");
  });
});
