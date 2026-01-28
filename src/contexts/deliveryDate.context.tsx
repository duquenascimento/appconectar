import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getAvailableDeliveryDatesByRestaurant } from '../services/deliveryDateService';
import { ComboOption } from '../types/componentTypes';
import {
  getBrazilDateTime,
  getBrazilDateTimeTomorrow,
  isDateBeforeToday,
} from '../utils/dateUtils';
import { useRestaurantContext } from './restaurant.context';

interface DeliveryDateContextProps {
  deliveryDate: string; // ISO date string (yyyy-MM-dd)
  deliveryDates: string[]; // Array of ISO date strings
  setDeliveryDate: (date: string) => void;
  initializeDeliveryDates: (restaurantId?: string) => Promise<void>;
  getFormattedDate: (isoDate?: string) => string; // Returns dd/MM/yyyy
  canChangeDeliveryDate: boolean;
  deliveryDatesDropdownOptions: () => ComboOption<string>[]; // For dropdown integration
  setDropdownDeliveryDate: (callback: any) => void; // For dropdown integration
  resetDeliveryDate: () => void;
  loading: boolean;
  errorMessage: string | null;
  isRetroactiveDate: boolean;
}

const DeliveryDateContext = createContext<DeliveryDateContextProps>({} as DeliveryDateContextProps);

export function DeliveryDateProvider({ children }: { children: ReactNode }) {
  const [deliveryDate, setDeliveryDate] = useState<string>(
    getBrazilDateTimeTomorrow().toISODate()!,
  );
  const [deliveryDates, setDeliveryDates] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const { selectedRestaurant } = useRestaurantContext();

  const isRetroactiveDate = useMemo(() => {
    return isDateBeforeToday(deliveryDate);
  }, [deliveryDate]);

  useEffect(() => {
    const initialize = async () => {
      if (!selectedRestaurant || initialized) return;

      setLoading(true);
      setErrorMessage(null);

      try {
        const availableDates = await getAvailableDeliveryDatesByRestaurant(selectedRestaurant.id);
        setDeliveryDates(availableDates);

        const tomorrowISO = getBrazilDateTimeTomorrow().toISODate()!;

        const dateToSet: string = availableDates.length > 0 ? availableDates[0] : tomorrowISO;

        setDeliveryDate(dateToSet);
        setInitialized(true);
      } catch (error) {
        console.error('Error initializing delivery dates:', error);
        setErrorMessage(error instanceof Error ? error.message : String(error));
        setDeliveryDate(getBrazilDateTimeTomorrow().toISODate()!);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [selectedRestaurant, initialized]);

  const initializeDeliveryDates = useCallback(
    async (restaurantId?: string) => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const availableDates = await getAvailableDeliveryDatesByRestaurant(
          restaurantId ?? selectedRestaurant?.id ?? '',
        );
        setDeliveryDates(availableDates);

        if (
          availableDates.length > 0 &&
          !availableDates.includes(deliveryDate) &&
          !isRetroactiveDate
        ) {
          setDeliveryDate(availableDates[0]);
        }
      } catch (error: Error | any) {
        setErrorMessage(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    },
    [deliveryDate, selectedRestaurant, isRetroactiveDate],
  );

  const setDropdownDeliveryDate = useCallback(
    (callback: any) => {
      const value = typeof callback === 'function' ? callback(deliveryDate) : callback;
      if (value) setDeliveryDate(value);
    },
    [deliveryDate],
  );

  const deliveryDatesDropdownOptions = useCallback((): ComboOption<string>[] => {
    return deliveryDates.map((date) => ({
      label: getBrazilDateTime(date).toFormat('dd/MM/yyyy'),
      value: date,
    }));
  }, [deliveryDates]);

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

  const value = useMemo(
    () => ({
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
    }),
    [
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
    ],
  );

  return <DeliveryDateContext.Provider value={value}>{children}</DeliveryDateContext.Provider>;
}

export const useDeliveryDate = () => useContext(DeliveryDateContext);
