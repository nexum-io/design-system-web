# Unified Cabinet Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship composable cabinet chrome in `@nexum-io/design-system`, then adopt it in `business-app-web`, `heth-app-web`, and `escrow-app-web` so authenticated user cabinets share one shell (sidebar, topbar, mobile tabs, settings layout, right sheet).

**Architecture:** Additive DS primitives under `layouts/cabinet/` + thin `CabinetShell` composer; apps pass nav/auth/orgSlot/labels and keep product content. No dual shells, no `system` theme, no hidden fallback UI. Rollout: DS → business → heth → escrow.

**Tech Stack:** React 19, Tailwind v4, Radix Sheet/Dialog, next-themes (apps), Vitest + Testing Library, Storybook 9, Vite SPAs, git submodules for DS.

**Spec:** `docs/superpowers/specs/2026-08-02-unified-cabinet-shell-design.md`

## Global Constraints

- Scope apps only: `business-app-web`, `heth-app-web`, `escrow-app-web` (not arb/admin)
- Theme values: `'light' | 'dark'` only; storage key `nexum.cabinet.theme`; default `light`; no `enableSystem`
- Locale values: `'en' | 'ru'`; storage key `nexum.cabinet.locale`; default `en`
- Topbar chrome: breadcrumbs + theme + locale + auth only (no ⌘K, bell, org)
- Org: optional `orgSlot` (business + heth); escrow omits
- Sheet: product content in apps; chrome via `CabinetSheet`; `SigningSheet` must use `CabinetSheet`
- Settings: DS `SettingsLayout`; theme + language sections required in every app
- Mobile: bottom tab bar + left nav sheet (`md` breakpoint), matching business pattern
- No runtime fallback to legacy AppShell/MainLayout after consumer migration
- Verify: DS `npm test && npm run lint`; each app `npm run ci:check` + local compose smoke
- Integration branch: `develop`; one PR per repo; producer first

## Plan set (execute in order)

| Plan | Repo | Deliverable |
|------|------|-------------|
| **Phase A** (this file, Tasks 1–8) | `design-system-web` | Cabinet primitives exported + tested |
| **Phase B** (Tasks 9–12) | `business-app-web` | Reference consumer on compose `:8085` |
| **Phase C** (Tasks 13–16) | `heth-app-web` | Consumer on compose `:8084`; DS remote → `design-system-web` |
| **Phase D** (Tasks 17–20) | `escrow-app-web` | Consumer on compose `:8080`; DS remote → `design-system-web` |

Do not start Phase B until Phase A is merged (or submodule-pinnable). Do not start C/D until B verifies the API in a real app.

---

## Locked public API (all later tasks depend on this)

```ts
// layouts/cabinet/types.ts
import type { ComponentType, ReactNode } from 'react';

export type CabinetTheme = 'light' | 'dark';
export type CabinetLocale = 'en' | 'ru';

export const CABINET_THEME_KEY = 'nexum.cabinet.theme';
export const CABINET_LOCALE_KEY = 'nexum.cabinet.locale';

export interface CabinetNavItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  external?: boolean;
}

export interface CabinetNavSection {
  id: string;
  label?: string;
  items: CabinetNavItem[];
}

export interface CabinetBrand {
  name: string;
  logo?: ReactNode;
}

export interface CabinetBreadcrumb {
  id: string;
  label: string;
  href?: string;
}

export interface CabinetAuthSignedOut {
  status: 'signed_out';
  signInLabel: string;
  onSignIn: () => void;
}

export interface CabinetAuthSignedIn {
  status: 'signed_in';
  label: string;
  subtitle?: string;
  signOutLabel: string;
  onSignOut: () => void;
}

export type CabinetAuth = CabinetAuthSignedOut | CabinetAuthSignedIn;

/** SPA link: apps pass react-router `Link` or `NavLink` adapter. */
export type CabinetLinkComponent = ComponentType<{
  to: string;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
  'aria-current'?: 'page' | undefined;
}>;

export interface CabinetLabels {
  collapseSidebar: string;
  expandSidebar: string;
  settings: string;
  menu: string;
  themeToLight: string;
  themeToDark: string;
  language: string;
  closeSheet: string;
}

export interface SettingsSection {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
}
```

```ts
// layouts/cabinet/persistence.ts
export function readCabinetTheme(storage?: Storage): CabinetTheme;
export function writeCabinetTheme(theme: CabinetTheme, storage?: Storage): void;
export function readCabinetLocale(storage?: Storage): CabinetLocale;
export function writeCabinetLocale(locale: CabinetLocale, storage?: Storage): void;
```

