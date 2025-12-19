import { getToken, setStorage } from '@/src/utils/utils';
import { DateTime } from 'luxon';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { useDeliveryDate } from '../hooks/useDeliveryDate';
import { SupplierData } from '../types/types';
import { getStorageRestaurant } from '../utils/restaurantUtils';
import { useRestaurantContext } from './restaurant.context';

interface SupplierContextType {
  suppliers: SupplierData[];
  unavailableSupplier: SupplierData[];
  loadingSuppliers: boolean;
  selectedRestaurant: any | null;
  loadRestaurants: () => Promise<any | null>;
  loadPrices: (restaurantId?: string, deliveryDate?: string) => Promise<void>;
}

const SupplierContext = createContext({} as SupplierContextType);

export function SupplierProvider({ children }: { children?: ReactNode }) {
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [unavailableSupplier, setUnavailableSupplier] = useState<SupplierData[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState<boolean>(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any | null>(null);
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
        const token = await getToken();
        if (!token) return;

        const restaurantSelected = await getStorageRestaurant();
        const allRestaurants = await loadRestaurants();
        const currentRestaurant = allRestaurants.find(
          (r: any) => r.externalId === (restaurantExternalId ?? restaurantSelected?.externalId),
        );

        if (!currentRestaurant) return;

        const dateToUse = deliveryDateParam ?? deliveryDate;
        const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/price/list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            selectedRestaurant: currentRestaurant,
            deliveryDate: dateToUse,
          }),
        });

        const response = await result.json();
        const currentDate = DateTime.now().setZone('America/Sao_Paulo');
        const currentHour = Number(
          `${currentDate.hour.toString().padStart(2, '0')}${currentDate.minute
            .toString()
            .padStart(2, '0')}${currentDate.second.toString().padStart(2, '0')}`,
        );

        const allSuppliers = response.data as SupplierData[];

        const isSupplierAvailable = (supplier: SupplierData): boolean => {
          // Check basic availability criteria
          const hasAvailableProducts =
            supplier.supplier.missingItens < supplier.supplier.discount.product.length;
          const hasPositiveOrderValue = supplier.supplier.discount.orderValue > 0;

          if (!hasAvailableProducts || !hasPositiveOrderValue) {
            return false;
          }

          // Check if supplier is closed (based on hour)
          if (!currentRestaurant?.allowClosedSupplier) {
            const supplierHour = Number(supplier.supplier.hour.replaceAll(':', ''));
            if (supplierHour < currentHour) {
              return false;
            }
          }

          // Check minimum order requirements
          if (!currentRestaurant?.allowMinimumOrder) {
            const meetsMinimumOrder =
              supplier.supplier.minimumOrder <= supplier.supplier.discount.orderValueFinish;
            const hasSameDayOrders = supplier.supplier.sameDayOrders.length > 0;

            if (!meetsMinimumOrder && !hasSameDayOrders) {
              return false;
            }
          }

          return true;
        };

        const { available, unavailable } = allSuppliers.reduce(
          (acc, supplier) => {
            if (isSupplierAvailable(supplier)) {
              acc.available.push(supplier);
            } else {
              acc.unavailable.push(supplier);
            }
            return acc;
          },
          { available: [] as SupplierData[], unavailable: [] as SupplierData[] },
        );

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
