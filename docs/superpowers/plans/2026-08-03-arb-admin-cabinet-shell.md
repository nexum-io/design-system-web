# Arb + Admin Cabinet Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add optional nav badges to `@nexum-io/design-system`, then migrate `escrow-admin-web` and `escrow-arbitrator-web` onto `CabinetShell` with strict chrome parity (Settings pinned, theme/language, mobile tabs).

**Architecture:** Additive `CabinetNavItem.badge` in DS; thin app shells modeled on `escrow-app-web`; arb profile via `orgSlot`; admin Settings gains nested theme/language/profile. Submodule remote switches from `escrow-design-system` → `design-system-web`. Rollout: DS → admin → arb.

**Tech Stack:** React 19, Tailwind v4, next-themes, Vitest + Testing Library, Vite SPAs, git submodules, escrow-compose (`:8080` edge).

**Spec:** `docs/superpowers/specs/2026-08-03-arb-admin-cabinet-shell-design.md`

## Global Constraints

- Scope: `design-system-web`, `escrow-admin-web`, `escrow-arbitrator-web` only
- Theme: `'light' | 'dark'`; key `nexum.cabinet.theme`; default `light`; no `system`
- Locale: `'en' | 'ru'`; key `nexum.cabinet.locale`; default `en`
- Topbar: breadcrumbs + theme + locale + auth only (no ⌘K button, bell, org)
- Arb `orgSlot` = existing profile card content; admin omits `orgSlot`
- Settings: DS `SettingsLayout`; both apps require theme + language; admin also `/settings/profile`
- Mobile: bottom tab bar + left nav sheet at `md` (same DS shell)
- No dual shell / no runtime fallback to legacy chrome after migration
- Verify: DS `npm test`; each app `npm run ci:check` + compose smoke via `escrow-compose`
- Integration branch: `develop`; one PR per repo; producer first
- Worktrees: `nexum-io/.ai-worktrees/<product>/<repo>/ai-feature-arb-admin-cabinet/`

## Plan set (execute in order)

| Phase | Repo | Deliverable |
|-------|------|-------------|
| **A** Tasks 1–3 | `design-system-web` | `badge` API + docs + patch changeset |
| **B** Tasks 4–8 | `escrow-admin-web` | CabinetShell + Settings; compose smoke |
| **C** Tasks 9–13 | `escrow-arbitrator-web` | CabinetShell + orgSlot/badges + Settings; compose smoke |

Do not start Phase B until Phase A is merged (or submodule-pinnable). Do not start Phase C until Phase B verifies the API in admin.

## Locked public API (Phase A)

```ts
// layouts/cabinet/types.ts — additive field only
export interface CabinetNavItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  external?: boolean;
  /** Optional trailing badge (count, status). Omitted = no badge. */
  badge?: ReactNode;
}
```

### Locked mobile tab subsets

| App | `mobileTabItems` ids (in order) |
|-----|----------------------------------|
| admin | `admin-overview`, `admin-arbitration`, `admin-signers` |
| arb | `overview`, `active`, `escalated`, `messages` |

---

## File map

### Phase A — `design-system-web`

| File | Role |
|------|------|
| `layouts/cabinet/types.ts` | Add `badge?: ReactNode` |
| `layouts/cabinet/CabinetSidebar.tsx` | Render badge (expanded + collapsed) |
| `layouts/cabinet/CabinetMobileNavSheet.tsx` | Render badge |
| `layouts/cabinet/CabinetTabBar.tsx` | Compact badge near icon/label |
| `layouts/cabinet/__tests__/CabinetSidebar.test.tsx` | Badge tests |
| `layouts/cabinet/__tests__/CabinetMobileNavSheet.test.tsx` | Badge tests |
| `layouts/cabinet/__tests__/CabinetTabBar.test.tsx` | Badge tests |
| `docs/CabinetShell.md` | Document `badge` + arb/admin consumers |
| `.changeset/cabinet-nav-badge.md` | patch changeset |

