import type { ReactNode } from 'react';
import { cx } from '../utils/cx';

export interface DetailRowProps {
  /** Подпись строки; ReactNode — для бейджей рядом с текстом («вы» и т.п.). */
  label: ReactNode;
  children: ReactNode;
  last?: boolean;
  className?: string;
}

export function DetailRow({ label, children, last, className }: DetailRowProps) {
  return (
    <div
      className={cx(
        'flex flex-col items-start gap-1 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0',
        !last && 'border-b border-border-muted',
        className,
      )}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
