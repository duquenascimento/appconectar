import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
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
import CustomButton from '../../src/components/button/customButton'
import CustomInfoCard from '@/src/components/card/customInfoCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'tamagui';

import { getCombinationsByRestaurant } from '@/src/services/combinationsService';
import { mapCombination } from '../utils/mapCombination';
import CustomAlert from '@/src/components/modais/CustomAlert';
import { getStorage } from '../utils/utils';
import { Stack } from 'tamagui';

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
  const [loading, setLoading] = useState<boolean>(true)

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
    setLoading(false);
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

      if (loading) {
      return (
        <View flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color="#04BF7B" />
        </View>
      )
    }

  return (
    <Stack pt={20} height="100%" position="relative">
      <View height={50} flex={1} paddingTop={20}>
        <View style={styles.wrapper}>
          <SafeAreaView style={styles.safeContainer}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.keyboardAvoidingView}
            >
              <CustomAlert
                visible={isAlertVisible}
                title="Ops!"
                message="Ocorreu um erro ao buscar combinações, tente novamente mais tarde."
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
                <CustomButton
                  title="Criar nova combinação"
                  onPress={handleCreateNewCombination}
                  width='100%'
                />
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </View>
    </Stack>
  )
};
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: '80%',
    alignSelf: 'center',
    borderRadius: 12,
    padding: 12,
  },
  safeContainer: {
    flex: 1,
    width: '95%',
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  buttonContainer: {
    backgroundColor: '#fff',
    width: '100%',
  },
});



export default PreferencesScreen;
