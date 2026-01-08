import { getAvailableDeliveryDaysFormatted } from '@/src/utils/orderDateValidation.utils';
import { getStorage, setStorage } from '@/src/utils/utils';
import { useCallback, useEffect, useState } from 'react';
import { useRestaurantContext } from '../contexts/restaurant.context';
import { ComboOption } from '../types/componentTypes';
import { Restaurant } from '../types/restaurantTypes';
import { getBrazilDateTime, getBrazilDateTimeTomorrow } from '../utils/dateUtils';

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
  const [deliveryDate, setDeliveryDateState] = useState<string>(getBrazilDateTimeTomorrow().toISODate()!);
  const [deliveryDates, setDeliveryDates] = useState<string[]>([]);
  const { selectedRestaurant } = useRestaurantContext();

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

  const initializeDeliveryDates = useCallback((restaurant: Restaurant) => {
    const availableDates = getAvailableDeliveryDaysFormatted(restaurant);
    setDeliveryDates(availableDates);
  }, []);

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
