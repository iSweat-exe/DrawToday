import type { Metadata } from "next";
import { DesignSystemDemo } from "./demo";

export const metadata: Metadata = {
  title: "Guide de style",
  // A working page for the team, not for search engines.
  robots: { index: false, follow: false },
};

/** Living style guide: every shared component, in context. Public on purpose (no data, no secret). */
export default function DesignSystemPage() {
  return (
    <>
      <h1 className="page-title">Guide de style</h1>
      <p className="text-muted">
        Les composants de DrawToday : retour tactile immédiat, ressorts, zones de 44 à 48 px.
      </p>
      <DesignSystemDemo />
    </>
  );
}
