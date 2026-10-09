"use client";

import { useEffect } from "react";
import { applySavedAppearance } from "@/lib/appearance-store";

/**
 * Renders nothing. When the app starts it puts the saved look on the page once more (the init script did it before paint,
 * but could not set the color of the browser bar, which needs the stylesheet), and again when the phone switches between
 * light and dark, since the paper of a theme depends on it.
 */
export function AppearanceSync() {
  useEffect(() => {
    applySavedAppearance();
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", applySavedAppearance);
    return () => scheme.removeEventListener("change", applySavedAppearance);
  }, []);
  return null;
}
