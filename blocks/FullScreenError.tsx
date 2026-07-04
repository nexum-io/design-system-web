/**
 * DS Block: FullScreenError
 *
 * Full-viewport centered error state. Use as a top-level fallback so the app never
 * shows a blank white screen (config errors, fatal boot failures, route-level crashes).
 * Wraps ErrorStateCard with a sensible default warning icon.
 */
import type { ReactNode } from 'react';
import { ErrorStateCard } from './ErrorStateCard';
import type { IconBoxVariant } from '../components/IconBox';
import { cx } from '../utils/cx';

export interface FullScreenErrorProps {
  title: string;
  description?: string;
  /** Leading icon. Falls back to a built-in warning glyph. */
  icon?: ReactNode;
  iconVariant?: IconBoxVariant;
  /** Action buttons (e.g. reload, go home). */
  actions?: ReactNode;
  className?: string;
}

function DefaultWarningIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function FullScreenError({
  title,
  description,
  icon,
  iconVariant = 'warning',
  actions,
  className,
}: FullScreenErrorProps) {
  return (
    <div
      role="alert"
      className={cx(
        'min-h-screen w-full flex items-center justify-center bg-background p-4',
        className,
      )}
    >
      <ErrorStateCard
        icon={icon ?? <DefaultWarningIcon />}
        iconVariant={iconVariant}
        title={title}
        description={description}
        actions={actions}
      />
    </div>
  );
}
