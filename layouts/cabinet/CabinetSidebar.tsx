"use client";

import type { ReactNode } from 'react';
import { PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react';
import { cx } from '../../utils/cx';
import type { CabinetBrand, CabinetLinkComponent, CabinetNavSection } from './types';

export interface CabinetSidebarProps {
  brand: CabinetBrand;
  sections: CabinetNavSection[];
  settingsHref: string;
  settingsLabel: string;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  collapseLabel: string;
  expandLabel: string;
  linkComponent: CabinetLinkComponent;
  isActive: (href: string) => boolean;
  orgSlot?: ReactNode;
  /** Extra footer above collapse control (e.g. ResetDemo) */
  footerSlot?: ReactNode;
  className?: string;
}

export function CabinetSidebar({
  brand,
  sections,
  settingsHref,
  settingsLabel,
  collapsed,
  onCollapsedChange,
  collapseLabel,
  expandLabel,
  linkComponent: Link,
  isActive,
  orgSlot,
  footerSlot,
  className,
}: CabinetSidebarProps) {
  function getLinkClassName(active: boolean): string {
    return cx(
      'flex min-h-10 items-center rounded-lg px-3 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
      collapsed ? 'relative justify-center' : 'gap-3',
      active
        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    );
  }

  return (
    <aside
      data-slot="cabinet-sidebar"
      data-collapsed={collapsed || undefined}
      className={cx(
        'sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex',
        collapsed ? 'w-14' : 'w-64',
        className,
      )}
    >
      <div
        data-slot="cabinet-brand"
        className={cx('flex min-h-14 shrink-0 items-center px-3', collapsed ? 'justify-center' : 'gap-3')}
      >
        {brand.logo}
        <span className={cx('truncate font-semibold', collapsed && 'sr-only')}>{brand.name}</span>
      </div>

      {orgSlot != null ? (
        <div data-slot="cabinet-org" className="shrink-0 px-2 pb-2">
          {orgSlot}
        </div>
      ) : null}

      <nav data-slot="cabinet-nav" className="min-h-0 flex-1 space-y-5 overflow-y-auto px-2 py-3">
        {sections.map((section) => (
          <div key={section.id} data-slot="cabinet-nav-section">
            {!collapsed && section.label ? (
              <div className="mb-1 px-3 text-xs font-medium uppercase tracking-wide text-sidebar-foreground/60">
                {section.label}
              </div>
            ) : null}
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    className={getLinkClassName(active)}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
                    <span className={cx('truncate', collapsed && 'sr-only')}>{item.label}</span>
                    {item.badge != null ? (
                      <span
                        data-slot="cabinet-nav-badge"
                        className={cx('ms-auto shrink-0', collapsed && 'absolute end-1 top-1')}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div
        data-slot="cabinet-sidebar-footer"
        className="mt-auto shrink-0 space-y-1 border-t border-sidebar-border p-2"
      >
        <Link
          to={settingsHref}
          className={getLinkClassName(isActive(settingsHref))}
          aria-current={isActive(settingsHref) ? 'page' : undefined}
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span className={cx('truncate', collapsed && 'sr-only')}>{settingsLabel}</span>
        </Link>
        {footerSlot != null ? <div data-slot="cabinet-sidebar-footer-slot">{footerSlot}</div> : null}
        <button
          type="button"
          onClick={() => onCollapsedChange(!collapsed)}
          aria-label={collapsed ? expandLabel : collapseLabel}
          className={cx(
            'flex min-h-10 w-full items-center rounded-lg px-3 text-sm text-sidebar-foreground transition-colors outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring',
            collapsed ? 'justify-center' : 'gap-3',
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4 shrink-0" />
          ) : (
            <PanelLeftClose className="h-4 w-4 shrink-0" />
          )}
          <span className={cx(collapsed && 'sr-only')}>{collapsed ? expandLabel : collapseLabel}</span>
        </button>
      </div>
    </aside>
  );
}
