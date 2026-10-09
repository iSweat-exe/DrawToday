import Link from "next/link";
import { getCurrentAccount } from "@/lib/data/account";
import { LoginButtons } from "./login-buttons";
import { signInErrorMessage } from "./messages";
import { SignOutForm } from "./sign-out-form";

/**
 * The interactive part of the sign-in page: the error of a failed attempt, the providers and the guest door; or, for
 * someone already signed in, a way home. Reads the session and the URL, so it must sit inside a `<Suspense>`.
 */
export async function LoginPanel({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [account, params] = await Promise.all([getCurrentAccount(), searchParams]);

  if (account.kind === "user") {
    return (
      <div className="flex flex-col gap-3">
        <p className="card p-4 text-center text-sm text-muted">
          Tu es connecté en tant que <strong className="text-foreground">{account.name}</strong>.
        </p>
        <Link href="/" className="btn btn-primary">
          Aller à l&apos;accueil
        </Link>
        <SignOutForm />
      </div>
    );
  }

  const error = signInErrorMessage(params.error);

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="alert alert-error">
          {error}
        </p>
      )}
      <LoginButtons />
      <div className="flex flex-col items-center gap-1 pt-2 text-center">
        {/* The guest door: no account, nothing saved online. Back to the app, which already works without a session. */}
        <Link href="/" className="btn btn-ghost w-full">
          Continuer en invité
        </Link>
        <p className="max-w-xs text-xs text-faint">
          En invité, tes progrès restent sur cet appareil et ne sont pas sauvegardés en ligne.
        </p>
      </div>
    </div>
  );
}
