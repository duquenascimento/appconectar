import { Button, Text, View } from "tamagui";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigationTypes";
import { useEffect, useState } from "react";
import { cancelOrder, getOrder } from "../utils/services/orderService";
import { OrderData } from "../types/IOrder";
import { ActivityIndicator } from "react-native";
import Icons from "@expo/vector-icons/Ionicons";
import LabelAndBoxContent from "../components/box/LabelAndBoxContent";
import { openURL } from "expo-linking";
import CustomAlert from "../components/modais/CustomAlert";

export default function OrderDetailsScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "OrderDetails">>();
  const navigation = useNavigation();

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
        console.log("Order Data:", orderData);
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
    (item) => item.supplier.externalId === order.supplierId
  )?.supplier;

  const supplierName = supplier ? supplier.name : "Fornecedor não encontrado";

  return (
    <View flex={1} backgroundColor="#F0F2F6">
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
          onPress={() => {
            navigation.goBack();
          }}
          size={25}
          name="chevron-back"
        ></Icons>
        <View flex={1} alignItems="center">
          <Text>Pedido {order.id}</Text>
          <Text fontSize={10} color="gray">
            Entregue {formatDate(order.deliveryDate)}
          </Text>
        </View>
      </View>
      <View padding={16} flex={1} gap={6}>
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
        <LabelAndBoxContent
          iconName="download"
          icon={true}
          title="Nota Fiscal"
          subtitle={`Por ${supplierName}`}
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
