"use client";

/**
 * DS ChatBubble — a single message in a conversation thread.
 *
 * Tone drives alignment and color: `self` (right, brand), `other` (left,
 * muted), `arbiter` (left, warning accent + role badge), `system` (centered
 * pill). Attachments render via AttachmentThumb. Domain-agnostic and
 * token-styled; all copy comes in through props.
 */
import { cn } from "../utils/cx";
import { Avatar } from "../primitives/avatar";
import { AttachmentThumb, type AttachmentView } from "./AttachmentThumb";

export type ChatBubbleTone = "self" | "other" | "arbiter" | "system";

export interface ChatBubbleProps {
  tone?: ChatBubbleTone;
  authorName?: string;
  authorAvatarUrl?: string | null;
  /** Short badge shown next to the name (e.g. an "Arbiter" label). */
  roleLabel?: string;
  time?: string;
  text?: string;
  attachments?: AttachmentView[];
  className?: string;
}

export function ChatBubble({
  tone = "other",
  authorName,
  authorAvatarUrl,
  roleLabel,
  time,
  text,
  attachments = [],
  className,
}: ChatBubbleProps) {
  if (tone === "system") {
    return (
      <div className={cn("flex justify-center", className)}>
        <span className="rounded-full bg-bg-muted px-3 py-1 text-center text-2xs text-muted-foreground">
          {text}
        </span>
      </div>
    );
  }

  const isSelf = tone === "self";
  const isArbiter = tone === "arbiter";

  return (
    <div className={cn("flex gap-2", isSelf ? "flex-row-reverse" : "flex-row", className)}>
      <Avatar
        size="sm"
        name={authorName}
        src={authorAvatarUrl}
        className={isArbiter ? "bg-warning-subtle text-warning-fg" : undefined}
      />
      <div className={cn("flex max-w-[80%] flex-col gap-1", isSelf ? "items-end" : "items-start")}>
        <div className="flex items-center gap-2">
          {authorName && <span className="text-xs font-medium text-foreground">{authorName}</span>}
          {isArbiter && roleLabel && (
            <span className="rounded-full bg-warning-subtle px-1.5 py-0.5 text-2xs font-semibold text-warning-fg">
              {roleLabel}
            </span>
          )}
          {time && <span className="text-2xs text-muted-foreground">{time}</span>}
        </div>

        {text && (
          <div
            className={cn(
              "rounded-2xl px-3 py-2 text-sm",
              isSelf
                ? "rounded-tr-sm bg-primary text-primary-foreground"
                : isArbiter
                  ? "rounded-tl-sm bg-warning-subtle text-foreground"
                  : "rounded-tl-sm bg-bg-muted text-foreground",
            )}
          >
            <p className="whitespace-pre-wrap break-words">{text}</p>
          </div>
        )}

        {attachments.length > 0 && (
          <div className={cn("flex flex-wrap gap-1.5", isSelf && "justify-end")}>
            {attachments.map((attachment) => (
              <AttachmentThumb key={attachment.id} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
