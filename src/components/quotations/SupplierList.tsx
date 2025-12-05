import { SupplierData } from '@/src/types/types';
import { YStack } from 'tamagui';
import { SupplierCard } from './SupplierCard';

interface SupplierListProps {
  suppliers: SupplierData[];
  deliveryDate: string;
  onShowPdf: (pdfUrl: string) => void;
}

export function SupplierList({ suppliers, deliveryDate, onShowPdf }: SupplierListProps) {
  return (
    <YStack gap="$3">
      {suppliers.map(({ supplier }) => (
        <SupplierCard key={supplier.externalId} supplier={supplier} deliveryDate={deliveryDate} onShowPdf={onShowPdf} />
      ))}
    </YStack>
  );
}
