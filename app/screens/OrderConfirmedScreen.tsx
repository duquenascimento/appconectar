import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { YStack, XStack, Text, Separator, View, Image } from 'tamagui';
import Icons from '@expo/vector-icons/Ionicons';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import CustomButton from '@/src/components/button/customButton';
import { SupplierData } from '@/src/types/types'; // Importe a tipagem correta
import { getStorage } from '@/app/utils/utils'; // Importe a função getStorage

// --- Novas Interfaces para os dados do Restaurante ---
interface RestaurantAddress {
  address: string;
  neighborhood: string;
  city: string;
  localNumber: string;
  zipCode: string;
  initialDeliveryTime: string;
  finalDeliveryTime: string;
}

interface RestaurantData {
  name: string;
  addressInfos: RestaurantAddress[];
  paymentWay: string; // Ex: 'UQ10'
  // Adicione outros campos que precisar aqui
}

// Tipagem de Rota
type RootStackParamList = {
  QuotationDetails: undefined;
  OrderConfirmed: { suppliers: SupplierData[] };
  Orders: undefined;
};

type OrderConfirmedRouteProp = RouteProp<RootStackParamList, 'OrderConfirmed'>;
type OrderConfirmedNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderConfirmed'>;


export function OrderConfirmedScreen() {
  const navigation = useNavigation<OrderConfirmedNavigationProp>();
  const route = useRoute<OrderConfirmedRouteProp>();
  
  const { suppliers } = route.params;

  // Estado para guardar os detalhes do restaurante e o estado de carregamento
  const [restaurantDetails, setRestaurantDetails] = useState<RestaurantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect para carregar os dados do restaurante do storage
  useEffect(() => {
    const loadRestaurantData = async () => {
      try {
        const storedData = await getStorage('selectedRestaurant');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          // O JSON tem uma chave "restaurant" no topo
          setRestaurantDetails(parsedData.restaurant); 
        } else {
          Alert.alert('Erro', 'Não foi possível encontrar os dados do restaurante.');
        }
      } catch (error) {
        console.error("Erro ao carregar dados do restaurante:", error);
        Alert.alert('Erro', 'Ocorreu um problema ao carregar as informações do restaurante.');
      } finally {
        setIsLoading(false);
      }
    };

    loadRestaurantData();
  }, []);


  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

  // Função para formatar o endereço
  const getFormattedAddress = () => {
    if (!restaurantDetails || !restaurantDetails.addressInfos.length) return '';
    const addr = restaurantDetails.addressInfos[0];
    return `${addr.address}, ${addr.localNumber} - ${addr.neighborhood}, ${addr.city}`;
  };

  // Função para formatar a janela de entrega
  const getDeliveryWindow = () => {
    if (!restaurantDetails || !restaurantDetails.addressInfos.length) return '';
    const addr = restaurantDetails.addressInfos[0];
    const startTime = new Date(addr.initialDeliveryTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const endTime = new Date(addr.finalDeliveryTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `Entre ${startTime} e ${endTime}`;
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F8' }}>
        <ActivityIndicator size="large" color="#1DC588" />
        <Text mt="$4">Carregando confirmação...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F4F8' }}>
      <YStack 
        flex={1} 
        backgroundColor="#F0F4F8"
        alignSelf="center"
        width="100%"
        maxWidth={Platform.OS === 'web' ? 768 : undefined}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <YStack flex={1} alignItems="center" justifyContent="center" p="$4" gap="$4">
            
            <YStack alignItems="center" gap="$3">
              <YStack width={80} height={80} borderRadius={40} backgroundColor="white" alignItems="center" justifyContent="center" elevation={5}>
                <Icons name="checkmark" size={48} color="#1DC588" />
              </YStack>
              <Text fontSize={24} fontWeight="bold" color="$gray12">
                Pedidos confirmados!
              </Text>
            </YStack>

            <YStack width="100%" bg="white" br={8} p="$4" gap="$3">
              {suppliers.map(({ supplier }, index) => (
                <React.Fragment key={supplier.externalId}>
                  <XStack ai="center" jc="space-between">
                    <XStack ai="center" gap="$3">
                      <Image source={{ uri: supplier.image }} width={40} height={40} borderRadius={20}/>
                      <YStack>
                        <Text fontSize={16} fontWeight="bold">{supplier.name}</Text>
                        <XStack ai="center" gap="$1.5">
                          <Icons name="star" color="#F59E0B" size={14} />
                          <Text fontSize={12} color="$gray10">{supplier.star}</Text>
                        </XStack>
                      </YStack>
                    </XStack>
                    <YStack ai="flex-end">
                      <Text fontSize={16} fontWeight="bold">{formatCurrency(supplier.discount.orderValueFinish)}</Text>
                      <Text fontSize={12} color="$gray10">Pedido #{supplier.externalId.slice(-5)}</Text>
                    </YStack>
                  </XStack>
                  {index < suppliers.length - 1 && <Separator borderColor="$gray4" />}
                </React.Fragment>
              ))}
            </YStack>

            {/* Card de Detalhes com dados do Storage */}
            {restaurantDetails && (
              <YStack width="100%" bg="white" br={8} p="$4" gap="$4">
                <XStack ai="flex-start" gap="$3">
                  <Icons name="location-outline" size={24} color="$gray11" />
                  <YStack flex={1}>
                    <Text fontSize={16} fontWeight="bold">{restaurantDetails.name}</Text>
                    <Text fontSize={14} color="$gray10">{getFormattedAddress()}</Text>
                  </YStack>
                </XStack>

                <XStack ai="flex-start" gap="$3">
                  <Icons name="time-outline" size={24} color="$gray11" />
                  <YStack>
                    <Text fontSize={16} fontWeight="bold">{getDeliveryWindow()}</Text>
                    <Text fontSize={14} color="$gray10">Previsão de entrega</Text>
                  </YStack>
                </XStack>

                <XStack ai="flex-start" gap="$3">
                  <Icons name="cash-outline" size={24} color="$gray11" />
                  <YStack>
                    <Text fontSize={16} fontWeight="bold">Pagamento via Boleto</Text>
                    <Text fontSize={14} color="$gray10">Vencimento em 7 dias</Text>
                  </YStack>
                </XStack>
              </YStack>
            )}
          </YStack>
        </ScrollView>

        <YStack py="$4" px="$4" bg="#F0F4F8">
          <CustomButton
            title="Ir para Meus pedidos"
            onPress={() => navigation.navigate('Orders')}
            backgroundColor="white"
            textColor="black"
            borderColor="$gray8"
            borderWidth={1}
          />
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}
