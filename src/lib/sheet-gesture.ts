/**
 * Decides whether a bottom sheet dragged down must close when the finger is lifted: it closes when it was pulled
 * down far enough (more than a third of its height) or flicked fast enough.
 * @param distance - How far the sheet was dragged down, in px (negative or zero means it was not).
 * @param durationMs - How long the drag lasted.
 * @param height - Height of the sheet in px.
 * @returns `true` when the sheet must close, `false` when it springs back.
 */
export function shouldDismissSheet(distance: number, durationMs: number, height: number): boolean {
  if (distance <= 0) return false;
  if (height > 0 && distance > height / 3) return true;
  const velocity = durationMs > 0 ? distance / durationMs : Number.POSITIVE_INFINITY;
  return distance > 40 && velocity > 0.6;
}
