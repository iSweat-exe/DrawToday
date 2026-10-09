import { OAUTH_PROVIDERS } from "@/lib/auth/providers";
import { ProviderButton } from "./provider-button";

/** One "Continue with…" button per supported provider. Used by the sign-in page and by a guest's profile. */
export function LoginButtons() {
  return (
    <div className="flex flex-col gap-3">
      {OAUTH_PROVIDERS.map((provider) => (
        <ProviderButton key={provider} provider={provider} />
      ))}
    </div>
  );
}
