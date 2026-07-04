/**
 * DS Block: HeroSection
 *
 * Full-width hero with brand gradient background.
 * Accepts icon, title, subtitle, and action buttons.
 */
import React from 'react';
import { cx } from '../utils/cx';

export interface HeroSectionProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function HeroSection({ icon, title, subtitle, actions, className }: HeroSectionProps) {
  return (
    <section
      className={cx(
        'bg-gradient-to-b from-(--brand-gradient-from) to-(--brand-gradient-to) text-white py-12 lg:py-20',
        className,
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {icon && (
          <div className="bg-white/10 backdrop-blur-sm w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            {icon}
          </div>
        )}
        <h1 className="text-3xl lg:text-5xl mb-4 tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-base lg:text-lg mb-8 max-w-2xl mx-auto leading-relaxed opacity-95">
            {subtitle}
          </p>
        )}
        {actions && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">{actions}</div>
        )}
      </div>
    </section>
  );
}
