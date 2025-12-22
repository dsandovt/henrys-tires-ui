import { Pipe, PipeTransform } from '@angular/core';
import {
  formatEasternTime,
  formatEasternTimeWithZone,
  formatEasternTimeShort,
  formatEasternDate,
  formatEasternTimeOnly
} from '../../core/utils/timezone.utils';

/**
 * Pipe to format UTC dates to Eastern Time (Newport News, VA timezone)
 *
 * Usage in templates:
 * {{ utcDate | easternTime }} - Full datetime: "12/21/2024, 03:45:30 PM"
 * {{ utcDate | easternTime:'date' }} - Date only: "12/21/2024"
 * {{ utcDate | easternTime:'time' }} - Time only: "03:45:30 PM"
 * {{ utcDate | easternTime:'short' }} - Short format: "Dec 21, 2024, 3:45 PM"
 * {{ utcDate | easternTime:'withZone' }} - With timezone: "12/21/2024, 03:45:30 PM EST"
 */
@Pipe({
  name: 'easternTime',
  standalone: true
})
export class EasternTimePipe implements PipeTransform {
  transform(
    value: string | undefined | null,
    format: 'datetime' | 'date' | 'time' | 'short' | 'withZone' = 'datetime'
  ): string {
    if (!value) return '-';

    switch (format) {
      case 'withZone':
        return formatEasternTimeWithZone(value);
      case 'short':
        return formatEasternTimeShort(value);
      case 'date':
        return formatEasternDate(value);
      case 'time':
        return formatEasternTimeOnly(value);
      case 'datetime':
      default:
        return formatEasternTime(value, 'datetime');
    }
  }
}
