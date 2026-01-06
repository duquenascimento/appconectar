import { mergeSupplierData } from '@/src/utils/mergeSuppliersData';
import { getStorage, getToken } from '@/src/utils/utils';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, SectionList, StyleSheet } from 'react-native';
import { View } from 'tamagui';
import { useSupplier } from '../contexts/fornecedores.context';
import { useRestaurantContext } from '../contexts/restaurant.context';
import {
  getAllQuotationByRestaurant,
  QuotationApiResponse,
  QuotationApiResponseData,
} from '../services/combinationsService';
import { Combination, CombinationMissingProducts } from '../types/combinationTypes';
import { AvailableSupplier, ChosenSupplierQuote } from '../types/suppliersDataTypes';
import { SupplierData } from '../types/types';
import { transformCombinationFromApi } from '../utils/combinacaoUtils';
import CustomListItem from './list/customListItem';
import CustomAlert from './modais/CustomAlert';
import CustomSubtitle from './subtitle/customSubtitle';
import { getQuotationsByCombination } from '../services/quotationService';
import { useDeliveryDate } from '../hooks/useDeliveryDate';

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
    missingProducts?: CombinationMissingProducts[];
  };
};

const CombinationList: React.FC = () => {
  const [minecombinations, setMineCombinations] = useState<Combination[]>([]);
  const [unavailableCombinations, setUnavailableCombinations] = useState<Combination[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [combinationData, setCombinationData] = useState<QuotationApiResponseData[]>([]);

  const { availableSuppliers } = useSupplier();
  const { selectedRestaurant } = useRestaurantContext();
  const { deliveryDate } = useDeliveryDate();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const initialize = async () => {
        if (!selectedRestaurant) return;
        try {
          setLoading(true);
          const cartStoredValue = JSON.parse(
            (await getStorage(`cart_${selectedRestaurant.externalId}`)) || '[]',
          );

          const combinationsData: QuotationApiResponse = await getQuotationsByCombination({
            restaurantId: selectedRestaurant.id,
            deliveryDate: deliveryDate,
          });

          const totalItens = cartStoredValue?.length || 0;
          setCombinationData([
            ...combinationsData.availableCombinations,
            ...combinationsData.unavailableCombinations,
          ]);

          const availableCombinations = transformCombinationFromApi(
            combinationsData.availableCombinations,
            totalItens,
            availableSuppliers,
          );
          const unavailableCombinations = transformCombinationFromApi(
            combinationsData.unavailableCombinations,
            totalItens,
            availableSuppliers,
          );

          setMineCombinations(availableCombinations);
          setUnavailableCombinations(unavailableCombinations);
        } catch (error) {
          setIsAlertVisible(true);
          console.error('Erro ao inicializar:', error);
        } finally {
          setLoading(false);
        }
      };
      initialize();
    }, [selectedRestaurant, availableSuppliers]),
  );

  const handleCombinationPress = async (item: Combination) => {
    const selectedCombination = combinationData.filter((data) => data.id === item.id);
    const combinationSelected = selectedCombination as ChosenSupplierQuote[];
    const mergedData: any = mergeSupplierData(
      combinationSelected,
      availableSuppliers,
    );

    const params = {
      combinationId: item.id,
      combinationName: item.combination,
      totalValue: String(item.totalValue),
      missingItems: String(item.missingItems),
      suppliersData: JSON.stringify(mergedData),
      missingProducts: JSON.stringify(item.missingProducts),
    };

    router.push({
      pathname: '/quotationDetailsScreen',
      params,
    });
  };

  const sections = [
    { title: 'Minhas combinações', data: minecombinations },
    {
      title: unavailableCombinations.length > 0 ? 'Combinações indisponíveis' : '',
      data: unavailableCombinations,
    },
  ];

  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
      </View>
    );
  }

  return (
    <>
      <CustomAlert
        visible={isAlertVisible}
        title="Ops!"
        message="Erro ao obter cotações por restaurante, tente novamente mais tarde."
        onConfirm={() => setIsAlertVisible(false)}
        width="35%"
      />
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
            sameDayOrders={item.sameDayOrders}
            unavailable={!!unavailableCombinations.includes(item)}
            onPress={() => handleCombinationPress(item)}
          />
        )}
        renderSectionHeader={({ section: { title } }) => <CustomSubtitle>{title}</CustomSubtitle>}
        contentContainerStyle={styles.listContentContainer}
        style={[
          styles.container,
          {
            width: Platform.OS === 'web' ? '70%' : '100%',
            alignSelf: 'center',
          },
        ]}
      />
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
