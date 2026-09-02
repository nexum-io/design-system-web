import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatePicker, formatIsoDate, parseIsoDate } from "../date-picker";
import { Label } from "../label";

/**
 * Resolves an element's accessible *description* the way a screen reader
 * would: space-joined text content of every id in `aria-describedby`.
 *
 * `@testing-library/dom`'s own `getByRole` name matching is implemented on
 * top of `dom-accessibility-api`'s `computeAccessibleDescription`, but that
 * function isn't re-exported from `@testing-library/dom`'s public API, and
 * importing `dom-accessibility-api` directly (it's only a transitive
 * dependency, not declared in this package's `package.json`) fails
 * `tsc --noEmit`: its `package.json` "exports" map doesn't expose a `types`
 * condition, so TypeScript can't resolve `dist/index.d.ts` even though the
 * file is right there. Reading `aria-describedby` by hand sidesteps both
 * problems and is what the fix actually guarantees.
 */
function getAccessibleDescription(element: HTMLElement): string {
  const ids = element.getAttribute("aria-describedby")?.split(/\s+/).filter(Boolean) ?? [];
  return ids
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ")
    .trim();
}

describe("parseIsoDate", () => {
  it("parses an ISO date into local Date components (no UTC shift)", () => {
    const date = parseIsoDate("2026-09-02");
    expect(date).toBeInstanceOf(Date);
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(8);
    expect(date?.getDate()).toBe(2);
  });

  it("returns undefined for empty or invalid input", () => {
    expect(parseIsoDate("")).toBeUndefined();
    expect(parseIsoDate(undefined)).toBeUndefined();
    expect(parseIsoDate("not-a-date")).toBeUndefined();
    expect(parseIsoDate("2026-13-40")).toBeUndefined();
  });
});

describe("formatIsoDate", () => {
  it("formats a local Date back to zero-padded YYYY-MM-DD", () => {
    expect(formatIsoDate(new Date(2026, 8, 2))).toBe("2026-09-02");
    expect(formatIsoDate(new Date(2026, 0, 1))).toBe("2026-01-01");
  });
});

