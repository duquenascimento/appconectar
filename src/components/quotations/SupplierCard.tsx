import { Platform } from 'react-native';
import { YStack, XStack, Text, Image } from 'tamagui';
import Icons from '@expo/vector-icons/Ionicons';
import { ProductItemCard } from './ProductItemCard';
import { formatCurrency } from '@/src/utils/formatCurrency';
import { Supplier } from '@/src/types/types';

interface SupplierCardProps {
  supplier: Supplier;
}

export function SupplierCard({ supplier }: SupplierCardProps) {
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
          <Text fontSize={16} fontWeight="bold">
            {supplier.name.replace('Distribuidora', '').trim()}
          </Text>
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

      {/* Lista de produtos */}
      <YStack gap="$3">
        {supplier.discount.product.map((product) => (
          <ProductItemCard key={product.sku} product={product} />
        ))}
      </YStack>
    </YStack>
  );
}
