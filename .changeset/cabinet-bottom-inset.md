---
"@nexum-io/design-system": patch
---

Add the `cabinet` token group (`--ds-cabinet-tab-bar-height`, `--ds-cabinet-bottom-inset`; `tokens.cabinet.*`) so app-level fixed/sticky bottom bars and FABs can reserve space above `CabinetTabBar` below `md`; `theme.css` resets the inset to `0px` on the `md` variant where the tab bar is hidden. `CabinetTabBar` now floors its height with `min-h-(--ds-cabinet-tab-bar-height)` (no visual change: the rendered bar was already 3.5rem + border). Consumers that do not use the variables are unchanged.
