import React, { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomSubtitle from '@/src/components/subtitle/customSubtitle';
import CustomHeader from '@/src/components/header/customHeader';
import CustomListItem from '@/src/components/list/customListItem';
import CustomButton from '@/src/components/button/customButton';
import CustomInfoCard from '@/src/components/card/customInfoCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'tamagui';

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
  Preferences: undefined;
  CombinationDetail: { id: string };
  CreateCombination: undefined;
};

type PreferencesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Preferences'
>;

const PreferencesScreen: React.FC = () => {
  const navigation = useNavigation<PreferencesScreenNavigationProp>();

  const [combinations, setCombinations] = useState<Combination[]>([
    { id: '1', combination: 'Combinação 1', createdAt: '02/03/2025' },
    { id: '2', combination: 'Combinação 2', createdAt: '05/03/2025' },
    { id: '31', combination: 'Combinação 1', createdAt: '02/03/2025' },
    { id: '22', combination: 'Combinação 2', createdAt: '05/03/2025' },
    { id: '41', combination: 'Combinação 1', createdAt: '02/03/2025' },
    { id: '32', combination: 'Combinação 2', createdAt: '05/03/2025' },
    { id: '51', combination: 'Combinação 1', createdAt: '02/03/2025' },
    { id: '42', combination: 'Combinação 2', createdAt: '05/03/2025' },
  ]);

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
                supplier={item.supplier}
                delivery={item.delivery}
                totalValue={item.totalValue}
                missingItems={item.missingItems}
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
