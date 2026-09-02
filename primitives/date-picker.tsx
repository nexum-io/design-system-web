"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { enUS, ru } from "react-day-picker/locale";

import { cn } from "./utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { parseIsoDate, formatIsoDate } from "./iso-date";
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
  /**
   * Overrides the trigger's visible text *and* accessible-description text
   * (the sr-only span below). Defaults to the formatted date (or
   * `placeholder` when empty) — omitting it is a no-op change. Lets a
   * composing consumer (e.g. `DateTimePicker`) show its own richer label
   * (date + time) without this component knowing anything about time.
   */
  label?: React.ReactNode;
  /** Extra props for the popover content (e.g. `align`). */
  contentProps?: React.ComponentProps<typeof PopoverContent>;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  /**
   * Merged (space-separated) with the trigger's own description id, which
   * points at a visually-hidden span holding the picked date. Without this,
   * a consumer labelling the trigger with `<Label htmlFor={id}>` gets an
   * accessible name but no accessible description of the value — a native
   * `<input type="date">` announces both, this restores parity.
   */
  "aria-describedby"?: string;
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
  label: labelProp,
  contentProps,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const generatedId = React.useId();
  const triggerId = id ?? generatedId;
  const valueDescriptionId = `${triggerId}-value`;

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
  const computedLabel = date
    ? new Intl.DateTimeFormat(intlTag, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date)
    : placeholder;
  const label = labelProp ?? computedLabel;

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
          aria-describedby={[valueDescriptionId, ariaDescribedBy].filter(Boolean).join(" ")}
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
      {/*
        Screen readers resolve the trigger's accessible name from any
        `<Label htmlFor>` a consumer attaches (label-from-content loses to an
        explicit external label) — so the picked date, otherwise the only
        text inside the button, would never be announced. Exposing it as the
        trigger's accessible description restores that, matching what native
        `<input type="date">` announces.
      */}
      <span id={valueDescriptionId} className="sr-only">
        {label}
      </span>
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