Persistence rules: missing or invalid → return default (`light` / `en`) and rewrite storage when `write*` is next called; `read*` that finds invalid must rewrite default immediately (fail-closed, no silent coerce to system).

---

## File structure (Phase A — DS)

| Path | Responsibility |
|------|----------------|
| `layouts/cabinet/types.ts` | Shared types + storage key constants |
| `layouts/cabinet/persistence.ts` | Theme/locale read/write with validation |
| `layouts/cabinet/ThemeToggle.tsx` | Controlled light/dark button |
| `layouts/cabinet/LocaleSwitch.tsx` | Controlled EN/RU segmented control |
| `layouts/cabinet/CabinetSheet.tsx` | Right slide-over chrome (title/description/footer/children) |
| `layouts/cabinet/CabinetSidebar.tsx` | Collapsible rail, sections, orgSlot, settings footer |
| `layouts/cabinet/CabinetTopbar.tsx` | Breadcrumbs + theme + locale + auth |
| `layouts/cabinet/CabinetTabBar.tsx` | Mobile bottom tabs + Menu |
| `layouts/cabinet/CabinetMobileNavSheet.tsx` | Left sheet with full nav |
| `layouts/cabinet/SettingsLayout.tsx` | Settings sub-nav + children; asserts theme+language ids |
| `layouts/cabinet/CabinetShell.tsx` | Composes the above |
| `layouts/cabinet/index.ts` | Barrel |
| `layouts/index.ts` | Re-export cabinet |
| `blocks/SigningSheet.tsx` | Refactor internals to `CabinetSheet` |
| `layouts/cabinet/__tests__/*.test.tsx` | Unit tests |
| `stories/Cabinet*.stories.tsx` | Storybook |

## File structure (Phase B — business)

| Path | Responsibility |
|------|----------------|
| `src/app/layouts/AppShell.tsx` | Thin wrapper → `CabinetShell` |
| `src/app/layouts/cabinetNav.ts` | Map `APP_MODULES` → `CabinetNavSection[]` |
| `src/app/components/sidebar/OrgScopeSlot.tsx` | Entity switcher moved from header |
| `src/app/components/AppHeader.tsx` | Delete or reduce to breadcrumbs helper only |
| `src/app/components/sidebar/AppSidebar.tsx` | Remove after migration |
| `src/app/pages/settings/*` | Use DS `SettingsLayout`; add Theme + Language sections |
| `src/i18n/*` | Add `ru`; persist locale via DS helpers |
| `src/app/AppProviders.tsx` | `defaultTheme` from `readCabinetTheme()` |
| `src/app/components/SignSheet.tsx` | Prefer DS `SigningSheet` / `CabinetSheet` |
| `src/design-system` | Bump submodule to Phase A commit |

## File structure (Phase C — heth)

| Path | Responsibility |
|------|----------------|
| `src/app/layouts/MainLayout.tsx` → cabinet wrapper | `CabinetShell` |
| `src/app/layouts/cabinetNav.ts` | From `APP_MODULES` |
| `src/app/components/sidebar/OrgSwitcher.tsx` | Pass as `orgSlot` |
| `src/app/pages/settings/*` | Split into `SettingsLayout` routes + theme/language |
| `src/app/pages/payments/NewPaymentSheet.tsx` | Wrap with `CabinetSheet` |
| `.gitmodules` | Remote → `design-system-web` |
| `src/design-system` | Repoint + bump |

## File structure (Phase D — escrow)

| Path | Responsibility |
|------|----------------|
| `src/app/layouts/AppShell.tsx` | `CabinetShell` (no orgSlot) |
| `src/app/layouts/cabinetNav.ts` | From `USER_NAV` / `config/nav.ts` |
| `src/app/layouts/Sidebar.tsx`, `ShellHeader.tsx`, `MobileNavSheet.tsx` | Remove after migration |
| `src/app/pages/Settings*.tsx` | DS `SettingsLayout` + theme/language sections |
| `src/app/components/SignSheet.tsx`, payment/sign sheets | Already `SigningSheet`; verify `CabinetSheet` base |
| `.gitmodules` + submodule | → `design-system-web` |

---

### Task 1: Cabinet types + persistence

**Files:**
- Create: `layouts/cabinet/types.ts`
- Create: `layouts/cabinet/persistence.ts`
- Create: `layouts/cabinet/__tests__/persistence.test.ts`
- Create: `layouts/cabinet/index.ts` (partial exports)
- Modify: `layouts/index.ts`

