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
