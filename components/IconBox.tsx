/**
 * DS IconBox Component
 *
 * Consistent icon container with brand/semantic color variants.
 * Replaces ad-hoc `bg-[#6B46C1]/10 w-14 h-14 rounded-2xl` patterns.
 */
import React from 'react';
import { cx } from '../utils/cx';

export type IconBoxVariant = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type IconBoxSize = 'sm' | 'md' | 'lg' | 'xl';

export interface IconBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: IconBoxVariant;
  size?: IconBoxSize;
}

const variantClasses: Record<NonNullable<IconBoxProps['variant']>, string> = {
  brand: 'bg-brand/10 text-brand',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-info/10 text-info',
  neutral: 'bg-bg-muted text-fg-muted',
};

const sizeClasses: Record<NonNullable<IconBoxProps['size']>, string> = {
  sm: 'w-8 h-8 rounded-lg',
  md: 'w-10 h-10 rounded-xl',
  lg: 'w-12 h-12 rounded-xl',
  xl: 'w-14 h-14 rounded-2xl',
};

export const IconBox = React.forwardRef<HTMLDivElement, IconBoxProps>(
  ({ variant = 'brand', size = 'xl', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cx(
          'flex items-center justify-center flex-shrink-0',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

IconBox.displayName = 'IconBox';
