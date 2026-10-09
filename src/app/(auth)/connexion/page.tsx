import type { Metadata } from "next";
import { Suspense } from "react";
import { Mascot } from "@/components/ui/mascot";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginPanel } from "@/features/auth/login-panel";

export const metadata: Metadata = {
  title: "Connexion",
  // Nothing to index here, and the page changes with the session.
  robots: { index: false, follow: false },
};

/** Sign-in page: Discord, GitHub, or the guest mode. The title is static, only the panel below depends on the session. */
export default function LoginPage({ searchParams }: PageProps<"/connexion">) {
  return (
    <>
      <div className="flex flex-col items-center gap-3 text-center">
        <Mascot mood="cheer" size={112} />
        <h1 className="page-title">Bienvenue sur DrawToday</h1>
        <p className="max-w-xs text-sm text-muted">
          Connecte-toi pour retrouver ta progression sur tous tes appareils.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex flex-col gap-3" aria-hidden="true">
            <Skeleton height="3rem" />
            <Skeleton height="3rem" />
            <Skeleton height="3rem" />
          </div>
        }
      >
        <LoginPanel searchParams={searchParams} />
      </Suspense>
    </>
  );
}
