import { CombinationApiResponse } from '../services/combinationsService';
import { Combination } from '../types/combinationTypes';

export function mapCombination(apiData: CombinationApiResponse): Combination {
  return {
    id: apiData.id,
    combination: apiData.nome,
    createdAt: new Date(apiData.created_at).toLocaleDateString('pt-BR'),
  };
}
