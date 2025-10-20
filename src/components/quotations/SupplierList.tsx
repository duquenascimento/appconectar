import { YStack } from 'tamagui';
import { SupplierCard } from './SupplierCard';
import { SupplierData } from '@/src/types/types';

interface SupplierListProps {
  suppliers: SupplierData[];
}

export function SupplierList({ suppliers }: SupplierListProps) {
  return (
    <YStack gap="$3">
      {suppliers.map(({ supplier }) => (
        <SupplierCard key={supplier.externalId} supplier={supplier} />
      ))}
    </YStack>
  );
}
