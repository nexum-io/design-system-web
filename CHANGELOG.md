# Changelog

## 0.3.0

### Minor Changes

- e214bd4: Add `Popover`, `Calendar` and `DatePicker` primitives. `DatePicker` renders a locale-controlled calendar (`locale: "en" | "ru"`) instead of the browser-localized native date input, with ISO `YYYY-MM-DD` value contract, optional `min`/`max` bounds and a formatted trigger label. The trigger always exposes the picked date (or placeholder) as its accessible description via a new, optional `aria-describedby` prop that merges with the trigger's own value-description id, so an external `<Label htmlFor>` no longer silences the picked date for screen readers.
- ab92b25: Add `TimeField` and `DateTimePicker` primitives, plus a new optional `label` prop on `DatePicker`. `TimeField` is a pair of plain `<select>`s (hours `00-23`, minutes `00-59`, configurable `minuteStep`, off-grid current values inserted so the select never renders blank) with a `HH:mm | ""` value contract — used instead of `<input type="time">`, which localizes AM/PM and separators by browser language. `DatePicker`'s new `label?: React.ReactNode` overrides the trigger's visible text _and_ its sr-only accessible-description span; omitting it changes nothing (it still defaults to the formatted date/placeholder). `DateTimePicker` composes `DatePicker` and `TimeField` side by side behind an ISO `YYYY-MM-DDTHH:mm` value contract (`min`/`max` accept a date or date-time; only the date part constrains the calendar, never a time-of-day, including on the boundary day itself), replacing `<input type="datetime-local">`. It passes `DatePicker` a combined `Intl.DateTimeFormat` label (`dateStyle: "medium"`, `timeStyle: "short"`, `hour12: false`) so the trigger shows and announces date _and_ time through `DatePicker`'s own single sr-only span — no second, duplicate description. Picking a date defaults an unset time to `00:00` so the time is never silently dropped (re-selecting a `TimeField` select back to its unset `--` option while a date is set re-defaults to `00:00` the same way, rather than clearing); clearing the date clears the whole value. `DateTimePicker` also forwards `name`, `aria-label`, `aria-invalid`, and `contentProps` to `DatePicker`, and `minuteStep`/`timeLabels` (defaulted from `locale`, e.g. `ru` → "Часы"/"Минуты") to `TimeField`.

### Patch Changes

- 3d9d8e2: Add the `cabinet` token group (`--ds-cabinet-tab-bar-height`, `--ds-cabinet-bottom-inset`; `tokens.cabinet.*`) so app-level fixed/sticky bottom bars and FABs can reserve space above `CabinetTabBar` below `md`; `theme.css` resets the inset to `0px` on the `md` variant where the tab bar is hidden. `CabinetTabBar` now floors its height with `min-h-(--ds-cabinet-tab-bar-height)` (no visual change: the rendered bar was already 3.5rem + border). Consumers that do not use the variables are unchanged.
- ac116f7: Add optional `supportLabel` / `onSupport` to `CabinetAuthSignedIn`: `CabinetTopbar` renders a Support item before Sign out in the signed-in dropdown when both are provided; consumers that omit them are unchanged.
- ecf71a9: Add optional `trailing` slot to `SignStepTimeline` steps so consumers can render an action (e.g. Disconnect) to the right of the step label/description/result.

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