**Interfaces:**
- Produces: types and `readCabinetTheme` / `writeCabinetTheme` / `readCabinetLocale` / `writeCabinetLocale` as locked above

- [ ] **Step 1: Write the failing test**

```ts
// layouts/cabinet/__tests__/persistence.test.ts
import { describe, expect, it } from 'vitest';
import {
  CABINET_LOCALE_KEY,
  CABINET_THEME_KEY,
  readCabinetLocale,
  readCabinetTheme,
  writeCabinetLocale,
  writeCabinetTheme,
} from '../persistence';

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(initial));
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: (k) => void map.delete(k),
    key: (i) => [...map.keys()][i] ?? null,
  };
}

describe('cabinet persistence', () => {
  it('defaults theme to light and rewrites invalid values', () => {
    const storage = memoryStorage({ [CABINET_THEME_KEY]: 'system' });
    expect(readCabinetTheme(storage)).toBe('light');
    expect(storage.getItem(CABINET_THEME_KEY)).toBe('light');
  });

  it('round-trips dark theme', () => {
    const storage = memoryStorage();
    writeCabinetTheme('dark', storage);
    expect(readCabinetTheme(storage)).toBe('dark');
  });

  it('defaults locale to en and rewrites invalid values', () => {
    const storage = memoryStorage({ [CABINET_LOCALE_KEY]: 'de' });
    expect(readCabinetLocale(storage)).toBe('en');
    expect(storage.getItem(CABINET_LOCALE_KEY)).toBe('en');
  });

  it('round-trips ru locale', () => {
    const storage = memoryStorage();
    writeCabinetLocale('ru', storage);
    expect(readCabinetLocale(storage)).toBe('ru');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- layouts/cabinet/__tests__/persistence.test.ts`  
Expected: FAIL (module not found)

- [ ] **Step 3: Write minimal implementation**

```ts
// layouts/cabinet/types.ts
export type CabinetTheme = 'light' | 'dark';
export type CabinetLocale = 'en' | 'ru';
export const CABINET_THEME_KEY = 'nexum.cabinet.theme';
export const CABINET_LOCALE_KEY = 'nexum.cabinet.locale';
// ... remaining types from Locked public API
```

```ts
// layouts/cabinet/persistence.ts
import {
  CABINET_LOCALE_KEY,
  CABINET_THEME_KEY,
  type CabinetLocale,
  type CabinetTheme,
} from './types';

function store(storage?: Storage): Storage | null {
  if (storage) return storage;
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readCabinetTheme(storage?: Storage): CabinetTheme {
  const s = store(storage);
  const raw = s?.getItem(CABINET_THEME_KEY);
  if (raw === 'light' || raw === 'dark') return raw;
  if (s) s.setItem(CABINET_THEME_KEY, 'light');
  return 'light';
}

export function writeCabinetTheme(theme: CabinetTheme, storage?: Storage): void {
  store(storage)?.setItem(CABINET_THEME_KEY, theme);
}

export function readCabinetLocale(storage?: Storage): CabinetLocale {
  const s = store(storage);
  const raw = s?.getItem(CABINET_LOCALE_KEY);
  if (raw === 'en' || raw === 'ru') return raw;
  if (s) s.setItem(CABINET_LOCALE_KEY, 'en');
  return 'en';
}

export function writeCabinetLocale(locale: CabinetLocale, storage?: Storage): void {
  store(storage)?.setItem(CABINET_LOCALE_KEY, locale);
}
```

Export from `layouts/cabinet/index.ts` and `layouts/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- layouts/cabinet/__tests__/persistence.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add layouts/cabinet layouts/index.ts
git commit -m "feat(cabinet): add theme/locale persistence helpers"
```

---

### Task 2: ThemeToggle + LocaleSwitch

**Files:**
- Create: `layouts/cabinet/ThemeToggle.tsx`
- Create: `layouts/cabinet/LocaleSwitch.tsx`
- Create: `layouts/cabinet/__tests__/ThemeToggle.test.tsx`
- Create: `layouts/cabinet/__tests__/LocaleSwitch.test.tsx`
- Modify: `layouts/cabinet/index.ts`

**Interfaces:**
- Consumes: `CabinetTheme`, `CabinetLocale`
- Produces:
  - `ThemeToggle({ theme, onThemeChange, labelToLight, labelToDark })`
  - `LocaleSwitch({ locale, onLocaleChange, ariaLabel, locales?: CabinetLocale[] })` — `locales` default `['en','ru']` must still be explicit in stories; component requires `locale` + `onLocaleChange` (controlled only)

