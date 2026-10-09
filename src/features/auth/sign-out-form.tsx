import { signOut } from "./actions";
import { SubmitButton } from "./provider-button";

/** "Se déconnecter": ends the session of this device. */
export function SignOutForm() {
  return (
    <form action={signOut}>
      <SubmitButton variant="outline" className="w-full">
        Se déconnecter
      </SubmitButton>
    </form>
  );
}
