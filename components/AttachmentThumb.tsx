"use client";

/**
 * DS AttachmentThumb — renders a single uploaded attachment.
 *
 * Images show a fixed-size thumbnail that opens a lightbox (built on the DS
 * Dialog); other files render as a downloadable chip. Domain-agnostic: it takes
 * a plain {@link AttachmentView} descriptor. Colors are --ds-* tokens.
 */
import * as React from "react";
import { Download, Paperclip } from "lucide-react";

import { cn } from "../utils/cx";
import { Dialog, DialogContent, DialogTitle } from "../primitives/dialog";

export interface AttachmentView {
  id: string;
  name: string;
  url: string;
  kind: "image" | "file";
  sizeBytes?: number;
}

export interface AttachmentThumbProps {
  attachment: AttachmentView;
  className?: string;
}

export function AttachmentThumb({ attachment, className }: AttachmentThumbProps) {
  const [open, setOpen] = React.useState(false);

  if (!attachment.url) {
    return (
      <span
        className={cn(
          'inline-flex max-w-full items-center gap-2 rounded-lg border border-dashed border-border-muted px-3 py-2 text-xs text-muted-foreground',
          className,
        )}
        title={attachment.name}
      >
        {attachment.name}
      </span>
    );
  }

  if (attachment.kind === "image") {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={attachment.name}
          className={cn(
            "group relative size-20 shrink-0 overflow-hidden rounded-lg border border-border-muted bg-bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            className,
          )}
        >
          <img
            src={attachment.url}
            alt={attachment.name}
            loading="lazy"
            className="size-full object-cover transition-transform group-hover:scale-105"
          />
        </button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent variant="centered" className="max-h-[90dvh] overflow-y-auto p-4 sm:max-w-3xl sm:p-6">
            <DialogTitle className="sr-only">{attachment.name}</DialogTitle>
            <img
              src={attachment.url}
              alt={attachment.name}
              className="max-h-[75dvh] w-full rounded-lg object-contain"
            />
            <a
              href={attachment.url}
              download={attachment.name}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 self-start text-sm text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Download className="size-4" />
              <span className="max-w-[16rem] truncate" title={attachment.name}>{attachment.name}</span>
            </a>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <a
      href={attachment.url}
      download={attachment.name}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-lg border border-border-muted bg-card px-3 py-2 text-xs font-medium text-foreground outline-none hover:bg-bg-subtle focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <Paperclip className="size-4 shrink-0 text-muted-foreground" />
      <span className="max-w-[12rem] truncate" title={attachment.name}>{attachment.name}</span>
    </a>
  );
}
