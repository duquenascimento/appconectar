import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getUserRestaurants, updateRestaurantDeliveryInfo } from '../services/restaurantService';
import { Restaurant } from '../types/restaurantTypes';
import { getStorageRestaurant, setStorageRestaurant } from '../utils/restaurantUtils';
import { useAuthContext } from './auth.context';
import { useDeliveryDate } from './deliveryDate.context';

interface RestaurantContextProps {
  restaurants: Restaurant[];
  selectedRestaurant?: Restaurant | null;
  saveRestaurant: (restaurant: Restaurant) => Promise<void>;
  handleRestaurantChange: (restaurant: Restaurant | null) => Promise<void>;
  updateRestaurant: (restaurant: Restaurant) => Promise<void>;
  loadRestaurants: (currentRestaurant?: Restaurant) => Promise<Restaurant[]>;
  areRestaurantsLoading: boolean;
  hasConectarPlusAccess: boolean;
}

const RestaurantContext = createContext<RestaurantContextProps>({} as RestaurantContextProps);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const { authToken } = useAuthContext();
  const { initializeDeliveryDates } = useDeliveryDate();

  const saveRestaurant = useCallback(async (restaurant: Restaurant): Promise<void> => {
    setSelectedRestaurant(restaurant);
    await setStorageRestaurant(restaurant);
  }, []);

  const handleRestaurantChange = useCallback(
    async (restaurant: Restaurant | null): Promise<void> => {
      try {
        if (!restaurant) return;

        const storedRestaurant = await getStorageRestaurant();
        if (storedRestaurant?.externalId === restaurant.externalId) return;

        const foundRestaurant = restaurants.find((r) => r.externalId === restaurant.externalId);
        if (!foundRestaurant) {
          throw new Error('Restaurante não encontrado');
        }

        await saveRestaurant(foundRestaurant);
      } catch (error) {
        console.error('Falha ao selecionar restaurante:', error);
      }
    },
    [restaurants, saveRestaurant],
  );

  const updateRestaurant = useCallback(
    async (data: Partial<Restaurant>): Promise<void> => {
      if (!selectedRestaurant) return;

      await updateRestaurantDeliveryInfo(selectedRestaurant.id, data);
      const updatedRestaurant = { ...selectedRestaurant, ...data };

      setRestaurants((prev) =>
        prev.map((r) => (r.externalId === updatedRestaurant.externalId ? updatedRestaurant : r)),
      );

      await saveRestaurant(updatedRestaurant);
    },
    [selectedRestaurant, saveRestaurant],
  );

  const loadRestaurants = useCallback(
    async (currentRestaurant?: Restaurant): Promise<Restaurant[]> => {
      setLoading(true);

      try {
        const fetchedRestaurants = await getUserRestaurants();

        if (!fetchedRestaurants?.length) {
          setRestaurants([]);
          return [];
        }

        setRestaurants(fetchedRestaurants);

        let newSelectedRestaurant = currentRestaurant ?? selectedRestaurant;

        if (newSelectedRestaurant !== null && fetchedRestaurants.length > 0) {
          const listRestaurant = fetchedRestaurants.find(
            (r) => r.externalId === newSelectedRestaurant?.externalId,
          );
          if (listRestaurant) {
            newSelectedRestaurant = listRestaurant;
          }
        } else {
          const stored = await getStorageRestaurant();
          const storedRestaurant = stored ?? fetchedRestaurants[0];
          newSelectedRestaurant = storedRestaurant;
        }

        await saveRestaurant(newSelectedRestaurant);
        await initializeDeliveryDates(newSelectedRestaurant.id);

        return fetchedRestaurants;
      } catch (error) {
        console.error('Erro ao carregar restaurantes:', error);
        setRestaurants([]);
        setSelectedRestaurant(null);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [selectedRestaurant, saveRestaurant, initializeDeliveryDates],
  );

  useEffect(() => {
    const initialize = async () => {
      if (!authToken) {
        if (selectedRestaurant) {
          setSelectedRestaurant(null);
          setLoading(false);
          setRestaurants([]);
        }
        return;
      }

      try {
        await loadRestaurants();
      } catch (error) {
        console.error('Erro ao inicializar restaurante:', error);
      }
    };
    initialize();
  }, [authToken, saveRestaurant]);

  const hasConectarPlusAccess = useMemo(() => {
    if (!selectedRestaurant) return false;

    return selectedRestaurant.premium && selectedRestaurant.conectarPlusAuthorization;
  }, [selectedRestaurant]);

  const value = useMemo(
    () => ({
      loadRestaurants,
      restaurants,
      selectedRestaurant,
      saveRestaurant,
      handleRestaurantChange,
      updateRestaurant,
      areRestaurantsLoading: loading,
      hasConectarPlusAccess,
    }),
    [
      restaurants,
      selectedRestaurant,
      saveRestaurant,
      handleRestaurantChange,
      updateRestaurant,
      loading,
      hasConectarPlusAccess,
    ],
  );

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
}

export const useRestaurantContext = () => useContext(RestaurantContext);
