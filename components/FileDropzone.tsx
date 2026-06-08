"use client";

/**
 * DS FileDropzone — controlled multi-file picker with drag & drop and previews.
 *
 * Presentational and domain-agnostic: it owns no upload logic. The parent holds
 * the selected `File[]` (`value`) and reacts to `onChange`. Image files get a
 * thumbnail (object URL, revoked on removal/unmount); others get a file chip.
 * Validation (accept / max size / max count) rejects via `onReject`. All copy is
 * passed in through `labels`, and all colors are --ds-* tokens (dark-mode safe).
 */
import * as React from "react";
import { ImageIcon, Paperclip, Upload, X } from "lucide-react";

import { cn } from "../utils/cx";

export interface FileDropzoneLabels {
  /** Primary call-to-action inside the drop area. */
  hint?: string;
  /** Secondary line describing constraints (caller formats size/count). */
  constraints?: string;
  /** Accessible label for the per-file remove button. */
  remove?: string;
}

export type FileRejectReason = { type: "count" | "size" | "type"; file?: File };

export interface FileDropzoneProps {
  value: File[];
  onChange: (files: File[]) => void;
  /** Comma list of mime types / extensions, e.g. "image/*,.pdf". */
  accept?: string;
  maxFiles?: number;
  maxSizeMb?: number;
  disabled?: boolean;
  labels?: FileDropzoneLabels;
  className?: string;
  onReject?: (reason: FileRejectReason) => void;
}

function fileKey(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function isImage(file: File): boolean {
  return file.type.startsWith("image/");
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function matchesAccept(file: File, accept: string): boolean {
  if (!accept || accept.includes("*/*")) return true;
  const tokens = accept
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some((token) => {
    if (token.startsWith(".")) return name.endsWith(token);
    if (token.endsWith("/*")) return type.startsWith(token.slice(0, token.indexOf("/") + 1));
    return type === token;
  });
}

export function FileDropzone({
  value,
  onChange,
  accept = "image/*",
  maxFiles = 8,
  maxSizeMb = 10,
  disabled = false,
  labels,
  className,
  onReject,
}: FileDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setDragging] = React.useState(false);
  const [previews, setPreviews] = React.useState<Record<string, string>>({});

  // Keep object URLs in sync with the controlled value (create missing, revoke removed).
  React.useEffect(() => {
    setPreviews((prev) => {
      const next: Record<string, string> = {};
      for (const file of value) {
        if (!isImage(file)) continue;
        const key = fileKey(file);
        next[key] = prev[key] ?? URL.createObjectURL(file);
      }
      for (const [key, url] of Object.entries(prev)) {
        if (!next[key]) URL.revokeObjectURL(url);
      }
      return next;
    });
  }, [value]);

  // Revoke everything on unmount.
  const previewsRef = React.useRef<Record<string, string>>({});
  previewsRef.current = previews;
  React.useEffect(
    () => () => {
      Object.values(previewsRef.current).forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const addFiles = (incoming: FileList | File[]) => {
    if (disabled) return;
    const accepted: File[] = [];
    for (const file of Array.from(incoming)) {
      if (!matchesAccept(file, accept)) {
        onReject?.({ type: "type", file });
        continue;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        onReject?.({ type: "size", file });
        continue;
      }
      const key = fileKey(file);
      const seen = value.some((f) => fileKey(f) === key) || accepted.some((f) => fileKey(f) === key);
      if (!seen) accepted.push(file);
    }
    if (accepted.length === 0) return;
    let nextFiles = [...value, ...accepted];
    if (nextFiles.length > maxFiles) {
      onReject?.({ type: "count" });
      nextFiles = nextFiles.slice(0, maxFiles);
    }
    onChange(nextFiles);
  };

  const removeAt = (index: number) => {
    if (disabled) return;
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && !disabled) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (event.dataTransfer?.files?.length) addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center outline-none transition-colors",
          "focus-visible:ring-ring focus-visible:ring-[2px]",
          disabled
            ? "cursor-not-allowed border-border-muted opacity-60"
            : "cursor-pointer hover:bg-bg-subtle",
          isDragging ? "border-primary bg-brand-subtle" : "border-border",
        )}
      >
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-full",
            isDragging ? "bg-primary/10 text-primary" : "bg-bg-muted text-muted-foreground",
          )}
        >
          <Upload className="size-5" />
        </span>
        <span className="text-sm text-foreground">
          {labels?.hint ?? "Drag & drop files here, or click to choose"}
        </span>
        <span className="text-xs text-muted-foreground">
          {labels?.constraints ?? `Up to ${maxSizeMb} MB · max ${maxFiles} files`}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          disabled={disabled}
          className="sr-only"
          onChange={(event) => {
            if (event.target.files?.length) addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {value.map((file, index) => {
            const key = fileKey(file);
            const url = previews[key];
            return (
              <li
                key={key}
                className="group relative flex items-center gap-2 rounded-lg border border-border-muted bg-card p-2"
              >
                {url ? (
                  <img src={url} alt={file.name} className="size-12 shrink-0 rounded-md object-cover" />
                ) : (
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-bg-muted text-muted-foreground">
                    {isImage(file) ? <ImageIcon className="size-5" /> : <Paperclip className="size-5" />}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium text-foreground">{file.name}</div>
                  <div className="text-2xs text-muted-foreground">{formatBytes(file.size)}</div>
                </div>
                {!disabled && (
                  <button
                    type="button"
                    aria-label={labels?.remove ?? "Remove file"}
                    onClick={() => removeAt(index)}
                    className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-bg-muted text-muted-foreground opacity-0 outline-none transition-opacity hover:bg-danger-subtle hover:text-danger-fg focus-visible:opacity-100 focus-visible:ring-ring focus-visible:ring-[2px] group-hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
