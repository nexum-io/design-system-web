# Changelog

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
