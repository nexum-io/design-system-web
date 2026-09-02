---
"@nexum-io/design-system": minor
---

Add `TimeField` and `DateTimePicker` primitives. `TimeField` is a pair of plain `<select>`s (hours `00-23`, minutes `00-59`, configurable `minuteStep`) with a `HH:mm | ""` value contract — used instead of `<input type="time">`, which localizes AM/PM and separators by browser language. `DateTimePicker` composes `DatePicker` and `TimeField` side by side behind an ISO `YYYY-MM-DDTHH:mm` value contract (`min`/`max` accept a date or date-time; only the date part constrains the calendar), replacing `<input type="datetime-local">`. Picking a date defaults an unset time to `00:00` so the time is never silently dropped; clearing the date clears the whole value. The trigger's accessible description is the combined date+time (`Intl.DateTimeFormat` with `dateStyle: "medium"`, `timeStyle: "short"`, `hour12: false`), merged with any consumer-supplied `aria-describedby` the same way `DatePicker` already does.
