/** A view of a zoomable image: scale (1 = fits the screen) and offset in px from the centre. */
export type ZoomView = { scale: number; x: number; y: number };

export const MIN_SCALE = 1;
export const MAX_SCALE = 5;
/** The scale reached by a double tap on a fitted image. */
export const DOUBLE_TAP_SCALE = 2.5;

/**
 * Keeps a scale inside the allowed range.
 * @param scale - The wanted scale.
 * @returns A scale between {@link MIN_SCALE} and {@link MAX_SCALE} (1 when the value is not a number).
 */
export function clampScale(scale: number): number {
  if (!Number.isFinite(scale)) return MIN_SCALE;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

/**
 * Keeps the image on the screen: when it is zoomed in it can be dragged only until its edge reaches the edge of the
 * screen; when it is not zoomed (or smaller than the screen once zoomed) it stays centred on that axis.
 * @param view - The view to correct.
 * @param width - Width of the viewport in px.
 * @param height - Height of the viewport in px.
 * @param content - Size in px of the image as displayed at scale 1 (defaults to the viewport size).
 * @returns The corrected view (the scale is clamped too).
 */
export function clampView(
  view: ZoomView,
  width: number,
  height: number,
  content: { width: number; height: number } = { width, height },
): ZoomView {
  const scale = clampScale(view.scale);
  const limitX = Math.max(0, (content.width * scale - width) / 2);
  const limitY = Math.max(0, (content.height * scale - height) / 2);
  return {
    scale,
    // `+ 0` turns -0 into 0 (a centred image has no offset, not a negative one).
    x: Math.min(limitX, Math.max(-limitX, view.x)) + 0,
    y: Math.min(limitY, Math.max(-limitY, view.y)) + 0,
  };
}

/**
 * Scale after a pinch: the scale at the start of the gesture, multiplied by how much the fingers moved apart.
 * @param startScale - Scale when the second finger touched the screen.
 * @param startDistance - Distance between the two fingers at that moment.
 * @param distance - Current distance between the two fingers.
 * @returns The new scale, clamped (the start scale when the start distance is 0).
 */
export function pinchScale(startScale: number, startDistance: number, distance: number): number {
  if (startDistance <= 0) return clampScale(startScale);
  return clampScale((startScale * distance) / startDistance);
}

/**
 * Zooms while keeping the point under the finger (or the cursor) where it is.
 * @param view - Current view.
 * @param nextScale - Wanted scale (clamped).
 * @param pointX - Focal point, in px from the centre of the viewport.
 * @param pointY - Focal point, in px from the centre of the viewport.
 * @returns The new view (not yet clamped to the edges: pass it through {@link clampView}).
 */
export function zoomAround(
  view: ZoomView,
  nextScale: number,
  pointX: number,
  pointY: number,
): ZoomView {
  const scale = clampScale(nextScale);
  const ratio = scale / view.scale;
  return { scale, x: pointX - (pointX - view.x) * ratio, y: pointY - (pointY - view.y) * ratio };
}

/**
 * The scale a double tap leads to: back to fitted when already zoomed, otherwise {@link DOUBLE_TAP_SCALE}.
 * @param scale - Current scale.
 */
export function doubleTapScale(scale: number): number {
  return scale > MIN_SCALE + 0.05 ? MIN_SCALE : DOUBLE_TAP_SCALE;
}

/**
 * Distance between two points.
 * @param ax - First point, x.
 * @param ay - First point, y.
 * @param bx - Second point, x.
 * @param by - Second point, y.
 */
export function distanceBetween(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(bx - ax, by - ay);
}
