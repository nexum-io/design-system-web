# Unified product cabinet shell

Date: 2026-08-02  
Status: approved  
Approach: composable DS primitives + thin `CabinetShell` (Approach 2)

## Goal

Make authenticated user cabinets for **business**, **heth**, and **escrow** visually and structurally identical on one platform: collapsible left sidebar (Settings pinned at bottom), minimal topbar, mobile tab bar, shared right slide-over sheet chrome, shared Settings layout, theme + language controls — all owned by `@nexum-io/design-system`, with product content wired through explicit config and slots.

## Scope

| In scope | Out of scope |
|----------|----------------|
| `business-app-web`, `heth-app-web`, `escrow-app-web` | `escrow-arbitrator-web`, `escrow-admin-web` |
| Cabinet chrome in DS | Landing, native (heth iOS) |
| Shell-adjacent Dialog / `CabinetSheet` / auth-sign / payment sheets | Bulk refactor of unrelated page dialogs |
| Theme + language in topbar and Settings | Command palette / notifications in topbar |
| Org widget in sidebar where product already has org | Org for escrow |

## Cross-product contract

### Producer

- Product / repo: common / `design-system-web` (`@nexum-io/design-system`)
- Surface: cabinet layout primitives + sheet chrome + settings layout + theme/locale control components

### Consumers

| Product | Repo | Change needed |
|---------|------|---------------|
| business | `business-app-web` | Adopt `CabinetShell`; move org from topbar to sidebar `orgSlot`; drop ⌘K/bell from topbar; wire theme/locale; SettingsLayout; SignSheet on `CabinetSheet` |
| heth | `heth-app-web` | Replace `MainLayout` with `CabinetShell` + topbar; keep OrgSwitcher as `orgSlot`; mobile tabs; SettingsLayout; payment sheet on `CabinetSheet`; point submodule to canonical DS |
| escrow | `escrow-app-web` | Replace local AppShell chrome; no `orgSlot`; collapsible sidebar; SettingsLayout; sign/deal sheets on `CabinetSheet`; point submodule to canonical DS |

### Compatibility

- Strategy: **additive** DS exports; consumers **replace** local shells in the same PR (no dual AppShell / no runtime fallback to old chrome)
- Migration window: DS lands first on `develop`; each consumer bumps DS pin and migrates in one PR per repo
- Rollback: revert consumer PR (restores previous submodule pin + local shell); DS chrome can remain unused

### Rollout order

1. `design-system-web` — primitives, stories, unit tests
2. `business-app-web` — reference consumer (compose `:8085`)
3. `heth-app-web` — compose `:8084`
4. `escrow-app-web` — compose `:8080`

### Env / compose impact

- No new secrets
- Submodule / package pin: all three apps use canonical `nexum-io/design-system-web` on `develop` (heth/escrow migrate off `escrow-design-system` remote if still pointed there)
- Local verify via each product `*-compose` `./docker_compose_up.sh`

## Architecture

```text
@nexum-io/design-system
  CabinetShell
  ├─ CabinetSidebar (collapsible, groups, Settings pinned)
  ├─ CabinetTopbar (breadcrumbs, theme, locale, auth)
  ├─ CabinetTabBar + MobileNavSheet (< md)
  ├─ CabinetSheet (+ SigningSheet uses same chrome)
  └─ SettingsLayout (sub-nav + content)
        ▲ config / slots / callbacks only
business | heth | escrow  (nav, orgSlot?, auth, pages, product settings)
```

### Boundaries

- **DS owns:** chrome structure, tokens, sheet/dialog primitives, theme/locale control UI
- **App owns:** nav registry, feature-flag filtering before pass-in, org data/API, auth session, page content, product-specific settings sections
- **No hidden fallback UI:** omitted optional slot (`orgSlot`) means no slot; omitted nav section means absent; invalid storage values reset to defaults explicitly

## Components

| Component | Responsibility | Explicit API notes |
|-----------|----------------|--------------------|
| `CabinetShell` | Composes sidebar + topbar + main + mobile | `nav`, `brand`, `breadcrumbs`, `auth`, `orgSlot?`, `children` |
| `CabinetSidebar` | Collapsible rail; groups; Settings at bottom | `sections[]`, collapse state, `footer`, `orgSlot?` |
| `CabinetTopbar` | Sticky header | **Only** breadcrumbs + theme + locale + auth |
| `CabinetTabBar` + `MobileNavSheet` | Mobile nav | Same nav model as sidebar |
| `CabinetSheet` | Right slide-over chrome | `open`, `onOpenChange`, `title`, `description?`, `footer?`, `children`, size tokens |
| `SigningSheet` | Existing DS block | Refactor to use `CabinetSheet` chrome; no parallel visual variants |
| `SettingsLayout` | Settings sub-nav + content | App supplies `sections[]`; **theme** and **language** required |
| `ThemeToggle` / `LocaleSwitch` | Shared controls | Controlled `value` + `onChange`; labels passed from app |

