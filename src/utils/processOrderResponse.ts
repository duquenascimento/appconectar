import { SupplierData } from '../types/types';

export function processOrderResponse(
  suppliers: SupplierData[],
  ordersGenerated: { externalId: string; orderId: string }[],
): SupplierData[] {
  const orderIdMap = new Map(
    ordersGenerated.map((item: { externalId: string; orderId: string }) => [
      item.externalId,
      item.orderId,
    ]),
  );

  const supplierWithOrderId: SupplierData[] = suppliers.map(
    (s) => ({
      supplier: {
        ...s.supplier,
        orderId: orderIdMap.get(s.supplier.externalId) || null,
      },
    }),
  );

  return supplierWithOrderId;
}
