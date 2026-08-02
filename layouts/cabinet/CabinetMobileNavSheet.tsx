"use client";

import type { ReactNode } from 'react';
import { Settings } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '../../primitives/sheet';
import { cx } from '../../utils/cx';
import type { CabinetBrand, CabinetLinkComponent, CabinetNavSection } from './types';

export interface CabinetMobileNavSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: CabinetBrand;
  sections: CabinetNavSection[];
  settingsHref: string;
  settingsLabel: string;
  linkComponent: CabinetLinkComponent;
  isActive: (href: string) => boolean;
  orgSlot?: ReactNode;
  closeLabel: string;
}

const linkClassName =
  'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function CabinetMobileNavSheet({
  open,
  onOpenChange,
  brand,
  sections,
  settingsHref,
  settingsLabel,
  linkComponent: Link,
  isActive,
  orgSlot,
  closeLabel,
}: CabinetMobileNavSheetProps) {
  function getLinkClassName(active: boolean): string {
    return cx(
      linkClassName,
      active
        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    );
  }

  function closeSheet() {
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        data-side="left"
        closeLabel={closeLabel}
        data-slot="cabinet-mobile-nav-sheet"
        aria-describedby=""
        className="w-[min(20rem,85vw)] gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
      >
        <div data-slot="cabinet-brand" className="flex min-h-14 items-center gap-3 border-b border-sidebar-border px-4 pr-14">
          {brand.logo}
          <SheetTitle className="truncate text-base text-sidebar-foreground">{brand.name}</SheetTitle>
        </div>

        {orgSlot != null ? (
          <div data-slot="cabinet-org" className="shrink-0 border-b border-sidebar-border p-3">
            {orgSlot}
          </div>
        ) : null}

        <nav data-slot="cabinet-mobile-nav" className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {sections.map((section) => (
            <div key={section.id} data-slot="cabinet-nav-section">
              {section.label ? (
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
                      onClick={closeSheet}
                      aria-current={active ? 'page' : undefined}
                      className={getLinkClassName(active)}
                    >
                      {item.icon ? <span className="shrink-0 [&>svg]:size-4">{item.icon}</span> : null}
                      <span className="truncate">{item.label}</span>
                      {item.badge != null ? (
                        <span data-slot="cabinet-nav-badge" className="ms-auto shrink-0">
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

        <div className="shrink-0 border-t border-sidebar-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
          <Link
            to={settingsHref}
            onClick={closeSheet}
            aria-current={isActive(settingsHref) ? 'page' : undefined}
            className={getLinkClassName(isActive(settingsHref))}
          >
            <Settings className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{settingsLabel}</span>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
