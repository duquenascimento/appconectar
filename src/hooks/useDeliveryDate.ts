import { getAvailableDeliveryDaysFormatted } from '@/src/utils/orderDateValidation.utils';
import { getTomorrowDate } from '@/src/utils/timeUtils';
import { getStorage, setStorage } from '@/src/utils/utils';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useState } from 'react';
import { ComboOption } from '../types/componentTypes';
import { Restaurant } from '../types/restaurantTypes';

interface UseDeliveryDateReturn {
    deliveryDate: string; // ISO date string (yyyy-MM-dd)
    deliveryDates: string[]; // Array of ISO date strings
    setDeliveryDate: (date: string) => void;
    initializeDeliveryDates: (restaurant: Restaurant) => void;
    getFormattedDate: (isoDate?: string) => string; // Returns dd/MM/yyyy
    canChangeDeliveryDate: boolean;
    deliveryDatesDropdownOptions: ComboOption<string>[]; // For dropdown integration
    setDropdownDeliveryDate: (callback: any) => void; // For dropdown integration
    resetDeliveryDate: () => void;
}

export function useDeliveryDate(): UseDeliveryDateReturn {
    const [deliveryDate, setDeliveryDateState] = useState<string>(
        getTomorrowDate().toISODate()!
    );
    const [deliveryDates, setDeliveryDates] = useState<string[]>([]);

    // Load saved delivery date from storage on mount
    useEffect(() => {
        const loadSavedDate = async () => {
            const tomorrowDate = getTomorrowDate();
            const tomorrowISO = tomorrowDate.toISODate()!;

            try {
                const savedDate = await getStorage('selectedDeliveryDate');
                if (!savedDate) {
                    setDeliveryDate(tomorrowISO);
                    return;
                }

                const parsedDate = JSON.parse(savedDate);
                const isDateValid = DateTime.fromISO(parsedDate) >= tomorrowDate;
                if (isDateValid) {
                    setDeliveryDate(parsedDate);
                    return;
                }

                setDeliveryDate(tomorrowISO);
            } catch (error) {
                console.error('Error loading saved delivery date:', error);
                setDeliveryDate(tomorrowISO);
            }
        };
        loadSavedDate();
    }, []);

    const initializeDeliveryDates = useCallback((restaurant: Restaurant) => {
        const availableDates = getAvailableDeliveryDaysFormatted(restaurant);
        setDeliveryDates(availableDates);
    }, []);

    const setDeliveryDate = useCallback((date: string) => {
        setDeliveryDateState(date);
        setStorage('selectedDeliveryDate', JSON.stringify(date));
    }, []);

    const setDropdownDeliveryDate = useCallback((callback: any) => {
        const value = typeof callback === 'function'
            ? callback(deliveryDate)
            : callback;

        if (value) setDeliveryDate(value);
    }, []);

    const deliveryDatesDropdownOptions = deliveryDates.map((date) => ({
        label: DateTime.fromISO(date).toFormat('dd/MM/yyyy'),
        value: date,
    }));

    const getFormattedDate = useCallback((isoDate?: string): string => {
        const dateToFormat = isoDate || deliveryDate;
        return DateTime.fromISO(dateToFormat).toFormat('dd/MM/yyyy');
    }, [deliveryDate]);

    const canChangeDeliveryDate = deliveryDates.length > 1;

    const resetDeliveryDate = useCallback(() => {
        const tomorrow = getTomorrowDate().toISODate()!;
        setDeliveryDate(tomorrow);
    }, []);

    return {
        deliveryDate,
        deliveryDates,
        setDeliveryDate,
        initializeDeliveryDates,
        getFormattedDate,
        canChangeDeliveryDate,
        deliveryDatesDropdownOptions,
        setDropdownDeliveryDate,
        resetDeliveryDate,
    };
}
