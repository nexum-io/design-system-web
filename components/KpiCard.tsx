/**
 * DS KpiCard — stat card.
 *
 * Layout: label + big tabular value + optional delta line + IconBox slot.
 * Fully token-driven (label uses muted-foreground, delta tones map to status tokens).
 */
import type { ReactNode } from 'react';

import { Card } from './Card';
import { IconBox, type IconBoxVariant } from './IconBox';
import { cn } from '../utils/cx';

export type DeltaTone = 'success' | 'warning' | 'danger' | 'neutral';

const deltaClasses: Record<DeltaTone, string> = {
  success: 'text-success-fg',
  warning: 'text-warning-fg',
  danger: 'text-danger-fg',
  neutral: 'text-muted-foreground',
};

export interface KpiCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: DeltaTone;
  icon?: ReactNode;
  iconTone?: IconBoxVariant;
  className?: string;
}

export function KpiCard({
  label,
  value,
  delta,
  deltaTone = 'neutral',
  icon,
  iconTone = 'brand',
  className,
}: KpiCardProps) {
  return (
    <Card padding="none" className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-muted-foreground text-xs tracking-wider uppercase">{label}</div>
          <div className="mt-2 text-3xl font-bold tracking-tight tabular-nums">{value}</div>
          {delta ? (
            <div className={cn('mt-1 text-xs font-medium', deltaClasses[deltaTone])}>{delta}</div>
          ) : null}
        </div>
        {icon ? (
          <IconBox variant={iconTone} size="lg">
            {icon}
          </IconBox>
        ) : null}
      </div>
    </Card>
  );
}
