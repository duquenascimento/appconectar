import { Supplier } from '@/src/types/types';
import { getBrazilDateTime } from '@/src/utils/dateUtils';
import { formatCurrency } from '@/src/utils/formatCurrency';
import Icons from '@expo/vector-icons/Ionicons';
import { Platform } from 'react-native';
import { Button, Image, Text, View, XStack, YStack } from 'tamagui';
import { AccordionInfo } from '../AccordionInfo';
import { ProductItemCard } from './ProductItemCard';

interface SupplierCardProps {
  supplier: Supplier;
  deliveryDate: string;
  onShowPdf: (pdfUrl: string) => void;
}

export function SupplierCard({ supplier, deliveryDate, onShowPdf }: SupplierCardProps) {
  const hasSameDayOrders = supplier.sameDayOrders.length > 0;

  return (
    <YStack
      backgroundColor="white"
      borderRadius="$4"
      padding="$3"
      gap="$3"
      borderColor="$gray6"
      borderWidth={1}
    >
      {/* Cabeçalho do fornecedor */}
      <XStack alignItems="center">
        <Image
          source={{ uri: supplier.image }}
          width={Platform.OS === 'web' ? 40 : undefined}
          height={40}
          borderRadius={20}
        />
        <YStack marginLeft="$3" flex={1}>
          <XStack>
            <Text fontSize={16} fontWeight="bold">
              {supplier.name.replace('Distribuidora', '').trim()}
            </Text>
            {hasSameDayOrders && (
              <View
                marginLeft={8}
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
          </XStack>
          <XStack alignItems="center" gap="$1.5">
            <Icons name="star" color="#F59E0B" size={14} />
            <Text fontSize={12} color="$gray10">
              {supplier.star}
            </Text>
          </XStack>
        </YStack>

        <YStack alignItems="flex-end">
          <Text fontSize={16} fontWeight="bold">
            {formatCurrency(supplier.discount.orderValueFinish)}
          </Text>
          <Text fontSize={12} color="$gray10">
            {supplier.discount.product.length} item
            {supplier.discount.product.length !== 1 ? 's' : ''}
          </Text>
        </YStack>
      </XStack>

      {/* Same Day Orders Accordion */}
      {hasSameDayOrders && (
        <YStack width="100%" marginHorizontal={0}>
          <AccordionInfo
            marginBottom={4}
            title={`Você já possui ${supplier.sameDayOrders.length} pedido${supplier.sameDayOrders.length > 1 ? 's' : ''} com esse fornecedor para o dia ${getBrazilDateTime(deliveryDate).toFormat('dd/MM/yyyy')}`}
            content={
              <>
                {supplier.sameDayOrders.map((order, index) => (
                  <YStack key={order.id || index}>
                    <YStack padding={12} backgroundColor="#F9F9F9" borderRadius={8} gap={8}>
                      <XStack justifyContent="space-between" alignItems="center">
                        <YStack>
                          <Text fontSize={14} fontWeight="600">
                            Pedido {order.id}
                          </Text>
                        </YStack>
                        {order.orderDocument && (
                          <Button
                            onPress={() => onShowPdf(order.orderDocument!)}
                            backgroundColor="#04BF7B"
                            size="$3"
                            paddingHorizontal={16}
                            paddingVertical={8}
                          >
                            <Text fontSize={12} color="white" fontWeight="600">
                              Ver recibo
                            </Text>
                          </Button>
                        )}
                      </XStack>
                    </YStack>
                    {index < supplier.sameDayOrders.length - 1 && (
                      <YStack height={1} backgroundColor="#E0E0E0" marginVertical={8} />
                    )}
                  </YStack>
                ))}
              </>
            }
          />
        </YStack>
      )}

      {/* Lista de produtos */}
      <YStack gap="$3">
        {supplier.discount.product.map((product) => (
          <ProductItemCard key={product.sku} product={product} />
        ))}
      </YStack>
    </YStack>
  );
}
