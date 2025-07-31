import { Platform, SectionList, StyleSheet } from 'react-native';
import CustomSubtitle from './subtitle/customSubtitle';
import { useEffect, useState } from 'react';
import CustomListItem from './list/customListItem';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { mockSuppliersData } from '@/src/components/data/mockDataQuotationDetails';
import { SupplierData } from '@/src/types/types';
import { setStorage } from '@/app/utils/utils';
import { Alert } from 'react-native';

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

export type RootStackParamList = {
  Sign: undefined;
  Products: undefined;
  Preferences: undefined;
  CombinationDetail: { id: string };
  CreateCombination: undefined;
  QuotationDetails: {
    combinationId: string;
    combinationName?: string;
    suppliersData: SupplierData[];
  };
};

const CombinationList: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [minecombinations, setMineCombinations] = useState<Combination[]>([
    { id: 'mock-1', combination: 'Combinação 1', supplier: 'Luizão Hortifruti', totalValue: 120.0, missingItems: 1 },
    { id: 'mock-2', combination: 'Combinação 2', supplier: 'Gustavo Frutas', totalValue: 80.0, missingItems: 1 },
    { id: 'mock-3', combination: 'Combinação 3', supplier: 'Frutas do Zé', totalValue: 150.0, missingItems: 1 },
  ]);
  const [combinationsAlter, setCombinationsAlter] = useState<Combination[]>([
    { id: '1', combination: 'Combinação 1', supplier: 'Fornecedor 1', delivery: 'Entrega de 07:00 às 09:00', missingItems: 0, totalValue: 0 },
    { id: '2', combination: 'Combinação 2', supplier: 'Fornecedor 2', delivery: 'Entrega de 07:00 às 09:00', missingItems: 1, totalValue: 10.5 },
  ]);
  const [combinationsUnvaliable, setCombinationsUnvaliable] = useState<Combination[]>([
    { id: '1', combination: 'Combinação 1', supplier: 'Fornecedor 1', supplierClosed: 'Forn. Fechado (18)', missingItems: 0, totalValue: 0 },
    { id: '2', combination: 'Combinação 2', supplier: 'Fornecedor 2', supplierClosed: 'Forn. Fechado (18)', missingItems: 1, totalValue: 10.5 },
  ]);

  // Salva os dados no storage uma única vez quando o componente monta.
  useEffect(() => {
    const saveMockData = async () => {
      try {
        await setStorage('MockSuppliersData', JSON.stringify(mockSuppliersData));
        console.log('Dados mockados salvos no storage.');
      } catch (error) {
        console.error('Erro ao salvar dados mockados:', error);
      }
    };
    saveMockData();
  }, []);

  // Função para lidar com o clique em um item da lista
  const handleCombinationPress = (item: Combination) => {
    //  Encontra o índice do item clicado na lista 'minecombinations'.
    // 'minecombinations' corresponde à ordem em 'mockSuppliersData'.
    const itemIndex = minecombinations.findIndex((comb) => comb.id === item.id);

    // Verifica se o item foi encontrado (itemIndex não é -1)
    if (itemIndex !== -1) {
      // Pega apenas os dados do fornecedor correspondente do array mockado.
      // em um array `[]` porque a tela de detalhes espera um array de SupplierData.
      const selectedSupplierData = [mockSuppliersData[itemIndex]];

      // Navega para a tela de detalhes, passando apenas os dados do fornecedor selecionado.
      navigation.navigate('QuotationDetails', {
        combinationId: item.id,
        combinationName: item.combination,
        suppliersData: selectedSupplierData,
      });
    } else {
      // Caso o item não seja encontrado, exibe um erro.
      console.error('Combinação não encontrada na lista `minecombinations`.');
      Alert.alert('Erro', 'Ocorreu um erro ao tentar abrir os detalhes da combinação.');
    }
  };

  const sections = [
    { title: 'Minhas combinações', data: minecombinations },
    { title: 'Disponíveis com alteração', data: combinationsAlter },
    { title: 'Combinações indisponíveis', data: combinationsUnvaliable },
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
          delivery={item.delivery}
          totalValue={item.totalValue}
          missingItems={item.missingItems}
          createdAt={item.createdAt}
          supplierClosed={item.supplierClosed}
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
