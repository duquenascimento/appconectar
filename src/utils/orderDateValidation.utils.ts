import { Restaurant } from "@/src/types/restaurant";
import { DateTime } from "luxon";

// Constants for days of the week
const FRIDAY = 5;
const SATURDAY = 6;
const SUNDAY = 7;
const TIMEZONE = 'America/Sao_Paulo';

/**
 * Get the current date/time in São Paulo timezone
 */
function getToday(): DateTime {
    return DateTime.now().setZone(TIMEZONE);
}

/**
 * Check if a restaurant allows Sunday deliveries
 * @param restaurant - Restaurant object with deliveryPolicy
 * @returns boolean - true if Sunday deliveries are allowed
 */
function canDeliverOnSunday(restaurant: Restaurant): boolean {
    return restaurant.deliveryPolicy.canCreateSundayOrders;
}

/**
 * Check if an order can be created today for a target date
 * @param targetDate - The desired delivery date
 * @param restaurant - Restaurant object
 * @returns boolean - true if order can be created
 */
export function canCreateOrderForDate(
    targetDate: DateTime,
    restaurant: Restaurant,
): boolean {
    const availableDates = getAvailableDeliveryDaysFormatted(restaurant);
    const targetDateString = targetDate.toISODate();

    return targetDateString !== null && availableDates.includes(targetDateString);
}

/**
 * Check if a specific date is a valid delivery date for the restaurant
 * @param date - The date to check
 * @param restaurant - Restaurant object with deliveryPolicy
 * @returns boolean - true if the date is valid for delivery
 */
function isValidDeliveryDate(date: DateTime, restaurant: Restaurant): boolean {
    const dayOfWeek = date.weekday;
    
    // Sunday requires special permission
    if (dayOfWeek === SUNDAY) {
        return canDeliverOnSunday(restaurant);
    }
    
    // All other days (Monday-Saturday) are valid
    return true;
}

/**
 * Safely add a date to the available dates array
 * @param dates - Array to add the date to
 * @param date - DateTime to convert and add
 */
function addDateIfValid(dates: string[], date: DateTime): void {
    const dateString = date.toISODate();
    if (dateString) {
        dates.push(dateString);
    }
}

/**
 * Calculate the next valid delivery date from a given starting point
 * @param fromDate - Starting date to calculate from
 * @param daysToAdd - Number of days to add
 * @param restaurant - Restaurant object with deliveryPolicy
 * @returns DateTime | null - Next valid date or null if not valid
 */
function getNextValidDeliveryDate(
    fromDate: DateTime,
    daysToAdd: number,
    restaurant: Restaurant,
): DateTime | null {
    const targetDate = fromDate.plus({ days: daysToAdd });
    return isValidDeliveryDate(targetDate, restaurant) ? targetDate : null;
}

/**
 * Return the available delivery days for a restaurant, being possible tomorrow and sunday only
 * @param restaurant - Restaurant object with deliveryPolicy
 * @returns string[] - Array of available delivery dates as ISO date strings (yyyy-MM-dd)
 */
export function getAvailableDeliveryDaysFormatted(restaurant: Restaurant): string[] {
    const availableDates: string[] = [];
    const today = getToday();
    const todayDay = today.weekday;

    // Rule 1: Standard next-day delivery
    const nextDay = getNextValidDeliveryDate(today, 1, restaurant);
    if (nextDay) {
        addDateIfValid(availableDates, nextDay);
    }

    // Rule 2: Saturday skips Sunday, delivers Monday
    if (todayDay === SATURDAY) {
        const monday = today.plus({ days: 2 });
        addDateIfValid(availableDates, monday);
    }

    // Rule 3: Friday can optionally deliver on Sunday (if restaurant allows)
    if (todayDay === FRIDAY && canDeliverOnSunday(restaurant)) {
        const sunday = today.plus({ days: 2 });
        addDateIfValid(availableDates, sunday);
    }

    return availableDates;
}