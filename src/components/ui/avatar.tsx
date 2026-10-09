"use client";

import { useState } from "react";
import { initialsOf } from "@/lib/auth/account";
import { cn } from "@/lib/cn";

export type AvatarProps = {
  /** Picture URL (must be allowed by the CSP `img-src`); the initials show when it is missing or fails to load. */
  src?: string | null;
  /** The person's name: gives the initials and the accessible name. */
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = { sm: "size-9 text-sm", md: "size-11 text-base", lg: "size-20 text-3xl" } as const;

/** A round profile picture, or the initials on the accent color. Announced as the person's name. */
export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-outline bg-reward font-display font-semibold text-reward-ink",
        SIZES[size],
        className,
      )}
    >
      {showImage ? (
        // A 44 px picture: next/image would spend the Vercel image-optimization quota (free tier) for nothing.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt=""
          width={80}
          height={80}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(src ?? null)}
          className="size-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initialsOf(name)}</span>
      )}
    </span>
  );
}