### Phase B — `escrow-admin-web`

| File | Role |
|------|------|
| `.gitmodules` | URL → `design-system-web` |
| `src/design-system` | Submodule pin |
| `src/app/layouts/admin/AdminAppShell.tsx` | Thin `CabinetShell` wrapper |
| `src/app/layouts/admin/adminCabinetNav.ts` | Build sections + mobile tabs |
| `src/app/layouts/admin/AdminAppShell.test.tsx` | Shell assertions |
| `src/config/nav-admin.ts` | Remove Settings item |
| `src/config/nav-admin.test.ts` | Expect no `/settings` in main nav |
| `src/app/routes.tsx` | Nested `/settings/:section` |
| `src/app/pages/admin/AdminSettings.tsx` | SettingsLayout + theme/language/profile |
| `src/i18n/index.ts` (+ provider if needed) | `readCabinetLocale` / `writeCabinetLocale` |
| Delete after green | `AdminSidebar.tsx`, `AdminSidebarNav.tsx`, `AdminHeader.tsx`, `AdminUserMenu.tsx`, `AdminMobileNavSheet.tsx` (+ their tests if orphaned) |

### Phase C — `escrow-arbitrator-web`

| File | Role |
|------|------|
| `.gitmodules` | URL → `design-system-web` |
| `src/design-system` | Submodule pin |
| `src/app/layouts/AppShell.tsx` | Thin `CabinetShell` wrapper |
| `src/app/layouts/cabinetNav.ts` | Sections + badges + mobile tabs |
| `src/app/layouts/ArbProfileSlot.tsx` | Profile card for `orgSlot` |
| `src/app/layouts/AppShell.test.tsx` | Create/update |
| `src/app/routes.tsx` | Real Settings routes (remove redirect) |
| `src/app/pages/Settings.tsx` (new) | SettingsLayout theme/language |
| `src/i18n/index.ts` | Cabinet locale persistence |
| Keep outside shell | `CommandPalette`, `ShortcutsCheatsheet`, `SignerDevSwitcher`, sheets |
| Delete after green | `Sidebar.tsx`, `Header.tsx`, `UserMenu.tsx` (+ orphaned tests) |

---

## Phase A — design-system-web

### Task 1: `CabinetNavItem.badge` + sidebar/mobile rendering

**Files:**
- Modify: `layouts/cabinet/types.ts`
- Modify: `layouts/cabinet/CabinetSidebar.tsx`
- Modify: `layouts/cabinet/CabinetMobileNavSheet.tsx`
- Modify: `layouts/cabinet/__tests__/CabinetSidebar.test.tsx`
- Modify: `layouts/cabinet/__tests__/CabinetMobileNavSheet.test.tsx`

**Interfaces:**
- Consumes: existing `CabinetNavItem`, sidebar/mobile props
- Produces: `CabinetNavItem.badge?: ReactNode` rendered when present

- [ ] **Step 1: Write failing sidebar test**

Add to `CabinetSidebar.test.tsx`:

```tsx
it('renders item.badge after the label when provided', () => {
  render(
    <CabinetSidebar
      {...defaultProps}
      sections={[
        {
          id: 'main',
          items: [
            {
              id: 'active',
              label: 'Active',
              href: '/active',
              badge: <span data-testid="nav-badge">3</span>,
            },
          ],
        },
      ]}
    />,
  );
  expect(screen.getByTestId('nav-badge')).toHaveTextContent('3');
});

it('omits badge region when badge is undefined', () => {
  const { container } = render(<CabinetSidebar {...defaultProps} />);
  expect(container.querySelector('[data-slot="cabinet-nav-badge"]')).toBeNull();
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd /path/to/design-system-web && npm test -- layouts/cabinet/__tests__/CabinetSidebar.test.tsx
```

Expected: FAIL (badge not rendered / slot missing).

- [ ] **Step 3: Extend type**

In `layouts/cabinet/types.ts` add to `CabinetNavItem`:

