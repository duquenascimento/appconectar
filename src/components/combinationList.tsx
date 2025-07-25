import { Platform, SectionList, StyleSheet } from 'react-native';
import CustomSubtitle from './subtitle/customSubtitle';
import { useState } from 'react';
import CustomListItem from './list/customListItem';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { mockSuppliersData } from '@/src/components/data/mockDataQuotationDetails'; 
import { SupplierData } from '@/app/screens/QuotationDetailsScreen'; 

export interface Combination {
  id: string;
  combination: string;
  supplier?: string;
  totalValue?: number;
}

// tipagem da rota para incluir os dados que serão enviados
export type RootStackParamList = {
  Sign: undefined;
  Products: undefined;
  Preferences: undefined;
  CombinationDetail: { id: string };
  CreateCombination: undefined;
  QuotationDetails: { 
    combinationId: string;
    combinationName?: string;
    suppliersData: SupplierData[]; // <-- Essencial para passar os dados
  };
};

const CombinationList: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // lista de exemplo (mock) para as combinações
  // No futuro, você vai preencher isso com a resposta da sua API GET
  const [minecombinations, setMineCombinations] = useState<Combination[]>([
    { id: 'mock-1', combination: 'Combinação 1', supplier: 'Luizão Hortifruti', totalValue: 120.00 },
    { id: 'mock-2', combination: 'Combinação 2', supplier: 'Gustavo Frutas', totalValue: 80.00 },
    { id: 'mock-3', combination: 'Combinação 3', supplier: 'Frutas do Zé', totalValue: 150.00 },
    { id: 'mock-4', combination: 'Combinação 4', supplier: 'Hortifruti da Maria', totalValue: 200.00 },
    { id: 'mock-5', combination: 'Combinação 5', supplier: 'Frutas e Verduras do João', totalValue: 90.00 }
  ]);

  // 4. A função envia os dados mockados para a tela de detalhes (QuotationDetailsScreen)
  const handleCombinationPress = (item: Combination) => {
    // Ao clicar, navegamos e passamos o pacote completo de dados mockados.
    // Isso garante que a próxima tela tenha o que precisa para renderizar.
    navigation.navigate('QuotationDetails', {
      combinationId: item.id,
      combinationName: item.combination,
      suppliersData: mockSuppliersData 
    });
  };
  const [combinationsAlter] = useState<Combination[]>([]);
  const [combinationsUnvaliable] = useState<Combination[]>([]);

  const sections = [
    { title: 'Minhas combinações', data: minecombinations },
    { title: 'Disponíveis com alteração', data: combinationsAlter },
    { title: 'Combinações indisponíveis', data: combinationsUnvaliable }
  ];

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CustomListItem
          id={item.id}
          combination={item.combination}
          supplier={item.supplier}
          totalValue={item.totalValue}
          onPress={() => handleCombinationPress(item)}
        />
      )}
      renderSectionHeader={({ section: { title } }) => <CustomSubtitle>{title}</CustomSubtitle>}
      contentContainerStyle={styles.listContentContainer}
      style={[styles.container, { width: Platform.OS === 'web' ? '70%' : '90%', alignSelf: 'center' }]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContentContainer: {
    paddingBottom: 100,
  },
});

export default CombinationList;
