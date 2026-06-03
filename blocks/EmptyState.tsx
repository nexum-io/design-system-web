/**
 * DS Block: EmptyState
 *
 * Shown when a list is empty. Optional icon (or custom illustration) + title +
 * subtitle + optional CTA. `description` is accepted as an alias for `subtitle`.
 */
import React from 'react';
import { cx } from '../utils/cx';

export interface EmptyStateProps {
  /** Leading icon, wrapped in a muted circle. Omit for a text-only empty state. */
  icon?: React.ReactNode;
  /** Custom illustration node; takes precedence over `icon`. */
  illustration?: React.ReactNode;
  title: string;
  subtitle?: string;
  /** Alias for `subtitle`. */
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  illustration,
  title,
  subtitle,
  description,
  action,
  className,
}: EmptyStateProps) {
  const text = subtitle ?? description;
  return (
    <div
      className={cx(
        'bg-card rounded-lg border border-border-muted px-6 py-12 text-center',
        className,
      )}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {illustration ??
        (icon ? (
          <div className="bg-bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            {icon}
          </div>
        ) : null)}
      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      {text && <p className="text-sm text-fg-subtle mb-6">{text}</p>}
      {action}
    </div>
  );
}
