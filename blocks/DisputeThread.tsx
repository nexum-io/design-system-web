"use client";

/**
 * DS Block: DisputeThread
 *
 * A scrollable message list (ChatBubble) with a composer that supports text and
 * attachments (Enter to send, Shift+Enter for newline). Presentational and
 * domain-agnostic: messages are plain {@link DisputeMessageView}; copy comes via
 * `labels`; the parent owns the async send (`sending`).
 */
import * as React from "react";
import { Info, Paperclip, Send } from "lucide-react";

import { cx } from "../utils/cx";
import { Button } from "../primitives/button";
import { Textarea } from "../primitives/textarea";
import { Alert, AlertDescription } from "../primitives/alert";
import { ChatBubble, type ChatBubbleTone } from "../components/ChatBubble";
import { FileDropzone, type FileDropzoneLabels } from "../components/FileDropzone";
import type { AttachmentView } from "../components/AttachmentThumb";

export interface DisputeMessageView {
  id: string;
  tone: ChatBubbleTone;
  authorName?: string;
  authorAvatarUrl?: string | null;
  roleLabel?: string;
  time?: string;
  text?: string;
  attachments?: AttachmentView[];
}

export interface DisputeThreadLabels {
  empty?: string;
  /** Optional privacy hint shown above the message list. */
  note?: string;
  inputPlaceholder: string;
  send: string;
  sending?: string;
  attach?: string;
  dropzone?: FileDropzoneLabels;
}

export interface ThreadSendInput {
  text: string;
  files: File[];
}

export interface DisputeThreadProps {
  messages: DisputeMessageView[];
  labels: DisputeThreadLabels;
  sending?: boolean;
  disabled?: boolean;
  error?: string | null;
  onSend: (input: ThreadSendInput) => void | Promise<void>;
  accept?: string;
  maxFiles?: number;
  maxSizeMb?: number;
  className?: string;
}

export function DisputeThread({
  messages,
  labels,
  sending = false,
  disabled = false,
  error,
  onSend,
  accept = "image/*,.pdf",
  maxFiles = 6,
  maxSizeMb = 10,
  className,
}: DisputeThreadProps) {
  const [text, setText] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [showDropzone, setShowDropzone] = React.useState(false);
  const listEndRef = React.useRef<HTMLDivElement>(null);

  // Keep the latest message in view.
  React.useEffect(() => {
    listEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const canSend = !sending && !disabled && (text.trim().length > 0 || files.length > 0);

  const submit = () => {
    if (!canSend) return;
    void Promise.resolve(onSend({ text: text.trim(), files })).then(() => {
      setText("");
      setFiles([]);
      setShowDropzone(false);
    });
  };

  return (
    <div className={cx("flex flex-col gap-3", className)}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {labels.note && (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <span>{labels.note}</span>
        </p>
      )}
      <div className="flex max-h-[28rem] min-h-40 flex-col gap-4 overflow-y-auto rounded-xl border border-border-muted bg-bg-subtle p-4">
        {messages.length === 0 ? (
          <p className="m-auto text-center text-xs text-muted-foreground">{labels.empty}</p>
        ) : (
          messages.map((message) => (
            <ChatBubble
              key={message.id}
              tone={message.tone}
              authorName={message.authorName}
              authorAvatarUrl={message.authorAvatarUrl}
              roleLabel={message.roleLabel}
              time={message.time}
              text={message.text}
              attachments={message.attachments}
            />
          ))
        )}
        <div ref={listEndRef} />
      </div>

      {showDropzone && (
        <FileDropzone
          value={files}
          onChange={setFiles}
          accept={accept}
          maxFiles={maxFiles}
          maxSizeMb={maxSizeMb}
          disabled={sending || disabled}
          labels={labels.dropzone}
        />
      )}

      <div className="flex items-end gap-2 rounded-xl border border-border-muted bg-card p-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={labels.attach ?? "Attach files"}
          aria-pressed={showDropzone}
          disabled={sending || disabled}
          onClick={() => setShowDropzone((prev) => !prev)}
          className={cx("shrink-0", (showDropzone || files.length > 0) && "text-primary")}
        >
          <Paperclip className="size-4" />
        </Button>
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder={labels.inputPlaceholder}
          disabled={sending || disabled}
          rows={1}
          className="min-h-9 flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        <Button type="button" size="icon" aria-label={labels.send} disabled={!canSend} onClick={submit} className="shrink-0">
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
