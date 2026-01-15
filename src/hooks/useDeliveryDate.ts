import { getStorage, setStorage } from '@/src/utils/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRestaurantContext } from '../contexts/restaurant.context';
import { getAvailableDeliveryDatesByRestaurant } from '../services/deliveryDateService';
import { ComboOption } from '../types/componentTypes';
import { Restaurant } from '../types/restaurantTypes';
import { getBrazilDateTime, getBrazilDateTimeTomorrow, isDateBeforeToday } from '../utils/dateUtils';

interface UseDeliveryDateReturn {
  deliveryDate: string; // ISO date string (yyyy-MM-dd)
  deliveryDates: string[]; // Array of ISO date strings
  setDeliveryDate: (date: string) => void;
  initializeDeliveryDates: (restaurant: Restaurant) => Promise<void>;
  getFormattedDate: (isoDate?: string) => string; // Returns dd/MM/yyyy
  canChangeDeliveryDate: boolean;
  deliveryDatesDropdownOptions: ComboOption<string>[]; // For dropdown integration
  setDropdownDeliveryDate: (callback: any) => void; // For dropdown integration
  resetDeliveryDate: () => void;
  loading: boolean;
  errorMessage: string | null;
  isRetroactiveDate: boolean;
}

export function useDeliveryDate(): UseDeliveryDateReturn {
  const [deliveryDate, setDeliveryDateState] = useState<string>(getBrazilDateTimeTomorrow().toISODate()!);
  const [deliveryDates, setDeliveryDates] = useState<string[]>([]);
  const { selectedRestaurant } = useRestaurantContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isRetroactiveDate = useMemo(() => {
    return isDateBeforeToday(deliveryDate);
  }, [deliveryDate]);

  // Load saved delivery date from storage on mount
  useEffect(() => {
    const loadSavedDate = async () => {
      const tomorrowDate = getBrazilDateTimeTomorrow();
      const tomorrowISO = tomorrowDate.toISODate()!;
      const todayDate = getBrazilDateTime();
      const todayISO = todayDate.toISODate()!;

      try {
        if (!selectedRestaurant) {
          return;
        }
        if (selectedRestaurant.allowEmergencyOrder) {
          setDeliveryDate(todayISO);
          return;
        }
        const savedDate = await getStorage('selectedDeliveryDate');
        if (!savedDate) {
          setDeliveryDate(tomorrowISO);
          return;
        }

        const parsedDate = JSON.parse(savedDate);
        const isDateValid = getBrazilDateTime(parsedDate) >= tomorrowDate;
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
  }, [selectedRestaurant]);

  const initializeDeliveryDates = useCallback(async (restaurant: Restaurant) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const availableDates = await getAvailableDeliveryDatesByRestaurant(restaurant.id);

      // TODO: Need to change this to display a DatePicker for the user
      // For admin users, add retroactive dates (last 60 days) to the available dates
      if (isRetroactiveDate) {
        const today = getBrazilDateTime();
        const retroactiveDates: string[] = [];

        // Generate retroactive dates for the last 60 days
        for (let i = 1; i <= 60; i++) {
          const pastDate = today.minus({ days: i }).toISODate();
          if (pastDate) {
            retroactiveDates.push(pastDate);
          }
        }

        // Combine retroactive dates with future dates and remove duplicates
        const allDates = [...retroactiveDates.reverse(), ...availableDates];
        const uniqueDates = Array.from(new Set(allDates)).sort();
        setDeliveryDates(uniqueDates);
      } else {
        setDeliveryDates(availableDates);
      }
    } catch (error: Error | any) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }, [isRetroactiveDate]);

  const setDeliveryDate = useCallback((date: string) => {
    setDeliveryDateState(date);
    setStorage('selectedDeliveryDate', JSON.stringify(date));
  }, []);

  const setDropdownDeliveryDate = useCallback((callback: any) => {
    const value = typeof callback === 'function' ? callback(deliveryDate) : callback;

    if (value) setDeliveryDate(value);
  }, []);

  const deliveryDatesDropdownOptions = deliveryDates.map((date) => ({
    label: getBrazilDateTime(date).toFormat('dd/MM/yyyy'),
    value: date,
  }));

  const getFormattedDate = useCallback(
    (isoDate?: string): string => {
      const dateToFormat = isoDate || deliveryDate;
      return getBrazilDateTime(dateToFormat).toFormat('dd/MM/yyyy');
    },
    [deliveryDate],
  );

  const canChangeDeliveryDate = deliveryDates.length > 1;

  const resetDeliveryDate = useCallback(() => {
    const tomorrow = getBrazilDateTimeTomorrow().toISODate()!;
    setDeliveryDate(tomorrow);
  }, [setDeliveryDate]);

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
    loading,
    errorMessage,
    isRetroactiveDate,
  };
}
