"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { enUS, ru } from "react-day-picker/locale";

import { cn } from "./utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export type DatePickerLocale = "en" | "ru";

const DAY_PICKER_LOCALES: Record<DatePickerLocale, typeof enUS> = {
  en: enUS,
  ru,
};

const INTL_LOCALE_TAGS: Record<DatePickerLocale, string> = {
  en: "en-US",
  ru: "ru-RU",
};

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parses an ISO calendar date (`YYYY-MM-DD`) into a local-time `Date`.
 *
 * Deliberately avoids `new Date("YYYY-MM-DD")`, which the spec parses as UTC
 * midnight — in timezones behind UTC that shifts the displayed calendar day
 * back by one. Returns `undefined` for empty, malformed, or out-of-range
 * input (e.g. `"2026-02-30"`).
 */
function parseIsoDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  // Guards against e.g. "2026-02-30": the Date constructor rolls invalid
  // day-of-month values into the next month instead of rejecting them.
  const isValid =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  return isValid ? date : undefined;
}

/** Formats a local `Date` back to a zero-padded `YYYY-MM-DD` string. */
function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface DatePickerProps {
  /** ISO calendar date `YYYY-MM-DD` or empty string / undefined. */
  value?: string;
  /** Called with `YYYY-MM-DD` on pick, `""` when the same day is toggled off. */
  onChange: (value: string) => void;
  /** UI language of the calendar and of the trigger label. Default `"en"`. Independent of the browser locale. */
  locale?: DatePickerLocale;
  /** Trigger text when no value. */
  placeholder?: string;
  /** Inclusive bounds, `YYYY-MM-DD`. Days outside are disabled. */
  min?: string;
  max?: string;
  disabled?: boolean;
  /** Forwarded to the trigger button (pairs with `<Label htmlFor>`). */
  id?: string;
  name?: string;
  className?: string;
  /** Extra props for the popover content (e.g. `align`). */
  contentProps?: React.ComponentProps<typeof PopoverContent>;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
}

function DatePicker({
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
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Radix keeps rendering the popover if `disabled` flips true mid-open —
  // force it closed so a disabled trigger can never leave a stale calendar
  // on screen.
  React.useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const date = parseIsoDate(value);
  const minDate = parseIsoDate(min);
  const maxDate = parseIsoDate(max);

  const dayPickerLocale = DAY_PICKER_LOCALES[locale];
  const intlTag = INTL_LOCALE_TAGS[locale];
  const label = date
    ? new Intl.DateTimeFormat(intlTag, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date)
    : placeholder;

  const disabledMatchers = [
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          id={id}
          name={name}
          disabled={disabled}
          data-slot="date-picker-trigger"
          data-empty={!date}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={ariaLabel}
          aria-invalid={ariaInvalid}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        {...contentProps}
        className={cn("w-auto p-0", contentProps?.className)}
      >
        <Calendar
          mode="single"
          locale={dayPickerLocale}
          selected={date}
          onSelect={(day) => {
            onChange(day ? formatIsoDate(day) : "");
            setOpen(false);
          }}
          disabled={disabledMatchers.length > 0 ? disabledMatchers : undefined}
          defaultMonth={date ?? minDate ?? new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker, parseIsoDate, formatIsoDate };
