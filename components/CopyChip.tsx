/**
 * DS CopyChip — inline code/hash/address chip with a copy button.
 */
import { Check, Copy } from 'lucide-react';

import { Button } from '../primitives/button';
import { cn } from '../utils/cx';
import { useCopyFeedback } from '@/hooks/useCopyFeedback';

export interface CopyChipProps {
  value: string;
  /** Truncate long values with an ellipsis in the middle. Default: true. */
  truncate?: boolean;
  copyLabel?: string;
  copiedLabel?: string;
  className?: string;
}

export function CopyChip({
  value,
  truncate = true,
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
        onClick={() => void copy(value)}
        aria-label={copied ? copiedLabel : copyLabel}
      >
        {copied ? <Check className="text-success" /> : <Copy />}
      </Button>
    </span>
  );
}
