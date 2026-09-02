"use client";

import * as React from "react";

import { cn } from "./utils";

export interface TimeFieldLabels {
  hours?: string;
  minutes?: string;
}

const DEFAULT_LABELS: Required<TimeFieldLabels> = {
  hours: "Hours",
  minutes: "Minutes",
};

export interface TimeFieldProps {
  /** `HH:mm` (zero-padded, 24h) or empty string when neither part is set. */
  value: string;
  /** Called with `HH:mm` once both parts are set, or `""` when reset back to unset. */
  onChange: (value: string) => void;
  /** Minute option interval, e.g. `5` renders `00, 05, 10, ... 55`. Default `1`. */
  minuteStep?: number;
  disabled?: boolean;
  /** Forwarded to the hours `<select>`; the minutes `<select>` gets `${id}-minutes`. */
  id?: string;
  /** `aria-label`s for the two selects, since neither has visible on-screen text. */
  labels?: TimeFieldLabels;
  className?: string;
}

/**
 * Two plain `<select>`s (hours 00-23, minutes 00-59) standing in for a time
 * input. Deliberately not the DS `Select` (Radix) primitive: a 24 + 60 item
 * pair of Radix listboxes adds pointer-capture/portal machinery for no
 * benefit here, since a native `<select>` of zero-padded numbers carries no
 * browser-locale risk the way `<input type="time">` does (no month/day
 * names, no AM/PM, no locale-dependent separator).
 */
function TimeField({
  value,
  onChange,
  minuteStep = 1,
  disabled,
  id,
  labels,
  className,
}: TimeFieldProps) {
  const hoursLabel = labels?.hours ?? DEFAULT_LABELS.hours;
  const minutesLabel = labels?.minutes ?? DEFAULT_LABELS.minutes;

  const [hoursPart, minutesPart] = value ? value.split(":") : ["", ""];

  const hourOptions = React.useMemo(
    () => Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0")),
    [],
  );
  const minuteOptions = React.useMemo(() => {
    const step = minuteStep > 0 ? minuteStep : 1;
    const options: string[] = [];
    for (let minute = 0; minute < 60; minute += step) {
      options.push(String(minute).padStart(2, "0"));
    }
    // The current value may not land on the step grid (e.g. value "07" with
    // minuteStep=5, or minuteStep changed after a value was already set) —
    // insert it in sorted position so the select never silently renders
    // blank for a value it otherwise has no option for.
    if (minutesPart && !options.includes(minutesPart)) {
      const minuteNumber = Number(minutesPart);
      const insertAt = options.findIndex((option) => Number(option) > minuteNumber);
      if (insertAt === -1) {
        options.push(minutesPart);
      } else {
        options.splice(insertAt, 0, minutesPart);
      }
    }
    return options;
  }, [minuteStep, minutesPart]);

  function handleHoursChange(newHours: string) {
    if (!newHours) {
      onChange("");
      return;
    }
    onChange(`${newHours}:${minutesPart || "00"}`);
  }

  function handleMinutesChange(newMinutes: string) {
    if (!newMinutes) {
      onChange("");
      return;
    }
    onChange(`${hoursPart || "00"}:${newMinutes}`);
  }

  const selectClassName = cn(
    "border-input dark:bg-input/30 dark:hover:bg-input/50 flex h-9 min-w-0 rounded-md border bg-input-background px-2 py-1 text-base md:text-sm transition-[color,box-shadow] outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  );

  return (
    <div className={cn("flex items-center gap-1", className)} data-slot="time-field">
      <select
        id={id}
        aria-label={hoursLabel}
        disabled={disabled}
        value={hoursPart}
        onChange={(event) => handleHoursChange(event.target.value)}
        className={selectClassName}
        data-slot="time-field-hours"
      >
        <option value="">--</option>
        {hourOptions.map((hour) => (
          <option key={hour} value={hour}>
            {hour}
          </option>
        ))}
      </select>
      <span aria-hidden="true" className="text-muted-foreground">
        :
      </span>
      <select
        id={id ? `${id}-minutes` : undefined}
        aria-label={minutesLabel}
        disabled={disabled}
        value={minutesPart}
        onChange={(event) => handleMinutesChange(event.target.value)}
        className={selectClassName}
        data-slot="time-field-minutes"
      >
        <option value="">--</option>
        {minuteOptions.map((minute) => (
          <option key={minute} value={minute}>
            {minute}
          </option>
        ))}
      </select>
    </div>
  );
}

export { TimeField };
