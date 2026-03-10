/**
 * Minimal date formatting utilities.
 * The backend JSON converter already adjusts dates by the X-Timezone-Offset header,
 * so response dates arrive pre-adjusted to Eastern Time.
 * These functions only format — no timezone conversion.
 */

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/**
 * Parse a date string into a Date object.
 * Appends 'Z' if missing so UTC getters read the pre-adjusted values as-is.
 */
function toDate(dateString: string): Date {
  const s = dateString.endsWith('Z') ? dateString : dateString + 'Z';
  return new Date(s);
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
    const d = toDate(utcDateString);
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

export function formatEasternTimeWithZone(utcDateString: string | undefined | null): string {
  if (!utcDateString) return '-';
  const formatted = formatEasternTime(utcDateString, 'datetime');
  if (formatted === 'Invalid Date' || formatted === '-') return formatted;
  return `${formatted} EST`;
}

export function formatEasternTimeShort(utcDateString: string | undefined | null): string {
  return formatEasternTime(utcDateString, 'short');
}

export function formatEasternDate(utcDateString: string | undefined | null): string {
  return formatEasternTime(utcDateString, 'date');
}

export function formatEasternTimeOnly(utcDateString: string | undefined | null): string {
  return formatEasternTime(utcDateString, 'time');
}

/**
 * Convert a datetime-local input value (user's local time) to a UTC ISO string for the API.
 */
export function localToUtcIso(dateTimeLocalValue: string): string {
  return new Date(dateTimeLocalValue).toISOString();
}
