/**
 * DS CopyChip — inline code/hash/address chip with a copy button.
 *
 * Truncates long values (e.g. wallet addresses) to first10…last8 by default.
 * Uses the DS Button primitive (contract-clean: imports from ../primitives).
 */
import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

import { Button } from '../primitives/button';
import { cn } from '../utils/cx';

export interface CopyChipProps {
  value: string;
  /** Truncate long values with an ellipsis in the middle. Default: true. */
  truncate?: boolean;
  className?: string;
}

export function CopyChip({ value, truncate = true, className }: CopyChipProps) {
  const [copied, setCopied] = useState(false);
  // Track the timeout so we can cancel on unmount (avoids setState on a torn-down component).
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
        timeoutRef.current = null;
      }, 1500);
    } catch {
      // Clipboard API blocked (e.g. insecure context) — no-op.
    }
  };

  const display =
    truncate && value.length > 18 ? `${value.slice(0, 10)}…${value.slice(-8)}` : value;

  return (
    <span
      className={cn(
        'bg-bg-muted inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs',
        className,
      )}
    >
      <code className="font-mono">{display}</code>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6"
        onClick={onCopy}
        aria-label={copied ? 'Copied' : 'Copy'}
      >
        {copied ? <Check className="text-success" /> : <Copy />}
      </Button>
    </span>
  );
}
