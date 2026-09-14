import { DateTime } from 'luxon';

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

type DateUtilsInput = Date | DateTime | string;

export function isTomorrowOrToday(dateToCheck: DateTime): boolean {
  const today = getBrazilDateTime();

  const isToday =
    dateToCheck.hasSame(today, 'day') &&
    dateToCheck.hasSame(today, 'month') &&
    dateToCheck.hasSame(today, 'year');
  if (isToday) {
    return true;
  }

  // Compare year, month, and day to check if it's the same date
  return isTomorrow(dateToCheck);
}

export function isTomorrow(dateToCheck: DateTime): boolean {
  const today = getBrazilDateTime();
  const tomorrow = today.plus({ days: 1 });

  // Compare year, month, and day to check if it's the same date
  return (
    dateToCheck.hasSame(tomorrow, 'year') &&
    dateToCheck.hasSame(tomorrow, 'month') &&
    dateToCheck.hasSame(tomorrow, 'day')
  );
}

export function convertToDaysUpFront(date: DateTime): number {
  return Math.ceil(date.diff(getBrazilDateTime(), 'days').days);
}

export function convertFromDaysUpFront(daysUpfront: number): DateTime {
  return getBrazilDateTime().plus({ days: daysUpfront }).startOf('day');
}

export const getBrazilDateTime = (date?: DateUtilsInput, format?: string): DateTime => {
  try {
    let dt = date ?? DateTime.now().setZone(BRAZIL_TIMEZONE);

    if (typeof dt === 'string') {
      if (format) {
        dt = DateTime.fromFormat(dt, format, { zone: BRAZIL_TIMEZONE });
      } else {
        dt = DateTime.fromISO(dt, { zone: BRAZIL_TIMEZONE });
      }

      if (!dt.isValid) {
        throw new Error(
          `Invalid date: ${dt}${format ? ` with format ${format}` : ''}. Err: ${dt.invalidReason}`,
        );
      }

      return dt;
    }

    if (dt instanceof Date) {
      return DateTime.fromJSDate(dt).setZone(BRAZIL_TIMEZONE);
    }

    return dt.setZone(BRAZIL_TIMEZONE);
  } catch (error: any) {
    return DateTime.invalid('Invalid Date: ', error.toString());
  }
};

export const getBrazilDateTimeTomorrow = (): DateTime => {
  return getBrazilDateTime().plus({ days: 1 });
};

export const getBrazilJSDate = (date?: DateUtilsInput, format?: string): Date => {
  const dt = getBrazilDateTime(date, format);
  return dt.toJSDate();
};

export const getBrazilJSStartOfDay = (date?: Date | string | DateTime, format?: string): Date => {
  const dt = getBrazilDateTime(date, format)
  return dt.startOf('day').toJSDate()
}

export const getBrazilJSDateTomorrow = (): Date => {
  return getBrazilDateTimeTomorrow().toJSDate();
};

export const getMinRetroactiveJSDate = (maxRetroactiveDays: number): Date => {
  return getBrazilDateTime().minus({ days: maxRetroactiveDays }).toJSDate();
};

export const getBrazilLocaleString = (date?: DateUtilsInput): string => {
  const dt = getBrazilDateTime(date);
  return dt.toLocaleString(DateTime.DATE_SHORT, { locale: 'pt-BR' });
};

export const isDateBeforeToday = (date?: string | undefined | null): boolean => {
  if (!date) return false

  const today = getBrazilJSStartOfDay()
  const targetDate = getBrazilJSStartOfDay(date)

  return targetDate < today
}

export function addMinutes(minutes: number, date: string | Date): DateTime {
  const dt = getBrazilDateTime(date)
  return dt.plus({ minutes })
} 
