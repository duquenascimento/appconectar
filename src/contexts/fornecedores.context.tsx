import { setStorage, STORAGE_DEFAULT_KEYS } from '@/src/utils/utils';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { getQuotationsBySupplier } from '../services/quotationService';
import { SupplierData } from '../types/types';
import { useDeliveryDate } from './deliveryDate.context';
import { useRestaurantContext } from './restaurant.context';

interface SupplierContextType {
  availableSuppliers: SupplierData[];
  unavailableSuppliers: SupplierData[];
  loadingSuppliers: boolean;
  getPricesBySupplier: (restaurantId?: string, deliveryDate?: string) => Promise<void>;
}

const SupplierContext = createContext({} as SupplierContextType);

export function SupplierProvider({ children }: { children?: ReactNode }) {
  const [availableSuppliers, setAvailableSuppliers] = useState<SupplierData[]>([]);
  const [unavailableSuppliers, setUnavailableSuppliers] = useState<SupplierData[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState<boolean>(false);
  const { selectedRestaurant, restaurants, loadRestaurants } = useRestaurantContext();
  const { deliveryDate } = useDeliveryDate();

  const saveSuppliersToStorage = async (available: SupplierData[], unavailable: SupplierData[]) => {
    try {
      await setStorage(STORAGE_DEFAULT_KEYS.AVAILABLE_SUPPLIERS, JSON.stringify(available)).catch(
        () => {
          console.warn('Falha ao salvar fornecedores disponíveis no Storage');
        },
      );
      await setStorage(
        STORAGE_DEFAULT_KEYS.UNAVAILABLE_SUPPLIERS,
        JSON.stringify(unavailable),
      ).catch(() => {
        console.warn('Falha ao salvar fornecedores indisponíveis no Storage');
      });
    } catch (error) {
      console.error('Erro ao salvar fornecedores no AsyncStorage:', error);
    }
  };

  const getPricesBySupplier = useCallback(
    async (restaurantExternalId?: string, deliveryDateParam?: string) => {
      if (!selectedRestaurant) return;

      try {
        setLoadingSuppliers(true);

        console.log('Carregando preços por fornecedor...');
        await loadRestaurants();

        const currentRestaurant = restaurants.find(
          (r: any) => r.externalId === (restaurantExternalId ?? selectedRestaurant?.externalId),
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
    [selectedRestaurant?.externalId, deliveryDate, restaurants?.length, saveSuppliersToStorage],
  );

  const value = {
    availableSuppliers,
    unavailableSuppliers,
    loadingSuppliers,
    getPricesBySupplier,
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
