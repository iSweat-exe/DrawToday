/** What the sign-in page says about an `?error=` code. Unknown codes say nothing (the URL is user-controlled). */
const ERROR_MESSAGES: Record<string, string> = {
  denied: "Connexion annulée. Tu peux réessayer quand tu veux.",
  oauth: "La connexion a échoué. Réessaie dans un instant.",
  provider: "Ce service de connexion n'est pas disponible.",
};

/**
 * Turns the `error` query parameter of the sign-in page into a message for the user.
 * @param code - The raw value of the parameter (a string, an array when repeated, or nothing).
 * @returns A French sentence, or `null` when there is nothing to show.
 */
export function signInErrorMessage(code: string | string[] | undefined): string | null {
  if (typeof code !== "string" || !Object.hasOwn(ERROR_MESSAGES, code)) return null;
  return ERROR_MESSAGES[code] ?? null;
}

/**
 * Maps what a provider sent back to the callback (`?error=access_denied`) to one of our codes.
 * @param providerError - The `error` parameter received from the provider, if any.
 * @returns `denied` when the user refused, `oauth` for any other failure.
 */
export function callbackErrorCode(providerError: string | null): "denied" | "oauth" {
  return providerError === "access_denied" ? "denied" : "oauth";
}
