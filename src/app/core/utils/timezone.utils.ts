/**
 * Timezone utilities for converting UTC dates to Eastern Time (Newport News, VA)
 * Uses America/New_York timezone (ET - Eastern Time)
 */

/**
 * Convert UTC date string to Eastern Time formatted string
 * @param utcDateString ISO 8601 UTC date string from API
 * @param format Format type: 'datetime', 'date', 'time', 'short'
 * @returns Formatted date string in Eastern Time
 */
export function formatEasternTime(
  utcDateString: string | undefined | null,
  format: 'datetime' | 'date' | 'time' | 'short' = 'datetime'
): string {
  if (!utcDateString) return '-';

  try {
    const date = new Date(utcDateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/New_York',
    };

    switch (format) {
      case 'datetime':
        options.year = 'numeric';
        options.month = '2-digit';
        options.day = '2-digit';
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.second = '2-digit';
        options.hour12 = true;
        break;
      case 'date':
        options.year = 'numeric';
        options.month = '2-digit';
        options.day = '2-digit';
        break;
      case 'time':
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.second = '2-digit';
        options.hour12 = true;
        break;
      case 'short':
        options.year = 'numeric';
        options.month = 'short';
        options.day = 'numeric';
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.hour12 = true;
        break;
    }

    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Get Eastern Time zone abbreviation (EST or EDT) for a given UTC date
 */
export function getEasternTimeZoneAbbr(utcDateString: string): string {
  try {
    const date = new Date(utcDateString);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      timeZoneName: 'short'
    });

    const parts = formatter.formatToParts(date);
    const timeZonePart = parts.find(part => part.type === 'timeZoneName');
    return timeZonePart?.value || 'ET';
  } catch {
    return 'ET';
  }
}

/**
 * Format date for display with timezone indicator
 * Example: "12/21/2024, 03:45:30 PM EST"
 */
export function formatEasternTimeWithZone(utcDateString: string | undefined | null): string {
  if (!utcDateString) return '-';

  const formatted = formatEasternTime(utcDateString, 'datetime');
  if (formatted === 'Invalid Date' || formatted === '-') return formatted;

  const tz = getEasternTimeZoneAbbr(utcDateString);
  return `${formatted} ${tz}`;
}

/**
 * Format date for display in a compact format
 * Example: "Dec 21, 2024, 3:45 PM"
 */
export function formatEasternTimeShort(utcDateString: string | undefined | null): string {
  return formatEasternTime(utcDateString, 'short');
}

/**
 * Format just the date part (no time)
 * Example: "12/21/2024"
 */
export function formatEasternDate(utcDateString: string | undefined | null): string {
  return formatEasternTime(utcDateString, 'date');
}

/**
 * Format just the time part (no date)
 * Example: "03:45:30 PM"
 */
export function formatEasternTimeOnly(utcDateString: string | undefined | null): string {
  return formatEasternTime(utcDateString, 'time');
}

/**
 * Convert a datetime-local input value (which the user enters in Eastern Time)
 * to a UTC ISO string for sending to the API
 *
 * The datetime-local input provides a value like "2024-12-22T00:43"
 * The user intends this to be 12:43 AM Eastern Time
 * We need to convert it to UTC (e.g., "2024-12-22T05:43:00.000Z" if EST)
 *
 * @param dateTimeLocalValue Value from datetime-local input (e.g., "2024-12-22T00:43")
 * @returns ISO 8601 UTC string (e.g., "2024-12-22T05:43:00.000Z")
 */
export function convertEasternToUtc(dateTimeLocalValue: string): string {
  if (!dateTimeLocalValue) {
    return new Date().toISOString();
  }

  // The datetime-local value is in format "YYYY-MM-DDTHH:mm"
  // We interpret this as Eastern Time and need to convert to UTC

  // Append seconds and treat as a localized string in Eastern Time
  const dateTimeString = dateTimeLocalValue + ':00';

  // Use toLocaleString to parse in Eastern Time, then convert to UTC
  // We create the date string in a way that it will be interpreted in Eastern timezone
  const easternDateString = dateTimeString + ' GMT-0500'; // Assume EST as base

  // Better approach: use the date parts and manually calculate
  const parts = dateTimeLocalValue.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);

  if (!parts) {
    return new Date().toISOString();
  }

  const [, year, month, day, hour, minute] = parts;

  // Create a date formatter that will give us the UTC time for an Eastern time
  // We'll format a UTC date AS IF it were Eastern time, then parse it back
  const easternString = `${month}/${day}/${year} ${hour}:${minute}:00`;

  // Create a date with toLocaleString using Eastern timezone
  // This is tricky: we need to find what UTC time corresponds to this Eastern time

  // Method: Create dates with different UTC offsets until we find one that
  // when formatted in Eastern time matches our input

  // Typical offsets: EST = UTC-5 (300 min), EDT = UTC-4 (240 min)
  for (const offset of [300, 240]) { // Try EST first, then EDT
    const testDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      0,
      0
    );

    // Add the offset to convert from "local interpretation" to UTC
    testDate.setMinutes(testDate.getMinutes() + offset);

    // Check if this UTC time, when formatted in Eastern time, matches our input
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const formatted = formatter.format(testDate);
    const formattedMatch = formatted.match(/(\d{2})\/(\d{2})\/(\d{4}),\s(\d{2}):(\d{2})/);

    if (formattedMatch) {
      const [, m, d, y, h, min] = formattedMatch;
      if (y === year && m === month && d === day && h === hour && min === minute) {
        return testDate.toISOString();
      }
    }
  }

  // Fallback: just use the default Date constructor
  return new Date(dateTimeLocalValue).toISOString();
}
