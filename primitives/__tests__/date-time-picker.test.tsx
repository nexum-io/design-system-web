import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DateTimePicker,
  type DateTimePickerProps,
  formatIsoDateTime,
  parseIsoDateTime,
} from "../date-time-picker";
import { TimeField } from "../time-field";
import { Label } from "../label";

/**
 * Resolves an element's accessible *description* the way a screen reader
 * would: space-joined text content of every id in `aria-describedby`. See
 * `date-picker.test.tsx` for why this is hand-rolled instead of relying on
 * `dom-accessibility-api`.
 */
function getAccessibleDescription(element: HTMLElement): string {
  const ids = element.getAttribute("aria-describedby")?.split(/\s+/).filter(Boolean) ?? [];
  return ids
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ")
    .trim();
}

/** Stateful wrapper so picking a date, then a time, compose onto the same value — mirrors real controlled usage. */
function ControlledDateTimePicker({
  initialValue,
  onChange,
  ...rest
}: Omit<DateTimePickerProps, "value" | "onChange"> & {
  initialValue?: string;
  onChange: (value: string) => void;
}) {
  const [value, setValue] = React.useState(initialValue ?? "");
  return (
    <DateTimePicker
      {...rest}
      value={value}
      onChange={(next) => {
        onChange(next);
        setValue(next);
      }}
    />
  );
}

describe("parseIsoDateTime", () => {
  it("parses an ISO date-time into local Date components (no UTC shift)", () => {
    const date = parseIsoDateTime("2026-09-02T14:30");
    expect(date).toBeInstanceOf(Date);
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(8);
    expect(date?.getDate()).toBe(2);
    expect(date?.getHours()).toBe(14);
    expect(date?.getMinutes()).toBe(30);
  });

  it("returns undefined for empty, date-only, or invalid input", () => {
    expect(parseIsoDateTime("")).toBeUndefined();
    expect(parseIsoDateTime(undefined)).toBeUndefined();
    expect(parseIsoDateTime("2026-09-02")).toBeUndefined();
    expect(parseIsoDateTime("2026-09-02T25:00")).toBeUndefined();
    expect(parseIsoDateTime("2026-13-40T10:00")).toBeUndefined();
  });
});

describe("formatIsoDateTime", () => {
  it("formats a local Date back to zero-padded YYYY-MM-DDTHH:mm", () => {
    expect(formatIsoDateTime(new Date(2026, 8, 2, 9, 5))).toBe("2026-09-02T09:05");
    expect(formatIsoDateTime(new Date(2026, 0, 1, 0, 0))).toBe("2026-01-01T00:00");
  });
});

