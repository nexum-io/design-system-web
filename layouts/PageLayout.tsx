/**
 * DS Layout: PageLayout
 *
 * Standard page wrapper with consistent padding and max-width.
 */
import React from 'react';
import { cx } from '../utils/cx';

export interface PageLayoutProps {
  children: React.ReactNode;
  bg?: 'default' | 'subtle';
  className?: string;
}

export function PageLayout({ children, bg = 'subtle', className }: PageLayoutProps) {
  return (
    <div
      className={cx(
        'min-h-dvh',
        bg === 'subtle' ? 'bg-bg-subtle' : 'bg-background',
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={cx('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12', className)}>
      {children}
    </div>
  );
}
