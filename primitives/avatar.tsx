"use client";

/**
 * DS Avatar — image with initials fallback.
 *
 * When `src` is missing or fails to load, renders initials from `name` on a
 * deterministic tint picked from the semantic status palette (stable per name).
 * All colors are --ds-* tokens, so it flips correctly in dark mode.
 */
import * as React from "react";

import { cn } from "./utils";

const sizeClasses = {
  xs: "size-6 text-2xs",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
} as const;

export interface AvatarProps extends React.ComponentProps<"span"> {
  src?: string | null;
  /** Used for the alt text and the initials fallback. */
  name?: string;
  size?: keyof typeof sizeClasses;
}

const tints = [
  "bg-info-subtle text-info-fg",
  "bg-success-subtle text-success-fg",
  "bg-warning-subtle text-warning-fg",
  "bg-danger-subtle text-danger-fg",
  "bg-brand-subtle text-primary",
] as const;

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name
    .trim()
    .split(/\s+/)
    .map((part) => part.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function tintFor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return tints[Math.abs(hash) % tints.length];
}

function Avatar({ src, name, size = "md", className, ...props }: AvatarProps) {
  const [errored, setErrored] = React.useState(false);
  const showImage = Boolean(src) && !errored;

  return (
    <span
      data-slot="avatar"
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-semibold",
        sizeClasses[size],
        !showImage && tintFor(name ?? ""),
        className,
      )}
      {...props}
    >
      {showImage ? (
        <img
          src={src as string}
          alt={name ?? ""}
          className="size-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  );
}

export { Avatar };
