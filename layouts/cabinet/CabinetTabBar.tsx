"use client";

import { Menu } from 'lucide-react';
import { cx } from '../../utils/cx';
import type { CabinetLinkComponent, CabinetNavItem } from './types';

export interface CabinetTabBarProps {
  items: CabinetNavItem[];
  menuLabel: string;
  onOpenMenu: () => void;
  linkComponent: CabinetLinkComponent;
  isActive: (href: string) => boolean;
}

const itemClassName =
  'flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring';

export function CabinetTabBar({
  items,
  menuLabel,
  onOpenMenu,
  linkComponent: Link,
  isActive,
}: CabinetTabBarProps) {
  return (
    <nav
      data-slot="cabinet-tab-bar"
      className="fixed inset-x-0 bottom-0 z-(--ds-z-sticky) flex border-t border-border bg-background pb-[env(safe-area-inset-bottom,0px)] md:hidden"
    >
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.id}
            to={item.href}
            aria-current={active ? 'page' : undefined}
            className={cx(
              itemClassName,
              active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span className="relative flex max-w-full min-w-0 flex-col items-center gap-1">
              {item.icon ? <span className="shrink-0 [&>svg]:size-5">{item.icon}</span> : null}
              <span className="max-w-full truncate">{item.label}</span>
              {item.badge != null ? (
                <span data-slot="cabinet-nav-badge" className="absolute end-0 top-0 shrink-0 -translate-y-1/2">
                  {item.badge}
                </span>
              ) : null}
            </span>
          </Link>
        );
      })}
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label={menuLabel}
        className={cx(itemClassName, 'text-muted-foreground hover:text-foreground')}
      >
        <Menu className="size-5" aria-hidden />
        <span className="max-w-full truncate">{menuLabel}</span>
      </button>
    </nav>
  );
}