describe("DateTimePicker", () => {
  const originalNavigatorLanguage = Object.getOwnPropertyDescriptor(
    window.navigator,
    "language",
  );

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalNavigatorLanguage) {
      Object.defineProperty(window.navigator, "language", originalNavigatorLanguage);
    } else {
      delete (window.navigator as { language?: string }).language;
    }
  });

  it("shows an English calendar caption independent of navigator.language=ru", async () => {
    Object.defineProperty(window.navigator, "language", {
      value: "ru",
      configurable: true,
    });
    const user = userEvent.setup();
    render(
      <DateTimePicker value="2026-09-02T10:00" onChange={vi.fn()} locale="en" />,
    );
    await user.click(screen.getByRole("button", { name: /Sep 2, 2026, 10:00/i }));
    await waitFor(() => {
      expect(screen.getByText("September 2026")).toBeInTheDocument();
    });
    expect(screen.getByText("Mo")).toBeInTheDocument();
    expect(screen.queryByText(/сент/i)).not.toBeInTheDocument();
  });

  it("shows the combined date and time — not just the date — on the trigger", () => {
    render(<DateTimePicker value="2026-09-02T14:05" onChange={vi.fn()} locale="en" />);
    // A single query proves both the accessible name (button text) and the
    // visible label carry the combined `dateStyle: "medium" / timeStyle:
    // "short" / hour12: false` string — not the date-only label DatePicker
    // computes on its own.
    const trigger = screen.getByRole("button", { name: "Sep 2, 2026, 14:05" });
    expect(trigger).toHaveTextContent("14:05");
  });

  it("picking a day then setting a time composes onto the same ISO value, defaulting the time to 00:00 first", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledDateTimePicker onChange={onChange} locale="en" placeholder="Select date and time" />);

    await user.click(screen.getByRole("button", { name: "Select date and time" }));
    const day15 = await screen.findByRole("button", { name: /September 15/i });
    await user.click(day15);
    // Time defaults to 00:00 the moment a date is picked — the time is
    // never silently dropped, matching what a native
    // `<input type="datetime-local">` would already carry.
    expect(onChange).toHaveBeenLastCalledWith("2026-09-15T00:00");

    await user.selectOptions(screen.getByRole("combobox", { name: "Hours" }), "14");
    expect(onChange).toHaveBeenLastCalledWith("2026-09-15T14:00");

    await user.selectOptions(screen.getByRole("combobox", { name: "Minutes" }), "30");
    expect(onChange).toHaveBeenLastCalledWith("2026-09-15T14:30");
  });

  it("clearing the date clears the whole value, including a previously-set time", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateTimePicker value="2026-09-15T14:30" onChange={onChange} locale="en" />);

    await user.click(screen.getByRole("button", { name: /Sep 15, 2026, 14:30/i }));
    const day15 = await screen.findByRole("button", { name: /September 15th/i });
    await user.click(day15);
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("ignores a time change while no date is set yet", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateTimePicker value="" onChange={onChange} locale="en" />);

    await user.selectOptions(screen.getByRole("combobox", { name: "Hours" }), "09");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disables days before min and leaves later days enabled", async () => {
    const user = userEvent.setup();
    render(
      <DateTimePicker
        value="2026-09-02T09:00"
        onChange={vi.fn()}
        locale="en"
        min="2026-09-10"
      />,
    );
    await user.click(screen.getByRole("button", { name: /Sep 2, 2026, 09:00/i }));
    const day5 = await screen.findByRole("button", { name: /September 5th/i });
    const day12 = screen.getByRole("button", { name: /September 12/i });
    expect(day5).toBeDisabled();
    expect(day12).not.toBeDisabled();
  });

  it("also honours a full datetime min by constraining on its date part", async () => {
    const user = userEvent.setup();
    render(
      <DateTimePicker
        value="2026-09-02T09:00"
        onChange={vi.fn()}
        locale="en"
        min="2026-09-10T18:00"
      />,
    );
    await user.click(screen.getByRole("button", { name: /Sep 2, 2026, 09:00/i }));
    const day9 = await screen.findByRole("button", { name: /September 9th/i });
    expect(day9).toBeDisabled();
  });

  it("disables days after max and leaves earlier days enabled", async () => {
    const user = userEvent.setup();
    render(
      <DateTimePicker
        value="2026-09-02T09:00"
        onChange={vi.fn()}
        locale="en"
        max="2026-09-20"
      />,
    );
    await user.click(screen.getByRole("button", { name: /Sep 2, 2026, 09:00/i }));
    const day25 = await screen.findByRole("button", { name: /September 25/i });
    const day12 = screen.getByRole("button", { name: /September 12/i });
    expect(day25).toBeDisabled();
    expect(day12).not.toBeDisabled();
  });

  it("also honours a full datetime max by constraining on its date part", async () => {
    const user = userEvent.setup();
    render(
      <DateTimePicker
        value="2026-09-02T09:00"
        onChange={vi.fn()}
        locale="en"
        max="2026-09-10T06:00"
      />,
    );
    await user.click(screen.getByRole("button", { name: /Sep 2, 2026, 09:00/i }));
    const day11 = await screen.findByRole("button", { name: /September 11th/i });
    expect(day11).toBeDisabled();
  });

  it("leaves time-of-day unconstrained on the min day itself — min only bounds the calendar day", async () => {
    // `min` truncates to its date part (see `isoDatePart`): the min *day* is
    // pickable, and once picked its TimeField is not further restricted to
    // times at-or-after `min`'s own time-of-day (there is no such concept —
    // `min`/`max` never carry a time constraint, only a day one).
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledDateTimePicker
        onChange={onChange}
        locale="en"
        min="2026-09-10T18:00"
        placeholder="Select date and time"
      />,
    );
    await user.click(screen.getByRole("button", { name: "Select date and time" }));
    const minDay = await screen.findByRole("button", { name: /September 10th/i });
    expect(minDay).not.toBeDisabled();
    await user.click(minDay);
    expect(onChange).toHaveBeenLastCalledWith("2026-09-10T00:00");

    await user.selectOptions(screen.getByRole("combobox", { name: "Hours" }), "00");
    await user.selectOptions(screen.getByRole("combobox", { name: "Minutes" }), "05");
    expect(onChange).toHaveBeenLastCalledWith("2026-09-10T00:05");
  });

  it("re-selecting the unset -- option in a TimeField select while a date is set re-defaults to 00:00 rather than clearing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledDateTimePicker initialValue="2026-09-15T14:30" onChange={onChange} locale="en" />);

    await user.selectOptions(screen.getByRole("combobox", { name: "Hours" }), "");
    // Not `onChange` called with `""` — the date stays, only the time part
    // resets, same as if the date had just been picked with no time set yet.
    expect(onChange).toHaveBeenLastCalledWith("2026-09-15T00:00");
    expect(onChange).not.toHaveBeenCalledWith("");
  });

  it("keeps the combined date+time in the trigger's single accessible description when an external <Label htmlFor> supplies the accessible name", () => {
    render(
      <>
        <Label htmlFor="deadline">Deadline</Label>
        <DateTimePicker id="deadline" value="2026-09-10T14:30" onChange={vi.fn()} locale="en" />
      </>,
    );
    const trigger = screen.getByRole("button", { name: "Deadline" });
    // Exactly one description id — `DatePicker`'s own `${id}-value` span,
    // now carrying the combined label via its `label` prop. There is no
    // second, `DateTimePicker`-owned span/id to double it up.
    expect(trigger.getAttribute("aria-describedby")).toBe("deadline-value");
    expect(getAccessibleDescription(trigger)).toBe(
      new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        hour12: false,
      }).format(new Date(2026, 8, 10, 14, 30)),
    );
  });

  it("merges a consumer-provided aria-describedby with the trigger's own single value-description id", () => {
    render(
      <>
        <span id="hint">Used for escrow release</span>
        <DateTimePicker
          id="deadline"
          value="2026-09-10T14:30"
          onChange={vi.fn()}
          locale="en"
          aria-describedby="hint"
        />
      </>,
    );
    const trigger = screen.getByRole("button", { name: /Sep 10, 2026, 14:30/i });
    expect(trigger.getAttribute("aria-describedby")).toBe("deadline-value hint");
  });

  it("forwards aria-invalid, name and aria-label to the date trigger", () => {
    render(
      <DateTimePicker
        id="deadline"
        name="deadline"
        value=""
        onChange={vi.fn()}
        locale="en"
        aria-invalid
        aria-label="Deadline"
      />,
    );
    const trigger = screen.getByRole("button", { name: "Deadline" });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAttribute("name", "deadline");
  });

  it("defaults TimeField aria-labels from locale (ru), independent of any English default", () => {
    render(<DateTimePicker value="" onChange={vi.fn()} locale="ru" />);
    expect(screen.getByRole("combobox", { name: "Часы" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Минуты" })).toBeInTheDocument();
  });

  it("forwards minuteStep to TimeField", () => {
    render(<DateTimePicker value="" onChange={vi.fn()} locale="en" minuteStep={15} />);
    const minutesSelect = screen.getByRole("combobox", { name: "Minutes" });
    const optionValues = Array.from(minutesSelect.querySelectorAll("option")).map((option) =>
      option.getAttribute("value"),
    );
    expect(optionValues).toEqual(["", "00", "15", "30", "45"]);
  });
});

describe("TimeField", () => {
  it("renders hours/minutes selects with EN default aria-labels and no value selected when empty", () => {
    render(<TimeField value="" onChange={vi.fn()} />);
    expect(screen.getByRole("combobox", { name: "Hours" })).toHaveValue("");
    expect(screen.getByRole("combobox", { name: "Minutes" })).toHaveValue("");
  });

  it("emits HH:mm once both parts are chosen, defaulting the other part to 00", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeField value="" onChange={onChange} />);

    await user.selectOptions(screen.getByRole("combobox", { name: "Hours" }), "09");
    expect(onChange).toHaveBeenLastCalledWith("09:00");
  });

  it("honours a custom minuteStep in the minutes options", () => {
    render(<TimeField value="" onChange={vi.fn()} minuteStep={15} />);
    const minutesSelect = screen.getByRole("combobox", { name: "Minutes" });
    const optionValues = Array.from(minutesSelect.querySelectorAll("option")).map(
      (option) => option.getAttribute("value"),
    );
    expect(optionValues).toEqual(["", "00", "15", "30", "45"]);
  });

  it("accepts custom labels", () => {
    render(
      <TimeField value="" onChange={vi.fn()} labels={{ hours: "Час", minutes: "Минута" }} />,
    );
    expect(screen.getByRole("combobox", { name: "Час" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Минута" })).toBeInTheDocument();
  });

  it("disables both selects when disabled", () => {
    render(<TimeField value="10:00" onChange={vi.fn()} disabled />);
    expect(screen.getByRole("combobox", { name: "Hours" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "Minutes" })).toBeDisabled();
  });
});
