import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { CabinetLinkComponent, SettingsSection } from './types';

export interface SettingsLayoutProps {
  title: string;
  subtitle?: string;
  sections: SettingsSection[];
  linkComponent: CabinetLinkComponent;
  isActive: (href: string) => boolean;
  children: ReactNode;
}

export function assertRequiredSettingsSections(sections: SettingsSection[]): void {
  const sectionIds = new Set(sections.map((section) => section.id));
  const missingIds = ['theme', 'language'].filter((id) => !sectionIds.has(id));

  if (missingIds.length > 0) {
    throw new Error(`SettingsLayout requires sections with ids: ${missingIds.join(', ')}`);
  }
}

export function SettingsLayout({
  title,
  subtitle,
  sections,
  linkComponent: Link,
  isActive,
  children,
}: SettingsLayoutProps) {
  assertRequiredSettingsSections(sections);

  return (
    <div data-slot="settings-layout" className="mx-auto w-full max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </header>
      <div className="grid gap-6 md:grid-cols-[14rem_minmax(0,1fr)]">
        <nav aria-label={title} className="flex gap-1 overflow-x-auto md:flex-col">
          {sections.map((section) => {
            const active = isActive(section.href);
            return (
              <Link
                key={section.id}
                to={section.href}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'flex min-h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                {section.icon ? <span className="shrink-0 [&>svg]:size-4">{section.icon}</span> : null}
                <span>{section.label}</span>
              </Link>
            );
          })}
        </nav>
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
