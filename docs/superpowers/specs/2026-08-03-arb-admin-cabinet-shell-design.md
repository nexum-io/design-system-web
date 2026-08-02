# Arb + admin cabinet shell adoption

Date: 2026-08-03  
Status: approved (plan ready)  
Approach: A — same consumer pattern as user cabinets + additive `CabinetNavItem.badge`

Extends: [`2026-08-02-unified-cabinet-shell-design.md`](./2026-08-02-unified-cabinet-shell-design.md) (Phases A–D shipped; DS `@nexum-io/design-system@0.2.0`).

## Goal

Bring **escrow-admin-web** and **escrow-arbitrator-web** onto the same authenticated cabinet chrome as business / heth / escrow-app: DS `CabinetShell`, pinned Settings, theme + language in topbar and Settings, mobile tabs + nav sheet — with arb profile in `orgSlot` and live nav counts via optional badges.

## Scope

| In scope | Out of scope |
|----------|----------------|
| `design-system-web` additive `badge` on `CabinetNavItem` | Landing, processor, MS API changes |
| `escrow-admin-web` shell + SettingsLayout | Bulk page-dialog unification |
| `escrow-arbitrator-web` shell + SettingsLayout (theme/language only) | Arb profile/settings beyond theme/language |
| Submodule repoint `escrow-design-system` → `design-system-web` | npm publish follow-up for non-submodule consumers |
| Remove bespoke sidebar/header/user-menu chrome | Command palette button in topbar (hotkey may remain app-level) |
| Theme `light\|dark` only (no `system`) | Changing role gates / SSO contracts |

## Decisions (locked)

1. **Both apps** in one track (admin + arb).
2. **Strict chrome parity** with user cabinets.
3. **Settings:** both get pinned Settings + DS `SettingsLayout`; required sections theme + language; admin keeps profile section; arb theme/language only for this track.
4. **Arb extras:** profile widget via existing `orgSlot`; dispute/message counts via additive `badge`.
5. **Approach A:** thin app shells over DS; no shared escrow-shell package.

## Cross-product contract

### Producer

- Product / repo: common / `design-system-web` (`@nexum-io/design-system`)
- Surface: optional `CabinetNavItem.badge?: ReactNode` rendered in sidebar, mobile nav sheet, and mobile tab items when present

### Consumers

| Product | Repo | Change needed |
|---------|------|---------------|
| escrow admin | `escrow-admin-web` | Repoint DS submodule; replace `AdminAppShell` chrome with `CabinetShell`; Settings nested routes; drop Settings from main nav; no `orgSlot` |
| escrow arb | `escrow-arbitrator-web` | Same DS pin; replace `AppShell` chrome; `orgSlot` = profile card; map nav counts → `badge`; add Settings theme/language; enable mobile shell |

### Compatibility

- Strategy: **additive** DS API (`badge` optional; omission = current behavior)
- Consumers **replace** local shells in the same PR (no dual shell / no runtime fallback)
- Migration window: DS lands first on `develop`; each consumer bumps pin + migrates in one PR
- Rollback: revert consumer PR (old submodule + local shell); DS badge can remain unused

### Rollout order

1. `design-system-web` — `badge` + tests/stories + CabinetShell.md note + patch changeset
2. `escrow-admin-web` — simpler consumer (no orgSlot/badges)
3. `escrow-arbitrator-web` — profile slot + badges + new Settings pages

### Env / compose impact

- No new secrets
- Submodule remote change for admin + arb (same as heth / escrow-app migration)
- Local verify via `escrow-compose` (admin + arb published host ports)

## Architecture

```text
@nexum-io/design-system
  CabinetShell  (existing)
  CabinetNavItem.badge?  (new, additive)
        ▲
escrow-admin-web     escrow-arbitrator-web
  no orgSlot           orgSlot = profile widget
  no badges            badge = live counts
  Settings:            Settings:
    theme, language,     theme, language
    profile
```

### Boundaries

- **DS owns:** chrome, optional badge rendering, theme/locale control UI + persistence helpers (already shipped)
- **App owns:** nav registry, count data, profile widget content, auth session, Settings section bodies, CommandPalette / SignSheet / MetaTxSheet outside shell chrome
- **No hidden fallback UI:** no badge key → no badge; no `orgSlot` → no org region; invalid storage → explicit defaults (`light`, `en`)

## Chrome contract

