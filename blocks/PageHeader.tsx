/**
 * DS Block: PageHeader
 *
 * Reusable page header with title, subtitle, and optional action slot.
 * Used at the top of list/detail pages.
 */
import React from 'react';
import { cx } from '../utils/cx';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cx('mb-8', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-foreground mb-2">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
