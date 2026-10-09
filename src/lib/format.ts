/**
 * Formats a whole number with a non-breaking space between thousands, the French way (`1350` becomes `1 350`), so a
 * number such as an XP total never wraps in the middle. Does not depend on the locale data of the runtime.
 * @param value - Any number; decimals are dropped, anything that is not finite shows as `0`.
 * @returns The formatted text.
 */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const whole = Math.trunc(value);
  const digits = String(Math.abs(whole)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return whole < 0 ? `-${digits}` : digits;
}
