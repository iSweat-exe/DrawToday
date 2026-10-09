import { Suspense } from "react";
import { BookIcon, HomeIcon, RouteIcon, UserIcon } from "@/components/ui/icons";
import { NavBar } from "@/components/ui/nav-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { TabBar, type TabBarItem } from "@/components/ui/tab-bar";
import { AccountChip } from "@/features/auth/account-chip";

/** The four sections of the app (docs/pedagogie/integration-app.md). The only links that are prefetched. */
const TABS: TabBarItem[] = [
  { href: "/", label: "Aujourd'hui", icon: <HomeIcon /> },
  { href: "/parcours", label: "Parcours", icon: <RouteIcon /> },
  { href: "/carnet", label: "Carnet", icon: <BookIcon /> },
  { href: "/profil", label: "Profil", icon: <UserIcon /> },
];

/**
 * Shell of the app: top bar, content, tab bar. The shell is static (served from the CDN); only the account button of
 * the top bar depends on the session, and it streams in behind a placeholder of its size.
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <NavBar
        actions={
          <Suspense
            fallback={<Skeleton width="6.5rem" height="2.5rem" className="rounded-control" />}
          >
            <AccountChip />
          </Suspense>
        }
      />
      <main className="flex flex-1 flex-col gap-section p-gutter">{children}</main>
      <TabBar items={TABS} />
    </>
  );
}
