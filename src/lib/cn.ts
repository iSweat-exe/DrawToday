/**
 * Joins class names, ignoring everything that is not a non-empty string (`false`, `null`, `undefined`).
 * @param parts - Class names or falsy placeholders, e.g. `cn("btn", loading && "btn-loading")`.
 * @returns A single space-separated class string.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter((part): part is string => typeof part === "string" && part !== "").join(" ");
}
