import Icons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Platform, VirtualizedList } from 'react-native';
import { ScrollView, Stack, Text, View } from 'tamagui';
import { useSupplier } from '../contexts/fornecedores.context';
import { useRestaurantContext } from '../contexts/restaurant.context';
import { TCart } from '../types/cartTypes';
import { Restaurant } from '../types/restaurantTypes';
import { SupplierData } from '../types/types';
import { getBrazilDateTime } from '../utils/dateUtils';
import { ImageWithFallback } from './image/ImageWithFallback';
import LoadingActivityIndicator from './loading/loadingActivityIndicator';
import CustomAlert from './modais/CustomAlert';

interface SuppliersListProps {
  cart: Map<string, TCart> | undefined;
  goToConfirm: (supplier: SupplierData, selectedRestaurant: Restaurant) => void;
}

function SupplierBox({
  supplier,
  available,
  selectedRestaurant,
  goToConfirm,
}: {
  supplier: SupplierData;
  available: boolean;
  selectedRestaurant: Restaurant;
  goToConfirm: (supplier: SupplierData, selectedRestaurant: Restaurant) => void;
}) {
  const isOpen = () => {
    const currentDate = getBrazilDateTime();
    const currentHour = Number(
      `${currentDate.hour.toString().length < 2 ? `0${currentDate.hour}` : currentDate.hour}${currentDate.minute.toString().length < 2 ? `0${currentDate.minute}` : currentDate.minute}${currentDate.second.toString().length < 2 ? `0${currentDate.second}` : currentDate.second}`,
    );
    return Number(supplier.supplier.hour.replaceAll(':', '')) < currentHour;
  };

  const hasSameDayOrdersWithSupplier = supplier.supplier.sameDayOrders.length > 0;

  return (
    <View
      opacity={available ? 1.0 : 0.4}
      onPress={() => {
        if (available) {
          goToConfirm(supplier, selectedRestaurant);
        }
      }}
      flexDirection="row"
      borderBottomWidth={0.1}
      borderBottomColor="lightgray"
    >
      <View
        style={{ paddingLeft: Platform.OS === 'web' ? '20vw' : '' }}
        marginVertical={10}
        flexDirection="row"
        flex={1}
      >
        <View padding={5}>
          <ImageWithFallback
            uri={`https://cdn.conectarhortifruti.com.br/files/images/supplier/${supplier.supplier.externalId}.jpg`}
          />
        </View>
        <View marginLeft={10} maxWidth="75%" justifyContent="center">
          <View flexDirection="row" alignItems="center" gap={8}>
            <Text flexShrink={16}>{supplier.supplier.name.replace('Distribuidora', '')}</Text>
            {hasSameDayOrdersWithSupplier && Platform.OS === 'web' && (
              <View
                paddingHorizontal={8}
                paddingVertical={2}
                borderRadius={12}
                borderWidth={1.5}
                borderColor="#04BF7B"
                backgroundColor="transparent"
              >
                <Text fontSize={12} color="#04BF7B" fontWeight="600">
                  Complementar pedido
                </Text>
              </View>
            )}
          </View>
          <View flexDirection="row" alignItems="center">
            <Icons color="orange" name="star" />
            <Text paddingLeft={4}>{supplier.supplier.star}</Text>
          </View>
          {hasSameDayOrdersWithSupplier && Platform.OS !== 'web' && (
            <View
              paddingHorizontal={8}
              paddingVertical={2}
              borderRadius={12}
              borderWidth={1.5}
              borderColor="#04BF7B"
              backgroundColor="transparent"
            >
              <Text fontSize={10} color="#04BF7B" fontWeight="600">
                Complementar pedido
              </Text>
            </View>
          )}
        </View>
      </View>
      <View style={{ paddingRight: Platform.OS === 'web' ? '10vw' : '' }} justifyContent="center">
        <View>
          <Text textAlign="right" fontSize={16} fontWeight="800">
            R$ {supplier.supplier.discount.orderValueFinish.toFixed(2).replace('.', ',')}
          </Text>
          {available ? (
            <Text color={supplier.supplier.missingItens > 0 ? 'red' : 'black'} fontSize={12}>
              {supplier.supplier.missingItens} iten(s) faltante(s)
            </Text>
          ) : (
            <>
              {supplier.supplier.missingItens > 0 ? (
                <Text color="red" fontSize={12}>
                  {supplier.supplier.missingItens} iten(s) faltante(s)
                </Text>
              ) : (
                <></>
              )}
              {isOpen() && !selectedRestaurant.allowClosedSupplier ? (
                <Text color="red" fontSize={12}>
                  Fechado às {supplier.supplier.hour.substring(0, 5)}
                </Text>
              ) : (
                <></>
              )}
              {supplier.supplier.minimumOrder > supplier.supplier.discount.orderValueFinish &&
              !selectedRestaurant.allowMinimumOrder &&
              supplier.supplier.sameDayOrders.length === 0 ? (
                <Text color="red" fontSize={12}>
                  Mínimo R$
                  {supplier.supplier.minimumOrder.toFixed(2).replace('.', ',')}
                </Text>
              ) : (
                <></>
              )}
            </>
          )}
        </View>
      </View>
      <View
        paddingLeft={10}
        justifyContent="center"
        style={{ paddingRight: Platform.OS === 'web' ? '10vw' : undefined }}
      >
        {available && <Icons name="chevron-forward" size={24} />}
      </View>
    </View>
  );
}

