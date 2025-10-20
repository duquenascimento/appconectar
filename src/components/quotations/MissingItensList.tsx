import { YStack, Text } from 'tamagui';
import { ProductItemCard } from './ProductItemCard';
import { Product } from '@/src/types/types';
import { useProductContext } from '@/src/contexts/produtos.context';
import { useMemo } from 'react';

interface MissingProductsListProps {
  missingProducts: string[];
}

export function MissingItemsList({ missingProducts }: MissingProductsListProps) {
  const { productsContext } = useProductContext();

  const missingProductsData: any[] = useMemo(() => {
    return missingProducts.map((sku) => {
      const found = productsContext.find((p) => p.sku === sku);

      return (
        found ?? {
          name: `Produto ${sku}`,
          image: ['https://via.placeholder.com/60x60?text=?'],
          quant: 0,
          orderQuant: 0,
          obs: '',
          orderUnit: '',
          price: 0,
          priceWithoutTax: 0,
          priceUnique: 0,
          priceUniqueWithTaxAndDiscount: 0,
        }
      );
    });
  }, [missingProducts, productsContext]);

  if (!missingProducts.length) return null;

  return (
    <YStack
      backgroundColor="white"
      borderRadius="$4"
      padding="$3"
      gap="$3"
      borderColor="$gray6"
      borderWidth={1}
    >
      <Text fontSize={16} fontWeight="bold" color="black">
        Itens faltantes
      </Text>
      {missingProductsData.map((product) => (
        <ProductItemCard key={product.sku} product={product} missing={true} />
      ))}
    </YStack>
  );
}