```ts
  /** Optional trailing badge (count, status). Omitted = no badge. */
  badge?: ReactNode;
```

- [ ] **Step 4: Render badge in `CabinetSidebar`**

Inside each nav `Link`, after the label span:

```tsx
{item.badge != null ? (
  <span
    data-slot="cabinet-nav-badge"
    className={cx('ms-auto shrink-0', collapsed && 'absolute end-1 top-1')}
  >
    {item.badge}
  </span>
) : null}
```

When `collapsed`, wrap the link content so the badge can sit as a compact indicator (`relative` on the link). Keep label `sr-only` when collapsed (existing behavior).

- [ ] **Step 5: Same badge slot in `CabinetMobileNavSheet`**

Mirror sidebar markup (no collapsed mode): label + optional `data-slot="cabinet-nav-badge"`.

- [ ] **Step 6: Mobile sheet test**

```tsx
it('renders nav item badge', () => {
  render(
    <CabinetMobileNavSheet
      {...defaultProps}
      open
      sections={[
        {
          id: 'main',
          items: [
            {
              id: 'active',
              label: 'Active',
              href: '/active',
              badge: <span data-testid="m-badge">2</span>,
            },
          ],
        },
      ]}
    />,
  );
  expect(screen.getByTestId('m-badge')).toHaveTextContent('2');
});
```

- [ ] **Step 7: Run cabinet layout tests**

```bash
npm test -- layouts/cabinet
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add layouts/cabinet
git commit -m "$(cat <<'EOF'
feat(cabinet): optional CabinetNavItem.badge in sidebar and mobile nav

EOF
)"
```

---

### Task 2: Tab bar badge + docs + changeset

**Files:**
- Modify: `layouts/cabinet/CabinetTabBar.tsx`
- Modify: `layouts/cabinet/__tests__/CabinetTabBar.test.tsx`
- Modify: `docs/CabinetShell.md`
- Create: `.changeset/cabinet-nav-badge.md`

**Interfaces:**
- Consumes: `CabinetNavItem.badge`
- Produces: compact badge in tab items; docs for arb/admin

- [ ] **Step 1: Failing tab bar test**

```tsx
it('renders compact badge on tab items when provided', () => {
  render(
    <CabinetTabBar
      {...defaultProps}
      items={[
        {
          id: 'active',
          label: 'Active',
          href: '/active',
          badge: <span data-testid="tab-badge">4</span>,
        },
      ]}
    />,
  );
  expect(screen.getByTestId('tab-badge')).toHaveTextContent('4');
});
```

- [ ] **Step 2: Implement compact badge in `CabinetTabBar`**

Relative wrap around icon+label; badge absolute top-end of the tab item with `data-slot="cabinet-nav-badge"`. Do not change Menu button.

- [ ] **Step 3: Update `docs/CabinetShell.md`**

- Expand intro list: include **escrow-admin-web** and **escrow-arbitrator-web**.
- Add section:

```md
## Nav badges

`CabinetNavItem.badge?: ReactNode` is optional. When set, DS renders it in the
sidebar, mobile nav sheet, and tab bar (`data-slot="cabinet-nav-badge"`).
Tone/count markup is app-owned. Omit the prop for no badge.
```

- Note arb may pass profile UI via `orgSlot` (same rules as business/heth).

- [ ] **Step 4: Changeset**

`.changeset/cabinet-nav-badge.md`:

```md
---
"@nexum-io/design-system": patch
---

Add optional `CabinetNavItem.badge` for sidebar, mobile nav, and tab bar counts.
```

- [ ] **Step 5: Verify + commit**

```bash
npm test && npm run lint
git add layouts/cabinet docs/CabinetShell.md .changeset/cabinet-nav-badge.md
git commit -m "$(cat <<'EOF'
feat(cabinet): tab-bar badges, docs, and patch changeset

EOF
)"
```

---

### Task 3: Open DS PR and merge to `develop`

**Files:** none (git/GitHub only)

