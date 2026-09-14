import { Platform } from 'react-native';
import { YStack, XStack, Text, Image } from 'tamagui';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatUnit } from '../../utils/formatUnit';
import { Product } from '../../types/types';
import BadgeText from '../text/BadgeText';

interface ProductItemCardProps {
  product: Product;
  // eslint-disable-next-line react/require-default-props
  missing?: boolean;
}

export function ProductItemCard({ product, missing = false }: ProductItemCardProps) {
  return (
    <XStack alignItems="center" gap="$3">
      <Image
        source={{ uri: product.image[0] }}
        width={Platform.OS === 'web' ? 40 : undefined}
        height={40}
        resizeMode="cover"
        borderRadius={5}
        opacity={missing ? 0.5 : 1}
      />
      <YStack flex={1} opacity={missing ? 0.5 : 1}>
        <Text fontSize={14} color="$gray12">
          {product.name}
        </Text>
        {product.obs ? (
          <Text fontSize={10} color="$gray10">
            Obs: {product.obs}
          </Text>
        ) : null}
        {product.scheduled && (
          <BadgeText fontSize={10} text="Entrega em até 48h" color="#3B82F6" marginTop={4} />
        )}
      </YStack>

      <YStack alignItems="flex-end">
        {product.price ? (
          <>
            <Text fontWeight="bold" fontSize={14} color="$gray12">
              {formatCurrency(product.price)}
            </Text>
            <Text fontSize={12} color="$gray10">
              {`${product.quant} ${formatUnit(product.orderUnit)} | ${formatCurrency(
                product.priceUniqueWithTaxAndDiscount,
              )}/${formatUnit(product.orderUnit)}`}
            </Text>
          </>
        ) : (
          <Text fontWeight="bold" fontSize={14} color="$red10">
            Indisponível
          </Text>
        )}
      </YStack>
    </XStack>
  );
}
