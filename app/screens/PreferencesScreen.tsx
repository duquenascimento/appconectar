import React, { useState, useEffect, useCallback } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
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
  Sign: undefined;
  Products: undefined;
  Preferences: { restaurantId: string };
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
  const restaurantId =
    (route.params as { restaurantId?: string })?.restaurantId ??
    '0ef6f918-542e-4ca1-860a-dcf7ae5f40a5';

  const [combinations, setCombinations] = useState<Combination[]>([]);

  const loadCombinations = useCallback(async () => {
    if (!restaurantId) return;

    try {
      const combinationsResponse = await getCombinationsByRestaurant(restaurantId);

      if (combinationsResponse.success && Array.isArray(combinationsResponse.data)) {
        const combinationsFormated: Combination[] = combinationsResponse.data.map(mapCombination);
        setCombinations(combinationsFormated);
      } else {
        throw new Error('Resposta inesperada da API');
      }
    } catch (err: any) {
      Alert.alert('Erro ao carregar preferências', err.message || 'Erro desconhecido');
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

  const restaurantName = 'Mar Doce';
  const cardTitle = `Preferências Restaurante ${restaurantName}`;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.container}>
          <FlatList
            data={combinations}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              <>
                <CustomHeader title="Minhas preferências" onBackPress={handleBackPress} />
                <CustomInfoCard
                  title={cardTitle}
                  description="As combinações Conéctar+ são salvas por unidade/restaurante cadastrado. Você pode alterar o restaurante na tela anterior."
                />
                <CustomSubtitle>Combinações salvas</CustomSubtitle>
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
