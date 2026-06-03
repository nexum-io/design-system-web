/**
 * DS Card Component
 *
 * Token-based card. The root keeps the app's existing API (variant + padding
 * defaults) so current call sites are unchanged; the data-slot subcomponents
 * (CardHeader/Title/Description/Action/Content/Footer) are available for richer
 * compositions. All colors are semantic tokens, so cards flip in dark mode.
 */
import React from 'react';
import { cx } from '../utils/cx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantClasses: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'bg-card border border-border-muted shadow-sm',
  outline: 'bg-card border border-border',
  ghost: 'bg-transparent',
  elevated: 'bg-card/80 backdrop-blur-sm border border-border-muted shadow-sm',
};

const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card"
        className={cx('rounded-2xl text-card-foreground', variantClasses[variant], paddingClasses[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

export function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cx(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 has-data-[slot=card-action]:grid-cols-[1fr_auto]',
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-title" className={cx('leading-none font-semibold', className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-description" className={cx('text-sm text-muted-foreground', className)} {...props} />;
}

export function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cx('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cx(className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-footer" className={cx('flex items-center [.border-t]:pt-6', className)} {...props} />;
}
