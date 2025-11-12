import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getToken } from '../utils/utils';
import { useRestaurantContext } from './restaurant.context';
import { Favorites } from '../types/favoriteTypes';

interface FavoritesContextType {
  favorites: Favorites[];
  setFavorites: (favorites: Favorites[]) => void;
  loadFavorites: () => Promise<Favorites[]>;
}

const FavoritesContext = createContext<FavoritesContextType>({} as FavoritesContextType);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Favorites[]>([]);
  const [, setLoading] = useState(false);
  const { selectedRestaurant } = useRestaurantContext();

  const loadFavorites = useCallback(async (): Promise<Favorites[]> => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token || !selectedRestaurant) {
        return [];
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/favorite/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          restaurantId: selectedRestaurant.id,
        }),
      });

      if (!response.ok) {
        console.warn('Falha ao carregar favoritos:', response.status);
        return [];
      }

      const data = await response.json();
      const list = data?.data;
      setFavorites(list);

      return list;
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      return [];
    }
  }, [selectedRestaurant]);

  useEffect(() => {
    loadFavorites();
  }, [selectedRestaurant]);

  const value = useMemo(
    () => ({
      favorites,
      setFavorites,
      loadFavorites,
    }),
    [favorites, loadFavorites],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export const useFavoritesContext = () => useContext(FavoritesContext);
