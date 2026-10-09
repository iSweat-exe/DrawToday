import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { getCurrentAccount } from "@/lib/data/account";

/**
 * The account entry of the top bar: the profile picture of a signed-in user (to their profile), or a "Se connecter"
 * button for a guest. Reads the session, so it must sit inside a `<Suspense>` (the rest of the shell stays static).
 */
export async function AccountChip() {
  const account = await getCurrentAccount();

  if (account.kind === "guest") {
    return (
      <Link href="/connexion" prefetch={false} className="btn btn-secondary btn-sm">
        Se connecter
      </Link>
    );
  }

  return (
    <Link
      href="/profil"
      aria-label={`Mon profil (${account.name})`}
      className="pressable inline-flex size-tap items-center justify-center rounded-full"
    >
      <Avatar name={account.name} src={account.avatarUrl} size="sm" />
    </Link>
  );
}
