import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { updateRestaurantDeliveryInfo } from '../services/restaurantService';
import { Restaurant } from '../types/restaurantTypes';
import { getStorageRestaurant, setStorageRestaurant } from '../utils/restaurantUtils';
import { getToken } from '../utils/utils';

interface RestaurantContextProps {
  restaurants: Restaurant[];
  selectedRestaurant?: Restaurant | null;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  handleRestaurantChange: (restaurant: Restaurant | null) => Promise<void>;
  updateRestaurant: (restaurant: Restaurant) => Promise<void>;
  loadRestaurants: () => Promise<Restaurant[]>;
}

const RestaurantContext = createContext<RestaurantContextProps>({} as RestaurantContextProps);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [, setLoading] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const handleRestaurantChange = useCallback(
    async (restaurant: Restaurant | null) => {
      try {
        if (!restaurant) return;

        const storedRestaurant = await getStorageRestaurant();
        if (storedRestaurant && storedRestaurant.externalId === restaurant.externalId) return;

        const selected = restaurants.find((r) => r.externalId === restaurant.externalId);
        if (!selected) {
          throw new Error('Restaurante não encontrado');
        }

        setSelectedRestaurant(selected);
        await setStorageRestaurant(selected);
      } catch (error) {
        console.error('Falha ao selecionar restaurante:', error);
      }
    },
    [restaurants],
  );

  const updateRestaurant = useCallback(
    async (data: Partial<Restaurant>) => {
      if (!selectedRestaurant) return;

      await updateRestaurantDeliveryInfo(selectedRestaurant.id, data);
      const newRestaurant = { ...selectedRestaurant, ...data };

      await setStorageRestaurant(newRestaurant);

      setRestaurants((prev) =>
        prev.map((r) => (r.externalId === newRestaurant.externalId ? newRestaurant : r)),
      );
      setSelectedRestaurant(newRestaurant);
    },
    [selectedRestaurant],
  );

  const loadRestaurants = useCallback(async (): Promise<Restaurant[]> => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        setRestaurants([]);
        return [];
      }

      const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/restaurant/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!result.ok) {
        setRestaurants([]);
        return [];
      }

      const data = await result.json();
      const list = data?.data ?? [];

      setRestaurants(list);

      if (!selectedRestaurant && list.length > 0) {
        const stored = await getStorageRestaurant();
        setSelectedRestaurant(stored ?? list[0]);
      }

      return list;
    } catch (error) {
      console.error('Erro ao carregar restaurantes:', error);
      setRestaurants([]);
      setSelectedRestaurant(null);
      return [];
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurant]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const stored = await getStorageRestaurant();
        const list = await loadRestaurants();

        if (stored) {
          const exists = list.find((r) => r.externalId === stored.externalId);
          setSelectedRestaurant(exists ?? list[0] ?? null);
        } else {
          setSelectedRestaurant(list[0] ?? null);
        }
      } catch (error) {
        console.error('Erro ao inicializar restaurante:', error);
      }
    };
    initialize();
  }, []);

  const value = useMemo(
    () => ({
      loadRestaurants,
      restaurants,
      selectedRestaurant,
      setSelectedRestaurant,
      handleRestaurantChange,
      updateRestaurant,
    }),
    [loadRestaurants, restaurants, selectedRestaurant, handleRestaurantChange],
  );

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
}

export const useRestaurantContext = () => useContext(RestaurantContext);
