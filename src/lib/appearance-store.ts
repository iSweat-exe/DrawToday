import {
  type Appearance,
  APPEARANCE_STORAGE_KEY,
  applyAppearance,
  DEFAULT_APPEARANCE,
  parseAppearance,
} from "./appearance";

/**
 * The appearance of the app on this device: kept in `localStorage` (a guest has no account; attaching it to the account
 * comes with the profile, A-070), applied to `<html>`, shared by every component through `useSyncExternalStore`
 * (see `use-appearance.ts`) and kept in step between tabs.
 */
let cache: { raw: string | null; value: Appearance } | null = null;
/** Used when the storage is not available (private mode, blocked): the choice then lasts until the page closes. */
let memory: Appearance | null = null;
const listeners = new Set<() => void>();

function readRaw(): string | null {
  try {
    return localStorage.getItem(APPEARANCE_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** The current choice. Returns the same object until the choice changes (required by `useSyncExternalStore`). */
export function getAppearance(): Appearance {
  if (typeof window === "undefined") return DEFAULT_APPEARANCE;
  const raw = readRaw();
  if (cache && cache.raw === raw) return cache.value;
  const value = raw === null && memory ? memory : parseAppearance(raw);
  cache = { raw, value };
  return value;
}

/** What the server renders: the defaults (the chosen look is put on the page before paint by the init script). */
export function getServerAppearance(): Appearance {
  return DEFAULT_APPEARANCE;
}

function notify() {
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== APPEARANCE_STORAGE_KEY) return;
  applyAppearance(document.documentElement, getAppearance());
  notify();
}

/**
 * Listens to the changes of the choice, here and in the other tabs.
 * @param listener - Called after each change.
 * @returns A function that stops listening.
 */
export function subscribeAppearance(listener: () => void): () => void {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

/**
 * Changes part of the choice: saves it, puts it on the page at once and tells the listeners.
 * @param patch - The values to change.
 */
export function updateAppearance(patch: Partial<Appearance>): void {
  const next = { ...getAppearance(), ...patch };
  memory = next;
  const raw = JSON.stringify(next);
  try {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, raw);
  } catch {
    // Storage unavailable: the choice stays in memory.
  }
  cache = { raw: readRaw(), value: next };
  applyAppearance(document.documentElement, next);
  notify();
}

/** Puts the saved choice on the page. Called once when the app starts (the init script did the same before paint). */
export function applySavedAppearance(): void {
  applyAppearance(document.documentElement, getAppearance());
}

/** Forgets what the module remembers (tests only). */
export function resetAppearanceStoreForTests(): void {
  cache = null;
  memory = null;
}
