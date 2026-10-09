import type { Metadata } from "next";
import { PreviewNotice } from "@/components/preview-notice";
import { Journal } from "@/features/progress/journal";

export const metadata: Metadata = { title: "Carnet" };

/** Sketchbook: the before/after and the pages of the journal. A mock-up with sample data (A-112); real content: A-074. */
export default function SketchbookPage() {
  return (
    <>
      <h1 className="page-title">Carnet</h1>
      <PreviewNotice />
      <Journal />
    </>
  );
}
