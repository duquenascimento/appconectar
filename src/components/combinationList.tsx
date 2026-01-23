import { mergeSupplierData } from '@/src/utils/mergeSuppliersData';
import { getStorage, getToken } from '@/src/utils/utils';
import { HttpStatusCode } from 'axios';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, SectionList, StyleSheet } from 'react-native';
import { Button, Text, View } from 'tamagui';
import { validate as validateUuid } from 'uuid';
import { useDeliveryDate } from '../contexts/deliveryDate.context';
import { useSupplier } from '../contexts/fornecedores.context';
import { useRestaurantContext } from '../contexts/restaurant.context';
import { QuotationApiResponse, QuotationApiResponseData } from '../services/combinationsService';
import { confirmPremiumOrder } from '../services/orderService';
import { getQuotationsByCombination } from '../services/quotationService';
import { Combination, CombinationMissingProducts } from '../types/combinationTypes';
import { ChosenSupplierQuote } from '../types/suppliersDataTypes';
import { SupplierData } from '../types/types';
import { transformCombinationFromApi } from '../utils/combinacaoUtils';
import CustomListItem from './list/customListItem';
import CustomAlert from './modais/CustomAlert';
import DialogInstanceNotification from './modais/DialogInstanceNotification';
import CustomSubtitle from './subtitle/customSubtitle';

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

interface CombinationListProps {
  combinationsLoading: boolean;
  mainDataLoaded: boolean;
  handleConfirm: () => void;
}

const CombinationList: React.FC<CombinationListProps> = ({
  combinationsLoading,
  mainDataLoaded,
  handleConfirm,
}) => {
  const [myCombinations, setMyCombinations] = useState<Combination[]>([]);
  const [conectarCombinations, setConectarCombinations] = useState<Combination[]>([]);
  const [unavailableCombinations, setUnavailableCombinations] = useState<Combination[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [combinationData, setCombinationData] = useState<QuotationApiResponseData[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  const { availableSuppliers } = useSupplier();
  const { selectedRestaurant, hasConectarPlusAccess } = useRestaurantContext();
  const { deliveryDate } = useDeliveryDate();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const initialize = async () => {
        if (!selectedRestaurant || !hasConectarPlusAccess || !mainDataLoaded) return;
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

          setMyCombinations(availableCombinations.filter((c) => validateUuid(c.id)));
          setConectarCombinations(availableCombinations.filter((c) => !validateUuid(c.id)));
          setUnavailableCombinations(unavailableCombinations);
        } catch (error) {
          setIsAlertVisible(true);
          console.error('Erro ao inicializar:', error);
        } finally {
          setLoading(false);
        }
      };
      initialize();
    }, [selectedRestaurant, availableSuppliers, hasConectarPlusAccess, mainDataLoaded]),
  );

  const handleCombinationPress = async (item: Combination) => {
    const selectedCombination = combinationData.filter((data) => data.id === item.id);
    const combinationSelected = selectedCombination as ChosenSupplierQuote[];
    const mergedData: any = mergeSupplierData(combinationSelected, availableSuppliers);

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
    {
      title: myCombinations.length > 0 ? 'Minhas combinações' : '',
      data: myCombinations,
    },
    {
      title: conectarCombinations.length > 0 ? 'Combinações Conéctar' : '',
      data: conectarCombinations,
    },
    {
      title: unavailableCombinations.length > 0 ? 'Combinações indisponíveis' : '',
      data: unavailableCombinations,
    },
  ];

  if (combinationsLoading || confirmLoading || loading || !mainDataLoaded) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
      </View>
    );
  }

  if (!hasConectarPlusAccess) {
    return (
      <View
        padding={20}
        marginTop={10}
        width={Platform.OS === 'web' ? '73%' : '92%'}
        alignSelf="center"
      >
        <DialogInstanceNotification
          openModal={showNotification}
          setOpenModal={setShowNotification}
          title="Pronto!"
          subtitle="Cotação solicitada."
          description="Seu pedido foi enviado para o seu Whatsapp, retornaremos com sua cotação."
          buttonText="Ok"
          onConfirm={handleConfirm}
        />

        <Button
          backgroundColor="#04BF7B"
          onPress={async () => {
            setConfirmLoading(true);

            const result = await confirmPremiumOrder({
              token: await getToken(),
              selectedRestaurant,
              deliveryDate: deliveryDate,
            });

            if (result.status === HttpStatusCode.Ok) {
              setShowNotification(true);
            }

            setConfirmLoading(false);
          }}
        >
          <Text fontWeight="500" fontSize={16} color="white">
            Solicitar cotação
          </Text>
        </Button>
        <Text marginTop={5} textAlign="center" fontSize={12} color="gray">
          Você receberá a cotação no Whatsapp
        </Text>
      </View>
    );
  }

  if (myCombinations.length === 0 && unavailableCombinations.length === 0 && !loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" padding={20}>
        <CustomSubtitle>
          Nenhuma combinação encontrada para o restaurante selecionado.
        </CustomSubtitle>
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
            terminationCondition={item.terminationCondition}
            tooltip={
              !validateUuid(item.id) && !!unavailableCombinations.includes(item)
                ? 'A falta de fornecedores pode acontecer devido ao horário do seu pedido ou à região de entrega.'
                : undefined
            }
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
