import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  SetStateAction,
} from 'react';
import { SupplierData } from '../types/types';
import { getStorage, getToken, setStorage } from '@/src/utils/utils';
import { DateTime } from 'luxon';
import { useRestaurantContext } from './restaurant.context';

interface SupplierContextType {
  suppliers: SupplierData[];
  unavailableSupplier: SupplierData[];
  loadingSuppliers: boolean;
  selectedRestaurant: any | null;
  loadRestaurants: () => Promise<any | null>;
  loadPrices: (restaurantId?: string) => Promise<void>;
}

const SupplierContext = createContext({} as SupplierContextType);

export function SupplierProvider({ children }: { children?: ReactNode }) {
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [unavailableSupplier, setUnavailableSupplier] = useState<SupplierData[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState<boolean>(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any | null>(null);
  const { loadRestaurants } = useRestaurantContext();

  // --- Função auxiliar para buscar o restaurante salvo no AsyncStorage ---
  const getSavedRestaurant = async () => {
    try {
      const data = await getStorage('selectedRestaurant');
      if (!data) return null;
      const parsedData = JSON.parse(data);
      return parsedData?.restaurant ?? parsedData;
    } catch (error) {
      console.error('Erro ao parsear dados do restaurante:', error);
      return null;
    }
  };

  // --- Salva fornecedores no storage ---
  const saveSuppliersToStorage = async (available: SupplierData[], unavailable: SupplierData[]) => {
    try {
      await setStorage('availableSuppliers', JSON.stringify(available)).catch(() => {
        console.warn('Falha ao salvar fornecedores disponíveis no Storage');
      });
      await setStorage('unavailableSuppliers', JSON.stringify(unavailable)).catch(() => {
        console.warn('Falha ao salvar fornecedores indisponíveis no Storage');
      });
    } catch (error) {
      console.error('Erro ao salvar fornecedores no AsyncStorage:', error);
    }
  };

  // --- Nova função: carregar restaurante atualizado da API ---
  // const loadRestaurants = useCallback(async () => {
  //   try {
  //     const token = await getToken();
  //     if (token == null) return [];
  //     const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/restaurant/list`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         token,
  //       }),
  //     });
  //     if (!result.ok) return [];
  //     const restaurants = await result.json();
  //     if (restaurants.data.length < 1) return [];
  //     return restaurants.data;
  //   } catch (error) {
  //     console.error('Erro ao carregar restaurantes:', error);
  //     return [];
  //   }
  // }, []); // Sem dependências, pois não usa nada do escopo externo que mude

  // --- Carregar preços dos produtos ---
  const loadPrices = useCallback(
    async (restaurantId?: string) => {
      try {
        setLoadingSuppliers(true);
        const token = await getToken();
        if (!token) return;

        const restaurantSelected = await getSavedRestaurant();
        const allRestaurants = await loadRestaurants();
        const currentRestaurant = allRestaurants.find(
          (r: any) => r.externalId === (restaurantId ?? restaurantSelected?.externalId),
        );

        if (!currentRestaurant) return;

        const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/price/list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, selectedRestaurant: currentRestaurant }),
        });

        const response = await result.json();
        const currentDate = DateTime.now().setZone('America/Sao_Paulo');
        const currentHour = Number(
          `${currentDate.hour.toString().padStart(2, '0')}${currentDate.minute
            .toString()
            .padStart(2, '0')}${currentDate.second.toString().padStart(2, '0')}`,
        );

        const allSuppliers = response.data as SupplierData[];

        let available = allSuppliers.filter((item) => item.supplier.missingItens > 0);
        let unavailable: SetStateAction<SupplierData[]> = [];

        if (!currentRestaurant?.allowClosedSupplier) {
          unavailable = unavailable.concat(
            available.filter(
              (item) => Number(item.supplier.hour.replaceAll(':', '')) < currentHour,
            ),
          );
          available = available.filter(
            (item) => Number(item.supplier.hour.replaceAll(':', '')) >= currentHour,
          );
        }

        if (!currentRestaurant?.allowMinimumOrder) {
          unavailable = unavailable.concat(
            available.filter(
              (item) => item.supplier.minimumOrder > item.supplier.discount.orderValueFinish,
            ),
          );
          available = available.filter(
            (item) => item.supplier.minimumOrder <= item.supplier.discount.orderValueFinish,
          );
        }

        setSuppliers(available);
        setUnavailableSupplier(unavailable);
        await saveSuppliersToStorage(available, unavailable);
      } catch (error) {
        console.error('Erro ao carregar preços:', error);
      } finally {
        setLoadingSuppliers(false);
      }
    },
    [loadRestaurants],
  );

  const value = {
    suppliers,
    unavailableSupplier,
    loadingSuppliers,
    selectedRestaurant,
    loadPrices,
  };

  return <SupplierContext.Provider value={value}>{children}</SupplierContext.Provider>;
}

export function useSupplier() {
  const context = useContext(SupplierContext);
  if (!context) {
    throw new Error('useSupplier deve ser usado dentro de um SupplierProvider');
  }
  return context;
}
