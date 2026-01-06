import { setStorage } from '@/src/utils/utils';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { useDeliveryDate } from '../hooks/useDeliveryDate';
import { SupplierData } from '../types/types';
import { getStorageRestaurant } from '../utils/restaurantUtils';
import { useRestaurantContext } from './restaurant.context';
import { getQuotationsBySupplier } from '../services/quotationService';

interface SupplierContextType {
  availableSuppliers: SupplierData[];
  unavailableSuppliers: SupplierData[];
  loadingSuppliers: boolean;
  selectedRestaurant: any | null;
  loadRestaurants: () => Promise<any | null>;
  loadPrices: (restaurantId?: string, deliveryDate?: string) => Promise<void>;
}

const SupplierContext = createContext({} as SupplierContextType);

export function SupplierProvider({ children }: { children?: ReactNode }) {
  const [availableSuppliers, setAvailableSuppliers] = useState<SupplierData[]>([]);
  const [unavailableSuppliers, setUnavailableSuppliers] = useState<SupplierData[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState<boolean>(false);
  const [selectedRestaurant] = useState<any | null>(null);
  const { loadRestaurants } = useRestaurantContext();
  const { deliveryDate } = useDeliveryDate();

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
    async (restaurantExternalId?: string, deliveryDateParam?: string) => {
      try {
        setLoadingSuppliers(true);

        const restaurantSelected = await getStorageRestaurant();
        const allRestaurants = await loadRestaurants();
        const currentRestaurant = allRestaurants.find(
          (r: any) => r.externalId === (restaurantExternalId ?? restaurantSelected?.externalId),
        );

        if (!currentRestaurant) return;

        const dateToUse = deliveryDateParam ?? deliveryDate;

        const result = await getQuotationsBySupplier({
          deliveryDate: dateToUse,
          restaurantId: currentRestaurant.id,
        });

        setAvailableSuppliers(result.availableSuppliers);
        setUnavailableSuppliers(result.unavailableSuppliers);
        await saveSuppliersToStorage(result.availableSuppliers, result.unavailableSuppliers);
      } catch (error) {
        console.error('Erro ao carregar preços:', error);
      } finally {
        setLoadingSuppliers(false);
      }
    },
    [loadRestaurants],
  );

  const value = {
    availableSuppliers,
    unavailableSuppliers,
    loadingSuppliers,
    selectedRestaurant,
    loadPrices,
    loadRestaurants,
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
