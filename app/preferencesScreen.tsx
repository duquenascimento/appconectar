import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform } from 'react-native';

import { router } from 'expo-router';
import { ScrollView, YStack } from 'tamagui';
import CustomButton from '../src/components/button/customButton';
import CustomInfoCard from '../src/components/card/customInfoCard';
import CustomHeader from '../src/components/header/customHeader';
import CustomListItem from '../src/components/list/customListItem';
import CustomSubtitle from '../src/components/subtitle/customSubtitle';

import CustomAlert from '@/src/components/modais/CustomAlert';
import { useCombinacao } from '@/src/contexts/combinacao.context';
import { getCombinationsByRestaurant } from '@/src/services/combinationsService';
import { Combinacao } from '@/src/types/combinationTypes';
import { transformCombinacaoForSave } from '../src/utils/combinacaoUtils';
import { mapCombination } from '../src/utils/mapCombination';
import { getStorage } from '../src/utils/utils';

import PageContainer from '@/src/components/box/PageContainer';
import { useSupplier } from '@/src/contexts/fornecedores.context';
import { useRestaurantContext } from '@/src/contexts/restaurant.context';
import { Restaurant } from '@/src/types/restaurant';

export interface Combination {
  id: string;
  combination: string;
  supplier?: string;
  delivery?: string;
  createdAt?: string;
  missingItems?: number;
  totalValue?: number;
}

export type RootStackParamList = {
  Preferences: { restaurantId: string; restaurant: Restaurant };
  Combination: { id: string };
};

type PreferencesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Preferences'>;

const PreferencesScreen: React.FC = () => {
  const navigation = useNavigation<PreferencesScreenNavigationProp>();
  const route = useRoute();
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { updateCombinacao, resetCombinacao, modificado, setModificado } = useCombinacao();
  const [combinationsFull, setCombinationsFull] = useState([]);
  const { loadPrices } = useSupplier();
  const { loadRestaurants } = useRestaurantContext();

  useEffect(() => {
    const fetchStoredRestaurant = async () => {
      loadPrices();
      loadRestaurants();
      const storedValue = await getStorage('selectedRestaurant');
      let restaurantFromStorage = null;

      if (storedValue) {
        try {
          const parsedValue = JSON.parse(storedValue);
          restaurantFromStorage = parsedValue?.restaurant ?? parsedValue ?? null;
        } catch {
          restaurantFromStorage = null;
        }
      }

      setRestaurant(restaurantFromStorage);
    };

    fetchStoredRestaurant();
  }, []);

  const restaurantId = useMemo(() => {
    return (route.params as { restaurantId?: string })?.restaurantId ?? restaurant?.id;
  }, [route.params, restaurant]);

  const loadCombinations = useCallback(async () => {
    if (!restaurantId) return;

    try {
      const res = await getCombinationsByRestaurant(restaurantId);
      if (Array.isArray(res.return)) {
        setCombinations(res.return.map(mapCombination));
        setCombinationsFull(res.return);
      } else {
        throw new Error('Resposta inesperada da API');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setIsAlertVisible(true);
    }
    setLoading(false);
  }, [restaurantId]);

  useEffect(() => {
    if (modificado) setLoading(true);
  }, [modificado]);

  useFocusEffect(
    useCallback(() => {
      loadCombinations();
    }, [loadCombinations]),
  );

  const handleBackPress = () => router.push('prices');

  const handleCombinationPress = (id: string) => {
    const combinationResult = combinationsFull.filter((c) => c.id === id);

    const normalizedCombination = transformCombinacaoForSave(combinationResult[0]);
    updateCombinacao(normalizedCombination as Combinacao);
    setModificado(true);
    router.push({ pathname: 'combination', params: { id } });
  };
  const handleCreateNewCombination = () => {
    resetCombinacao();
    setModificado(true);
    router.push('combination');
  };

  const cardTitle = `Preferências de ${restaurant?.name ?? ''}`;

  return (
    <PageContainer backgroundColor="white">
      <CustomAlert
        visible={isAlertVisible}
        title="Ops!"
        message="Ocorreu um erro ao buscar combinações, tente novamente mais tarde."
        onConfirm={() => setIsAlertVisible(false)}
        width="35%"
      />
      <CustomHeader title="Minhas preferências" onBackPress={handleBackPress} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <YStack
          width={Platform.OS === 'web' ? '76%' : '92%'}
          alignSelf="center"
          gap={15}
          marginTop="$2"
        >
          <CustomAlert
            visible={isAlertVisible}
            title="Ops!"
            message="Ocorreu um erro ao buscar combinações, tente novamente mais tarde."
            onConfirm={() => setIsAlertVisible(false)}
            width="35%"
          />
          <CustomInfoCard
            icon="information-circle"
            title={cardTitle}
            description="As combinações Conéctar+ são salvas por unidade/restaurante cadastrado. Você pode alterar o restaurante na tela anterior."
          />

          <CustomSubtitle>
            {!loading && (combinations.length ? 'Combinações salvas' : 'Nenhuma combinação salva')}
          </CustomSubtitle>

          {loading ? (
            <YStack flex={1} justifyContent="center" alignItems="center" paddingTop={100}>
              <ActivityIndicator size="large" color="#04BF7B" />
            </YStack>
          ) : (
            combinations.map((item) => (
              <CustomListItem
                key={item.id}
                id={item.id}
                combination={item.combination}
                createdAt={item.createdAt}
                onPress={handleCombinationPress}
              />
            ))
          )}
        </YStack>
      </ScrollView>
      <CustomButton title="Criar nova combinação" onPress={handleCreateNewCombination} />
    </PageContainer>
  );
};

export default PreferencesScreen;
