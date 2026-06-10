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
  /** Heading level for the title — `h1` only when the card IS the page (404 etc.). */
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}

export function ErrorStateCard({
  icon,
  iconVariant = 'warning',
  title,
  description,
  actions,
  as: Heading = 'h1',
  className,
}: ErrorStateCardProps) {
  return (
    <Card
      variant="default"
      padding="lg"
      role="alert"
      className={cx('max-w-md w-full text-center', className)}
    >
      <IconBox variant={iconVariant} size="xl" className="mx-auto mb-6">
        {icon}
      </IconBox>
      <Heading className={`text-2xl font-semibold text-foreground ${description ? 'mb-2' : 'mb-8'}`}>{title}</Heading>
      {description ? <p className="text-muted-foreground mb-8">{description}</p> : null}
      {actions ? (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">{actions}</div>
      ) : null}
    </Card>
  );
}
