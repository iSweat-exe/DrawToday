import type { Metadata } from "next";
import { Suspense } from "react";
import { PreviewNotice } from "@/components/preview-notice";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountCard } from "@/features/auth/account-card";
import { BadgeGrid } from "@/features/progress/badge-grid";
import { LevelCard } from "@/features/progress/level-card";
import { StatsGrid } from "@/features/progress/stats-grid";
import { AppearanceCard } from "@/features/settings/appearance-card";
import { SettingsCard } from "@/features/settings/settings-card";

export const metadata: Metadata = { title: "Profil" };

/**
 * Profile: the account (real: connected or guest), then a mock-up with sample data (A-112) of the level, the statistics,
 * the badges and the settings; real content: A-070 to A-073.
 */
export default function ProfilePage() {
  return (
    <>
      <h1 className="page-title">Profil</h1>
      <Suspense
        fallback={
          <div className="flex flex-col gap-3" aria-hidden="true">
            <Skeleton height="6rem" className="rounded-card" />
            <Skeleton height="3rem" />
          </div>
        }
      >
        <AccountCard />
      </Suspense>
      <AppearanceCard />
      <PreviewNotice />
      <LevelCard headingLevel={3} />
      <StatsGrid />
      <BadgeGrid />
      <SettingsCard />
    </>
  );
}
