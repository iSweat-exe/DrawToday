import type { Metadata } from "next";
import { PreviewNotice } from "@/components/preview-notice";
import { PathView } from "@/features/exercises/path-view";

export const metadata: Metadata = { title: "Parcours" };

/** Path: the weeks of "Fondations" and the map of skills. A mock-up with sample data (A-112); real content: A-047, A-048. */
export default function PathPage() {
  return (
    <>
      <h1 className="page-title">Parcours</h1>
      <PreviewNotice />
      <PathView />
    </>
  );
}
