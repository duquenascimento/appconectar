import { getStorage, setStorage, STORAGE_DEFAULT_KEYS } from '@/src/utils/utils';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { validate as validateUuid } from 'uuid';
import { QuotationApiResponse, QuotationApiResponseData } from '../services/combinationsService';
import { getQuotationsByCombination } from '../services/quotationService';
import { Combination } from '../types/combinationTypes';
import { transformCombinationFromApi } from '../utils/combinacaoUtils';
import { useDeliveryDate } from './deliveryDate.context';
import { useSupplier } from './fornecedores.context';
import { useRestaurantContext } from './restaurant.context';

interface CombinationContextType {
  myCombinations: Combination[];
  conectarCombinations: Combination[];
  unavailableCombinations: Combination[];
  combinationData: QuotationApiResponseData[];
  loadingCombinations: boolean;
  getCombinationsByRestaurant: (restaurantId?: string, deliveryDate?: string) => Promise<void>;
}

const CombinationContext = createContext({} as CombinationContextType);

export function CombinationProvider({ children }: { children?: ReactNode }) {
  const [myCombinations, setMyCombinations] = useState<Combination[]>([]);
  const [conectarCombinations, setConectarCombinations] = useState<Combination[]>([]);
  const [unavailableCombinations, setUnavailableCombinations] = useState<Combination[]>([]);
  const [combinationData, setCombinationData] = useState<QuotationApiResponseData[]>([]);
  const [loadingCombinations, setLoadingCombinations] = useState<boolean>(false);

  const { selectedRestaurant, restaurants, hasConectarPlusAccess, loadRestaurants } =
    useRestaurantContext();
  const { deliveryDate } = useDeliveryDate();
  const { availableSuppliers, getSuppliersFromStorage } = useSupplier();

  const saveCombinationsToStorage = async (
    my: Combination[],
    conectar: Combination[],
    unavailable: Combination[],
    data: QuotationApiResponseData[],
  ) => {
    try {
      await setStorage(STORAGE_DEFAULT_KEYS.MY_COMBINATIONS, JSON.stringify(my)).catch(() => {
        console.warn('Falha ao salvar minhas combinações no Storage');
      });
      await setStorage(STORAGE_DEFAULT_KEYS.CONECTAR_COMBINATIONS, JSON.stringify(conectar)).catch(
        () => {
          console.warn('Falha ao salvar combinações Conectar no Storage');
        },
      );
      await setStorage(
        STORAGE_DEFAULT_KEYS.UNAVAILABLE_COMBINATIONS,
        JSON.stringify(unavailable),
      ).catch(() => {
        console.warn('Falha ao salvar combinações indisponíveis no Storage');
      });
      await setStorage(STORAGE_DEFAULT_KEYS.COMBINATION_DATA, JSON.stringify(data)).catch(() => {
        console.warn('Falha ao salvar dados de combinação no Storage');
      });
    } catch (error) {
      console.error('Erro ao salvar combinações no AsyncStorage:', error);
    }
  };

  const getCombinationsByRestaurant = useCallback(
    async (restaurantIdParam?: string, deliveryDateParam?: string) => {
      if (!selectedRestaurant || !hasConectarPlusAccess) return;

      if (availableSuppliers.length === 0) {
        await getSuppliersFromStorage();
        return;
      }

      try {
        setLoadingCombinations(true);

        await loadRestaurants();

        const currentRestaurant = restaurants.find(
          (r: any) => r.id === (restaurantIdParam ?? selectedRestaurant?.id),
        );

        if (!currentRestaurant) return;

        const dateToUse = deliveryDateParam ?? deliveryDate;

        // Get cart items count
        const cartStoredValue = JSON.parse(
          (await getStorage(`cart_${currentRestaurant.externalId}`)) || '[]',
        );
        const totalItens = cartStoredValue?.length || 0;

        const result: QuotationApiResponse = await getQuotationsByCombination({
          restaurantId: currentRestaurant.id,
          deliveryDate: dateToUse,
        });

        // Store raw combination data
        const allCombinationData = [
          ...result.availableCombinations,
          ...result.unavailableCombinations,
        ];
        setCombinationData(allCombinationData);

        // Transform combinations
        const availableCombinations = transformCombinationFromApi(
          result.availableCombinations,
          totalItens,
          availableSuppliers,
        );
        const unavailableCombinationsTransformed = transformCombinationFromApi(
          result.unavailableCombinations,
          totalItens,
          availableSuppliers,
        );

        // Separate by type (user-created vs Conectar)
        const myCombs = availableCombinations.filter((c) => validateUuid(c.id));
        const conectarCombs = availableCombinations.filter((c) => !validateUuid(c.id));

        setMyCombinations(myCombs);
        setConectarCombinations(conectarCombs);
        setUnavailableCombinations(unavailableCombinationsTransformed);

        await saveCombinationsToStorage(
          myCombs,
          conectarCombs,
          unavailableCombinationsTransformed,
          allCombinationData,
        );
      } catch (error) {
        console.error('Erro ao carregar combinações:', error);
        throw error;
      } finally {
        setLoadingCombinations(false);
      }
    },
    [selectedRestaurant?.id, deliveryDate, restaurants?.length, availableSuppliers?.length],
  );

  const value = {
    myCombinations,
    conectarCombinations,
    unavailableCombinations,
    combinationData,
    loadingCombinations,
    getCombinationsByRestaurant,
  };

  return <CombinationContext.Provider value={value}>{children}</CombinationContext.Provider>;
}

export function useCombination() {
  const context = useContext(CombinationContext);
  if (!context) {
    throw new Error('useCombination deve ser usado dentro de um CombinationProvider');
  }
  return context;
}
