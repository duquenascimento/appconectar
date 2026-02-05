import { useFocusEffect, useRoute } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import { ScrollView, YStack } from 'tamagui';
import PageContainer from '../src/components/box/PageContainer';
import CustomButton from '../src/components/button/customButton';
import CustomInfoCard from '../src/components/card/customInfoCard';
import CustomHeader from '../src/components/header/customHeader';
import CustomListItem from '../src/components/list/customListItem';
import CustomAlert from '../src/components/modais/CustomAlert';
import CustomSubtitle from '../src/components/subtitle/customSubtitle';
import { useCombinacao } from '../src/contexts/combinacao.context';
import { useRestaurantContext } from '../src/contexts/restaurant.context';
import {
  getCombinationsByRestaurant,
  getDefaultCombinations,
} from '../src/services/combinationsService';
import { Combinacao, Combination } from '../src/types/combinationTypes';
import { Restaurant } from '../src/types/restaurantTypes';
import { transformCombinacaoForSave } from '../src/utils/combinacaoUtils';
import { mapCombination } from '../src/utils/mapCombination';

export type RootStackParamList = {
  Preferences: { restaurantId: string; restaurant: Restaurant };
  Combination: { id: string };
};

export default function PreferencesScreen() {
  const route = useRoute();
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { updateCombinacao, resetCombinacao, modificado, setModificado } = useCombinacao();
  const [combinationsFull, setCombinationsFull] = useState<any[]>([]);
  const [defaultCombinations, setDefaultCombinations] = useState<Combinacao[]>([]);
  const { selectedRestaurant, loadRestaurants } = useRestaurantContext();

  useEffect(() => {
    const initialize = async () => {
      await loadRestaurants();
    };

    initialize();
  }, []);

  const restaurantId = useMemo(() => {
    return (route.params as { restaurantId?: string })?.restaurantId ?? selectedRestaurant?.id;
  }, [route.params, selectedRestaurant]);

  const loadCombinations = useCallback(async () => {
    if (!restaurantId) return;

    try {
      const [combinationsByRestaurant, defaultCombinations] = await Promise.all([
        getCombinationsByRestaurant(restaurantId),
        getDefaultCombinations(),
      ]);

      if (Array.isArray(defaultCombinations)) {
        setDefaultCombinations(defaultCombinations);
      }

      if (Array.isArray(combinationsByRestaurant.return)) {
        setCombinations(combinationsByRestaurant.return.map(mapCombination));
        setCombinationsFull(combinationsByRestaurant.return);
      } else {
        throw new Error('Resposta inesperada da API');
      }
    } catch (err) {
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

  const cardTitle = `Preferências de ${selectedRestaurant?.name ?? ''}`;

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
                sameDayOrders={[]}
              />
            ))
          )}
          {defaultCombinations.length > 0 && (
            <>
              <CustomSubtitle>Combinações Conéctar</CustomSubtitle>
              {defaultCombinations.map((item) => (
                <CustomListItem
                  key={item.nome}
                  id={item.nome}
                  combination={item.nome}
                  sameDayOrders={[]}
                />
              ))}
            </>
          )}
        </YStack>
      </ScrollView>
      <CustomButton title="Criar nova combinação" onPress={handleCreateNewCombination} />
    </PageContainer>
  );
}
