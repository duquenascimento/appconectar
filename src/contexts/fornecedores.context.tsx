import { getToken, setStorage } from '@/src/utils/utils';
import { DateTime } from 'luxon';
import { createContext, ReactNode, SetStateAction, useCallback, useContext, useState } from 'react';
import { SupplierData } from '../types/types';
import { getStorageRestaurant } from '../utils/restaurantUtils';
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

  const loadPrices = useCallback(
    async (restaurantId?: string) => {
      try {
        setLoadingSuppliers(true);
        const token = await getToken();
        if (!token) return;

        const restaurantSelected = await getStorageRestaurant();
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
