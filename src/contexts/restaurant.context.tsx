import React, { createContext, useContext, useCallback, useState } from 'react';
import { getToken } from '../utils/utils';
import { Restaurant } from '../../app/products';


interface RestaurantContextProps {
  restaurants: Restaurant[];
  loadRestaurants: () => Promise<void>;
  loading: boolean;
}

const RestaurantContext = createContext<RestaurantContextProps>({
  restaurants: [],
  loadRestaurants: async () => {},
  loading: false,
});

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRestaurants = useCallback(async () => {
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
      setRestaurants(data?.data ?? []);
      return data?.data ?? [];
    } catch (error) {
      console.error('Erro ao carregar restaurantes:', error);
      setRestaurants([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <RestaurantContext.Provider value={{ restaurants, loadRestaurants, loading }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurantContext = () => useContext(RestaurantContext);