- [ ] **Step 1: Write failing tests**

```tsx
// ThemeToggle.test.tsx
it('calls onThemeChange with the opposite theme', async () => {
  const onThemeChange = vi.fn();
  render(
    <ThemeToggle
      theme="light"
      onThemeChange={onThemeChange}
      labelToLight="Light"
      labelToDark="Dark"
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Dark' }));
  expect(onThemeChange).toHaveBeenCalledWith('dark');
});
```

```tsx
// LocaleSwitch.test.tsx
it('marks the active locale and notifies on change', async () => {
  const onLocaleChange = vi.fn();
  render(
    <LocaleSwitch
      locale="en"
      onLocaleChange={onLocaleChange}
      ariaLabel="Language"
    />,
  );
  expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true');
  await userEvent.click(screen.getByRole('button', { name: 'RU' }));
  expect(onLocaleChange).toHaveBeenCalledWith('ru');
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npm test -- layouts/cabinet/__tests__/ThemeToggle.test.tsx layouts/cabinet/__tests__/LocaleSwitch.test.tsx`

- [ ] **Step 3: Implement**

Use existing `Button` from primitives for ThemeToggle (Moon/Sun from `lucide-react`). LocaleSwitch: `role="group"` + two pressed buttons, styles aligned with escrow `ShellHeader` language control (`border`, `rounded-md`, active `bg-bg-muted`).

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(cabinet): add ThemeToggle and LocaleSwitch"
```

---

### Task 3: CabinetSheet

**Files:**
- Create: `layouts/cabinet/CabinetSheet.tsx`
- Create: `layouts/cabinet/__tests__/CabinetSheet.test.tsx`
- Create: `stories/CabinetSheet.stories.tsx`
- Modify: `layouts/cabinet/index.ts`

**Interfaces:**
- Consumes: Sheet primitives
- Produces:

```ts
export interface CabinetSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  closeLabel: string;
  footer?: ReactNode;
  children: ReactNode;
  /** default 'md' → sm:max-w-md; 'sm' → sm:max-w-sm; 'lg' → sm:max-w-lg */
  size?: 'sm' | 'md' | 'lg';
  hideCloseButton?: boolean;
  className?: string;
  /** When true, ignore dismiss (busy signing) */
  preventDismiss?: boolean;
}
```

- [ ] **Step 1: Write failing test**

```tsx
it('renders dialog with title, body, optional footer, and closes', async () => {
  const onOpenChange = vi.fn();
  render(
    <CabinetSheet
      open
      onOpenChange={onOpenChange}
      title="Create payment"
      closeLabel="Close"
      footer={<button type="button">Submit</button>}
    >
      <p>body</p>
    </CabinetSheet>,
  );
  expect(screen.getByRole('dialog', { name: 'Create payment' })).toBeInTheDocument();
  expect(screen.getByText('body')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

it('does not call onOpenChange when preventDismiss is true', async () => {
  const onOpenChange = vi.fn();
  render(
    <CabinetSheet open onOpenChange={onOpenChange} title="Sign" closeLabel="Close" preventDismiss>
      body
    </CabinetSheet>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(onOpenChange).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement on Sheet primitives**

`side="right"`, `data-slot="cabinet-sheet"`, header (non-gradient plain chrome — brand-neutral), scrollable body, sticky footer region only when `footer` set. Size map:

```ts
const SIZE = { sm: 'sm:max-w-sm', md: 'sm:max-w-md', lg: 'sm:max-w-lg' } as const;
```

- [ ] **Step 4: Run — expect PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(cabinet): add CabinetSheet right-panel chrome"
```

---

### Task 4: Refactor SigningSheet onto CabinetSheet

**Files:**
- Modify: `blocks/SigningSheet.tsx`
- Modify: `blocks/__tests__/SigningSheet.test.tsx` (keep existing assertions green)
- Test: `npm test -- blocks/__tests__/SigningSheet`

**Interfaces:**
- Consumes: `CabinetSheet` (may need `variant="signing"` gradient header **inside** children, OR extend `CabinetSheet` with optional `headerClassName` / `header` slot)
- Produces: same public `SigningSheetProps` (no breaking consumer API)

**Design choice (required):** Extend `CabinetSheet` with optional `header?: ReactNode` — when provided, replaces default title header. `SigningSheet` passes gradient header as `header` and keeps step indicator / body / footer behavior. Do **not** keep a parallel raw `SheetContent` path.

- [ ] **Step 1: Run existing SigningSheet tests (baseline green)**

Run: `npm test -- blocks/__tests__/SigningSheet`  
Expected: PASS on current code

- [ ] **Step 2: Add CabinetSheet `header` slot + failing SigningSheet structural test**

```tsx
it('renders through cabinet-sheet chrome', () => {
  renderSheet();
  expect(document.querySelector('[data-slot="cabinet-sheet"]')).not.toBeNull();
});
```

- [ ] **Step 3: Refactor SigningSheet to compose CabinetSheet**

Preserve: busy dismiss blocking, closeConfirm dialog, step indicator, gradient header classes, footer `data-slot="signing-sheet-footer"`.

- [ ] **Step 4: Run full SigningSheet + CabinetSheet tests — PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "refactor(signing-sheet): compose CabinetSheet chrome"
```

---

### Task 5: CabinetSidebar + Settings footer + orgSlot

**Files:**
- Create: `layouts/cabinet/CabinetSidebar.tsx`
- Create: `layouts/cabinet/__tests__/CabinetSidebar.test.tsx`
- Modify: `layouts/cabinet/index.ts`

**Interfaces:**

```ts
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
```

- [ ] **Step 1: Failing tests**

```tsx
it('renders section labels and settings link', () => {
  render(
    <CabinetSidebar
      brand={{ name: 'Nexum' }}
      sections={[{ id: 'root', items: [{ id: 'home', label: 'Home', href: '/' }] }]}
      settingsHref="/settings"
      settingsLabel="Settings"
      collapsed={false}
      onCollapsedChange={vi.fn()}
      collapseLabel="Collapse"
      expandLabel="Expand"
      linkComponent={({ to, children, ...p }) => <a href={to} {...p}>{children}</a>}
      isActive={(href) => href === '/'}
    />,
  );
  expect(screen.getByText('Home')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings');
});

it('omits org region when orgSlot is not passed', () => {
  const { container } = render(/* sidebar without orgSlot */);
  expect(container.querySelector('[data-slot="cabinet-org"]')).toBeNull();
});

it('renders orgSlot inside data-slot=cabinet-org when provided', () => {
  render(/* orgSlot={<div>Org</div>} */);
  expect(screen.getByText('Org').closest('[data-slot="cabinet-org"]')).not.toBeNull();
});
```

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement**

Visual reference: business `AppSidebar` — `w-64` / `w-14`, `bg-sidebar`, sticky `h-dvh`, `hidden md:flex`. Settings pinned at bottom above collapse control. Section labels hidden when `collapsed`. External items: `linkComponent` still used; app may pass `href` that opens new tab via its link adapter when `external`.

- [ ] **Step 4: PASS + commit**

```bash
git commit -m "feat(cabinet): add CabinetSidebar with orgSlot and settings pin"
```

---

### Task 6: CabinetTopbar + TabBar + MobileNavSheet

**Files:**
- Create: `layouts/cabinet/CabinetTopbar.tsx`
- Create: `layouts/cabinet/CabinetTabBar.tsx`
- Create: `layouts/cabinet/CabinetMobileNavSheet.tsx`
- Create: matching `__tests__`
- Modify: `layouts/cabinet/index.ts`

**Interfaces:**

```ts
export interface CabinetTopbarProps {
  breadcrumbs: CabinetBreadcrumb[];
  linkComponent: CabinetLinkComponent;
  theme: CabinetTheme;
  onThemeChange: (theme: CabinetTheme) => void;
  locale: CabinetLocale;
  onLocaleChange: (locale: CabinetLocale) => void;
  auth: CabinetAuth;
  labels: Pick<CabinetLabels, 'themeToLight' | 'themeToDark' | 'language'>;
}

export interface CabinetTabBarProps {
  items: CabinetNavItem[]; // app already filtered to mobile tabs
  menuLabel: string;
  onOpenMenu: () => void;
  linkComponent: CabinetLinkComponent;
  isActive: (href: string) => boolean;
}

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
```

- [ ] **Step 1: Tests**

Topbar: renders breadcrumb labels; has theme + locale + Sign In; **does not** render org/search/bell text.  
TabBar: renders tab labels + Menu button calling `onOpenMenu`.  
MobileNavSheet: left sheet lists nav items; closes on navigate click.

- [ ] **Step 2: Implement**

Topbar auth:
- `signed_out` → button `auth.signInLabel` → `onSignIn`
- `signed_in` → dropdown or button showing `label` + Sign Out action (`DropdownMenu` from primitives)

No hamburger in topbar on mobile if TabBar Menu is the single affordance (business pattern). Do **not** add a second menu button in topbar.

- [ ] **Step 3: PASS + commit**

```bash
git commit -m "feat(cabinet): add topbar, tab bar, and mobile nav sheet"
```

---

### Task 7: SettingsLayout + CabinetShell composer

**Files:**
- Create: `layouts/cabinet/SettingsLayout.tsx`
- Create: `layouts/cabinet/CabinetShell.tsx`
- Create: `__tests__/SettingsLayout.test.tsx`, `__tests__/CabinetShell.test.tsx`
- Create: `stories/CabinetShell.stories.tsx`
- Modify: `layouts/cabinet/index.ts`, `layouts/index.ts`

**Interfaces:**

```ts
export interface SettingsLayoutProps {
  title: string;
  subtitle?: string;
  sections: SettingsSection[];
  linkComponent: CabinetLinkComponent;
  isActive: (href: string) => boolean;
  children: ReactNode;
}

/** Throws in development / test if sections lack id `theme` and `language`. */
export function assertRequiredSettingsSections(sections: SettingsSection[]): void;

export interface CabinetShellProps {
  brand: CabinetBrand;
  sections: CabinetNavSection[];
  mobileTabItems: CabinetNavItem[];
  settingsHref: string;
  breadcrumbs: CabinetBreadcrumb[];
  auth: CabinetAuth;
  labels: CabinetLabels;
  theme: CabinetTheme;
  onThemeChange: (t: CabinetTheme) => void;
  locale: CabinetLocale;
  onLocaleChange: (l: CabinetLocale) => void;
  collapsed: boolean;
  onCollapsedChange: (c: boolean) => void;
  linkComponent: CabinetLinkComponent;
  isActive: (href: string) => boolean;
  orgSlot?: ReactNode;
  sidebarFooterSlot?: ReactNode;
  children: ReactNode;
}
```

- [ ] **Step 1: SettingsLayout tests**

```tsx
it('requires theme and language section ids', () => {
  expect(() =>
    assertRequiredSettingsSections([{ id: 'wallet', label: 'Wallet', href: '/settings/wallet' }]),
  ).toThrow(/theme/);
});

it('renders section nav and children', () => {
  render(
    <SettingsLayout
      title="Settings"
      sections={[
        { id: 'theme', label: 'Theme', href: '/settings/theme' },
        { id: 'language', label: 'Language', href: '/settings/language' },
      ]}
      linkComponent={({ to, children, ...p }) => <a href={to} {...p}>{children}</a>}
      isActive={() => false}
    >
      <div>Panel</div>
    </SettingsLayout>,
  );
  expect(screen.getByText('Theme')).toBeInTheDocument();
  expect(screen.getByText('Panel')).toBeInTheDocument();
});
```

Call `assertRequiredSettingsSections` inside `SettingsLayout` render.

- [ ] **Step 2: CabinetShell test**

Renders sidebar brand, topbar auth, main children, tab bar Menu opens mobile sheet.

- [ ] **Step 3: Implement CabinetShell layout**

```tsx
<div className="bg-background text-foreground flex min-h-dvh">
  <CabinetSidebar ... orgSlot={orgSlot} footerSlot={sidebarFooterSlot} />
  <div className="flex min-w-0 flex-1 flex-col">
    <CabinetTopbar ... />
    <main className="flex-1 p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-6 sm:p-6">
      {children}
    </main>
  </div>
  <CabinetTabBar ... onOpenMenu={() => setMobileOpen(true)} />
  <CabinetMobileNavSheet open={mobileOpen} onOpenChange={setMobileOpen} ... />
</div>
```

Shell owns only `mobileOpen` local state.

- [ ] **Step 4: `npm test && npm run lint` — PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(cabinet): add SettingsLayout and CabinetShell"
```

---

### Task 8: DS docs + release readiness

**Files:**
- Create: `docs/CabinetShell.md` (usage: config, orgSlot rules, persistence keys)
- Modify: `CHANGELOG.md` (changeset or changelog entry)
- Modify: spec status → `approved`

- [ ] **Step 1: Write usage doc with copy-paste consumer example** (Link adapter + persistence wiring)
- [ ] **Step 2: Run `npm test && npm run lint && npm run build`**
- [ ] **Step 3: Commit + open PR to `develop`**

```bash
git commit -m "docs(cabinet): document CabinetShell adoption contract"
```

**Phase A done when:** PR merged (or SHA available to pin) and Storybook shows CabinetShell / CabinetSheet.

---

### Task 9: Business — bump DS + providers (theme/locale)

**Repo:** `business/business-app-web` (worktree under `.ai-worktrees/business/business-app-web/...`)

**Files:**
- Modify: `src/design-system` submodule pin
- Modify: `src/app/AppProviders.tsx` — `defaultTheme={readCabinetTheme()}`, keep `enableSystem={false}`
- Modify: `src/i18n/index.ts`, `src/i18n/en.ts`, create `src/i18n/ru.ts`, `src/i18n/provider.tsx` — `Locale = 'en' | 'ru'`; init from `readCabinetLocale()`; `setLocale` calls `writeCabinetLocale`
- Test: provider unit test for locale persistence

- [ ] **Step 1: Update submodule to Phase A SHA**

```bash
cd src/design-system && git fetch origin && git checkout <phase-a-sha>
cd ../.. && git add src/design-system
```

- [ ] **Step 2: Failing test — locale `ru` round-trip via provider**
- [ ] **Step 3: Implement i18n + ThemeProvider default from persistence**
- [ ] **Step 4: `npm run ci:check` (may still fail until shell wired — at least i18n/theme tests green)**
- [ ] **Step 5: Commit** `feat(i18n): add ru locale and cabinet persistence keys`

---

### Task 10: Business — wire CabinetShell

**Files:**
- Create: `src/app/layouts/cabinetNav.ts`
- Create: `src/app/components/sidebar/OrgScopeSlot.tsx` (move entity switcher UI from `AppHeader`)
- Modify: `src/app/layouts/AppShell.tsx`
- Modify/Delete: `AppHeader.tsx` (remove ⌘K, bell, org, theme from topbar — breadcrumbs produced for shell)
- Delete usage of local `AppSidebar` / replace `MobileTabBar` with shell tabs fed from modules `mobile: true`
- Keep: `CommandPalette` mount **optional** — if kept, only via existing hotkey provider, **not** topbar (spec: not in topbar). Prefer leave `CommandPalette` mounted invisibly if already wired to keyboard; do not re-add search pill.
- Keep: `AuthGate`, `Toaster`, `SignerDevSwitcher`, `ScrollToTop`

**Interfaces:**
- Consumes: `CabinetShell`, persistence helpers, types from `@/design-system`

- [ ] **Step 1: Map modules → sections in `cabinetNav.ts`** (filter with `useFeatureFlags` in shell wrapper)
- [ ] **Step 2: Failing AppShell test — topbar has no notifications/search; org in `[data-slot=cabinet-org]`**
- [ ] **Step 3: Replace AppShell body with CabinetShell wiring**
- [ ] **Step 4: `npm run ci:check`**
- [ ] **Step 5: Commit** `feat(shell): adopt DS CabinetShell`

---

### Task 11: Business — SettingsLayout + Theme/Language pages + SignSheet

**Files:**
- Modify: `src/app/pages/settings/SettingsLayout.tsx` → re-export/wrap DS `SettingsLayout`
- Modify: `SettingsNav.tsx` / routes — ensure first sections `theme` + `language`
- Create: `sections/ThemeSection.tsx`, `sections/LanguageSection.tsx` using `ThemeToggle` / `LocaleSwitch`
- Modify: `SignSheet.tsx` → DS `SigningSheet` (same intent/step API as heth) or `CabinetSheet` if auth UI stays custom
- Update routes in `src/app/routes.tsx`

- [ ] **Step 1: Tests for required settings sections present**
- [ ] **Step 2: Implement**
- [ ] **Step 3: `npm run ci:check`**
- [ ] **Step 4: Commit** `feat(settings): DS SettingsLayout with theme and language`

---

### Task 12: Business — compose verify

- [ ] **Step 1:** `cd business/business-compose && ./docker_compose_up.sh`
- [ ] **Step 2:** Smoke checklist from spec (sidebar collapse, org in sidebar, topbar minimal, theme/lang sync, sign sheet right, mobile tabs)
- [ ] **Step 3:** Open PR to `develop` with notes + checklist results
- [ ] **Step 4:** Commit any compose/env doc fixes only if required (no secrets)

---

### Task 13: Heth — repoint DS submodule

**Files:** `.gitmodules`, `src/design-system`

- [ ] **Step 1:** Change url to `https://github.com/nexum-io/design-system-web.git`, branch `develop`
- [ ] **Step 2:** `git submodule sync && git submodule update --init --remote` (pin Phase A SHA)
- [ ] **Step 3:** Fix any import breakages from package drift (`npm run typecheck`)
- [ ] **Step 4:** Commit `chore(ds): point submodule at design-system-web`

---

### Task 14: Heth — CabinetShell + orgSlot

**Files:**
- Create: `src/app/layouts/cabinetNav.ts`
- Modify: `src/app/layouts/MainLayout.tsx` → CabinetShell (move Theme/Locale providers to `AppProviders` to avoid double wrap — **single** provider tree)
- Pass `OrgSwitcher` as `orgSlot`
- Add mobile tab items (pick primary routes from modules; include Menu)
- Wire theme/locale persistence like business

- [ ] **Step 1: Failing layout test — topbar present; org in sidebar slot**
- [ ] **Step 2: Implement**
- [ ] **Step 3: `npm run ci:check`**
- [ ] **Step 4: Commit** `feat(shell): adopt DS CabinetShell`

---

### Task 15: Heth — Settings + NewPaymentSheet on CabinetSheet

**Files:**
- Split `pages/settings/Settings.tsx` into layout + sections (currencies + theme + language)
- Modify: `NewPaymentSheet.tsx` to use `CabinetSheet` for chrome (keep payment form as children)
- Keep `SignSheet` on DS `SigningSheet`

- [ ] **Step 1–4:** TDD section routes, `ci:check`, commit `feat(settings): SettingsLayout and CabinetSheet payment`

---

### Task 16: Heth — compose verify `:8084`

- [ ] Smoke checklist + PR to `develop`

---

### Task 17: Escrow — repoint DS submodule

Same as Task 13 for `escrow-app-web`.

- [ ] Commit `chore(ds): point submodule at design-system-web`

---

### Task 18: Escrow — CabinetShell (no orgSlot)

**Files:**
- Create: `cabinetNav.ts` from `config/nav.ts`
- Replace `AppShell` internals; delete `Sidebar.tsx` / `ShellHeader.tsx` / `MobileNavSheet.tsx` after tests updated
- **Do not** pass `orgSlot`
- Preserve `DemoModeBanner`, `DataProvider`, wallet bootstrap, `SignerDevSwitcher`
- Theme/locale: remove duplicate controls from old header; use shell + persistence keys (migrate any old keys by reading once then writing new keys — **no dual-read fallback in steady state**; one-time migration function `migrateLegacyCabinetPrefs()` called at boot that copies old escrow keys if new keys absent, then stops)

- [ ] **Step 1: Test — `queryBy` cabinet-org is null**
- [ ] **Step 2: Implement**
- [ ] **Step 3: `npm run ci:check`**
- [ ] **Step 4: Commit** `feat(shell): adopt DS CabinetShell`

---

### Task 19: Escrow — SettingsLayout + sheets

**Files:**
- Restructure `Settings.tsx` / `Settings.view.tsx` into DS `SettingsLayout` with theme + language + existing wallet/notifications/currencies
- Confirm `SignSheet` / `MetaTxSheet` use `SigningSheet` → `CabinetSheet`
- Leave `DealActionModal` on `GradientDialog` unless it is a right-sheet UX (spec: right sheet flows only); do not force DealActionModal into CabinetSheet if it is centered dialog

- [ ] **Step 1–4:** tests, `ci:check`, commit

---

### Task 20: Escrow — compose verify `:8080`

- [ ] Smoke checklist + PR to `develop`
- [ ] Update spec status to `implemented` in DS repo after all three consumers land (follow-up commit)

---

## Self-review (plan vs spec)

| Spec requirement | Task |
|------------------|------|
| Chrome in DS | 1–8 |
| CabinetSheet + SigningSheet | 3–4 |
| Sidebar collapse, settings pin, orgSlot | 5, 10, 14, 18 |
| Minimal topbar | 6, 10, 14, 18 |
| Theme/locale persistence + defaults | 1–2, 9, 14, 18 |
| SettingsLayout + required sections | 7, 11, 15, 19 |
| Mobile tabs + nav sheet | 6, 10, 14, 18 |
| business/heth/escrow only | Phases B–D |
| Canonical DS submodule | 13, 17 |
| Compose verify | 12, 16, 20 |
| No dual shell fallback | 10, 14, 18 delete old chrome |
| Modals via DS for sheet flows | 4, 11, 15, 19 |

**Placeholder scan:** none intentional.  
**Type consistency:** `CabinetTheme` / `CabinetLocale` / `CabinetShellProps` locked at top; consumers use the same names.

---

## Execution handoff

Plan complete and saved to `common/design-system-web/docs/superpowers/plans/2026-08-02-unified-cabinet-shell.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
2. **Inline Execution** — execute tasks in this session with executing-plans checkpoints  

**Which approach?** Start with **Phase A / Task 1** only until DS PR is ready.