- [ ] **Step 1: Push branch + open PR**

Base: `develop`. Title: `feat(cabinet): optional nav item badges`.

Body must mention consumers admin + arb and link the spec.

- [ ] **Step 2: Wait for CI `verify`, merge** (admin squash if REVIEW_REQUIRED)

- [ ] **Step 3: Note tip SHA** for consumer pins (e.g. `git rev-parse HEAD` on develop)

- [ ] **Step 4: If Release pushes `changeset-release/develop` but cannot open PR**, open Version Packages PR manually (same as 0.2.0) — optional for this track if consumers pin SHA; do not block Phase B on npm publish

---

## Phase B — escrow-admin-web

### Task 4: Repoint design-system submodule

**Files:**
- Modify: `.gitmodules`
- Update: `src/design-system` submodule checkout

- [ ] **Step 1: Worktree from `develop`**

```bash
# from nexum-io workspace
./ai-infrastructure/scripts/create-agent-worktree.sh \
  --product escrow --repo escrow-admin-web \
  --type feature --task arb-admin-cabinet
```

- [ ] **Step 2: Repoint submodule**

```bash
# in worktree
git submodule deinit -f src/design-system
rm -rf .git/modules/src/design-system src/design-system
git submodule add --force https://github.com/nexum-io/design-system-web.git src/design-system
cd src/design-system && git fetch origin develop && git checkout <PHASE_A_SHA>
cd ../..
# ensure .gitmodules url is design-system-web (not escrow-design-system)
npm ci
```

- [ ] **Step 3: Confirm exports**

```bash
node -e "const ds=require('./src/design-system/package.json'); console.log(ds.name, ds.version)"
# Typecheck will prove CabinetShell resolves in Task 5
```

- [ ] **Step 4: Commit pin**

```bash
git add .gitmodules src/design-system package-lock.json
git commit -m "$(cat <<'EOF'
chore(ds): point submodule at design-system-web for CabinetShell

EOF
)"
```

---

### Task 5: Admin `CabinetShell` + nav helper

**Files:**
- Create: `src/app/layouts/admin/adminCabinetNav.ts`
- Modify: `src/app/layouts/admin/AdminAppShell.tsx`
- Modify: `src/app/layouts/admin/AdminAppShell.test.tsx`
- Modify: `src/config/nav-admin.ts`
- Modify: `src/config/nav-admin.test.ts`
- Modify: `src/i18n/index.ts` (cabinet locale persistence — mirror escrow-app-web)

**Interfaces:**
- Consumes: `CabinetShell`, `CABINET_THEME_KEY`, `readCabinetLocale`, `ADMIN_NAV` without settings
- Produces: shell chrome; `buildAdminCabinetNav(t)` → `{ sections, mobileTabItems }`

- [ ] **Step 1: Remove Settings from `ADMIN_NAV`**

Delete the `admin-settings` entry. Update `nav-admin.test.ts` so `/settings` is **not** in paths and last item is `/signers`.

- [ ] **Step 2: Create `adminCabinetNav.ts`**

```ts
import type { CabinetNavItem, CabinetNavSection } from '@/design-system';
import { ADMIN_NAV } from '@/config/nav-admin';
import { getIcon } from '@/config/icon-map';

const MOBILE_TAB_KEYS = ['admin-overview', 'admin-arbitration', 'admin-signers'] as const;

export function buildAdminCabinetNav(t: (key: string) => string): {
  sections: CabinetNavSection[];
  mobileTabItems: CabinetNavItem[];
} {
  const items: CabinetNavItem[] = ADMIN_NAV.map((item) => ({
    id: item.key,
    label: t(item.labelKey),
    href: item.path,
    icon: getIcon(item.icon),
  }));
  const mobileTabItems = MOBILE_TAB_KEYS.map(
    (key) => items.find((item) => item.id === key)!,
  );
  return {
    sections: [{ id: 'admin', items }],
    mobileTabItems,
  };
}
```

