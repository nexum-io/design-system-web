import { cx } from '../utils/cx';

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-10 h-10 border-4',
} as const;

export interface SpinnerProps {
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cx(
        'border-brand border-t-transparent rounded-full animate-spin',
        sizeClasses[size],
        className,
      )}
      aria-hidden="true"
    />
  );
}
