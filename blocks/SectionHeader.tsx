import type { ReactNode } from 'react';
import { IconBox } from '../components/IconBox';
import { cx } from '../utils/cx';

export interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({ icon, title, subtitle, className }: SectionHeaderProps) {
  return (
    <div className={cx('flex items-center gap-3 mb-6', className)}>
      <IconBox variant="brand" size="sm">
        {icon}
      </IconBox>
      <div className="min-w-0">
        <h2 className="ds-text-heading-xs text-foreground">{title}</h2>
        {subtitle ? (
          <p className="ds-text-body-sm mt-1 text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
