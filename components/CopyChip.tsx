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
        className="size-6 shrink-0"
        onClick={() => void copy(value)}
        aria-label={copied ? copiedLabel : copyLabel}
      >
        {copied ? <Check className="text-success" /> : <Copy />}
      </Button>
    </span>
  );
}
