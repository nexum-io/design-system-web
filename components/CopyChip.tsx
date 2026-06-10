/**
 * DS CopyChip — inline code/hash/address chip with a copy button.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

import { Button } from '../primitives/button';
import { cn } from '../utils/cx';

const FEEDBACK_MS = 2000;

/* Self-contained clipboard helper: Clipboard API with a textarea fallback for
   non-secure contexts, so the DS does not depend on app-level utils. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const node = document.createElement('textarea');
      node.value = text;
      node.setAttribute('readonly', '');
      node.style.position = 'fixed';
      node.style.opacity = '0';
      document.body.appendChild(node);
      node.select();
      const ok = document.execCommand('copy');
      node.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

function useCopyFeedback(resetMs = FEEDBACK_MS) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const copy = useCallback(
    async (text: string) => {
      const ok = await copyText(text);
      if (!ok) return false;
      setCopied(true);
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
        timeoutRef.current = null;
      }, resetMs);
      return true;
    },
    [resetMs],
  );

  return { copied, copy };
}

export interface CopyChipProps {
  value: string;
  /** Truncate long values with an ellipsis in the middle. Default: true. */
  truncate?: boolean;
  /** Stretch to container width and pin the copy button to the right. */
  fullWidth?: boolean;
  copyLabel?: string;
  copiedLabel?: string;
  className?: string;
}

export function CopyChip({
  value,
  truncate = true,
  fullWidth = false,
  copyLabel = 'Copy',
  copiedLabel = 'Copied',
  className,
}: CopyChipProps) {
  const { copied, copy } = useCopyFeedback();

  const display =
    truncate && value.length > 18 ? `${value.slice(0, 10)}…${value.slice(-8)}` : value;

  return (
    <span
      className={cn(
        'bg-bg-muted items-center gap-2 rounded-md px-2 py-1 text-xs',
        fullWidth ? 'flex w-full' : 'inline-flex',
        className,
      )}
    >
      <code
        title={value}
        className={cn(
          'font-mono',
          fullWidth && 'min-w-0 flex-1',
          fullWidth && (truncate ? 'truncate' : 'overflow-x-auto'),
        )}
      >
        {display}
      </code>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 shrink-0"
        onClick={() => void copy(value)}
        aria-label={copied ? copiedLabel : copyLabel}
      >
        {copied ? <Check className="text-success" /> : <Copy />}
      </Button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ''}
      </span>
    </span>
  );
}
