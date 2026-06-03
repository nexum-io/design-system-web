/**
 * DS Block: SectionBlock
 *
 * Page section with optional heading and constrained width.
 */
import React from 'react';
import { cx } from '../utils/cx';

export interface SectionBlockProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  bg?: 'white' | 'subtle' | 'transparent';
  border?: boolean;
  className?: string;
}

const bgClasses: Record<NonNullable<SectionBlockProps['bg']>, string> = {
  white: 'bg-card',
  subtle: 'bg-bg-subtle',
  transparent: 'bg-transparent',
};

export function SectionBlock({
  title,
  subtitle,
  children,
  bg = 'transparent',
  border = false,
  className,
}: SectionBlockProps) {
  return (
    <section
      className={cx(
        'py-12 lg:py-20',
        bgClasses[bg],
        border && 'border-t border-border',
        className,
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-foreground mb-3">{title}</h2>}
            {subtitle && (
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
