/**
 * ISO calendar date (`YYYY-MM-DD`) parsing/formatting shared by `date-picker`
 * and `calendar`. Kept in its own module (rather than living in
 * `date-picker.tsx` and being imported back into `calendar.tsx`) because
 * `date-picker.tsx` imports `Calendar` from `./calendar` — importing the
 * other way would be circular.
 */

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

const ISO_DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

/**
 * Parses an ISO local date-time (`YYYY-MM-DDTHH:mm`, the `datetime-local`
 * input contract) into a local-time `Date`. Same UTC-shift avoidance as
 * {@link parseIsoDate} — never goes through `new Date(string)`. Returns
 * `undefined` for empty, malformed, or out-of-range input (invalid calendar
 * date, hour outside 0-23, minute outside 0-59).
 */
function parseIsoDateTime(value?: string): Date | undefined {
  if (!value) return undefined;
  const match = ISO_DATE_TIME_PATTERN.exec(value);
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hours = Number(match[4]);
  const minutes = Number(match[5]);
  const date = new Date(year, month - 1, day, hours, minutes);

  const isValid =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getHours() === hours &&
    date.getMinutes() === minutes;

  return isValid ? date : undefined;
}

/** Formats a local `Date` back to `YYYY-MM-DDTHH:mm` (zero-padded). */
function formatIsoDateTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${formatIsoDate(date)}T${hours}:${minutes}`;
}

export { parseIsoDate, formatIsoDate, parseIsoDateTime, formatIsoDateTime };
