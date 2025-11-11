import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
  ReactNode,
  useEffect,
} from 'react';
import { getToken, setStorage } from '../utils/utils';
import { Restaurant } from '../types/restaurantTypes';
import { getSavedRestaurant } from '../utils/savedRestaurant';

interface RestaurantContextProps {
  restaurants: Restaurant[];
  selectedRestaurant?: Restaurant | null;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  handleRestaurantChange: (restaurant: Restaurant | null) => Promise<void>;
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

        const storedRestaurant = await getSavedRestaurant();
        if (storedRestaurant && storedRestaurant.externalId === restaurant.externalId) return;

        const selected = restaurants.find((r) => r.externalId === restaurant.externalId);
        if (!selected) {
          throw new Error('Restaurante não encontrado');
        }

        await setStorage('selectedRestaurant', JSON.stringify(selected));
        setSelectedRestaurant(selected);
      } catch (error) {
        console.error('Falha ao selecionar restaurante:', error);
      }
    },
    [restaurants],
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
        const stored = await getSavedRestaurant();
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
        const stored = await getSavedRestaurant();
        if (stored) {
          setSelectedRestaurant(stored);
        } else {
          await loadRestaurants();
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
    }),
    [loadRestaurants, restaurants, selectedRestaurant, handleRestaurantChange],
  );

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
}

export const useRestaurantContext = () => useContext(RestaurantContext);
