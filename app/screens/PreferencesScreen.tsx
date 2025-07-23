import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import CustomSubtitle from '@/src/components/subtitle/customSubtitle';
import CustomHeader from '@/src/components/header/customHeader';
import CustomListItem from '@/src/components/list/customListItem';
import CustomButton from '@/src/components/button/customButton';
import CustomInfoCard from '@/src/components/card/customInfoCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'tamagui';

import { getCombinationsByRestaurant } from '@/src/services/combinationsService';
import { mapCombination } from '../utils/mapCombination';
import CustomAlert from '@/src/components/modais/CustomAlert';
import { getStorage } from '../utils/utils';

export interface Combination {
  id: string;
  combination: string;
  supplier?: string;
  delivery?: string;
  createdAt?: string;
  missingItems?: number;
  totalValue?: number;
}

export interface Restaurant {
  id: string;
  name: string;
}

export type RootStackParamList = {
  Sign: undefined;
  Products: undefined;
  Preferences: { restaurantId: string, restaurant: Restaurant };
  CombinationDetail: { id: string };
  CreateCombination: undefined;
};

type PreferencesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Preferences'
>;

const PreferencesScreen: React.FC = () => {
  const navigation = useNavigation<PreferencesScreenNavigationProp>();
  const route = useRoute();
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    const fetchStoredRestaurant = async () => {
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
      } else {
        throw new Error('Resposta inesperada da API');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Erro ao buscar combinações:', message);
      setIsAlertVisible(true);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadCombinations();
  }, [loadCombinations]);

  const handleBackPress = () => navigation.goBack();
  const handleCombinationPress = (id: string) =>
    navigation.navigate('CombinationDetail', { id });
  const handleCreateNewCombination = () =>
    navigation.navigate('CreateCombination');

  const cardTitle = `Preferências de ${restaurant?.name ?? ''}`;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <CustomAlert
          visible={isAlertVisible}
          title="Ops!"
          message={`Ocorreu um erro ao buscar combinações, tente novamente mais tarde.`}
          onConfirm={() => setIsAlertVisible(false)}
        />
        <View style={styles.container}>
          <FlatList
            data={combinations}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              <>
                <CustomHeader title="Minhas preferências" onBackPress={handleBackPress} />
                <CustomInfoCard
                  icon="information-circle"
                  title={cardTitle}
                  description="As combinações Conéctar+ são salvas por unidade/restaurante cadastrado. Você pode alterar o restaurante na tela anterior."
                />
                <CustomSubtitle>
                  {combinations.length ? 'Combinações salvas' : 'Nenhuma combinação salva'}
                </CustomSubtitle>
              </>
            }
            renderItem={({ item }) => (
              <CustomListItem
                id={item.id}
                combination={item.combination}
                createdAt={item.createdAt}
                onPress={handleCombinationPress}
              />
            )}
            contentContainerStyle={styles.listContentContainer}
          />
        </View>
      </KeyboardAvoidingView>
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Criar nova combinação"
          onPress={handleCreateNewCombination}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
});

export default PreferencesScreen;
