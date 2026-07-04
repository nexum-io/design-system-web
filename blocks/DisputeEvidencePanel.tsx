"use client";

/**
 * DS Block: DisputeEvidencePanel
 *
 * Shows the CURRENT USER's own evidence only (privacy: a party never sees the
 * counterparty's evidence) plus a submit form (text + attachments).
 * Presentational and domain-agnostic: evidence is a list of plain
 * {@link DisputeEvidenceView}; copy comes via `labels`; the parent owns submit.
 */
import * as React from "react";
import { Info, ShieldCheck } from "lucide-react";

import { Button } from "../primitives/button";
import { Textarea } from "../primitives/textarea";
import { Label } from "../primitives/label";
import { Alert, AlertDescription } from "../primitives/alert";
import { AttachmentThumb, type AttachmentView } from "../components/AttachmentThumb";
import { FileDropzone, type FileDropzoneLabels } from "../components/FileDropzone";

export type DisputeParty = "creator" | "executor";

export interface DisputeEvidenceView {
  id: string;
  party?: DisputeParty;
  authorName?: string;
  text?: string;
  attachments?: AttachmentView[];
  createdAt?: string;
}

export interface DisputeEvidenceLabels {
  title: string;
  /** Optional privacy hint shown under the title. */
  note?: string;
  empty?: string;
  submitTitle: string;
  textLabel: string;
  textPlaceholder?: string;
  attachmentsLabel: string;
  dropzone?: FileDropzoneLabels;
  submit: string;
  submitting?: string;
  requiredError?: string;
}

export interface EvidenceSubmitInput {
  text: string;
  files: File[];
}

export interface DisputeEvidencePanelProps {
  evidence: DisputeEvidenceView[];
  labels: DisputeEvidenceLabels;
  canSubmit?: boolean;
  submitting?: boolean;
  error?: string | null;
  onSubmit: (input: EvidenceSubmitInput) => void | Promise<void>;
  accept?: string;
  maxFiles?: number;
  maxSizeMb?: number;
}

function EvidenceCard({ item }: { item: DisputeEvidenceView }) {
  return (
    <div className="rounded-xl border border-border-muted bg-card p-4">
      {item.createdAt && <div className="mb-2 text-2xs text-muted-foreground">{item.createdAt}</div>}
      {item.text && <p className="whitespace-pre-wrap break-words text-sm text-foreground">{item.text}</p>}
      {item.attachments && item.attachments.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.attachments.map((attachment) => (
            <AttachmentThumb key={attachment.id} attachment={attachment} />
          ))}
        </div>
      )}
    </div>
  );
}

export function DisputeEvidencePanel({
  evidence,
  labels,
  canSubmit = true,
  submitting = false,
  error,
  onSubmit,
  accept = "image/*,.pdf",
  maxFiles = 8,
  maxSizeMb = 10,
}: DisputeEvidencePanelProps) {
  const [text, setText] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [localError, setLocalError] = React.useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (!text.trim() && files.length === 0) {
      setLocalError(labels.requiredError ?? "Add a description or at least one file.");
      return;
    }
    setLocalError(null);
    void Promise.resolve(onSubmit({ text: text.trim(), files })).then(() => {
      setText("");
      setFiles([]);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground">{labels.title}</h3>
        {labels.note && (
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            <span>{labels.note}</span>
          </p>
        )}
      </div>

      {evidence.length > 0 ? (
        <div className="flex flex-col gap-3">
          {evidence.map((item) => (
            <EvidenceCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border-muted px-4 py-6 text-center text-xs text-muted-foreground">
          {labels.empty}
        </p>
      )}

      {canSubmit && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border-muted bg-bg-subtle p-4" noValidate>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">{labels.submitTitle}</h3>
          </div>

          {(error || localError) && (
            <Alert variant="destructive">
              <AlertDescription>{error ?? localError}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="evidence-text">{labels.textLabel}</Label>
            <Textarea
              id="evidence-text"
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                if (localError) setLocalError(null);
              }}
              placeholder={labels.textPlaceholder}
              disabled={submitting}
              className="min-h-20 bg-card"
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

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? labels.submitting ?? labels.submit : labels.submit}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
