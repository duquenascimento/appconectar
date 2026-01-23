import PageContainer from '@/src/components/box/PageContainer';
import DialogComercialInstance from '@/src/components/dialogComercialInstance';
import { DropDownPickerRestaurant } from '@/src/components/input/DropDownPickerRestaurant';
import { HeaderText } from '@/src/components/text/HeaderText';
import { useAuthContext } from '@/src/contexts/auth.context';
import { useRestaurantContext } from '@/src/contexts/restaurant.context';
import { getAllScheduleOrders } from '@/src/services/scheduleOrderService';
import { isScheduleOrderResponse, ScheduleOrderResponse } from '@/src/types/scheduleOrderTypes';
import { getBrazilDateTime, getBrazilLocaleString, isTomorrow } from '@/src/utils/dateUtils';
import Icons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { ReactNode, useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Input, Text, View, XStack, YStack } from 'tamagui';
import CustomAlert from '../src/components/modais/CustomAlert';
import { getOrders } from '../src/services/orderService';
import { ordersScreenStyles as styles } from '../src/styles/styles';
import { HomeScreenPropsUtils } from '../src/utils/NavigationTypes';
import { VersionInfo } from '../src/utils/VersionApp';

interface Order {
  orderDocument: ReactNode;
  id: string;
  deliveryDate: string;
  totalConectar: number;
  supplierId: string;
  calcOrderAgain: {
    data: {
      supplier: {
        externalId: string;
        name: string;
      };
    }[];
  };
}

const getStatusAndColor = (item: ScheduleOrderResponse): [string, string] => {
  if (isTomorrow(getBrazilDateTime(item.deliveryDate))) {
    return ['Aguardando confirmação', '#FFC107'];
  }
  if (item.status == 'CANCELED') {
    return ['Cancelado', '#DD2300'];
  }
  return ['Agendado', '#4CAF50'];
};

