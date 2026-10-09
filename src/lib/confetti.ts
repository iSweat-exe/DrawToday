/** One piece of confetti: where it flies to (px from the burst centre), how it turns, when it starts. */
export type ConfettiParticle = {
  id: number;
  x: number;
  y: number;
  rotation: number;
  delayMs: number;
  size: number;
  color: string;
};

/** Colors of the pieces, taken from the design tokens so they follow the theme. */
export const CONFETTI_COLORS = [
  "var(--accent)",
  "var(--reward)",
  "var(--success)",
  "var(--accent-strong)",
];

const GOLDEN_ANGLE = 137.508 * (Math.PI / 180);

/**
 * Builds the pieces of a confetti burst. It is deterministic (no randomness): the golden angle spreads the pieces
 * evenly in all directions, so the burst looks organic yet renders identically on the server and in the browser.
 * @param count - Number of pieces (0 or less gives none).
 * @param spread - How far the farthest pieces fly, in px.
 * @returns The pieces, in order.
 */
export function makeConfetti(count: number, spread = 120): ConfettiParticle[] {
  const total = Math.max(0, Math.floor(count));
  return Array.from({ length: total }, (_, index) => {
    const angle = index * GOLDEN_ANGLE;
    const reach = spread * (0.55 + 0.45 * ((index * 0.618) % 1));
    return {
      id: index,
      x: Math.round(Math.cos(angle) * reach),
      // Pieces burst upwards a little more than downwards, like a pop.
      y: Math.round(Math.sin(angle) * reach - spread * 0.3),
      rotation: ((index * 97) % 720) - 360,
      delayMs: (index % 5) * 30,
      size: 6 + (index % 3) * 2,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length]!,
    };
  });
}
