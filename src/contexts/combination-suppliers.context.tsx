import {
  CombinationSupplierDTO,
  getCombinationSuppliers,
  GetCombinationSuppliersRequestDTO,
} from '@/src/services/combinationsService';
import { Address } from '@/src/types/restaurantTypes';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { resolveMinMaxTimeForRoute } from '../utils/restaurantUtils';

interface CombinationSuppliersContextType {
  suppliers: CombinationSupplierDTO[];
  loading: boolean;
  fetchSuppliers: (restaurantAddressInfo: Address, blockedBySuppliers: string[]) => Promise<void>;
}

const CombinationSuppliersContext = createContext({} as CombinationSuppliersContextType);

export function CombinationSuppliersProvider({ children }: { children: ReactNode }) {
  const [suppliers, setSuppliers] = useState<CombinationSupplierDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuppliers = useCallback(
    async (restaurantAddressInfo: Address, blockedBySuppliers: string[]) => {
      try {
        setLoading(true);

        const dto: GetCombinationSuppliersRequestDTO = {
          city: restaurantAddressInfo.city,
          neighborhood: restaurantAddressInfo.neighborhood,
          blockedBySuppliers: blockedBySuppliers,
        };

        const data = await getCombinationSuppliers(dto);
        setSuppliers(data);
      } catch (error) {
        console.error('Erro ao buscar fornecedores da combinação:', error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return (
    <CombinationSuppliersContext.Provider value={{ suppliers, loading, fetchSuppliers }}>
      {children}
    </CombinationSuppliersContext.Provider>
  );
}

export function useCombinationSuppliers() {
  const context = useContext(CombinationSuppliersContext);
  if (!context) {
    throw new Error(
      'useCombinationSuppliers deve ser usado dentro de um CombinationSuppliersProvider',
    );
  }
  return context;
}