describe("DatePicker", () => {
  // Captured before any test stubs it, so it always holds the real
  // descriptor (or `undefined` if the environment never defined it).
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

  it("renders the placeholder and data-empty when value is empty", () => {
    render(<DatePicker value="" onChange={vi.fn()} placeholder="Pick a date" />);
    const trigger = screen.getByRole("button", { name: /pick a date/i });
    expect(trigger).toHaveAttribute("data-empty", "true");
    // Scoped to the trigger: the same text is now also mirrored into a
    // sr-only description span (see the accessible-description tests
    // below), so an unscoped `screen.getByText` would match twice.
    expect(within(trigger).getByText("Pick a date")).toBeInTheDocument();
  });

  it("renders a formatted English trigger label for locale=en", () => {
    render(<DatePicker value="2026-09-02" onChange={vi.fn()} locale="en" />);
    // `getByRole` with an exact accessible-name match is unambiguous even
    // though the label text is now duplicated into a sr-only description
    // span — an unscoped `getByText("September 2, 2026")` would match both.
    expect(screen.getByRole("button", { name: "September 2, 2026" })).toBeInTheDocument();
  });

  it("renders a formatted Russian trigger label for locale=ru", () => {
    render(<DatePicker value="2026-09-02" onChange={vi.fn()} locale="ru" />);
    expect(screen.getByRole("button", { name: /сентября/i })).toBeInTheDocument();
  });

  it("shows a Russian calendar (month caption + weekday) when locale=ru", async () => {
    const user = userEvent.setup();
    render(<DatePicker value="2026-09-02" onChange={vi.fn()} locale="ru" />);
    await user.click(screen.getByRole("button", { name: /2 сентября 2026/i }));
    // Exact match: the trigger label ("2 сентября 2026 г.") uses the
    // genitive "сентября" while the caption uses the nominative "сентябрь" —
    // matching the exact caption text avoids ambiguity between the two.
    await waitFor(() => {
      expect(screen.getByText("сентябрь 2026")).toBeInTheDocument();
    });
    expect(screen.getByText("пн")).toBeInTheDocument();
  });

  it("shows an English calendar (month caption + weekday) when locale=en, independent of navigator.language=ru", async () => {
    // This is the bug DEV-391 fixes: the browser/OS language must not leak
    // into the calendar when the app pins an explicit locale.
    Object.defineProperty(window.navigator, "language", {
      value: "ru",
      configurable: true,
    });
    const user = userEvent.setup();
    render(<DatePicker value="2026-09-02" onChange={vi.fn()} locale="en" />);
    await user.click(screen.getByRole("button", { name: /September 2, 2026/i }));
    // Exact match: the trigger label ("September 2, 2026") also contains
    // "September" — matching the exact caption text ("September 2026")
    // avoids ambiguity between the two.
    await waitFor(() => {
      expect(screen.getByText("September 2026")).toBeInTheDocument();
    });
    expect(screen.getByText("Mo")).toBeInTheDocument();
  });

  it("calls onChange with the picked ISO date and closes the popover", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value="2026-09-02" onChange={onChange} locale="en" />);
    await user.click(screen.getByRole("button", { name: /September 2, 2026/i }));
    const day15 = await screen.findByRole("button", { name: /September 15/i });
    await user.click(day15);
    expect(onChange).toHaveBeenCalledWith("2026-09-15");
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /September 15/i })).not.toBeInTheDocument();
    });
  });

  it("toggles the value off when the already-selected day is clicked again", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value="2026-09-15" onChange={onChange} locale="en" />);
    await user.click(screen.getByRole("button", { name: /September 15, 2026/i }));
    // "th" disambiguates the day-grid cell ("...September 15th, 2026, selected")
    // from the trigger label ("September 15, 2026"), which is also on screen.
    const day15 = await screen.findByRole("button", { name: /September 15th/i });
    // The day button's `data-day` must stay the OS-locale-independent ISO
    // form (react-day-picker's own `<td data-day>` convention), not
    // `Date#toLocaleDateString()` — which shadowed it with an OS-locale
    // string and could disagree with the ISO value the `<td>` carries.
    expect(day15).toHaveAttribute("data-day", "2026-09-15");
    await user.click(day15);
    expect(onChange).toHaveBeenCalledWith("");
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /September 15th/i })).not.toBeInTheDocument();
    });
  });

  it("disables days before min and leaves later days enabled", async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        value="2026-09-02"
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

  it("keeps the picked date in the accessible description when an external <Label htmlFor> supplies the accessible name", () => {
    render(
      <>
        <Label htmlFor="deadline">Deadline</Label>
        <DatePicker id="deadline" value="2026-09-10" onChange={vi.fn()} locale="en" />
      </>,
    );
    // `<button>` is a labelable element, so `getByRole`'s accessible-name
    // computation resolves the external `<label for>` — not the button's
    // own text content ("September 10, 2026") — confirming the same
    // name-from-content shadowing the fix works around.
    const trigger = screen.getByRole("button", { name: "Deadline" });
    // Without the fix, aria-describedby is unset and the picked date is
    // never announced at all — a native `<input type="date">` announces
    // both the label and the value.
    expect(getAccessibleDescription(trigger)).toBe("September 10, 2026");
  });

  it("describes the trigger with the placeholder when there is no value yet", () => {
    render(
      <>
        <Label htmlFor="deadline">Deadline (Optional)</Label>
        <DatePicker
          id="deadline"
          value=""
          onChange={vi.fn()}
          locale="en"
          placeholder="Pick a date"
        />
      </>,
    );
    const trigger = screen.getByRole("button", { name: "Deadline (Optional)" });
    expect(getAccessibleDescription(trigger)).toBe("Pick a date");
  });

  it("merges a consumer-provided aria-describedby with the trigger's own value-description id", () => {
    render(
      <>
        <span id="hint">Used for escrow release</span>
        <DatePicker
          id="deadline"
          value="2026-09-10"
          onChange={vi.fn()}
          locale="en"
          aria-describedby="hint"
        />
      </>,
    );
    const trigger = screen.getByRole("button", { name: /September 10, 2026/i });
    expect(trigger.getAttribute("aria-describedby")).toBe("deadline-value hint");
  });
});
