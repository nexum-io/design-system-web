---
"@nexum-io/design-system": minor
---

Add `Popover`, `Calendar` and `DatePicker` primitives. `DatePicker` renders a locale-controlled calendar (`locale: "en" | "ru"`) instead of the browser-localized native date input, with ISO `YYYY-MM-DD` value contract, optional `min`/`max` bounds and a formatted trigger label. The trigger always exposes the picked date (or placeholder) as its accessible description via a new, optional `aria-describedby` prop that merges with the trigger's own value-description id, so an external `<Label htmlFor>` no longer silences the picked date for screen readers.