const SuppliersList: React.FC<SuppliersListProps> = ({ cart, goToConfirm }) => {
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const { selectedRestaurant } = useRestaurantContext();
  const { availableSuppliers, unavailableSuppliers, loadingSuppliers, getPricesBySupplier } =
    useSupplier();

  useEffect(() => {
    const initialize = async () => {
      try {
        await getPricesBySupplier();
      } catch (error) {
        setIsAlertVisible(true);
      }
    };
    initialize();
  }, []);

  const getItem = (data: SupplierData[], index: number) => data[index];
  const getItemCount = (data: SupplierData[]) => data.length;
  const renderItem = (
    { item, restaurant }: { item: SupplierData; restaurant: Restaurant },
    available: boolean,
  ) => {
    return (
      <SupplierBox
        supplier={item}
        available={available}
        selectedRestaurant={restaurant}
        goToConfirm={goToConfirm}
      />
    );
  };

  if (loadingSuppliers || !selectedRestaurant) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <LoadingActivityIndicator />
      </View>
    );
  }

  if ((cart?.size ?? 0) === 0) {
    return (
      <Stack flex={1} alignItems="center" justifyContent="center">
        <Text>Não há cotações disponíveis...</Text>
        <Text>Tente adicionar algo ao carrinho!</Text>
      </Stack>
    );
  }

  return (
    <>
      <CustomAlert
        visible={isAlertVisible}
        title="Ops!"
        message="Erro ao carregar fornecedores, tente novamente mais tarde."
        onConfirm={() => setIsAlertVisible(false)}
        width="35%"
      />
      <ScrollView flex={1} overflow="scroll" padding={3}>
        <Text
          style={{ paddingLeft: Platform.OS === 'web' ? '20.7vw' : '' }}
          paddingBottom={5}
          marginTop={10}
          fontSize={16}
          color={'gray'}
        >
          Fornecedores disponíveis
        </Text>

      <VirtualizedList
        style={{ marginBottom: 5 }}
        data={availableSuppliers}
        getItemCount={getItemCount}
        getItem={getItem}
        keyExtractor={(item, index) => (item.supplier ? item.supplier.name : `separator-${index}`)}
        renderItem={(item) => renderItem({ item: item.item, restaurant: selectedRestaurant }, true)}
        ItemSeparatorComponent={() => <View height={2} />}
        initialNumToRender={availableSuppliers.length}
        scrollEnabled={false}
      />

      {unavailableSuppliers.length > 0 && (
        <>
          <Text
            style={{ paddingLeft: Platform.OS === 'web' ? '20.7vw' : '' }}
            paddingBottom={5}
            marginTop={10}
            fontSize={16}
            color={'gray'}
          >
            Fornecedores indisponíveis
          </Text>

          <VirtualizedList
            style={{ marginBottom: 5 }}
            data={unavailableSuppliers}
            getItemCount={getItemCount}
            getItem={getItem}
            keyExtractor={(item, index) =>
              item.supplier ? item.supplier.name : `separator-${index}`
            }
            renderItem={(item) =>
              renderItem({ item: item.item, restaurant: selectedRestaurant }, false)
            }
            ItemSeparatorComponent={() => <View height={2} />}
            initialNumToRender={unavailableSuppliers.length}
            scrollEnabled={false}
          />
        </>
      )}
      </ScrollView>
    </>
  );
};

export default SuppliersList;
