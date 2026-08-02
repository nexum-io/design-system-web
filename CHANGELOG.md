# Changelog

## 0.2.1

### Patch Changes

- 9fa1d18: Render `CabinetNavItem.external` as new-tab anchors in sidebar and mobile nav.
- 8c05889: Add optional `CabinetNavItem.badge` for sidebar, mobile nav, and tab bar counts.

## 0.2.0

### Minor Changes

- 6a8c3bb: Add SigningSheet block: a presentation-only right-side sheet for wallet signing
  flows (auth, connect-only, operation intents) with a built-in step indicator
  (idle/review/connect_wallet/signing/executing/completed/failed), busy close
  guard, close-confirm interception, and identity-based state reset. Add
  SigningConfirmDialog building block (confirm and confirm-with-reason with
  required-reason validation and double-submit prevention). SheetContent gains an
  optional hideCloseButton prop.
- 6517f16: Add unified cabinet shell layout: responsive sidebar/topbar/tab-bar navigation,
  theme and locale persistence helpers, settings layout, and adoption documentation.

## Unreleased

### Minor Changes

- **Cabinet shell (Phase A):** add unified authenticated cabinet layout exports —
  `CabinetShell`, `CabinetSidebar`, `CabinetTopbar`, `CabinetTabBar`,
  `CabinetMobileNavSheet`, `CabinetSheet`, `SettingsLayout`, `ThemeToggle`, and
  `LocaleSwitch`.
- Add cabinet theme/locale persistence helpers (`readCabinetTheme`,
  `writeCabinetTheme`, `readCabinetLocale`, `writeCabinetLocale`) and storage
  key constants (`CABINET_THEME_KEY`, `CABINET_LOCALE_KEY`).
- Export cabinet types (`CabinetNavItem`, `CabinetNavSection`, `CabinetBrand`,
  `CabinetBreadcrumb`, `CabinetAuth`, `CabinetLabels`, `CabinetLinkComponent`,
  `SettingsSection`, etc.) from `@nexum-io/design-system` layouts barrel.
- Add Storybook stories and unit tests for cabinet primitives.
- Consumer adoption guide: [`docs/CabinetShell.md`](./docs/CabinetShell.md).

## 0.1.0

### Minor Changes

- Publish `@nexum-io/design-system` to GitHub Packages with ESM build output in `dist/`.
- Add typed subpath exports for primitives, components, blocks, layouts, styles, and tokens.
- Add Changesets and GitHub Actions release workflow.
