export const processOrderResponse = (suppliers: any, ordersGenerated: any) => {
    const orderIdMap = new Map(
      ordersGenerated.map((item: { externalId: string; orderId: string }) => [item.externalId, item.orderId])
    );
  
    const supplierWithOrderId = suppliers.map((s: { supplier: { externalId: string; }; }) => ({
      ...s,
      supplier: {
        ...s.supplier,
        orderId: orderIdMap.get(s.supplier.externalId) || null,
      },
    }));
  
    return supplierWithOrderId;
  };