export default function OrdersScreen(props: HomeScreenPropsUtils) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [scheduledOrders, setScheduledOrders] = useState<ScheduleOrderResponse[]>([]);
  const [filteredScheduledOrders, setFilteredScheduledOrders] = useState<ScheduleOrderResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const { restaurants, selectedRestaurant, saveRestaurant } = useRestaurantContext();
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [showAlertVisible, setShowAlertVisible] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const { width: screenWidth } = useWindowDimensions();
  const isLargeScreen = screenWidth > 800;
  const { logout } = useAuthContext();

  const router = useRouter();

  // Só carrega pedidos ao entrar na tela e se restaurante mudar
  useFocusEffect(
    useCallback(() => {
      const loadOrders = async () => {
        if (!selectedRestaurant) {
          return;
        }
        setLoading(true);
        try {
          const [result, scheduleOrders] = await Promise.all([
            getOrders(1, 100, selectedRestaurant.externalId),
            getAllScheduleOrders(),
          ]);

          const ordersData = result.map((order: Order) => {
            const filteredSupplier =
              order.calcOrderAgain?.data?.filter(
                (item) => item.supplier?.externalId === order.supplierId,
              ) || [];

            return {
              ...order,
              calcOrderAgain: {
                ...order.calcOrderAgain,
                data: filteredSupplier,
              },
            };
          });
          setOrders(ordersData);
          setScheduledOrders(scheduleOrders);
          setFilteredScheduledOrders(scheduleOrders);
          setFilteredOrders(ordersData);
        } catch (error) {
          console.error('Erro ao carregar pedidos:', error);
        } finally {
          setLoading(false);
        }
      };
      loadOrders();
    }, [selectedRestaurant]),
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const datePartialRegex = /^(\d{1,2})(\/\d{1,2})?(\/\d{1,4})?$/;
    const isDatePartial = datePartialRegex.test(query);
    const fOrders = orders.filter((order: Order) => {
      if (isDatePartial) {
        const [day, month, year] = query.split('/');
        const deliveryDate = order.deliveryDate.split('T')[0];
        const [orderYear, orderMonth, orderDay] = deliveryDate.split('-');
        if (day && !orderDay.startsWith(day)) return false;
        if (month && !orderMonth.startsWith(month)) return false;
        if (year && !orderYear.startsWith(year)) return false;
        return true;
      }
      const matchesId = order.id?.toLowerCase().includes(query.toLowerCase());
      const matchesTotal = order.totalConectar.toString().includes(query);
      const matchExternalId = order.calcOrderAgain?.data?.find(
        (item) => item.supplier && item.supplier.externalId === order.supplierId,
      );

      const matchesSupplier = matchExternalId?.supplier?.name
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesId || matchesTotal || matchesSupplier;
    });

    setFilteredOrders(fOrders);

    const fScheduledOrders = scheduledOrders.filter((order: ScheduleOrderResponse) => {
      const matchType = 'agendamento'.includes(query.toLowerCase());
      const matchesSuppleir =
        order.supplier?.name.toLowerCase().includes(query.toLowerCase()) ||
        order.supplier?.externalId.toLowerCase().includes(query.toLowerCase());

      const matchDate = getBrazilDateTime(order.deliveryDate)
        .toFormat('dd/MM/yyyy')
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchType || matchesSuppleir || matchDate;
    });

    setFilteredScheduledOrders(fScheduledOrders);
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prevSelected: any) => {
      if (prevSelected.includes(orderId)) {
        return prevSelected.filter((id: string) => id !== orderId);
      }
      return [...prevSelected, orderId];
    });
  };

  const handleDownloadSelectedOrders = async () => {
    setIsDownloading(true);
    for (const orderId of selectedOrders) {
      const order: any = orders.find((o) => o.id === orderId);
      if (!order) {
        showAlert('Pedido inválido', 'Não foi possível encontrar o pedido selecionado.');
        continue;
      }

      const { orderDocument, orderInvoices } = order;
      const invoiceUrl = orderInvoices?.filePath?.[0];
      const isValidDocUrl = typeof orderDocument === 'string' && orderDocument.startsWith('http');

      if (!isValidDocUrl && !invoiceUrl) {
        showAlert('Ocorreu um erro ao buscar documentos', 'Por favor, tente novamente mais tarde');
        return;
      }
      if (!isValidDocUrl) {
        showAlert('Documento indisponível', 'O pedido não está disponível para visualização.');
      } else {
        await openUrl(orderDocument);
      }
      if (!invoiceUrl) {
        showAlert(
          'Nota fiscal indisponível',
          'A nota fiscal deste pedido não está disponível para download.',
        );
      } else {
        await openUrl(invoiceUrl);
      }
      await delay(1000);
    }

    setIsDownloading(false);
  };

  const openUrl = async (url: string) => {
    if (!url) return;

    try {
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Erro ao abrir o link:', error);
      showAlert(
        'Erro ao abrir o link',
        'Não foi possível abrir o link do pedido ou da nota fiscal.',
      );
    }
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const showAlert = (title: string, message: string) => {
    setCustomAlertTitle(title);
    setCustomAlertMessage(message);
    setShowAlertVisible(true);
    setIsDownloading(false);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return `${text.substring(0, maxLength)}...`;
    }
    return text;
  };

  if (loading) {
    return (
      <PageContainer backgroundColor="white">
        <View flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color="#04BF7B" />
          <Text fontSize={16} marginTop={5} color="gray" textAlign="center" width={'90%'}>
            Carregando histórico de pedidos. Por favor Aguarde...
          </Text>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer backgroundColor="white">
      <CustomAlert
        visible={showAlertVisible}
        title={customAlertTitle}
        message={customAlertMessage}
        onConfirm={() => setShowAlertVisible(false)}
      />
      <HeaderText>Meus Restaurantes</HeaderText>
      <DropDownPickerRestaurant onBeforeChange={() => setLoading(true)} />

      <XStack
        backgroundColor="#FFF"
        borderRadius={20}
        width={isLargeScreen ? '50%' : '92%'}
        marginTop={20}
        alignSelf="center"
        alignItems="center"
      >
        <Icons name="search" size={24} color="#04BF7B" style={{ marginLeft: 15 }} />
        <Input
          width={isLargeScreen ? '67%' : '92%'}
          placeholder="Buscar pedidos..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            handleSearch(text);
          }}
          backgroundColor="transparent"
          borderWidth={0}
          borderColor="transparent"
          fontSize={14}
          color="#000"
          flex={1}
          placeholderTextColor="#888"
        />
      </XStack>

      <TouchableOpacity
        onPress={handleDownloadSelectedOrders}
        disabled={selectedOrders.length === 0 || isDownloading}
        style={{
          width: isLargeScreen ? '50%' : '92%',
          backgroundColor: selectedOrders.length > 0 ? '#04BF7B' : '#ccc',
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 5,
          alignItems: 'center',
          alignSelf: 'center',
          marginBottom: 16,
          marginTop: isLargeScreen ? 20 : 15,
          marginHorizontal: 15,
        }}
      >
        {isDownloading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
            Baixar Documentos Selecionados
          </Text>
        )}
      </TouchableOpacity>

      <FlatList
        style={{
          width: isLargeScreen ? '50%' : '92%',
          alignSelf: 'center',
        }}
        data={[...filteredScheduledOrders, ...filteredOrders]}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => <Text>Nenhum pedido encontrado.</Text>}
        renderItem={({ item }) => {
          const isScheduledOrder = isScheduleOrderResponse(item);

          const supplierName = isScheduledOrder
            ? item.combination?.nome || item.supplier?.name || 'Fornecedor indisponível'
            : item.calcOrderAgain?.data[0]?.supplier?.name || 'Fornecedor indisponível';
          const truncatedSupplierName = truncateText(supplierName, isLargeScreen ? 20 : 12);
          const [status, statusColor] = isScheduledOrder ? getStatusAndColor(item) : [];
          return (
            <TouchableOpacity
              onPress={
                isScheduledOrder
                  ? () => {
                      router.push({
                        pathname: '/schedule',
                        params: { orderId: item.id },
                      });
                    }
                  : () =>
                      router.push({
                        pathname: '/orderDetailsScreen',
                        params: { orderId: item.id },
                      })
              }
              style={styles.itemContainer}
            >
              <TouchableOpacity
                onPress={isScheduledOrder ? () => {} : () => toggleOrderSelection(item.id)}
                style={{
                  ...styles.checkboxContainer,
                  borderColor: isScheduledOrder ? '#ccc' : '#04BF7B',
                  borderWidth: 3,
                }}
                disabled={isScheduledOrder}
              >
                <Text>{selectedOrders.includes(item.id) ? '✓' : ''}</Text>
              </TouchableOpacity>

              <View style={styles.leftColumn}>
                {isScheduledOrder ? (
                  <View
                    backgroundColor={statusColor}
                    borderRadius={20}
                    paddingHorizontal={8}
                    paddingVertical={2}
                    marginBottom={4}
                    marginRight={8}
                    flex={0}
                  >
                    <Text color={'white'} textAlign="center">
                      {status}
                    </Text>
                  </View>
                ) : (
                  <Text marginBottom={10} style={styles.orderId}>
                    {item.id}
                  </Text>
                )}
                <Text style={styles.deliveryDate}>{getBrazilLocaleString(item.deliveryDate)}</Text>
              </View>
              <YStack>
                {!isScheduledOrder && (
                  <Text marginBottom={10} style={styles.total} alignSelf="flex-end">
                    R$ {item.totalConectar.toFixed(2)}
                  </Text>
                )}
                <Text
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {truncatedSupplierName}
                </Text>
              </YStack>
              <Icons
                name="chevron-forward"
                size={20}
                color="#000"
                style={{
                  marginLeft: 10,
                }}
              />
            </TouchableOpacity>
          );
        }}
      />
      <View
        justifyContent="center"
        alignItems="center"
        flexDirection="row"
        gap={15}
        height={55}
        borderTopWidth={0.4}
        borderTopColor="lightgray"
      >
        <View
          onPress={() => router.push('/products')}
          padding={10}
          marginVertical={10}
          borderRadius={8}
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          width={60}
          height={70}
        >
          <Icons name="home" size={20} color="gray" />
          <Text fontSize={12} color="gray">
            Home
          </Text>
        </View>
        <View
          onPress={async () => {
            setLoading(true);
            router.push('/ordersScreen');
          }}
          padding={10}
          marginVertical={10}
          borderRadius={8}
          flexWrap="nowrap"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          width={120}
          height={70}
        >
          <Icons name="journal" size={20} color="#04BF7B" />
          <Text fontSize={12} color="#04BF7B">
            Meus Pedidos
          </Text>
        </View>
        <View
          onPress={async () => {
            setLoading(true);
            setLoading(false);
            router.push('/userInfo');
          }}
          padding={10}
          marginVertical={10}
          borderRadius={8}
          flexWrap="nowrap"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          width={80}
          height={70}
        >
          <Icons name="person" size={20} color="gray" />
          <Text fontSize={12} color="gray">
            Perfil
          </Text>
        </View>
        <View
          onPress={async () => {
            setLoading(true);
            await logout();
          }}
          padding={10}
          marginVertical={10}
          borderRadius={8}
          flexWrap="nowrap"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          width={50}
          height={70}
        >
          <Icons name="log-out" size={20} color="gray" />
          <Text fontSize={12} color="gray">
            Sair
          </Text>
        </View>
      </View>
      <VersionInfo />
      <DialogComercialInstance
        openModal={showBlockedModal}
        setOpenModal={setShowBlockedModal}
        setRegisterInvalid={setShowBlockedModal}
        rest={restaurants}
        messageText="Este restaurante não está liberado para visualizar pedidos. Entre em contato conosco ou selecione outro restaurante disponível."
        onSelectAvailable={async () => {
          try {
            const availableRestaurant = restaurants.find((r) => !r.registrationReleasedNewApp);

            if (availableRestaurant) {
              setShowBlockedModal(false);
              await saveRestaurant(availableRestaurant);
              setShowBlockedModal(false);
            }
          } catch (error) {
            console.error('Erro ao trocar de restaurante:', error);
          }
        }}
      />
    </PageContainer>
  );
}
