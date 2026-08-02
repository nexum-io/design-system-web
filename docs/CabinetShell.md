# CabinetShell

Unified authenticated cabinet chrome for **business**, **heth**, **escrow**,
**escrow-admin-web**, and **escrow-arbitrator-web** user apps: collapsible sidebar
(Settings pinned at bottom), minimal topbar, mobile tab bar + nav sheet, and shared
settings layout primitives. The shell is **presentation + structure only** — apps
supply nav registries, auth callbacks, org widgets, page content, and all i18n labels.

## Import paths

```ts
import {
  CabinetShell,
  CabinetSheet,
  SettingsLayout,
  ThemeToggle,
  LocaleSwitch,
  readCabinetTheme,
  writeCabinetTheme,
  readCabinetLocale,
  writeCabinetLocale,
  CABINET_THEME_KEY,
  CABINET_LOCALE_KEY,
} from "@nexum-io/design-system";
```

## Persistence keys

| key | values | default (missing/invalid) |
|---|---|---|
| `nexum.cabinet.theme` (`CABINET_THEME_KEY`) | `'light' \| 'dark'` | `'light'` (invalid value rewritten once) |
| `nexum.cabinet.locale` (`CABINET_LOCALE_KEY`) | `'en' \| 'ru'` | `'en'` (invalid value rewritten once) |

Use the exported helpers so topbar toggles and Settings pages stay in sync.
Sidebar collapse state is **app-owned** (not persisted by DS).

## `orgSlot` rules

- **Optional** — omit the prop when the product has no org context (escrow).
- **business / heth** — pass the existing org switcher / entity scope widget
  here; it renders in the sidebar (desktop) and mobile nav sheet.
- **escrow-arbitrator-web** — may pass profile UI via `orgSlot` (same rules as
  business/heth).
- DS does **not** render a placeholder when omitted — no org UI appears.
- Org fetch errors and loading states belong inside the slot content the app
  provides; the shell does not mask them.

## Copy-paste consumer wiring

Minimal cabinet root for a React Router SPA. Adapt nav registries, auth, and
`orgSlot` to your product.

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  CabinetShell,
  readCabinetLocale,
  readCabinetTheme,
  writeCabinetLocale,
  writeCabinetTheme,
  type CabinetLinkComponent,
  type CabinetLocale,
  type CabinetTheme,
} from "@nexum-io/design-system";
import { OrgSwitcher } from "./OrgSwitcher"; // business / heth only

/** react-router `NavLink` adapter — required `to` prop contract. */
const CabinetLink: CabinetLinkComponent = ({ to, className, onClick, children, "aria-current": ariaCurrent }) => (
  <NavLink to={to} className={className} onClick={onClick} aria-current={ariaCurrent}>
    {children}
  </NavLink>
);

export function AppCabinetLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<CabinetTheme>(() => readCabinetTheme());
  const [locale, setLocale] = useState<CabinetLocale>(() => readCabinetLocale());

  // Keep document theme class in sync (app ThemeProvider may also listen).
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    writeCabinetTheme(theme);
  }, [theme]);

  useEffect(() => {
    writeCabinetLocale(locale);
    // App LocaleProvider should read the same key on change.
  }, [locale]);

  const sections = useMemo(
    () => [
      {
        id: "main",
        label: "Workspace",
        items: [
          { id: "overview", label: "Overview", href: "/overview" },
          { id: "payments", label: "Payments", href: "/payments" },
        ],
      },
    ],
    [],
  );

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <CabinetShell
      brand={{ name: "Nexum" }}
      sections={sections}
      mobileTabItems={sections[0].items.slice(0, 2)}
      settingsHref="/settings/theme"
      breadcrumbs={[{ id: "cabinet", label: "Cabinet", href: "/overview" }]}
      auth={{
        status: "signed_in",
        label: "0xabc…def",
        signOutLabel: "Sign out",
        onSignOut: () => {/* SSO sign-out */},
      }}
      labels={{
        collapseSidebar: "Collapse sidebar",
        expandSidebar: "Expand sidebar",
        settings: "Settings",
        menu: "Menu",
        themeToLight: "Use light theme",
        themeToDark: "Use dark theme",
        language: "Language",
        closeSheet: "Close navigation",
      }}
      theme={theme}
      onThemeChange={setTheme}
      locale={locale}
      onLocaleChange={setLocale}
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      linkComponent={CabinetLink}
      isActive={isActive}
      orgSlot={<OrgSwitcher />} // omit for escrow
    >
      {children}
    </CabinetShell>
  );
}
```

## Settings layout

`SettingsLayout` requires sections with ids **`theme`** and **`language`**
(enforced in non-production via `assertRequiredSettingsSections`). Product-specific
sections (profile, notifications, etc.) are appended by the app.

```tsx
import { SettingsLayout } from "@nexum-io/design-system";

<SettingsLayout
  title="Settings"
  sections={[
    { id: "theme", label: "Theme", href: "/settings/theme" },
    { id: "language", label: "Language", href: "/settings/language" },
    { id: "profile", label: "Profile", href: "/settings/profile" },
  ]}
  linkComponent={CabinetLink}
  isActive={isActive}
>
  {/* route outlet / section panel */}
</SettingsLayout>
```

Theme and language panels should call the same `writeCabinetTheme` /
`writeCabinetLocale` helpers (or controlled state lifted to the cabinet root) so
topbar controls and Settings stay aligned.

## Nav badges

`CabinetNavItem.badge?: ReactNode` is optional. When set, DS renders it in the
sidebar, mobile nav sheet, and tab bar (`data-slot="cabinet-nav-badge"`).
Tone/count markup is app-owned. Omit the prop for no badge.

## Related exports

| export | role |
|---|---|
| `CabinetShell` | Full cabinet chrome composition |
| `CabinetSidebar`, `CabinetTopbar`, `CabinetTabBar`, `CabinetMobileNavSheet` | Composable primitives (advanced use) |
| `CabinetSheet` | Right slide-over chrome for sign / payment / deal flows |
| `SigningSheet` | Signing flow UI built on `CabinetSheet` |
| `ThemeToggle`, `LocaleSwitch` | Standalone controls (also used inside topbar) |
| `SettingsLayout` | Settings sub-nav + content grid |

## Adoption checklist

- [ ] Replace local `AppShell` / `MainLayout` with `CabinetShell`
- [ ] Wire `linkComponent` to your router (`NavLink` or equivalent)
- [ ] Pass all `labels` from app i18n (DS has no hidden chrome dictionary)
- [ ] Sync theme/locale via persistence helpers + app providers
- [ ] Move org UI to `orgSlot` (business/heth) or omit (escrow)
- [ ] Use `CabinetSheet` / `SigningSheet` for right-panel flows
- [ ] Settings routes use `SettingsLayout` with required theme + language sections

Spec: [`docs/superpowers/specs/2026-08-02-unified-cabinet-shell-design.md`](./superpowers/specs/2026-08-02-unified-cabinet-shell-design.md)
