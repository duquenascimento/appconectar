import { mergeSupplierData } from '@/src/utils/mergeSuppliersData';
import { getToken } from '@/src/utils/utils';
import { HttpStatusCode } from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, SectionList, StyleSheet } from 'react-native';
import { Button, Text, View } from 'tamagui';
import { validate as validateUuid } from 'uuid';
import { useCombination } from '../contexts/combination.context';
import { useDeliveryDate } from '../contexts/deliveryDate.context';
import { useSupplier } from '../contexts/fornecedores.context';
import { useRestaurantContext } from '../contexts/restaurant.context';
import { confirmPremiumOrder } from '../services/orderService';
import { Combination } from '../types/combinationTypes';
import { ChosenSupplierQuote } from '../types/suppliersDataTypes';
import CustomListItem from './list/customListItem';
import CustomAlert from './modais/CustomAlert';
import DialogInstanceNotification from './modais/DialogInstanceNotification';
import CustomSubtitle from './subtitle/customSubtitle';

interface CombinationListProps {
  handleConfirm: () => void;
}

const CombinationList: React.FC<CombinationListProps> = ({ handleConfirm }) => {
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  const { availableSuppliers, getSuppliersFromStorage } = useSupplier();
  const { selectedRestaurant, hasConectarPlusAccess } = useRestaurantContext();
  const { deliveryDate } = useDeliveryDate();
  const {
    myCombinations,
    conectarCombinations,
    unavailableCombinations,
    combinationData,
    loadingCombinations,
    getCombinationsByRestaurant,
  } = useCombination();
  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      try {
        await getCombinationsByRestaurant();
      } catch (error) {
        setIsAlertVisible(true);
      }
    };
    initialize();
  }, []);

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

  if (loadingCombinations || confirmLoading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
      </View>
    );
  }

  if (myCombinations.length === 0 && unavailableCombinations.length === 0) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" padding={20}>
        <CustomSubtitle>
          Nenhuma combinação encontrada para o restaurante selecionado.
        </CustomSubtitle>
      </View>
    );
  }

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
