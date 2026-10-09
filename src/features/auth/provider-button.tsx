"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";
import { PROVIDER_LABELS, type OAuthProvider } from "@/lib/auth/providers";
import { signInWithProvider } from "./actions";
import { ProviderIcon } from "./provider-icons";

/** Submit button of a form: shows the spinner while the Server Action runs (the redirect can take a second). */
export function SubmitButton({ children, ...props }: Omit<ButtonProps, "type" | "loading">) {
  const { pending } = useFormStatus();
  return (
    <Button {...props} type="submit" loading={pending}>
      {children}
    </Button>
  );
}

/**
 * "Continue with Discord / GitHub". A plain form posting to a Server Action: the provider is validated on the server,
 * and the user leaves for the provider's consent screen.
 */
export function ProviderButton({ provider }: { provider: OAuthProvider }) {
  return (
    <form action={signInWithProvider}>
      <input type="hidden" name="provider" value={provider} />
      <SubmitButton variant="outline" className="w-full">
        <ProviderIcon provider={provider} />
        Continuer avec {PROVIDER_LABELS[provider]}
      </SubmitButton>
    </form>
  );
}
