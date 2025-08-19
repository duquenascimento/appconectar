import { createContext, useContext, useState, ReactNode, useEffect, useCallback, SetStateAction } from 'react';
import { SupplierData } from '../types/types';
import { getStorage, getToken, setStorage } from '@/app/utils/utils';
import { loadRestaurants } from '@/src/services/restaurantService';
import { DateTime } from 'luxon';

interface SupplierContextType {
  suppliers: SupplierData[];
  unavailableSupplier: SupplierData[];
  loadingSuppliers: boolean;
  loadPrices: (restaurantId?: string) => Promise<void>;
}

const SupplierContext = createContext({} as SupplierContextType);

export function SupplierProvider({ children }: { children: ReactNode }) {
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [unavailableSupplier, setUnavailableSupplier] = useState<SupplierData[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState<boolean>(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any | null>(null);

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

  const saveSuppliersToStorage = async (available: SupplierData[], unavailable: SupplierData[]) => {
    try {
      await setStorage('availableSuppliers', JSON.stringify(available)).catch((e) => {
        console.warn('Falha ao salvar fornecedores disponiveis no Storage')
      })
      await setStorage('unavailableSuppliers', JSON.stringify(unavailable)).catch((e) => {
        console.warn('Falha ao salvar fornecedores indisponiveis no Storage')
      })
    } catch (error) {
      console.error('Erro ao salvar fornecedores no AsyncStorage:', error);
    }
  };

  const loadPrices = useCallback(async (restaurantId?: string) => {
    try {
      setLoadingSuppliers(true);
      const token = await getToken();
      if (!token) return;

      const restaurantSelected = await getSavedRestaurant();
      const allRestaurants = await loadRestaurants();
      const currentRestaurant = allRestaurants.find((r: any) => r.externalId === (restaurantId ?? restaurantSelected?.externalId));

      if (!currentRestaurant) return;

      const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/price/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, selectedRestaurant: currentRestaurant })
      });

      const response = await result.json();
      const currentDate = DateTime.now().setZone('America/Sao_Paulo');
      const currentHour = Number(`${currentDate.hour.toString().padStart(2, '0')}${currentDate.minute.toString().padStart(2, '0')}${currentDate.second.toString().padStart(2, '0')}`);
      
      const allSuppliers = response.data as SupplierData[];
      let available = [];
      let unavailable: SetStateAction<SupplierData[]> = [];

      if (currentRestaurant?.allowClosedSupplier && currentRestaurant?.allowMinimumOrder) {
        available = allSuppliers.filter((item) => item.supplier.missingItens > 0);
      } else {
        available = allSuppliers.filter(
          (item) => Number(item.supplier.hour.replaceAll(':', '')) >= currentHour && item.supplier.minimumOrder <= item.supplier.discount.orderValueFinish && item.supplier.missingItens > 0
        );
        unavailable = allSuppliers.filter(
          (item) => Number(item.supplier.hour.replaceAll(':', '')) < currentHour || item.supplier.minimumOrder > item.supplier.discount.orderValueFinish
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
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      const restaurant = await getSavedRestaurant();
      if (restaurant) {
        setSelectedRestaurant(restaurant);
        loadPrices(restaurant.externalId);
      }
    };
    loadInitialData();
  }, [loadPrices]);
  

  const value = {
    suppliers,
    unavailableSupplier,
    loadingSuppliers,
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