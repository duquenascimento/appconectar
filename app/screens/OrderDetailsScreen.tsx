import { Button, Text, View } from "tamagui";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../src/types/navigationTypes";
import { useEffect, useState } from "react";
import { cancelOrder, getOrder } from "../../src/services/orderService";
import { OrderData } from "../../src/types/IOrder";
import { ActivityIndicator, Platform } from "react-native";
import Icons from "@expo/vector-icons/Ionicons";
import LabelAndBoxContent from "../../src/components/box/LabelAndBoxContent";
import { openURL } from "expo-linking";
import CustomAlert from "../../src/components/modais/CustomAlert";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

export function OrderDetailsScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "OrderDetails">>();
  const navigation = useNavigation();
  /*type OrderDetailsScreenProps = {
      navigation: NativeStackNavigationProp<RootStackParamList, 'OrderDetails'>;
  }*/

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalErrorVisibility, setModalErrorVisibility] = useState(false);
  const [modalCancelOrderVisibility, setModalCancelOrderVisibility] = useState(false);
  const [modalSuccessCanceledVisibility, setModalSuccessCanceledVisbility] = useState(false);

  const orderId = route.params?.orderId;

  useEffect(() => {
    const loadOrders = async () => {
      if (!orderId) {
        console.error("orderId não encontrado nos parâmetros da rota");
        setLoading(false);
        return;
      }

      try {
        const orderData: OrderData = await getOrder(orderId);
        setOrder(orderData);
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [orderId]);

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
      </View>
    );
  }

  if (!order) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <Text>Pedido não encontrado</Text>
      </View>
    );
  }

  const supplier = order.calcOrderAgain?.data?.find(
    (item: any) => item.supplier.externalId === order.supplierId
  )?.supplier;

  const supplierName = supplier ? supplier.name : "Fornecedor não encontrado";

  return (
    <View flex={1} backgroundColor="#F0F2F6">
      <Text
        style={{
          marginTop: 35,
          marginLeft: Platform.OS === 'web' ? 30 : 15,
          width: Platform.OS === 'web' ? '70%' : '92%',
          alignSelf: Platform.OS === 'web' ? 'center' : 'flex-start'
        }}
      >Detalhamento</Text>
      <CustomAlert
        message="Pedidos só podem ser cancelados em até 15 minutos após a confirmação"
        title="Ops!"
        onConfirm={() => {
          setModalErrorVisibility(false);
        }}
        visible={modalErrorVisibility}
      />
      <CustomAlert
        message="Seu pedido foi cancelado com sucesso!"
        title="Pedido cancelado"
        onConfirm={() => {
          navigation.goBack();
        }}
        visible={modalSuccessCanceledVisibility}
      />
      <CustomAlert
        message="Esta ação não poderá ser revertida"
        title="Cancelar pedido?"
        onConfirm={async () => {
          try {
            setLoading(true);
            const orderCanceled = await cancelOrder(order.id);
            if (orderCanceled === "too late") setModalErrorVisibility(true);
            else setModalSuccessCanceledVisbility(true);
          } finally {
            setModalCancelOrderVisibility(false);
            setLoading(false);
          }
        }}
        visible={modalCancelOrderVisibility}
        closeOption
        setVisibility={setModalCancelOrderVisibility}
        buttonText="Cancelar"
        negativeMainButton
      />
      <View
        flexDirection="row"
        alignItems="center"
        padding={6}
        borderBottomWidth={1}
        borderBottomColor="lightgray"
      >
        <Icons
          onPress={() =>
            navigation.replace('Orders')
          }
          size={25}
          name="chevron-back"
        ></Icons>
        <View 
        flex={1} 
        alignItems="center" 
        mb={5}>
          <Text>Pedido {order.id}</Text>
          <Text fontSize={10} color="gray">
            Entregue {formatDate(order.deliveryDate)}
          </Text>
        </View>
      </View>
      <View
        padding={16}
        flex={1}
        gap={6}
        style={{ 
          width: Platform.OS === 'web' ? '70%' : '92%',
          alignSelf: "center"
         }}
      >
        <Text fontSize={10} color="gray">
          Documentos
        </Text>
        <LabelAndBoxContent
          iconName="download"
          title="Recibo"
          subtitle="Por Conéctar"
          icon={true}
          iconAction={() => {
            if (order.orderDocument) {
              openURL(order.orderDocument);
            } else {
              console.warn("Documento não disponível");
            }
          }}
        />
        <Text fontSize={10} color="gray">
        </Text>
        <LabelAndBoxContent
          iconName="download"
          icon={true}
          title="Nota Fiscal"
          subtitle={`Por ${supplierName}`}
          iconAction={() => {
            if (order.orderInvoices) {
              openURL(order.orderInvoices?.filePath[0]);
            } else {
              console.warn("Documento não disponível");
            }
          }}
        />
        <Button
          borderColor="red"
          borderWidth={1}
          borderRadius={6}
          onPress={async () => setModalCancelOrderVisibility(true)}
        >
          <Text color="red">Cancelar pedido</Text>
        </Button>
      </View>
    </View>
  );
}
