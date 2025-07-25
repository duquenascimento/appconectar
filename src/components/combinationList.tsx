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
  delivery?: string;
  missingItems?: number;
  createdAt?: string;
  supplierClosed?: string;
  combinationAvailable?: boolean;
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
    { id: 'mock-1', combination: 'Combinação 1', supplier: 'Luizão Hortifruti', totalValue: 120.00, missingItems: 1, },
    { id: 'mock-2', combination: 'Combinação 2', supplier: 'Gustavo Frutas', totalValue: 80.00, missingItems: 1, },
    { id: 'mock-3', combination: 'Combinação 3', supplier: 'Frutas do Zé', totalValue: 150.00, missingItems: 1, }
  ]);
  const [combinationsAlter, setCombinationsAlter] = useState<Combination[]>([
    { id: '1', combination: 'Combinação 1', supplier: 'Fornecedor 1', delivery: 'Entrega de 07:00 às 09:00', missingItems: 0, totalValue: 0 },
    { id: '2', combination: 'Combinação 2', supplier: 'Fornecedor 2', delivery: 'Entrega de 07:00 às 09:00', missingItems: 1, totalValue: 10.5 }
  ]);
  const [combinationsUnvaliable, setCombinationsUnvaliable] = useState<Combination[]>([
    { id: '1', combination: 'Combinação 1', supplier: 'Fornecedor 1', supplierClosed: 'Forn. Fechado (18)', missingItems: 0, totalValue: 0 },
    { id: '2', combination: 'Combinação 2', supplier: 'Fornecedor 2', supplierClosed: 'Forn. Fechado (18)', missingItems: 1, totalValue: 10.5 }
  ])

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
 

  const sections = [
    { title: 'Minhas combinações', data: minecombinations },
    { title: 'Disponíveis com alteração', data: combinationsAlter },
    { title: 'Combinações indisponíveis', data: combinationsUnvaliable }
  ];

  return <SectionList sections={sections} keyExtractor={(item) => item.id} renderItem={({ item }) => <CustomListItem id={item.id} combination={item.combination} supplier={item.supplier} delivery={item.delivery} totalValue={item.totalValue} missingItems={item.missingItems} createdAt={item.createdAt} supplierClosed={item.supplierClosed} onPress={() => handleCombinationPress(item.id)} />} renderSectionHeader={({ section: { title } }) => <CustomSubtitle>{title}</CustomSubtitle>} contentContainerStyle={styles.listContentContainer} style={[styles.container, { width: Platform.OS === 'web' ? '70%' : '90%', alignSelf: 'center' }]} />;
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
