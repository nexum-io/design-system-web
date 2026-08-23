/**
 * DS Block: FilterChipGroup
 *
 * Horizontal row of filter chips (single-select). Markup and styling ported
 * from escrow-app-web's DealListToolbar so both products render filters the
 * same way: rounded-lg chips, brand-subtle active state, aria-pressed toggles
 * inside a labelled group, horizontal scroll with a hidden scrollbar.
 */
import React from 'react';
import { cx } from '../utils/cx';

export interface FilterChipOption {
  id: string;
  label: string;
}

export interface FilterChipGroupProps {
  options: FilterChipOption[];
  /** Active option id; chips are single-select. */
  activeId: string;
  onChange: (id: string) => void;
  /** Accessible name for the group. */
  ariaLabel: string;
  /** Optional node rendered after the chips (e.g. a total-count badge). */
  trailing?: React.ReactNode;
  className?: string;
}

export function FilterChipGroup({
  options,
  activeId,
  onChange,
  ariaLabel,
  trailing,
  className,
}: FilterChipGroupProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cx(
        'flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.id === activeId;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className={cx(
              'rounded-lg border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              active
                ? 'border-brand/40 bg-brand-subtle text-brand'
                : 'border-transparent text-[var(--ds-fg-muted)] hover:bg-[var(--ds-bg-muted)] hover:text-[var(--ds-fg)]',
            )}
          >
            {option.label}
          </button>
        );
      })}
      {trailing}
    </div>
  );
}
