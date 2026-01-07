import { DateTime } from 'luxon';

export function isTomorrowOrToday(dateToCheck: DateTime): boolean {
  const today = DateTime.local();

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
  const today = DateTime.local();
  const tomorrow = today.plus({ days: 1 });

  // Compare year, month, and day to check if it's the same date
  return (
    dateToCheck.hasSame(tomorrow, 'year') &&
    dateToCheck.hasSame(tomorrow, 'month') &&
    dateToCheck.hasSame(tomorrow, 'day')
  );
}

export function convertToDaysUpFront(date: DateTime): number {
  return Math.ceil(date.diff(DateTime.now(), 'days').days);
}

export function convertFromDaysUpFront(daysUpfront: number): DateTime {
  return DateTime.now().plus({ days: daysUpfront }).startOf('day');
}

export const getBrazilDateTime = (date?: Date | string | DateTime, format?: string): DateTime => {
  let dt = date ?? DateTime.now().setZone('America/Sao_Paulo');

  if (typeof dt === 'string') {
    console.log('Parsing date string:', dt, 'with format:', format);

    if (format) {
      dt = DateTime.fromFormat(dt, format, { zone: 'America/Sao_Paulo' });
    } else {
      dt = DateTime.fromISO(dt, { zone: 'America/Sao_Paulo' });
    }

    if (!dt.isValid) {
      throw new Error(
        `Invalid date: ${dt}${format ? ` with format ${format}` : ''}. Err: ${dt.invalidReason}`,
      );
    }

    console.log('Parsed DateTime:', dt.toString());

    return dt;
  }

  if (dt instanceof Date) {
    return DateTime.fromJSDate(dt).setZone('America/Sao_Paulo');
  }

  return dt.setZone('America/Sao_Paulo');
};

export const getBrazilDateTimeTomorrow = (): DateTime => {
  return getBrazilDateTime(DateTime.now().plus({ days: 1 }));
};

export const getBrazilJSDate = (date?: Date | string | DateTime, format?: string): Date => {
  const dt = getBrazilDateTime(date, format);
  return dt.toJSDate();
};

export const getBrazilJSDateTomorrow = (): Date => {
  return getBrazilDateTimeTomorrow().toJSDate();
};
