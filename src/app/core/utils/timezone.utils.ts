/**
 * Timezone utilities for converting UTC dates to Eastern Time (Newport News, VA)
 * Simple approach: subtract 5 hours from UTC (EST = UTC-5)
 */

const EST_OFFSET_HOURS = 5;

/**
 * Subtract 5 hours from a UTC date to get Eastern Time
 */
function toEastern(utcDateString: string): Date {
  const date = new Date(utcDateString);
  date.setHours(date.getHours() - EST_OFFSET_HOURS);
  return date;
}

/**
 * Pad a number to 2 digits
 */
function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/**
 * Format: "12/21/2024, 03:45:30 PM"
 */
export function formatEasternTime(
  utcDateString: string | undefined | null,
  format: 'datetime' | 'date' | 'time' | 'short' = 'datetime'
): string {
  if (!utcDateString) return '-';

  try {
    const d = toEastern(utcDateString);
    if (isNaN(d.getTime())) return 'Invalid Date';

    const month = pad(d.getUTCMonth() + 1);
    const day = pad(d.getUTCDate());
    const year = d.getUTCFullYear();
    const h24 = d.getUTCHours();
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
    const minute = pad(d.getUTCMinutes());
    const second = pad(d.getUTCSeconds());

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    switch (format) {
      case 'datetime':
        return `${month}/${day}/${year}, ${pad(h12)}:${minute}:${second} ${ampm}`;
      case 'date':
        return `${month}/${day}/${year}`;
      case 'time':
        return `${pad(h12)}:${minute}:${second} ${ampm}`;
      case 'short':
        return `${monthNames[d.getUTCMonth()]} ${d.getUTCDate()}, ${year}, ${h12}:${minute} ${ampm}`;
    }
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Format with timezone: "12/21/2024, 03:45:30 PM EST"
 */
export function formatEasternTimeWithZone(utcDateString: string | undefined | null): string {
  if (!utcDateString) return '-';
  const formatted = formatEasternTime(utcDateString, 'datetime');
  if (formatted === 'Invalid Date' || formatted === '-') return formatted;
  return `${formatted} EST`;
}

/**
 * Short format: "Dec 21, 2024, 3:45 PM"
 */
export function formatEasternTimeShort(utcDateString: string | undefined | null): string {
  return formatEasternTime(utcDateString, 'short');
}

/**
 * Date only: "12/21/2024"
 */
export function formatEasternDate(utcDateString: string | undefined | null): string {
  return formatEasternTime(utcDateString, 'date');
}

/**
 * Time only: "03:45:30 PM"
 */
export function formatEasternTimeOnly(utcDateString: string | undefined | null): string {
  return formatEasternTime(utcDateString, 'time');
}

/**
 * Convert a datetime-local input value (Eastern Time) to UTC ISO string.
 * Adds 5 hours to convert EST -> UTC.
 */
export function convertEasternToUtc(dateTimeLocalValue: string): string {
  if (!dateTimeLocalValue) {
    return new Date().toISOString();
  }

  const parts = dateTimeLocalValue.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!parts) {
    return new Date().toISOString();
  }

  const [, year, month, day, hour, minute] = parts;

  // Create a UTC date from the parts, then add 5 hours (EST offset)
  const date = new Date(Date.UTC(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour) + EST_OFFSET_HOURS,
    parseInt(minute),
    0
  ));

  return date.toISOString();
}
