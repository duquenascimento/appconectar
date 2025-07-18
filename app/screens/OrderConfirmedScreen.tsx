import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { YStack, XStack, Text, Separator, View } from 'tamagui';
import Icons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import CustomButton from '../../src/components/button/CustomButton';

type RootStackParamList = {
  QuotationDetails: undefined;
  OrderConfirmed: { suppliers: any[] }; // Recebe os fornecedores da tela anterior
  Orders: undefined;
};

type OrderConfirmedScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OrderConfirmed'>;
  // route: { params: { suppliers: any[] } }; 
};

// --- Mock Data ---
const mockSuppliers = [
  {
    name: 'Lorem',
    star: '4,8',
    orderId: '99999_999',
    orderValue: 99.99,
  },
  {
    name: 'Ipsum',
    star: '4,8',
    orderId: '99999_999',
    orderValue: 99.99,
  },
];

const mockDetails = {
  restaurant: 'Restaurante Lorem Ipsum',
  address: 'Rua Lorem Ipsum, 3500, Loja A.',
  deliveryTime: 'Sexta-feira, 10/05/2024',
  deliveryWindow: 'Entre 09:00 e 12:00',
  paymentDueDate: '27/05/2024',
  paymentMethod: 'Boleto, 7 dias',
};
// --- Fim do Mock Data ---

export function OrderConfirmedScreen({ navigation }: OrderConfirmedScreenProps) {
  // const { suppliers } = route.params; // para os dados reais

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#CFD8DC' }}>
      <YStack 
        flex={1} 
        backgroundColor="#CFD8DC"
        alignSelf="center"
        width="100%"
        $gtMd={{
          maxWidth: 768
        }}
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
                <Icons name="checkmark" size={48} color="#04BF7B" />
              </YStack>
              <Text fontSize={24} fontWeight="bold" color="$gray12">
                Pedidos confirmados!
              </Text>
            </YStack>

            {/* Card de Pedidos */}
            <YStack width="100%" bg="white" br={8} p="$4" gap="$3">
              {mockSuppliers.map((supplier, index) => (
                <React.Fragment key={index}>
                  <XStack ai="center" jc="space-between">
                    <XStack ai="center" gap="$3">
                      <View width={40} height={40} br={20} bg="$gray4" />
                      <YStack>
                        <Text fontSize={16} fontWeight="bold">{supplier.name}</Text>
                        <XStack ai="center" gap="$1.5">
                          <Icons name="star" color="#F59E0B" size={14} />
                          <Text fontSize={12} color="$gray10">{supplier.star}</Text>
                        </XStack>
                      </YStack>
                    </XStack>
                    <YStack ai="flex-end">
                      <Text fontSize={16} fontWeight="bold">{formatCurrency(supplier.orderValue)}</Text>
                      <Text fontSize={12} color="$gray10">Pedido {supplier.orderId}</Text>
                    </YStack>
                  </XStack>
                  
                  {index < mockSuppliers.length - 1 && <Separator borderColor="$gray4" />}
                </React.Fragment>
              ))}
            </YStack>

            {/* Card de Detalhes */}
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

        <YStack py="$4" px="$4" bg="#CFD8DC">
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
