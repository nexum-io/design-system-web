/**
 * DS Block: FeatureCard
 *
 * Card with icon, title, and description for feature grids.
 * Used on Landing page and HowItWorks.
 */
import React from 'react';
import { cx } from '../utils/cx';
import { IconBox, type IconBoxProps } from '../components/IconBox';

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconVariant?: IconBoxProps['variant'];
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  iconVariant = 'brand',
  className,
}: FeatureCardProps) {
  return (
    <div className={cx('text-center p-6', className)}>
      <IconBox variant={iconVariant} size="xl" className="mx-auto mb-5">
        {icon}
      </IconBox>
      <h3 className="text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
