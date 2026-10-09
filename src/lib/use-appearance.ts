"use client";

import { useSyncExternalStore } from "react";
import type { Appearance } from "./appearance";
import {
  getAppearance,
  getServerAppearance,
  subscribeAppearance,
  updateAppearance,
} from "./appearance-store";

/**
 * The look chosen by the learner and the way to change it. On the server and during hydration it is the default look
 * (the page already shows the chosen one thanks to the init script), then it follows what is stored.
 * @returns The current choice and `update`, which saves and applies a change at once.
 */
export function useAppearance(): {
  appearance: Appearance;
  update: (patch: Partial<Appearance>) => void;
} {
  const appearance = useSyncExternalStore(subscribeAppearance, getAppearance, getServerAppearance);
  return { appearance, update: updateAppearance };
}