- [ ] **Step 3: Rewrite `AdminAppShell.tsx`**

Pattern: `escrow-app-web/src/app/layouts/AppShell.tsx`.

Required wiring:

- `ThemeProvider` with `attribute="class"`, `defaultTheme={readCabinetTheme()}`, `enableSystem={false}`, `storageKey={CABINET_THEME_KEY}`
- `LocaleProvider` unchanged wrapper; locale state backed by cabinet helpers in `src/i18n/index.ts`
- Inner: `CabinetShell` with brand, `sections`, `mobileTabItems`, `settingsHref="/settings"`, breadcrumbs from active nav, `CabinetAuth` from admin session (sign-out existing; signed-out should not appear inside RoleGate cabinet — still type correctly)
- `linkComponent`: react-router `Link`/`NavLink` adapter
- `window.scrollTo({ top: 0 })` on pathname change (CabinetShell uses document scroll, not inner main)
- Keep `Toaster`; remove grid/`AdminSidebar`/`AdminHeader`/`AdminMobileNavSheet`

- [ ] **Step 4: Update `AdminAppShell.test.tsx`**

Assert `[data-slot="cabinet-sidebar"]`, `[data-slot="cabinet-topbar"]`, no `cabinet-org`, Settings footer link present. Drop assertions that depend on old header hamburger-only chrome if obsolete.

- [ ] **Step 5: Run tests**

```bash
npm run ci:check
```

Expected: PASS (Settings page may still be old — fix compile breaks only; Task 6 finishes Settings).

If AdminSettings still imports deleted chrome types, keep files until Task 6/7.

- [ ] **Step 6: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(shell): adopt CabinetShell for admin cabinet chrome

