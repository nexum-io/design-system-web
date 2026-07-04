import { cx } from '../utils/cx';

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-10 h-10 border-4',
} as const;

export interface SpinnerProps {
  size?: keyof typeof sizeClasses;
  className?: string;
  /** Screen-reader announcement (e.g. "Загрузка…"). When set, wraps the spinner in role="status". */
  label?: string;
}

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  const circle = (
    <div
      className={cx(
        'border-brand border-t-transparent rounded-full animate-spin',
        sizeClasses[size],
        className,
      )}
      aria-hidden="true"
    />
  );

  if (!label) return circle;

  return (
    <span role="status" aria-live="polite" className="inline-flex">
      {circle}
      <span className="sr-only">{label}</span>
    </span>
  );
}
