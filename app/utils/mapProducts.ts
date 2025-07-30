import { ProductResponse } from '@/src/services/productsService';
import { ProrityProductsCombination } from '@/src/components/Combination/prioridade';

export function mapProducts (apiData: ProductResponse): ProrityProductsCombination {
  return {
    id: apiData.id,
    name: apiData.name,
    class: apiData.class
  };
}