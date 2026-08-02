"use client";

import { useState, type ReactNode } from 'react';
import { CabinetMobileNavSheet } from './CabinetMobileNavSheet';
import { CabinetSidebar } from './CabinetSidebar';
import { CabinetTabBar } from './CabinetTabBar';
import { CabinetTopbar } from './CabinetTopbar';
import type {
  CabinetAuth,
  CabinetBrand,
  CabinetBreadcrumb,
  CabinetLabels,
  CabinetLinkComponent,
  CabinetLocale,
  CabinetNavItem,
  CabinetNavSection,
  CabinetTheme,
} from './types';

export interface CabinetShellProps {
  brand: CabinetBrand;
  sections: CabinetNavSection[];
  mobileTabItems: CabinetNavItem[];
  settingsHref: string;
  breadcrumbs: CabinetBreadcrumb[];
  auth: CabinetAuth;
  labels: CabinetLabels;
  theme: CabinetTheme;
  onThemeChange: (theme: CabinetTheme) => void;
  locale: CabinetLocale;
  onLocaleChange: (locale: CabinetLocale) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  linkComponent: CabinetLinkComponent;
  isActive: (href: string) => boolean;
  orgSlot?: ReactNode;
  sidebarFooterSlot?: ReactNode;
  children: ReactNode;
}

export function CabinetShell({
  brand,
  sections,
  mobileTabItems,
  settingsHref,
  breadcrumbs,
  auth,
  labels,
  theme,
  onThemeChange,
  locale,
  onLocaleChange,
  collapsed,
  onCollapsedChange,
  linkComponent,
  isActive,
  orgSlot,
  sidebarFooterSlot,
  children,
}: CabinetShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <CabinetSidebar
        brand={brand}
        sections={sections}
        settingsHref={settingsHref}
        settingsLabel={labels.settings}
        collapsed={collapsed}
        onCollapsedChange={onCollapsedChange}
        collapseLabel={labels.collapseSidebar}
        expandLabel={labels.expandSidebar}
        linkComponent={linkComponent}
        isActive={isActive}
        orgSlot={orgSlot}
        footerSlot={sidebarFooterSlot}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <CabinetTopbar
          breadcrumbs={breadcrumbs}
          linkComponent={linkComponent}
          theme={theme}
          onThemeChange={onThemeChange}
          locale={locale}
          onLocaleChange={onLocaleChange}
          auth={auth}
          labels={labels}
        />
        <main className="flex-1 p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:p-6 md:pb-6">
          {children}
        </main>
      </div>
      <CabinetTabBar
        items={mobileTabItems}
        menuLabel={labels.menu}
        onOpenMenu={() => setMobileOpen(true)}
        linkComponent={linkComponent}
        isActive={isActive}
      />
      <CabinetMobileNavSheet
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        brand={brand}
        sections={sections}
        settingsHref={settingsHref}
        settingsLabel={labels.settings}
        linkComponent={linkComponent}
        isActive={isActive}
        orgSlot={orgSlot}
        closeLabel={labels.closeSheet}
      />
    </div>
  );
}
