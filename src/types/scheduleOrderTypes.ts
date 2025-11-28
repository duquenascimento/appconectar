export type ScheduleOrderCreationBody = {
  deliveryDate: string;
  restaurantId: string;
  combinationId?: string;
  supplierId?: string;
  products: {
    productId: string;
    quantity: number;
    obs?: string;
  }[];
};

export type ScheduleOrderConfirmationBody = {
  paymentWay?: string;
};

export type ScheduleOrderResponse = {
  id: string;
  deliveryDate: string;
  combination?: {
    id: string;
    nome: string;
    dividir_em_maximo: number;
  };
  supplier?: {
    id: string;
    name: string;
    externalId: string;
  };
  restaurantId: string;
  status: string;
  createdAt: string;
  products: {
    id: string;
    productId: string;
    productName: string;
    productSku: string;
    unit: string;
    quantity: number;
    obs?: string | null;
  }[];
};

export function isScheduleOrderResponse(obj: any): obj is ScheduleOrderResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof obj.id === 'string' &&
    'deliveryDate' in obj &&
    typeof obj.deliveryDate === 'string' &&
    'restaurantId' in obj &&
    typeof obj.restaurantId === 'string' &&
    'status' in obj &&
    typeof obj.status === 'string' &&
    'createdAt' in obj &&
    typeof obj.createdAt === 'string' &&
    'products' in obj &&
    Array.isArray(obj.products)
  );
}
