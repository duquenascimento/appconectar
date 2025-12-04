import { SupplierData } from '@/app/quotationDetailsScreen';
import { mergeSupplierData } from '@/src/utils/mergeSuppliersData';
import { getStorage, getToken } from '@/src/utils/utils';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, SectionList, StyleSheet } from 'react-native';
import { View } from 'tamagui';
import { useSupplier } from '../contexts/fornecedores.context';
import { useRestaurantContext } from '../contexts/restaurant.context';
import { getAllQuotationByRestaurant, QuotationApiResponse } from '../services/combinationsService';
import { AvailableSupplier, ChosenSupplierQuote } from '../types/suppliersDataTypes';
import { SameDayOrder } from '../types/types';
import CustomListItem from './list/customListItem';
import CustomAlert from './modais/CustomAlert';
import CustomSubtitle from './subtitle/customSubtitle';

export interface Combination {
  id: string;
  combination: string;
  supplier?: string;
  totalValue?: number;
  delivery?: string;
  missingItems?: number;
  missingProducts?: string[];
  createdAt?: string;
  supplierClosed?: string;
  combinationAvailable?: boolean;
  sameDayOrders: SameDayOrder[];
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
    missingProducts?: string[];
  };
};

const CombinationList: React.FC = () => {
  const [minecombinations, setMineCombinations] = useState<Combination[]>([]);
  const [unavailableCombinations, setUnavailableCombinations] = useState<Combination[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [combinationData, setCombinationData] = useState<QuotationApiResponse[]>([]);

  const { suppliers, unavailableSupplier } = useSupplier();
  const { selectedRestaurant } = useRestaurantContext();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const initialize = async () => {
        if (!selectedRestaurant) return;
        try {
          setLoading(true);
          const token = await getToken();
          const cartStoredValue = JSON.parse(
            (await getStorage(`cart_${selectedRestaurant.externalId}`)) || '[]',
          );
          const combinationsData: QuotationApiResponse[] = await getAllQuotationByRestaurant({
            token,
            selectedRestaurant,
            cart: cartStoredValue,
            prices: [...suppliers],
          });

          const totalItens = cartStoredValue?.length || 0;
          setCombinationData(combinationsData);

          const transformed: Combination[] = combinationsData.map((item) => {
            const suppliers =
              item.resultadoCotacao?.supplier?.map((c) => c.name.split('-')[0]).join(' + ') ||
              'N/A';
            const cartItens =
              item.resultadoCotacao?.supplier?.reduce((acc, cesta) => {
                return acc + (cesta.cart?.length || 0);
              }, 0) || 0;
            const missingItems = totalItens - cartItens;

            return {
              id: item.id,
              combination: item.nome,
              supplier: suppliers,
              totalValue: item.resultadoCotacao?.totalOrderValue,
              missingItems: missingItems < 0 ? 0 : missingItems,
              missingProducts: item.resultadoCotacao?.missingProducts || [],
              // TODO: fix to send sameDayOrders by supplier
              sameDayOrders: item.resultadoCotacao?.supplier?.flatMap((s) => s.sameDayOrders) || [],
            };
          });
          const unavailableSupplierNames = unavailableSupplier.map((s) => s.supplier.name);

          const unavailableCombinationList = transformed.filter(
            (item) =>
              item.totalValue === 0 ||
              unavailableSupplierNames.some((name) => item.supplier?.includes(name)),
          );

          const availableCombinationList = transformed
            .filter(
              (item) =>
                item.totalValue !== 0 &&
                !unavailableSupplierNames.some((name) => item.supplier?.includes(name)),
            )
            .sort((a, b) => {
              if (a.missingItems !== b.missingItems) {
                return (a.missingItems ?? 0) - (b.missingItems ?? 0);
              }
              return (a.totalValue ?? 0) - (b.totalValue ?? 0);
            });

          setUnavailableCombinations(unavailableCombinationList);
          setMineCombinations(availableCombinationList);
        } catch (error) {
          setIsAlertVisible(true);
          console.error('Erro ao inicializar:', error);
        } finally {
          setLoading(false);
        }
      };
      initialize();
    }, [selectedRestaurant, suppliers]),
  );

  const handleCombinationPress = async (item: Combination) => {
    const selectedCombination = combinationData.filter((data) => data.id === item.id);
    const combinationSelected = selectedCombination as ChosenSupplierQuote[];
    const mergedData: any = mergeSupplierData(
      combinationSelected,
      suppliers as AvailableSupplier[],
    );

    const params = {
      combinationId: item.id,
      combinationName: item.combination,
      totalValue: String(item.totalValue),
      missingItems: String(item.missingItems),
      suppliersData: JSON.stringify(mergedData),
      missingProducts: item.missingProducts,
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