| Surface | Behavior |
|---------|----------|
| Topbar | Breadcrumbs + ThemeToggle + LocaleSwitch + auth only |
| Sidebar | Collapsible; Settings pinned footer; brand; optional `orgSlot` |
| Mobile | Bottom tab bar + left nav sheet (`md` breakpoint, same as user cabinets) |
| Theme | `nexum.cabinet.theme`, `'light' \| 'dark'`, default `light`, no `system` |
| Locale | `nexum.cabinet.locale`, `'en' \| 'ru'`, default `en` |
| Auth | `CabinetAuth`; Sign In opens existing auth `SignSheet`; Sign Out existing session logout; wallet ≠ SSO (admin AGENTS unchanged) |

### Removed from chrome

- Admin/arb custom Sidebar, Header, UserMenu theme/locale/settings entries
- ⌘K / search control in topbar (arb `CommandPalette` may stay as keyboard shortcut only)
- System theme option
- Settings as a primary nav item (admin)

### Retained app-level (not shell)

- Arb: `CommandPalette`, `ShortcutsCheatsheet`, `SignerDevSwitcher`, `MetaTxSheet`, auth `SignSheet`
- Admin: auth `SignSheet`, page-level signer/deploy dialogs

## Navigation

### Admin main nav (no Settings)

Overview, Arbitration, Administrators, Application, Testing, Contracts, Signers.

`settingsHref="/settings"` via shell footer only.

### Arb main nav

Overview, Active, Escalated, Resolved, Deal create, Messages — with `badge` from existing count sources.

### Mobile tabs

Short primary subset (3–4 items + Menu via shell), not the full admin list. Exact keys chosen per app to match highest-traffic routes (document in implementation plan).

## Settings

| Route | Admin | Arb |
|-------|-------|-----|
| `/settings` | → `/settings/theme` | → `/settings/theme` |
| `/settings/theme` | required | required |
| `/settings/language` | required | required |
| `/settings/profile` | display name / accessId / lastSeen from current `AdminSettings` | — |

Use DS `SettingsLayout`. Nested `/settings/:section` pattern matching `escrow-app-web` (avoid hash-only sections).

Arb: remove `/settings` → overview redirect; ship real Settings pages.

## DS delta

```ts
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

Render rules:

- Expanded sidebar / mobile nav sheet: badge after label (end-aligned)
- Collapsed sidebar: compact indicator near icon; label remains `sr-only` when collapsed
- Tab bar: optional compact badge when item included in `mobileTabItems`

Changeset: **patch**. Update `docs/CabinetShell.md`. No auth/theme/locale contract changes.

## App migration notes

1. Submodule `src/design-system` → `https://github.com/nexum-io/design-system-web.git`, pin ≥ badge SHA (develop after DS PR).
2. Replace shell entry with thin wrapper modeled on `escrow-app-web` `AppShell`.
3. `ThemeProvider`: `storageKey={CABINET_THEME_KEY}`, `enableSystem={false}`, default light; sync with `readCabinetTheme` / `writeCabinetTheme` as in user apps.
4. Locale provider: read/write `CABINET_LOCALE_KEY`.
5. Delete dead chrome components once tests point at `CabinetShell`.
6. Admin: remove Settings from `ADMIN_NAV`; move profile UI into Settings section.
7. Arb: pass profile widget as `orgSlot`; map `count` / tone into `badge` nodes (tone styling stays app-owned ReactNode).

## Risks

| Risk | Mitigation |
|------|------------|
| Submodule remote change breaks CI cache / paths | Same migration path as heth/escrow-app; verify `ci:check` |
| Arb desktop-only layout regressions on mobile | Explicit mobile smoke; tab subset review |
| Badge visual clash with active nav styles | DS stories + arb screenshot/smoke |
| Actions cannot open Version Packages PRs | Manual PR from `changeset-release/*` if Release workflow needs it |
| Knip/dead code after chrome delete | Run knip/ci gate; remove orphans in same PR |

## Verification

- DS: unit tests for badge in sidebar / mobile sheet / tab bar; `npm test` / repo verify
- Admin: `npm run ci:check`; compose smoke — shell, settings theme/language/profile, sign-out
- Arb: `npm run ci:check`; compose smoke — shell, orgSlot profile, badges on Active/Escalated/Messages, settings theme/language, mobile menu
- No claim of green without running commands; note env gaps

## Definition of done

- Spec approved; implementation plan written
- DS badge merged; admin + arb PRs merged to `develop` with DS pin
- Bespoke chrome removed; Settings nested routes live
- Compose smoke evidence recorded in PR / handoff notes
