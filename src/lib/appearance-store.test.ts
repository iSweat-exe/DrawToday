import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { APPEARANCE_STORAGE_KEY, DEFAULT_APPEARANCE } from "./appearance";
import {
  applySavedAppearance,
  getAppearance,
  getServerAppearance,
  resetAppearanceStoreForTests,
  subscribeAppearance,
  updateAppearance,
} from "./appearance-store";

function clean() {
  localStorage.clear();
  resetAppearanceStoreForTests();
  for (const name of ["data-theme", "data-accent", "data-style"]) {
    document.documentElement.removeAttribute(name);
  }
}

beforeEach(clean);
afterEach(() => {
  vi.restoreAllMocks();
  clean();
});

describe("getAppearance", () => {
  it("is the default look at first, and the same object each time until it changes", () => {
    const first = getAppearance();
    expect(first).toEqual(DEFAULT_APPEARANCE);
    expect(getAppearance()).toBe(first);
  });

  it("is the default look on the server", () => {
    expect(getServerAppearance()).toEqual(DEFAULT_APPEARANCE);
  });

  it("reads what is stored", () => {
    localStorage.setItem(
      APPEARANCE_STORAGE_KEY,
      JSON.stringify({ mode: "dark", accent: "lagoon", retro: false }),
    );
    expect(getAppearance()).toEqual({ mode: "dark", accent: "lagoon", retro: false });
  });
});

describe("updateAppearance", () => {
  it("saves the change, keeps the rest, and puts it on the page at once", () => {
    updateAppearance({ accent: "candy" });
    updateAppearance({ mode: "dark" });
    expect(getAppearance()).toEqual({ mode: "dark", accent: "candy", retro: true });
    expect(JSON.parse(localStorage.getItem(APPEARANCE_STORAGE_KEY)!)).toEqual(getAppearance());
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement).toHaveAttribute("data-accent", "candy");
  });

  it("tells the listeners, until they stop listening", () => {
    const listener = vi.fn();
    const stop = subscribeAppearance(listener);
    updateAppearance({ retro: false });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(document.documentElement).toHaveAttribute("data-style", "classic");

    stop();
    updateAppearance({ retro: true });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("keeps the choice in memory when the storage refuses to save", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    updateAppearance({ accent: "ocean" });
    expect(getAppearance().accent).toBe("ocean");
    expect(document.documentElement).toHaveAttribute("data-accent", "ocean");
  });
});

describe("the other tabs", () => {
  it("follow a change made in another tab", () => {
    const listener = vi.fn();
    const stop = subscribeAppearance(listener);
    localStorage.setItem(
      APPEARANCE_STORAGE_KEY,
      JSON.stringify({ mode: "light", accent: "coral", retro: true }),
    );
    window.dispatchEvent(new StorageEvent("storage", { key: APPEARANCE_STORAGE_KEY }));
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getAppearance().accent).toBe("coral");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    stop();
  });

  it("also follow when the whole storage is cleared (the event has no key)", () => {
    updateAppearance({ accent: "coral" });
    const listener = vi.fn();
    const stop = subscribeAppearance(listener);
    localStorage.clear();
    window.dispatchEvent(new StorageEvent("storage", { key: null }));
    expect(listener).toHaveBeenCalledTimes(1);
    stop();
  });

  it("ignore the changes of other keys", () => {
    const listener = vi.fn();
    const stop = subscribeAppearance(listener);
    window.dispatchEvent(new StorageEvent("storage", { key: "something-else" }));
    expect(listener).not.toHaveBeenCalled();
    stop();
  });
});

describe("applySavedAppearance", () => {
  it("puts the saved look on the page", () => {
    localStorage.setItem(
      APPEARANCE_STORAGE_KEY,
      JSON.stringify({ mode: "dark", accent: "graphite", retro: false }),
    );
    applySavedAppearance();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement).toHaveAttribute("data-accent", "graphite");
    expect(document.documentElement).toHaveAttribute("data-style", "classic");
  });
});
