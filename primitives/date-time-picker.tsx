"use client";

import * as React from "react";

import { cn } from "./utils";
import { DatePicker, type DatePickerLocale } from "./date-picker";
import { TimeField, type TimeFieldLabels } from "./time-field";
import { parseIsoDateTime, formatIsoDateTime } from "./iso-date";

export type DateTimePickerLocale = DatePickerLocale;

const INTL_LOCALE_TAGS: Record<DateTimePickerLocale, string> = {
  en: "en-US",
  ru: "ru-RU",
};

/**
 * `TimeField`'s two `<select>`s have no visible text of their own, so their
 * aria-labels need to track `locale` the same way the calendar does —
 * unlike `TimeField`'s own English-only defaults (used when it's consumed
 * standalone), `DateTimePicker` knows its `locale` and defaults from it.
 */
const DEFAULT_TIME_LABELS: Record<DateTimePickerLocale, Required<TimeFieldLabels>> = {
  en: { hours: "Hours", minutes: "Minutes" },
  ru: { hours: "Часы", minutes: "Минуты" },
};

export interface DateTimePickerProps {
  /** ISO local date-time `YYYY-MM-DDTHH:mm` (the `datetime-local` contract), or empty string / undefined. */
  value?: string;
  /** Called with `YYYY-MM-DDTHH:mm` once a date is picked, or `""` when the date is cleared. */
  onChange: (value: string) => void;
  /** UI language of the calendar and of the combined value label. Default `"en"`. Independent of the browser locale. */
  locale?: DateTimePickerLocale;
  /** Trigger text when no value (forwarded to the date part). */
  placeholder?: string;
  /**
   * Inclusive bounds. Accepts either an ISO date (`YYYY-MM-DD`) or a full
   * date-time (`YYYY-MM-DDTHH:mm`) — only the date portion is enforced (the
   * calendar disables days outside range); time-of-day within the boundary
   * day (including the min/max day itself) is never restricted.
   */
  min?: string;
  max?: string;
  disabled?: boolean;
  /** Forwarded to the date trigger button (pairs with `<Label htmlFor>`); the `TimeField` gets `${id}-time`. */
  id?: string;
  name?: string;
  /** Lands on the wrapping `<div className="flex ...">` around the date trigger and `TimeField`, not on the trigger itself — use `contentProps`/DS class conventions for the popover or trigger surface. */
  className?: string;
  /** Extra props for the calendar's popover content (e.g. `align`); forwarded to `DatePicker`. */
  contentProps?: React.ComponentProps<typeof DatePicker>["contentProps"];
  /** aria-label for the date trigger. Forwarded to `DatePicker`. */
  "aria-label"?: string;
  /** Forwarded to `DatePicker`'s trigger `<Button>`, already styled for `aria-invalid:*`. */
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  /** Overrides the `TimeField` aria-labels; defaults from `locale` (see `DEFAULT_TIME_LABELS`) rather than `TimeField`'s own English-only default. */
  timeLabels?: TimeFieldLabels;
  /** Minute option interval passed through to `TimeField`, e.g. `5` renders `00, 05, ... 55`. Default `1`. */
  minuteStep?: number;
}

/** Splits `YYYY-MM-DDTHH:mm` into its date and time parts; `""` for both when `value` is empty. */
function splitIsoDateTime(value?: string): { date: string; time: string } {
  if (!value) return { date: "", time: "" };
  const [date = "", time = ""] = value.split("T");
  return { date, time };
}

/** First 10 characters of an ISO date or date-time string — the `YYYY-MM-DD` part. */
function isoDatePart(value?: string): string | undefined {
  return value ? value.slice(0, 10) : undefined;
}

/**
 * Date + time picker composed from the DS `DatePicker` (calendar, locale
 * `"en" | "ru"`) and `TimeField` (two plain `<select>`s) placed side by
 * side. Neither part is ever browser-localized, unlike a native
 * `<input type="datetime-local">`.
 *
 * Value semantics: the date drives the value. Picking a date defaults an
 * unset time to `00:00` (never drops the time silently); re-selecting the
 * unset `--` option in either `TimeField` select while a date is already
 * set *also* re-defaults to `00:00` rather than clearing anything — the
 * value contract has no "date with no time" state. Clearing the date is the
 * only way to clear the whole value (including any time that was set).
 * There is no way to hold a time with no date — `TimeField` changes are
 * ignored until a date exists.
 *
 * The trigger shows and announces the combined date+time (via `DatePicker`'s
 * `label` prop), formatted with `Intl.DateTimeFormat(locale, { dateStyle:
 * "medium", timeStyle: "short", hour12: false })` — `DatePicker` itself
 * still owns the single sr-only description span this produces.
 */
function DateTimePicker({
  value,
  onChange,
  locale = "en",
  placeholder,
  min,
  max,
  disabled,
  id,
  name,
  className,
  contentProps,
  timeLabels,
  minuteStep,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: DateTimePickerProps) {
  const { date: datePart, time: timePart } = splitIsoDateTime(value);

  function handleDateChange(newDate: string) {
    if (!newDate) {
      onChange("");
      return;
    }
    onChange(`${newDate}T${timePart || "00:00"}`);
  }

  function handleTimeChange(newTime: string) {
    // No date yet: there is nothing to combine the time with, and the value
    // contract has no "time-only" representation.
    if (!datePart) return;
    // `newTime` is `""` when the user reset a `TimeField` select back to its
    // unset `--` option — defaulting to `00:00` here (same as an initial
    // date pick) rather than calling `onChange("")` keeps that contract:
    // a set date always carries *some* time.
    onChange(`${datePart}T${newTime || "00:00"}`);
  }

  const intlTag = INTL_LOCALE_TAGS[locale];
  const parsed = parseIsoDateTime(value);
  const combinedLabel = parsed
    ? new Intl.DateTimeFormat(intlTag, {
        dateStyle: "medium",
        timeStyle: "short",
        hour12: false,
      }).format(parsed)
    : undefined;

  return (
    <div className={cn("flex items-start gap-2", className)} data-slot="date-time-picker">
      <DatePicker
        id={id}
        name={name}
        locale={locale}
        value={datePart}
        onChange={handleDateChange}
        min={isoDatePart(min)}
        max={isoDatePart(max)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
        label={combinedLabel}
        contentProps={contentProps}
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
      />
      <TimeField
        id={id ? `${id}-time` : undefined}
        value={timePart}
        onChange={handleTimeChange}
        minuteStep={minuteStep}
        disabled={disabled}
        labels={timeLabels ?? DEFAULT_TIME_LABELS[locale]}
        className="shrink-0"
      />
    </div>
  );
}

export { DateTimePicker, parseIsoDateTime, formatIsoDateTime };
