
import { CombinationApiResponse } from '@/src/services/combinationsService';
import { Combination } from '../screens/PreferencesScreen';

export function mapCombination(apiData: CombinationApiResponse): Combination {
  return {
    id: apiData.id,
    combination: apiData.nome,
    createdAt: new Date(apiData.created_at).toLocaleDateString('pt-BR'),
  };
}
