"use client";

import * as React from "react";

import { cn } from "./utils";
import { DatePicker, type DatePickerLocale } from "./date-picker";
import { TimeField } from "./time-field";
import { parseIsoDateTime, formatIsoDateTime } from "./iso-date";

export type DateTimePickerLocale = DatePickerLocale;

const INTL_LOCALE_TAGS: Record<DateTimePickerLocale, string> = {
  en: "en-US",
  ru: "ru-RU",
};

export interface DateTimePickerProps {
  /** ISO local date-time `YYYY-MM-DDTHH:mm` (the `datetime-local` contract), or empty string / undefined. */
  value?: string;
  /** Called with `YYYY-MM-DDTHH:mm` once a date is picked, or `""` when the date is cleared. */
  onChange: (value: string) => void;
  /** UI language of the calendar and of the combined value description. Default `"en"`. Independent of the browser locale. */
  locale?: DateTimePickerLocale;
  /** Trigger text when no value (forwarded to the date part). */
  placeholder?: string;
  /**
   * Inclusive bounds. Accepts either an ISO date (`YYYY-MM-DD`) or a full
   * date-time (`YYYY-MM-DDTHH:mm`) — only the date portion is enforced (the
   * calendar disables days outside range); time-of-day within the boundary
   * day is never restricted.
   */
  min?: string;
  max?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-describedby"?: string;
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
 * unset time to `00:00` (never drops the time silently); clearing the date
 * clears the whole value, including any time that was set. There is no way
 * to hold a time with no date — `TimeField` changes are ignored until a
 * date exists.
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
  className,
  "aria-describedby": ariaDescribedBy,
}: DateTimePickerProps) {
  const generatedId = React.useId();
  const baseId = id ?? generatedId;
  const valueDescriptionId = `${baseId}-datetime-value`;

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
    onChange(`${datePart}T${newTime || "00:00"}`);
  }

  const intlTag = INTL_LOCALE_TAGS[locale];
  const parsed = parseIsoDateTime(value);
  const formattedValue = parsed
    ? new Intl.DateTimeFormat(intlTag, {
        dateStyle: "medium",
        timeStyle: "short",
        hour12: false,
      }).format(parsed)
    : placeholder;

  return (
    <div className={cn("flex items-start gap-2", className)} data-slot="date-time-picker">
      <DatePicker
        id={baseId}
        locale={locale}
        value={datePart}
        onChange={handleDateChange}
        min={isoDatePart(min)}
        max={isoDatePart(max)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
        aria-describedby={[valueDescriptionId, ariaDescribedBy].filter(Boolean).join(" ") || undefined}
      />
      {/*
        Mirrors the DatePicker convention: the composed value (date *and*
        time) is exposed as an accessible description so a consumer's
        `<Label htmlFor={id}>` (which supplies the accessible name) doesn't
        silence it — a native `<input type="datetime-local">` announces both.
      */}
      {formattedValue ? (
        <span id={valueDescriptionId} className="sr-only">
          {formattedValue}
        </span>
      ) : null}
      <TimeField
        id={`${baseId}-time`}
        value={timePart}
        onChange={handleTimeChange}
        disabled={disabled}
        className="shrink-0"
      />
    </div>
  );
}

export { DateTimePicker, parseIsoDateTime, formatIsoDateTime };
