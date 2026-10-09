import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

export type SkeletonProps = {
  /** Width and height: any CSS length (`"100%"`, `"3rem"`) or a number of px. */
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  /** Draw a circle (avatar, icon). */
  circle?: boolean;
  className?: string;
};

/** A placeholder block with a soft light sweeping across it, shown while content loads. Hidden from screen readers. */
export function Skeleton({
  width = "100%",
  height = "1rem",
  circle = false,
  className,
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("skeleton", circle && "rounded-full", className)}
      style={{ width, height }}
    />
  );
}
