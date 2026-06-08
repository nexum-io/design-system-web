"use client";

/**
 * DS Block: OpenDisputeModal
 *
 * Presentational dialog for opening a dispute: category, reason, and optional
 * proof attachments, with a warning callout. Domain-agnostic — all copy and
 * category options come in via props; the parent owns the async submit
 * (`submitting`/`error`) and closes the dialog on success.
 */
import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { cx } from "../utils/cx";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../primitives/dialog";
import { Button } from "../primitives/button";
import { Textarea } from "../primitives/textarea";
import { Label } from "../primitives/label";
import { Alert, AlertDescription } from "../primitives/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../primitives/select";
import { FileDropzone, type FileDropzoneLabels } from "../components/FileDropzone";

export interface DisputeCategoryOption {
  value: string;
  label: string;
}

export interface OpenDisputeLabels {
  title: string;
  description?: string;
  categoryLabel: string;
  categoryPlaceholder?: string;
  reasonLabel: string;
  reasonPlaceholder?: string;
  attachmentsLabel: string;
  dropzone?: FileDropzoneLabels;
  warning?: string;
  submit: string;
  submitting?: string;
  cancel: string;
  reasonRequiredError?: string;
}

export interface OpenDisputeInput {
  category: string;
  reason: string;
  files: File[];
}

export interface OpenDisputeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: DisputeCategoryOption[];
  labels: OpenDisputeLabels;
  submitting?: boolean;
  error?: string | null;
  onSubmit: (input: OpenDisputeInput) => void | Promise<void>;
  accept?: string;
  maxFiles?: number;
  maxSizeMb?: number;
}

export function OpenDisputeModal({
  open,
  onOpenChange,
  categories,
  labels,
  submitting = false,
  error,
  onSubmit,
  accept = "image/*,.pdf",
  maxFiles = 8,
  maxSizeMb = 10,
}: OpenDisputeModalProps) {
  const [category, setCategory] = React.useState(categories[0]?.value ?? "");
  const [reason, setReason] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [localError, setLocalError] = React.useState<string | null>(null);

  // Reset the form each time the dialog opens.
  React.useEffect(() => {
    if (open) {
      setCategory(categories[0]?.value ?? "");
      setReason("");
      setFiles([]);
      setLocalError(null);
    }
  }, [open, categories]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (!reason.trim()) {
      setLocalError(labels.reasonRequiredError ?? "Please describe the problem.");
      return;
    }
    setLocalError(null);
    void onSubmit({ category, reason: reason.trim(), files });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          {labels.description && <DialogDescription>{labels.description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {(error || localError) && (
            <Alert variant="destructive">
              <AlertDescription>{error ?? localError}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="dispute-category">{labels.categoryLabel}</Label>
            <Select value={category} onValueChange={setCategory} disabled={submitting}>
              <SelectTrigger id="dispute-category" className="w-full">
                <SelectValue placeholder={labels.categoryPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="dispute-reason">{labels.reasonLabel}</Label>
            <Textarea
              id="dispute-reason"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                if (localError) setLocalError(null);
              }}
              placeholder={labels.reasonPlaceholder}
              disabled={submitting}
              className="min-h-24"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>{labels.attachmentsLabel}</Label>
            <FileDropzone
              value={files}
              onChange={setFiles}
              accept={accept}
              maxFiles={maxFiles}
              maxSizeMb={maxSizeMb}
              disabled={submitting}
              labels={labels.dropzone}
            />
          </div>

          {labels.warning && (
            <div className="flex items-start gap-2 rounded-lg border border-warning/25 bg-warning-subtle px-3 py-2 text-xs text-warning-fg">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>{labels.warning}</span>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              {labels.cancel}
            </Button>
            <Button type="submit" disabled={submitting} className={cx(submitting && "opacity-80")}>
              {submitting ? labels.submitting ?? labels.submit : labels.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