EOF
)"
```

---

### Task 6: Admin SettingsLayout (theme / language / profile)

**Files:**
- Modify: `src/app/routes.tsx`
- Modify: `src/app/pages/admin/AdminSettings.tsx`
- Modify: i18n keys under `src/i18n/en/*` and `src/i18n/ru/*` as needed
- Test: extend or add `AdminSettings` test if present; else shell/settings smoke via unit test on section routing

- [ ] **Step 1: Routes**

Replace flat `settings` route with:

```ts
{ path: 'settings', element: <Navigate to="/settings/theme" replace /> },
{
  path: 'settings/:section',
  lazy: lazyComponent(() => import('...AdminSettings'), 'AdminSettings'),
},
```

(Use the repo’s existing lazy helper style.)

- [ ] **Step 2: Rewrite `AdminSettings` with `SettingsLayout`**

Sections: `theme`, `language`, `profile` (icons `Palette`, `Languages`, `User`).

- Invalid/`undefined` section → `<Navigate to="/settings/theme" replace />`
- Theme section: `ThemeToggle` + `setTheme` from `next-themes`
- Language section: `LocaleSwitch` + `setLocale`
- Profile section: migrate existing display-name form / accessId / lastSeen from current page body

Mirror structure of `escrow-app-web/src/app/pages/Settings.view.tsx` (without wallet/notifications/currencies).

- [ ] **Step 3: i18n**

Ensure keys exist for settings nav labels and theme/language copy (reuse `pages.admin.settings.*` where possible; add appearance keys if missing). Run `npm run i18n:validate`.

- [ ] **Step 4: Unit test section routing**

```tsx
it('renders theme section on /settings/theme', async () => {
  // memory router → /settings/theme, expect ThemeToggle / appearance heading
});
it('redirects unknown section to theme', async () => {
  // /settings/nope → theme
});
```

- [ ] **Step 5: `npm run ci:check` + commit**

```bash
git commit -m "$(cat <<'EOF'
feat(settings): nested SettingsLayout with theme, language, profile

EOF
)"
```

---

### Task 7: Delete dead admin chrome + knip/ci clean

**Files:**
- Delete: `AdminSidebar.tsx`, `AdminSidebarNav.tsx`, `AdminHeader.tsx`, `AdminUserMenu.tsx`, `AdminMobileNavSheet.tsx` and obsolete tests
- Fix any remaining imports

- [ ] **Step 1: Delete files; fix references**
- [ ] **Step 2: `npm run ci:check`**
- [ ] **Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
chore(shell): remove legacy admin sidebar/header chrome

EOF
)"
```

---

### Task 8: Admin PR + compose smoke

- [ ] **Step 1: Push + PR → `develop`**

Title: `feat(shell): unified CabinetShell for admin web`

- [ ] **Step 2: Compose**

```bash
cd escrow/escrow-compose && ./docker_compose_up.sh
# rebuild admin web image if needed
```

Smoke (browser): `http://admin.escrow.nexum.localhost:8080` — sidebar collapse, topbar theme/locale, Settings theme/language/profile, mobile width menu/tabs, sign-out.

- [ ] **Step 3: Merge when CI green** (admin squash if required)
- [ ] **Step 4: Record tip SHA / PR URL for handoff**

---

## Phase C — escrow-arbitrator-web

### Task 9: Repoint design-system submodule

Same steps as Task 4, for `escrow-arbitrator-web`, pin **same** Phase A SHA (or newer develop if admin already forced a newer pin — prefer single SHA across admin+arb).

```bash
./ai-infrastructure/scripts/create-agent-worktree.sh \
  --product escrow --repo escrow-arbitrator-web \
  --type feature --task arb-admin-cabinet
```

Commit: `chore(ds): point submodule at design-system-web for CabinetShell`

---

### Task 10: Arb cabinet nav + profile slot + AppShell

**Files:**
- Create: `src/app/layouts/cabinetNav.ts`
- Create: `src/app/layouts/ArbProfileSlot.tsx`
- Modify: `src/app/layouts/AppShell.tsx`
- Create/Modify: `src/app/layouts/AppShell.test.tsx`
- Modify: `src/i18n/index.ts` for cabinet locale

**Interfaces:**
- Consumes: `useDisputes()` counts, session profile, `NAV`, `CabinetShell`
- Produces: badged nav items; `orgSlot={<ArbProfileSlot />}`

- [ ] **Step 1: Extract profile UI into `ArbProfileSlot.tsx`**

Move the profile card block from current `Sidebar.tsx` (initials, name, accessId, StatusBadge). No nav inside the slot.

- [ ] **Step 2: `cabinetNav.ts` with badges**

Reuse tone classes from old Sidebar:

```ts
const TONE_CLASSES: Record<CountTone, string> = {
  brand: 'bg-brand text-brand-fg',
  warning: 'bg-warning-subtle text-warning-fg',
  danger: 'bg-danger-subtle text-danger-fg',
  info: 'bg-info-subtle text-info-fg',
};

function countBadge(count: number, tone: CountTone): ReactNode {
  if (count <= 0) return undefined;
  return (
    <span className={cn('rounded-full px-1.5 text-[10px] font-semibold', TONE_CLASSES[tone])}>
      {count}
    </span>
  );
}
```

Map:

- `active` → `active.length`
- `escalated` → `escalated.length`
- `messages` → `0` for now (same as current Sidebar)
- Do **not** invent waiting nav item (not in `NAV`)

`mobileTabItems`: ids `overview`, `active`, `escalated`, `messages`.

- [ ] **Step 3: Rewrite `AppShell.tsx`**

- Providers: ThemeProvider with `CABINET_THEME_KEY` / `readCabinetTheme`; LocaleProvider; DataProvider; Toaster
- `CabinetShell` + `orgSlot={<ArbProfileSlot />}`
- Auth from session (signed-in label; sign-out)
- Keep mounting `CommandPalette`, `ShortcutsCheatsheet`, `SignerDevSwitcher` **siblings** of shell (not in topbar)
- Scroll: `window.scrollTo` on route change

- [ ] **Step 4: Tests**

```tsx
it('renders CabinetShell with org slot', () => {
  // expect cabinet-sidebar, cabinet-org, cabinet-topbar
});
```

- [ ] **Step 5: `npm run ci:check` (may fail until Settings routes — Task 11)**  

If `/settings` redirect still present, shell footer link is OK. Commit shell when typecheck/tests for shell pass.

```bash
git commit -m "$(cat <<'EOF'
feat(shell): adopt CabinetShell with profile slot and nav badges

EOF
)"
```

---

### Task 11: Arb Settings (theme + language)

**Files:**
- Modify: `src/app/routes.tsx` — remove `hiddenRedirect` for settings
- Create: `src/app/pages/Settings.tsx` (or `Settings.view.tsx` + thin page)
- i18n keys for settings appearance
- Tests for section routing

- [ ] **Step 1: Routes**

```ts
{ path: 'settings', element: <Navigate to="/settings/theme" replace /> },
{ path: 'settings/:section', lazy: /* Settings */ },
```

- [ ] **Step 2: Settings page**

Only sections `theme` and `language` via `SettingsLayout` + `ThemeToggle` + `LocaleSwitch`.

- [ ] **Step 3: i18n validate + unit tests**
- [ ] **Step 4: `npm run ci:check` + commit**

```bash
git commit -m "$(cat <<'EOF'
feat(settings): arb SettingsLayout with theme and language

