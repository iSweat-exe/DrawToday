import { Avatar } from "@/components/ui/avatar";
import { PROVIDER_LABELS } from "@/lib/auth/providers";
import { getCurrentAccount } from "@/lib/data/account";
import { GuestNotice } from "./guest-notice";
import { LoginButtons } from "./login-buttons";
import { SignOutForm } from "./sign-out-form";

/**
 * The account block of the profile page: who is signed in and how to sign out, or, for a guest, what the guest mode
 * means and how to sign in. Reads the session, so it must sit inside a `<Suspense>`.
 */
export async function AccountCard() {
  const account = await getCurrentAccount();

  if (account.kind === "guest") {
    return (
      <section aria-label="Compte" className="flex flex-col gap-4">
        <GuestNotice />
        <h2 className="section-title">Sauvegarder ma progression</h2>
        <LoginButtons />
      </section>
    );
  }

  return (
    <section aria-label="Compte" className="card flex flex-col items-center gap-4 p-5 text-center">
      <Avatar name={account.name} src={account.avatarUrl} size="lg" />
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-xl font-semibold">{account.name}</h2>
        {account.provider && (
          <span className="chip">Connecté avec {PROVIDER_LABELS[account.provider]}</span>
        )}
      </div>
      <div className="w-full">
        <SignOutForm />
      </div>
    </section>
  );
}
