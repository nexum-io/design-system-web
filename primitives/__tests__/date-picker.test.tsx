import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatePicker, formatIsoDate, parseIsoDate } from "../date-picker";

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
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the placeholder and data-empty when value is empty", () => {
    render(<DatePicker value="" onChange={vi.fn()} placeholder="Pick a date" />);
    const trigger = screen.getByRole("button", { name: /pick a date/i });
    expect(trigger).toHaveAttribute("data-empty", "true");
    expect(screen.getByText("Pick a date")).toBeInTheDocument();
  });

  it("renders a formatted English trigger label for locale=en", () => {
    render(<DatePicker value="2026-09-02" onChange={vi.fn()} locale="en" />);
    expect(screen.getByText("September 2, 2026")).toBeInTheDocument();
  });

  it("renders a formatted Russian trigger label for locale=ru", () => {
    render(<DatePicker value="2026-09-02" onChange={vi.fn()} locale="ru" />);
    expect(screen.getByText(/сентября/)).toBeInTheDocument();
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
});