EOF
)"
```

---

### Task 12: Delete legacy arb chrome

**Files:**
- Delete: `Sidebar.tsx`, `Header.tsx`, `UserMenu.tsx` (+ obsolete tests)
- Fix imports; run knip/ci if configured (`guard:all` only if still required by `ci:check` — do not expand guard scope)

- [ ] **Step 1: Delete + fix**
- [ ] **Step 2: `npm run ci:check`**
- [ ] **Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
chore(shell): remove legacy arbitrator sidebar/header chrome

EOF
)"
```

---

### Task 13: Arb PR + compose smoke

- [ ] **Step 1: PR → `develop`**

Title: `feat(shell): unified CabinetShell for arbitrator web`

- [ ] **Step 2: Compose smoke** on `http://arbitrator.escrow.nexum.localhost:8080` (confirm hostname in compose/nginx docs if naming differs — use the host from `escrow-compose` nginx conf)

Check: profile `orgSlot`, badges on Active/Escalated, Settings theme/language, topbar theme/locale, mobile tabs/menu, CommandPalette still opens via hotkey, MetaTx/Sign sheets unchanged on their pages.

- [ ] **Step 3: Merge; cleanup worktrees; update spec status to implemented**

In `docs/superpowers/specs/2026-08-03-arb-admin-cabinet-shell-design.md` set `Status: implemented` (DS PR in same or follow-up docs commit on DS repo if preferred).

---

## Spec coverage checklist (self-review)

| Spec requirement | Task |
|------------------|------|
| `badge?: ReactNode` additive API | 1–2 |
| Sidebar / mobile / tab badge render | 1–2 |
| CabinetShell.md + patch changeset | 2 |
| DS first merge | 3 |
| Admin submodule → design-system-web | 4 |
| Admin CabinetShell strict chrome | 5 |
| Admin Settings theme/language/profile nested | 6 |
| Remove admin Settings from main nav | 5 |
| Delete admin legacy chrome | 7 |
| Admin compose smoke | 8 |
| Arb submodule pin | 9 |
| Arb orgSlot profile + badges | 10 |
| Arb Settings theme/language | 11 |
| Delete arb legacy chrome | 12 |
| Arb compose smoke; CommandPalette hotkey retained | 13 |
| No system theme; cabinet persistence keys | 5, 6, 10, 11 |
| Rollout DS → admin → arb | Phases A–C |
| Non-goals (MS APIs, npm consumers, arb profile settings) | not tasked |

## Placeholder scan

None intentional. Hostname for arb SPA must be taken from live `escrow-compose` nginx conf at smoke time (Step 13) — if docs disagree, prefer nginx `server_name`.
