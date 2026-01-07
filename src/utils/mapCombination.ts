import { CombinationApiResponse } from '../services/combinationsService';
import { Combination } from '../types/combinationTypes';
import { getBrazilLocaleString } from './dateUtils';

export function mapCombination(apiData: CombinationApiResponse): Combination {
  return {
    id: apiData.id,
    combination: apiData.nome,
    createdAt: getBrazilLocaleString(apiData.created_at),
    sameDayOrders: [],
  };
}
