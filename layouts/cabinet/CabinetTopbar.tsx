"use client";

import { ChevronDown, ChevronRight, LifeBuoy, LogOut } from 'lucide-react';
import { Button } from '../../primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../primitives/dropdown-menu';
import type {
  CabinetAuth,
  CabinetBreadcrumb,
  CabinetLabels,
  CabinetLinkComponent,
  CabinetLocale,
  CabinetTheme,
} from './types';
import { LocaleSwitch } from './LocaleSwitch';
import { ThemeToggle } from './ThemeToggle';

export interface CabinetTopbarProps {
  breadcrumbs: CabinetBreadcrumb[];
  linkComponent: CabinetLinkComponent;
  theme: CabinetTheme;
  onThemeChange: (theme: CabinetTheme) => void;
  locale: CabinetLocale;
  onLocaleChange: (locale: CabinetLocale) => void;
  auth: CabinetAuth;
  labels: Pick<CabinetLabels, 'themeToLight' | 'themeToDark' | 'language'>;
  showLocaleSwitch?: boolean;
}

export function CabinetTopbar({
  breadcrumbs,
  linkComponent: Link,
  theme,
  onThemeChange,
  locale,
  onLocaleChange,
  auth,
  labels,
  showLocaleSwitch = true,
}: CabinetTopbarProps) {
  const hasSupport = Boolean(auth.status === 'signed_in' && auth.supportLabel && auth.onSupport);
  const menuItems = auth.status === 'signed_in' ? (auth.menuItems ?? []) : [];
  const hasMiddleActions = hasSupport || menuItems.length > 0;

  return (
    <header
      data-slot="cabinet-topbar"
      className="flex min-h-14 items-center gap-3 border-b border-border bg-background px-3 sm:px-4"
    >
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex min-w-0 items-center gap-1 text-sm">
          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <li key={breadcrumb.id} className="flex min-w-0 items-center gap-1">
                {index > 0 ? (
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                ) : null}
                {breadcrumb.href && !isLast ? (
                  <Link
                    to={breadcrumb.href}
                    className="truncate text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {breadcrumb.label}
                  </Link>
                ) : (
                  <span
                    className={isLast ? 'truncate font-medium text-foreground' : 'truncate text-muted-foreground'}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {breadcrumb.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle
          theme={theme}
          onThemeChange={onThemeChange}
          labelToLight={labels.themeToLight}
          labelToDark={labels.themeToDark}
        />
        {showLocaleSwitch ? (
          <LocaleSwitch
            locale={locale}
            onLocaleChange={onLocaleChange}
            ariaLabel={labels.language}
          />
        ) : null}
        {auth.status === 'signed_out' ? (
          <Button type="button" onClick={auth.onSignIn}>
            {auth.signInLabel}
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="gap-1.5 cursor-pointer"
                aria-label={auth.label}
              >
                <span className="max-w-32 truncate">{auth.label}</span>
                <ChevronDown className="size-4 opacity-70" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="min-w-56 rounded-xl border-border p-1.5 shadow-lg"
            >
              <div className="px-2.5 py-2" role="presentation">
                <p className="truncate text-sm font-semibold leading-tight text-foreground">
                  {auth.label}
                </p>
                {auth.subtitle ? (
                  <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                    {auth.subtitle}
                  </p>
                ) : null}
              </div>

              {hasMiddleActions ? (
                <>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuGroup>
                    {hasSupport ? (
                      <DropdownMenuItem
                        className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2"
                        onSelect={auth.onSupport}
                      >
                        <LifeBuoy aria-hidden />
                        {auth.supportLabel}
                      </DropdownMenuItem>
                    ) : null}
                    {menuItems.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2"
                        onSelect={item.onSelect}
                      >
                        {item.icon ?? null}
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </>
              ) : null}

              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2"
                onSelect={auth.onSignOut}
              >
                <LogOut aria-hidden />
                {auth.signOutLabel}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
