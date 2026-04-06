import Icons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { Text, View } from 'tamagui';
import LabelAndBoxContent from '../src/components/box/LabelAndBoxContent';
import CustomAlert from '../src/components/modais/CustomAlert';
import { cancelOrder, getOrder } from '../src/services/orderService';
import { OrderData } from '../src/types/IOrder';
import PageContainer from '@/src/components/box/PageContainer';
import PdfViewerModal from '@/src/components/modais/PdfViewerModal';
import TimerButton from '@/src/components/button/timerButton';
import { CancelationRulesType, CancelationOrderErrorKind } from '@/src/types/cancelOrderTypes';
import { TwoButtonCustomAlert } from '@/src/components/modais/TwoButtonCustomAlert';
import { ModalDocumentsAndInvoices } from '@/src/components/modais/ModalDocumentsAndInvoices';
import { PixDisplay } from '@/src/components/PixDisplay';
import { getPixChargeByOrderId } from '@/src/services/pixService';
import { PixCharge } from '@/src/types/pixTypes';
import { getOrderStatusDescription } from '@/src/utils/orderUtils';
import { getPaymentMethod } from '@/src/utils/paymentUtils';

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [cancelationRule, setCancelationRule] = useState<CancelationRulesType | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalCancelOrderVisibility, setModalCancelOrderVisibility] = useState(false);
  const [modalSuccessCanceledVisibility, setModalSuccessCanceledVisbility] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pixCharge, setPixCharge] = useState<PixCharge | null>(null);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadOrders = async (): Promise<OrderData | null> => {
      if (!orderId) {
        console.error('orderId não encontrado nos parâmetros da rota');
        return null;
      }

      try {
        const orderData = await getOrder(orderId);
        setOrder(orderData.data);
        setCancelationRule(orderData.data.cancelationRule);
        return orderData.data;
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        return null;
      }
    };

    const loadPixData = async (currentOrder: OrderData) => {
      if (getPaymentMethod(currentOrder.paymentWay) !== 'PIX') {
        return;
      }
      try {
        const currentPixCharge = await getPixChargeByOrderId(orderId);
        setPixCharge(currentPixCharge);
      } catch (error) {
        console.error('Erro ao carregar QR Code:', error);
      }
    };

    const loadInitalData = async () => {
      try {
        setLoading(true);
        const currentOrder = await loadOrders();
        if (currentOrder) {
          await loadPixData(currentOrder);
        }
      } finally {
        setLoading(false);
      }
    };

    loadInitalData();
  }, [orderId]);

  const showErrorModal = (title: string, message: string) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setErrorModalVisible(true);
  };

  const handleCancelOrder = async () => {
    if (!orderId) return;
    setLoading(true);
    const result = await cancelOrder(orderId);
    setLoading(false);
    if (result.success) {
      setModalSuccessCanceledVisbility(true);
      return;
    }
    switch (result.kind) {
      case CancelationOrderErrorKind.BUSINESS:
        showErrorModal('Não foi possível cancelar o pedido', result.message);
        break;

      case CancelationOrderErrorKind.NOT_FOUND:
        showErrorModal(
          'Pedido não encontrado',
          result.message || 'Este pedido não existe ou já foi removido.',
        );
        break;

      case CancelationOrderErrorKind.TECHNICAL:
      default:
        showErrorModal('Erro inesperado', result.message || 'Tente novamente mais tarde.');
        break;
    }
  };

  if (loading || !cancelationRule) {
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
    (item: any) => item.supplier.externalId === order.supplierId,
  )?.supplier;

  const supplierName = supplier ? supplier.name : 'Fornecedor não encontrado';
  const isPixPayment =  getPaymentMethod(order.paymentWay ?? '') === 'PIX';
  return (
    <PageContainer backgroundColor="gray">
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
            onClose={() => setShowPdfModal(false)}
          />
        )}

        <Text
          style={{
            marginLeft: Platform.OS === 'web' ? 30 : 15,
            width: Platform.OS === 'web' ? '70%' : '92%',
            alignSelf: Platform.OS === 'web' ? 'center' : 'flex-start',
          }}
        >
          Detalhamento
        </Text>
        <CustomAlert
          visible={errorModalVisible}
          title={errorTitle}
          message={errorMessage}
          onConfirm={() => setErrorModalVisible(false)}
        />
        <CustomAlert
          message="Seu pedido foi cancelado com sucesso!"
          title="Pedido cancelado"
          onConfirm={() => {
            router.back();
          }}
          color="#04BF7B"
          visible={modalSuccessCanceledVisibility}
          buttonText="Ok"
        />

        {/** A ordem dos botões foi invertida */}
        <TwoButtonCustomAlert
          message="Esta ação não poderá ser revertida"
          title="Cancelar pedido?"
          onConfirm={() => setModalCancelOrderVisibility(false)}
          onCancel={async () => {
            setModalCancelOrderVisibility(false);
            await handleCancelOrder();
          }}
          confirmText="Cancelar"
          cancelText="Confirmar"
          cancelColor="#04BF7B"
          confirmColor="#E74C3C"
          visible={modalCancelOrderVisibility}
        />
        <View
          alignItems="center"
          flexDirection="row"
          paddingVertical="$4"
          gap="$4"
          style={{ width: Platform.OS === 'web' ? '70%' : '92%' }}
          marginHorizontal="auto"
        >
          <Icons onPress={() => router.push('/ordersScreen')} size={30} name="chevron-back" />
          <View flex={1} marginBottom={5}>
            <Text>Pedido {order.id}</Text>
            <Text fontSize={10} color="gray">
              {getOrderStatusDescription(order.status_id, order.deliveryDate)}
            </Text>
          </View>
        </View>
        <View
          padding={16}
          flex={1}
          gap={6}
          style={{
            width: Platform.OS === 'web' ? '70%' : '92%',
            alignSelf: 'center',
          }}
        >
          {isPixPayment && order && order.status_id !== 7 && (
            <View width={'100%'} alignItems="center">
              {order.status_id === 6 || order.status_id === 14 ? (
                <Text>QR Code expirado</Text>
              ) : (
                <PixDisplay pixCharge={pixCharge} />
              )}
            </View>
          )}
          <Text fontSize={10} color="gray">
            Documentos
          </Text>
          <TouchableOpacity
            onPress={async () => {
              const url = order.orderDocument;
              if (!url) {
                setShowDocumentsModal(true);
                return;
              }

              try {
                const res = await fetch(
                  `${process.env.EXPO_PUBLIC_API_URL}/verify-link?url=${encodeURIComponent(url)}`,
                );
                const data = await res.json();
                if (data && data.status === 200) {
                  setPdfUrl(url);
                  setShowPdfModal(true);
                } else {
                  setShowDocumentsModal(true);
                }
              } catch (err) {
                console.error('Erro na verificação:', err);
                setShowDocumentsModal(true);
              }
            }}
          >
            <LabelAndBoxContent iconName="download" title="Recibo" subtitle="Por Conéctar" icon />
          </TouchableOpacity>
          <Text fontSize={10} color="gray" />
          <TouchableOpacity
            onPress={async () => {
              const url = order.orderInvoices?.filePath[0];
              if (!url) {
                setShowDocumentsModal(true);
                return;
              }

              try {
                const res = await fetch(
                  `${process.env.EXPO_PUBLIC_API_URL}/verify-link?url=${encodeURIComponent(url)}`,
                );
                const data = await res.json();
                if (data && data.status === 200) {
                  setPdfUrl(url);
                  setShowPdfModal(true);
                } else {
                  setShowDocumentsModal(true);
                }
              } catch (err) {
                console.error('Erro na verificação:', err);
                setShowDocumentsModal(true);
              }
            }}
          >
            <LabelAndBoxContent
              iconName="download"
              icon
              title="Nota Fiscal"
              subtitle={`Por ${supplierName}`}
            />
          </TouchableOpacity>
          {cancelationRule.criteria !== 'EXPIRED' && order.status_id !== 6 && (
            <TimerButton
              deadline={cancelationRule.remainingSeconds}
              onCancel={() => setModalCancelOrderVisibility(true)}
            />
          )}
        </View>
      </View>
    </PageContainer>
  );
}
