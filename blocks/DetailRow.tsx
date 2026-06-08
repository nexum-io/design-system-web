import type { ReactNode } from 'react';
import { cx } from '../utils/cx';

export interface DetailRowProps {
  label: string;
  children: ReactNode;
  last?: boolean;
  className?: string;
}

export function DetailRow({ label, children, last, className }: DetailRowProps) {
  return (
    <div
      className={cx(
        'flex items-center justify-between py-2',
        !last && 'border-b border-border-muted',
        className,
      )}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
