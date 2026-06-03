/**
 * Design System utility: cx (class merging)
 *
 * clsx + extendTailwindMerge so our custom DS font-size tokens
 * (`text-2xs`, `text-md`, `text-display`, `text-display-sm`, `text-display-lg`)
 * are recognised as font-sizes — NOT colors. Without this, `cx('text-display-lg',
 * 'text-danger-fg')` would silently drop the size because tw-merge would treat
 * both as `text-*` and keep only the latter.
 */
import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['2xs', 'md', 'display-sm', 'display', 'display-lg'] }],
    },
  },
});

export function cx(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Alias for ergonomics — many files use `cn` from the shadcn convention. */
export const cn = cx;
