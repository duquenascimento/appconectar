import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getFavorites } from '../services/favoritosService';
import { Favorites } from '../types/favoriteTypes';
import { getToken } from '../utils/utils';
import { useRestaurantContext } from './restaurant.context';

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

      const favoritesResponse = await getFavorites(token, selectedRestaurant.id);

      setFavorites(favoritesResponse);

      return favoritesResponse;
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
