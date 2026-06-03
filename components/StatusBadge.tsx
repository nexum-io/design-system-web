/**
 * DS StatusBadge Component
 *
 * Semantic status indicator with consistent styling.
 * Replaces ad-hoc status badge patterns across DealList/DealDetail.
 */
import React from 'react';
import { cx } from '../utils/cx';

export type StatusVariant =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'brand'
  | 'blue'
  | 'green'
  | 'amber'
  | 'red'
  | 'orange'
  | 'purple'
  | 'emerald';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusVariant;
  size?: 'sm' | 'md';
  /** Leading status dot. Auto-suppressed when a leading icon element is present. */
  dot?: boolean;
}

// All variants are backed by semantic --ds-* tokens, so they flip correctly in
// dark mode. Color-named aliases (blue/green/amber/red/orange/purple/emerald)
// collapse onto their semantic equivalent and are kept for back-compat.
const variantClasses: Record<StatusVariant, string> = {
  neutral: 'bg-bg-muted text-foreground border-border',
  info: 'bg-info-subtle text-info-fg border-info/20',
  success: 'bg-success-subtle text-success-fg border-success/20',
  warning: 'bg-warning-subtle text-warning-fg border-warning/25',
  danger: 'bg-danger-subtle text-danger-fg border-danger/20',
  brand: 'bg-brand-subtle text-primary border-brand/20',
  blue: 'bg-info-subtle text-info-fg border-info/20',
  green: 'bg-success-subtle text-success-fg border-success/20',
  amber: 'bg-warning-subtle text-warning-fg border-warning/25',
  red: 'bg-danger-subtle text-danger-fg border-danger/20',
  orange: 'bg-warning-subtle text-warning-fg border-warning/25',
  purple: 'bg-brand-subtle text-primary border-brand/20',
  emerald: 'bg-success-subtle text-success-fg border-success/20',
};

const dotClasses: Record<StatusVariant, string> = {
  neutral: 'bg-fg-muted',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  brand: 'bg-brand',
  blue: 'bg-info',
  green: 'bg-success',
  amber: 'bg-warning',
  red: 'bg-danger',
  orange: 'bg-warning',
  purple: 'bg-brand',
  emerald: 'bg-success',
};

const sizeClasses: Record<NonNullable<StatusBadgeProps['size']>, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2 py-1',
};

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ variant = 'neutral', size = 'md', dot = false, className, children, ...props }, ref) => {
    // If the first child is a React element (e.g. a Lucide icon), it already
    // serves as the leading visual — suppress the dot to avoid an icon+dot prefix.
    const firstChild = React.Children.toArray(children)[0];
    const hasLeadingIcon = React.isValidElement(firstChild) && typeof firstChild.type !== 'string';
    const showDot = dot && !hasLeadingIcon;

    return (
      <span
        ref={ref}
        className={cx(
          'inline-flex items-center gap-1 font-semibold rounded-full border',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {showDot ? (
          <span aria-hidden="true" className={cx('size-1.5 rounded-full', dotClasses[variant])} />
        ) : null}
        {children}
      </span>
    );
  },
);

StatusBadge.displayName = 'StatusBadge';

/** Back-compat alias for files that imported `StatusBadgeVariant`. */
export type StatusBadgeVariant = StatusVariant;
