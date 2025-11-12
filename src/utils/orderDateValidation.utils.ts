import { Restaurant } from "@/src/types/restaurant";
import { DateTime } from "luxon";

/**
 * Check if a restaurant can accept orders for a specific day of the week
 * @param restaurant - Restaurant object with optional deliveryPolicy
 * @param targetDayOfWeek - Day of week (1=Monday, 7=Sunday)
 * @returns boolean - true if orders are allowed for that day
 */
export function canDeliverOnDay(
    targetDayOfWeek: number,
    restaurant: Restaurant,
): boolean {
    // If it's Sunday, check restaurant's custom delivery policy
    if (targetDayOfWeek === 7) return restaurant.deliveryPolicy.canCreateSundayOrders;

    // Default behavior: Monday-Saturday is enabled
    return true;
}

/**
 * Check if an order can be created today for a target date
 * @param restaurant - Restaurant object
 * @param targetDate - The desired delivery date
 * @returns boolean - true if order can be created
 */
export function canCreateOrderForDate(
    targetDate: DateTime,
    restaurant: Restaurant,
): boolean {
    const today = DateTime.now().setZone('America/Sao_Paulo');
    const todayDay = today.get('day');
    const targetDay = targetDate.get('day');

    // Special case: Friday -> Sunday
    if (todayDay === 5 && targetDay === 7) {
        return canDeliverOnDay(7, restaurant); // Check if Sunday is allowed
    }

    // Check if target day is allowed for this restaurant
    if (!canDeliverOnDay(targetDay, restaurant)) {
        return false;
    }

    // Standard case: next day delivery
    const tomorrow = today.plus({ days: 1 });

    return targetDate.toISODate() === tomorrow.toISODate();
}

/**
 * Check if a restaurant can accept orders for tomorrow
 * @param restaurant - Restaurant object with optional deliveryPolicy
 * @returns boolean - true if orders are allowed for tomorrow
 */
export function canDeliverTomorrow(restaurant: Restaurant): boolean {
    const today = DateTime.now().setZone('America/Sao_Paulo');
    const todayDay = today.get('day');

    // Special case: Friday -> Sunday
    if (todayDay === 5) {
        return canDeliverOnDay(7, restaurant); // Check if Sunday is allowed
    }

    // Standard case: check for tomorrow
    const tomorrowDay = (todayDay + 1) % 7;
    return canDeliverOnDay(tomorrowDay, restaurant);
}

/**
 * Return the available delivery days for a restaurant, being possible tomorrow and sunday only
 * @param restaurant - Restaurant object with optional deliveryPolicy
 * @returns string[] - Array of available delivery dates as ISO date strings (yyyy-MM-dd)
 */
export function getAvailableDeliveryDaysFormatted(restaurant: Restaurant): string[] {
    const availableDates: string[] = [];
    const today = DateTime.now().setZone('America/Sao_Paulo');
    const tomorrow = today.plus({ days: 1 });

    if (canDeliverTomorrow(restaurant)) {
        availableDates.push(tomorrow.toISODate()!);
    }

    // Special case: Friday -> Sunday
    if (today.get('day') === 5 && canDeliverOnDay(7, restaurant)) {
        const sunday = tomorrow.plus({ days: 1 });
        availableDates.push(sunday.toISODate()!);
    }

    return availableDates;
}