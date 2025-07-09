import {
  Adapt,
  Button,
  Dialog,
  Sheet,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../src/types/navigationTypes";
import { useEffect, useState } from "react";
import { cancelOrder, getOrder } from "../../src/services/orderService";
import { OrderData } from "../../src/types/IOrder";
import { ActivityIndicator, Linking, Platform } from "react-native";
import Icons from "@expo/vector-icons/Ionicons";
import LabelAndBoxContent from "../../src/components/box/LabelAndBoxContent";
import { openURL } from "expo-linking";
import CustomAlert from "../../src/components/modais/CustomAlert";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

import { TouchableOpacity } from "react-native";
import { clearStorage, deleteToken } from "../utils/utils";
import PdfViewerModal from "@/src/components/modais/PdfViewerModal"

export function ModalDocumentsAndInvoices(props: {
  openModal: boolean;
  setRegisterInvalid: Function;
}) {
  return (
    <Dialog modal open={props.openModal}>
      {/* Modal adaptado para ocupar tela cheia no celular */}
      <Adapt when="sm" platform="touch">
        <Sheet
          animationConfig={{
            type: "spring",
            damping: 20,
            mass: 0.5,
            stiffness: 200,
          }}
          animation="medium"
          zIndex={200000}
          modal
          dismissOnSnapToBottom
          snapPoints={[100]} // Ocupa 100% da tela
          snapPointsMode="percent"
        >
          <Sheet.Frame padding="$4" gap="$4" flex={1}>
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay
            animation="quickest"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          bordered
          elevate
          key="content"
          animateOnly={["transform", "opacity"]}
          animation={[
            "quicker",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
        >
          <YStack
            flex={1}
            justifyContent="center"
            alignItems="center"
            padding="$4"
            gap="$4"
          >
            <Dialog.Title textAlign="center" mx="auto" color="red">
              Documento ainda não disponível
            </Dialog.Title>
            <Dialog.Description textAlign="center">
             O documento ainda não foi disponibilizado.
            </Dialog.Description>

            <XStack justifyContent="center" alignSelf="center" gap="$4">
              <Dialog.Close displayWhenAdapted asChild>
                <Button
                  width="$20"
                  theme="active"
                  aria-label="Close"
                  backgroundColor="#04BF7B"
                  color="$white1"
                  onPress={() => props.setRegisterInvalid(false)}
                >
                  Fechar
                </Button>
              </Dialog.Close>
            </XStack>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

export function OrderDetailsScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "OrderDetails">>();
  const navigation = useNavigation();
  /*type OrderDetailsScreenProps = {
      navigation: NativeStackNavigationProp<RootStackParamList, 'OrderDetails'>;
  }*/

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalErrorVisibility, setModalErrorVisibility] = useState(false);
  const [modalCancelOrderVisibility, setModalCancelOrderVisibility] =
    useState(false);
  const [modalSuccessCanceledVisibility, setModalSuccessCanceledVisbility] =
    useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false)

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
      <ModalDocumentsAndInvoices
        openModal={showDocumentsModal}
        setRegisterInvalid={setShowDocumentsModal}
      />
      {pdfUrl && showPdfModal && (
        <PdfViewerModal
          key={pdfUrl}
          pdfUrl={pdfUrl}
          open={showPdfModal}
          onClose={()=> setShowPdfModal(false)}
        />
      )}

      <Text
        style={{
          marginTop: 35,
          marginLeft: Platform.OS === "web" ? 30 : 15,
          width: Platform.OS === "web" ? "70%" : "92%",
          alignSelf: Platform.OS === "web" ? "center" : "flex-start",
        }}
      >
        Detalhamento
      </Text>
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
          onPress={() => navigation.replace("Orders")}
          size={25}
          name="chevron-back"
        ></Icons>
        <View flex={1} alignItems="center" mb={5}>
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
          width: Platform.OS === "web" ? "70%" : "92%",
          alignSelf: "center",
        }}
      >
        <Text fontSize={10} color="gray">
          Documentos
        </Text>
        <TouchableOpacity
          onPress={async () => {
            const url = order.orderDocument;
            console.log(url)
            if (!url) {
              setShowDocumentsModal(true);
              return;
            }

            try {
              const res = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/verify-link?url=${encodeURIComponent(
                  url
                )}`
              );
              const data = await res.json();
              console.log(data)
              if (data && data.status === 200) {
               setPdfUrl(url)
               setShowPdfModal(true)
              } else {
                setShowDocumentsModal(true);
              }
            } catch (err) {
              console.error("Erro na verificação:", err);
              setShowDocumentsModal(true);
            }
          }}
        >
          <LabelAndBoxContent
            iconName="download"
            title="Recibo"
            subtitle="Por Conéctar"
            icon={true}
          />
        </TouchableOpacity>
        <Text fontSize={10} color="gray"></Text>
        <TouchableOpacity
          onPress={async () => {
            const url = order.orderInvoices?.filePath[0];
            if (!url) {
              setShowDocumentsModal(true);
              return;
            }

            try {
              const res = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/verify-link?url=${encodeURIComponent(
                  url
                )}`
              );
              const data = await res.json();
              if (data && data.status === 200) {
               setPdfUrl(url)
               setShowPdfModal(true)
              } else {
                setShowDocumentsModal(true);
              }
            } catch (err) {
              console.error("Erro na verificação:", err);
              setShowDocumentsModal(true);
            }
          }}
        >
          <LabelAndBoxContent
            iconName="download"
            icon={true}
            title="Nota Fiscal"
            subtitle={`Por ${supplierName}`}
          />
        </TouchableOpacity>
        {/*<Button
          borderColor="red"
          borderWidth={1}
          borderRadius={6}
          onPress={async () => setModalCancelOrderVisibility(true)}
        >
          <Text color="red">Cancelar pedido</Text>
        </Button>*/}
      </View>
    </View>
  );
}
