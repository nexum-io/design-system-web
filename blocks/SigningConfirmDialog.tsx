"use client";

/**
 * DS Block: SigningConfirmDialog
 *
 * Nested confirm dialog for signing/operation flows (e.g. "abandon signing?",
 * "reject this request?"), built on the `AlertDialog` primitive. Optionally
 * collects a required reason via `reasonField`. The parent owns the async
 * confirm (`onConfirm`) and the resulting `busy`/`error` state; this block
 * only guards against double-submit and blocks dismissal while pending.
 */
import * as React from "react";

import { cx } from "../utils/cx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../primitives/alert-dialog";
import { buttonVariants } from "../primitives/button";
import { Alert, AlertDescription } from "../primitives/alert";
import { Label } from "../primitives/label";
import { Textarea } from "../primitives/textarea";

export interface SigningConfirmReasonField {
  label: string;
  placeholder?: string;
  /** Inline error when confirming with an empty reason (edge paths, e.g. form submit via keyboard). */
  requiredError?: string;
}

export interface SigningConfirmInput {
  /** Trimmed reason; present only when reasonField was configured. */
  reason?: string;
}

export interface SigningConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Danger styling on the confirm action (reject/abort). */
  destructive?: boolean;
  /** External pending state: disables both actions and blocks dismissal. */
  busy?: boolean;
  /** External error from the parent-owned async confirm. */
  error?: string | null;
  /** When set, requires a non-empty (trimmed) reason; confirm disabled while empty. */
  reasonField?: SigningConfirmReasonField | null;
  onConfirm: (input: SigningConfirmInput) => void | Promise<void>;
  /** Reason draft and submit latch reset when this changes (itemId/intent key). */
  resetKey?: string;
}

export function SigningConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  busy = false,
  error,
  reasonField,
  onConfirm,
  resetKey,
}: SigningConfirmDialogProps) {
  const reasonId = React.useId();
  const [reason, setReason] = React.useState("");
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const submittingRef = React.useRef(false);

  // Reset the reason draft, local error, and submit latch whenever the
  // dialog opens, or whenever the caller's identity key (itemId/intent) changes.
  React.useEffect(() => {
    if (open) {
      setReason("");
      setLocalError(null);
      setPending(false);
      submittingRef.current = false;
    }
  }, [open, resetKey]);

  const locked = busy || pending;
  const reasonInvalid = reasonField != null && reason.trim() === "";

  function handleOpenChange(next: boolean) {
    if (next) {
      onOpenChange(true);
      return;
    }
    if (locked) return;
    onOpenChange(false);
  }

  async function handleConfirm(event: React.MouseEvent<HTMLButtonElement>) {
    // Never let Radix auto-close the dialog; closing is the parent's decision
    // via the controlled `open` prop (it happens after a successful confirm).
    event.preventDefault();
    if (submittingRef.current || locked) return;

    let input: SigningConfirmInput = {};
    if (reasonField) {
      const trimmed = reason.trim();
      if (trimmed === "") {
        // Edge path: confirm reached with an empty reason (e.g. keyboard
        // submit bypassing the disabled attribute) — surface inline instead
        // of calling onConfirm.
        setLocalError(reasonField.requiredError ?? null);
        return;
      }
      setLocalError(null);
      input = { reason: trimmed };
    }

    submittingRef.current = true;
    setPending(true);
    try {
      await onConfirm(input);
    } finally {
      submittingRef.current = false;
      setPending(false);
    }
  }

  const displayError = error ?? localError;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {/*
            Always render a Description (visually hidden when no copy is given):
            unlike Dialog, AlertDialogContent's missing-description warning checks
            for an element whose id matches its aria-describedby, not just a
            truthy value — the empty aria-describedby trick SigningSheet/Sheet use
            doesn't satisfy it.
          */}
          <AlertDialogDescription className={description ? undefined : "sr-only"}>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {displayError ? (
          <Alert variant="destructive">
            <AlertDescription>{displayError}</AlertDescription>
          </Alert>
        ) : null}

        {reasonField ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor={reasonId}>{reasonField.label}</Label>
            <Textarea
              id={reasonId}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                if (localError) setLocalError(null);
              }}
              placeholder={reasonField.placeholder}
              disabled={locked}
              className="min-h-24"
            />
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={locked}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={locked || reasonInvalid}
            onClick={handleConfirm}
            className={cx(
              destructive &&
                "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive dark:bg-destructive/60"
            )}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
