import type { ReactNode } from 'react';
import { Card } from '../components/Card';
import { IconBox, type IconBoxVariant } from '../components/IconBox';
import { cx } from '../utils/cx';

export interface ErrorStateCardProps {
  icon: ReactNode;
  iconVariant?: IconBoxVariant;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function ErrorStateCard({
  icon,
  iconVariant = 'warning',
  title,
  description,
  actions,
  className,
}: ErrorStateCardProps) {
  return (
    <Card variant="default" padding="lg" className={cx('max-w-md w-full text-center', className)}>
      <IconBox variant={iconVariant} size="xl" className="mx-auto mb-6">
        {icon}
      </IconBox>
      <h1 className={`text-2xl font-semibold text-foreground ${description ? 'mb-2' : 'mb-8'}`}>{title}</h1>
      {description ? <p className="text-muted-foreground mb-8">{description}</p> : null}
      {actions ? (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">{actions}</div>
      ) : null}
    </Card>
  );
}