### App-owned (not in DS)

- Nav registries (`modules.ts` / `APP_MODULES` / `USER_NAV`)
- Org: business entity scope + heth `OrgSwitcher` as `orgSlot`
- Auth callbacks and sign content inside `CabinetSheet`
- Product settings beyond theme/language
- Page-level layouts (e.g. escrow deal sticky action column) — unchanged as page content; action sheets use `CabinetSheet`

### Removed from apps after migration

- Local `AppShell` / `MainLayout` / `ShellHeader` / duplicate sidebar chrome
- Business org switcher in topbar
- ⌘K pill and notifications bell from unified topbar

## Data flow

### Theme

- Storage key: `nexum.cabinet.theme`
- Values: `'light' \| 'dark'` only (no `system`, no `enableSystem`)
- Default if missing/invalid: `'light'` (rewrite invalid key once)
- Topbar and Settings write the same store; one `ThemeProvider` per cabinet root

### Locale

- Storage key: `nexum.cabinet.locale`
- Values: `'en' \| 'ru'`
- Default if missing/invalid: `'en'`
- Topbar and Settings share the same store → app `LocaleProvider`
- Shell chrome labels: **passed from app** (DS does not ship a hidden i18n fallback dictionary for cabinet chrome)

### Auth

- Topbar `auth`: `{ status: 'signed_in' \| 'signed_out', label, onSignIn, onSignOut, menuItems? }`
- Session/JWT/SSO remain in each app; DS has no SSO knowledge
- Sign In opens app content in `CabinetSheet`

### Nav

- App passes `nav.sections[]` with items `{ id, label, href, icon, external? }`
- Feature flags applied in app **before** passing to shell
- Active state: app provides `pathname` or `isActive(href)`

### Org

- `orgSlot?: ReactNode` — business + heth only
- Escrow omits slot → no org UI

### Settings

- Router owns `/settings/:section`
- Theme + language always present in section config
- Other sections product-specific

## Error handling

- Invalid theme/locale in storage → reset to default and persist (explicit, not silent coerce to system)
- Missing required shell props → TypeScript compile failure
- Auth/org/domain errors render inside app content / `orgSlot` / sheet body — shell does not mask them
- Wrong DS pin → build failure; never silent old chrome at runtime

## Testing & verification

### DS

- Unit + Storybook: sidebar collapse, topbar controls, `CabinetSheet`, `SettingsLayout` required sections, theme/locale toggles, `SigningSheet` on `CabinetSheet`

### Each app

- Existing `ci:check` / unit/smoke gates
- Targeted wiring tests: `orgSlot` presence (business/heth) / absence (escrow); theme/lang sync; sheets use `CabinetSheet`

### Local compose (mandatory order)

1. DS package gate
2. `business-compose` → `http://business.nexum.localhost:8085/`
3. `heth-compose` → `http://app.heth.nexum.localhost:8084/`
4. `escrow-compose` → `http://app.escrow.nexum.localhost:8080/`

### Compose smoke checklist (each cabinet)

- [ ] Sidebar collapses; Settings at bottom
- [ ] Topbar: breadcrumbs, theme, language, Sign In/Out only
- [ ] Theme toggle persists; Settings theme matches; default light for new profile
- [ ] Language EN/RU persists; Settings language matches; default EN
- [ ] Org in sidebar (business, heth) / absent (escrow)
- [ ] Right sheet (sign / payment / deal sign) uses shared chrome
- [ ] Mobile: bottom tab bar + left nav sheet
- [ ] No regression on primary authenticated routes

## Non-goals

- Unifying arbiter/admin shells
- Putting product domain flows into DS beyond sheet chrome
- Keeping parallel legacy shells “just in case”
- Topbar command palette / notifications in this wave

## Decisions log

| Topic | Decision |
|-------|----------|
| Scope | User cabinets only (A) |
| Right panel meaning | Right slide-over sheet (sign/payment), not permanent rail |
| Shell home | `@nexum-io/design-system` (A) |
| Org | Sidebar slot for business + heth; escrow none (A) |
| Topbar | Breadcrumbs + theme + lang + auth (A) |
| Theme default | `localStorage`, else light (C) |
| Locale | EN/RU, `localStorage`, default EN (A) |
| Sheet | `CabinetSheet` chrome; content in apps; `SigningSheet` specialized (A) |
| Mobile | Business pattern: tabs + nav sheet (A) |
| Settings | Shared `SettingsLayout`; app sections; theme+language required (B) |
| Implementation approach | Composable primitives + thin shell (2) |
