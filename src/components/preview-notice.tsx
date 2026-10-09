import { PencilIcon } from "@/components/ui/icons";

/**
 * Tells that a screen shows sample data (A-112): the mock-ups give an idea of the final look, they are not the learner's
 * real progress. Remove it from a page when the page gets its real data.
 */
export function PreviewNotice() {
  return (
    <p className="chip self-start text-muted">
      <PencilIcon width={14} height={14} className="mr-1.5" />
      Aperçu · données d&apos;exemple
    </p>
  );
}
