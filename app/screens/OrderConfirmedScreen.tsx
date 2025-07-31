import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { YStack, XStack, Text, Separator, View, Image } from 'tamagui';
import Icons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { SafeAreaView, ScrollView, Platform } from 'react-native';
import CustomButton from '@/src/components/button/customButton';
import { SupplierData } from '@/src/types/types';

type RootStackParamList = {
  QuotationDetails: undefined;
  OrderConfirmed: { suppliers: SupplierData[] };
  Orders: undefined;
};

type OrderConfirmedRouteProp = RouteProp<RootStackParamList, 'OrderConfirmed'>;
type OrderConfirmedNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderConfirmed'>;


// --- Mock Data para detalhes do restaurante (manter por enquanto) ---
// Em um app real, isso viria do perfil do usuário ou de um contexto global
const mockDetails = {
  restaurant: 'Restaurante Sabor & Arte',
  address: 'Avenida Brasil, 1234, Centro.',
  deliveryTime: 'Sexta-feira, 10/05/2024',
  deliveryWindow: 'Entre 09:00 e 12:00',
  paymentDueDate: '27/05/2024',
  paymentMethod: 'Boleto, 7 dias',
};

export function OrderConfirmedScreen() {
  const navigation = useNavigation<OrderConfirmedNavigationProp>();
  const route = useRoute<OrderConfirmedRouteProp>();
  
  
  const { suppliers } = route.params;

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

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
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <YStack flex={1} alignItems="center" justifyContent="center" p="$4" gap="$4">
            
            {/* Ícone de Check e Título */}
            <YStack alignItems="center" gap="$3">
              <YStack
                width={80}
                height={80}
                borderRadius={40}
                backgroundColor="white"
                alignItems="center"
                justifyContent="center"
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.1}
                shadowRadius={3.84}
                elevation={5}
              >
                <Icons name="checkmark" size={48} color="#1DC588" />
              </YStack>
              <Text fontSize={24} fontWeight="bold" color="$gray12">
                Pedidos confirmados!
              </Text>
            </YStack>

            {/* 3. Card de Pedidos - Renderiza os dados recebidos */}
            <YStack width="100%" bg="white" br={8} p="$4" gap="$3">
              {suppliers.map(({ supplier }, index) => (
                <React.Fragment key={supplier.externalId}>
                  <XStack ai="center" jc="space-between">
                    <XStack ai="center" gap="$3">
                      <Image
                        source={{ uri: supplier.image }}
                        width={40}
                        height={40}
                        borderRadius={20}
                      />
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

            {/* 4. Detalhes do Pedido */}
            <YStack width="100%" bg="white" br={8} p="$4" gap="$4">
              {/* Endereço */}
              <XStack ai="flex-start" gap="$3">
                <Icons name="location-outline" size={24} color="$gray11" />
                <YStack>
                  <Text fontSize={16} fontWeight="bold">{mockDetails.restaurant}</Text>
                  <Text fontSize={14} color="$gray10">{mockDetails.address}</Text>
                </YStack>
              </XStack>

              {/* Entrega */}
              <XStack ai="flex-start" gap="$3">
                <Icons name="time-outline" size={24} color="$gray11" />
                <YStack>
                  <Text fontSize={16} fontWeight="bold">{mockDetails.deliveryWindow}</Text>
                  <Text fontSize={14} color="$gray10">{mockDetails.deliveryTime}</Text>
                </YStack>
              </XStack>

              {/* Pagamento */}
              <XStack ai="flex-start" gap="$3">
                <Icons name="cash-outline" size={24} color="$gray11" />
                <YStack>
                  <Text fontSize={16} fontWeight="bold">Venc. {mockDetails.paymentDueDate}</Text>
                  <Text fontSize={14} color="$gray10">{mockDetails.paymentMethod}</Text>
                </YStack>
              </XStack>
            </YStack>
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
            paddingVertical="$3"
          />
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}
