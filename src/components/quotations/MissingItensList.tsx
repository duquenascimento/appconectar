import { useProductContext } from '@/src/contexts/produtos.context';
import { Product } from '@/src/types/types';
import { useMemo } from 'react';
import { Text, YStack } from 'tamagui';
import { CombinationMissingProducts } from '../combinationList';
import { ProductItemCard } from './ProductItemCard';

interface MissingProductsListProps {
  missingProducts: CombinationMissingProducts[];
}

export function MissingItemsList({ missingProducts }: MissingProductsListProps) {
  const { productsContext } = useProductContext();

  const missingProductsData: Product[] = useMemo(() => {
    return missingProducts.map((mp) => {
      const found = productsContext.find((p) => p.sku === mp.code);

      return (found ?? {
        name: `Produto ${mp.name}`,
        image: ['https://via.placeholder.com/60x60?text=?'],
        quant: 0,
        orderQuant: 0,
        obs: '',
        orderUnit: '',
        price: 0,
        priceWithoutTax: 0,
        priceUnique: 0,
        priceUniqueWithTaxAndDiscount: 0,
      }) as Product;
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
        <ProductItemCard key={product.sku} product={product} missing />
      ))}
    </YStack>
  );
}
