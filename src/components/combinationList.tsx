import { ActivityIndicator, Platform, SectionList, StyleSheet } from 'react-native';
import CustomSubtitle from './subtitle/customSubtitle';
import { useEffect, useMemo, useState } from 'react';
import CustomListItem from './list/customListItem';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { SupplierData } from '@/app/screens/QuotationDetailsScreen';
import { getAllQuotationByRestaurant, QuotationApiResponse } from '../services/combinationsService';
import { getStorage, getToken } from '@/app/utils/utils';
import { View } from 'tamagui';
import CustomAlert from './modais/CustomAlert';
import { useSupplier } from '../contexts/fornecedores.context';
import { mergeSupplierData } from '@/app/utils/mergeSuppliersData';
import { AvailableSupplier, ChosenSupplierQuote } from '../types/suppliersDataTypes';

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
    toalValue?: number;
    missingItems?: number;
  };
};

const CombinationList: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [minecombinations, setMineCombinations] = useState<Combination[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [combinationData, setCombinationData] = useState<QuotationApiResponse[]>([]);

  const { suppliers, unavailableSupplier } = useSupplier();

    const allSuppliers = useMemo(() => {
      return [...suppliers];
    }, [suppliers]);
  

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        const token = await getToken()
        const cartStoredValue = JSON.parse(await getStorage('cart') || '[]');
        const restaurantStoredValue = JSON.parse(await getStorage('selectedRestaurant') || '[]');
        const selectedRestaurant = { ...restaurantStoredValue.restaurant };
        const combinationsData: QuotationApiResponse[] =
          await getAllQuotationByRestaurant({
            token,
            selectedRestaurant,
            cart: cartStoredValue,
            prices: allSuppliers,
          });

        const totalItens = cartStoredValue?.length || 0;
        setCombinationData(combinationsData)
        
        const transformed: Combination[] = combinationsData.map((item) => {
          const suppliers = item.resultadoCotacao?.supplier?.map(c => c.name.split('-')[0]).join(' + ') || 'N/A';
          const cartItens = item.resultadoCotacao?.supplier?.reduce((acc, cesta) => {
            return acc + (cesta.cart?.length || 0);
          }, 0) || 0;
          const missingItems = totalItens - cartItens;

          return {
            id: item.id,
            combination: item.nome,
            supplier: suppliers,
            totalValue: item.resultadoCotacao?.totalOrderValue,
            missingItems: missingItems < 0 ? 0 : missingItems
          };
        });
        
        setMineCombinations(transformed);
      } catch (error) {
        setIsAlertVisible(true)
        console.error('Erro ao inicializar:', error);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [allSuppliers]);


  const handleCombinationPress = async (item: Combination) => {
    const selectedCombination = combinationData.filter((data) => data.id === item.id);
    
    const mergedData:any = mergeSupplierData(
      selectedCombination as ChosenSupplierQuote[],
      suppliers as AvailableSupplier[]
    )
    
    navigation.navigate('QuotationDetails', {
      combinationId: item.id,
      combinationName: item.combination,
      suppliersData: mergedData,
    });
  };
  
  const sections = [
    { title: 'Minhas combinações', data: minecombinations },
  ];

  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
      </View>
    )
  }

  return (
    <>
      <CustomAlert
        visible={isAlertVisible}
        title="Ops!"
        message="Erro ao obter cotações por restaurante, tente novamente mais tarde."
        onConfirm={() => setIsAlertVisible(false)}
        width="35%" />
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
            onPress={() => handleCombinationPress(item)} />
        )}
        renderSectionHeader={({ section: { title } }) => <CustomSubtitle>{title}</CustomSubtitle>}
        contentContainerStyle={styles.listContentContainer}
        style={[
          styles.container,
          {
            width: Platform.OS === 'web' ? '70%' : '90%',
            alignSelf: 'center',
          },
        ]} />
    </>

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
