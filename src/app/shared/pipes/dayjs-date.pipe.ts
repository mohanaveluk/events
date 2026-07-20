import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';

/**
 * Formats a Date (or ISO string) using dayjs. Defaults to `MMMM D, YYYY`
 * → e.g. "July 4, 2026".
 */
@Pipe({ name: 'dayjsDate' })
export class DayjsDatePipe implements PipeTransform {
  transform(value: Date | string | number | undefined | null, format = 'MMMM D, YYYY'): string {
    if (value == null) return '';
    const d = dayjs(value);
    return d.isValid() ? d.format(format) : '';
  }
}
