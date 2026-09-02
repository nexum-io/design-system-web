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
    await user.click(screen.getByRole("button", { name: /September 2, 2026/i }));
    await waitFor(() => {
      expect(screen.getByText("September 2026")).toBeInTheDocument();
    });
    expect(screen.getByText("Mo")).toBeInTheDocument();
    expect(screen.queryByText(/сент/i)).not.toBeInTheDocument();
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

    await user.click(screen.getByRole("button", { name: /September 15, 2026/i }));
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
    await user.click(screen.getByRole("button", { name: /September 2, 2026/i }));
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
    await user.click(screen.getByRole("button", { name: /September 2, 2026/i }));
    const day9 = await screen.findByRole("button", { name: /September 9th/i });
    expect(day9).toBeDisabled();
  });

  it("keeps the combined date+time in the accessible description when an external <Label htmlFor> supplies the accessible name", () => {
    render(
      <>
        <Label htmlFor="deadline">Deadline</Label>
        <DateTimePicker id="deadline" value="2026-09-10T14:30" onChange={vi.fn()} locale="en" />
      </>,
    );
    const trigger = screen.getByRole("button", { name: "Deadline" });
    expect(getAccessibleDescription(trigger)).toContain(
      new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        hour12: false,
      }).format(new Date(2026, 8, 10, 14, 30)),
    );
  });

  it("merges a consumer-provided aria-describedby with both of the trigger's own value-description ids", () => {
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
    const trigger = screen.getByRole("button", { name: /September 10, 2026/i });
    expect(trigger.getAttribute("aria-describedby")).toBe(
      "deadline-value deadline-datetime-value hint",
    );
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
