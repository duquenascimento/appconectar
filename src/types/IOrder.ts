export interface OrderData {
  addressId: string;
  calcOrderAgain: {
    data: {
      supplier: Supplier;
    }[];
  };
  deliveryDate: string;
  detailing: string[];
  finalDeliveryTime: string;
  id: string;
  initialDeliveryTime: string;
  orderDate: string;
  orderDocument: string;
  orderHour: string;
  paymentWay: string;
  referencePoint: string;
  restaurantId: string;
  status_id: number;
  supplierId: string;
  tax: string;
  totalConectar: string;
  totalSupplier: string;
}

interface Supplier {
  discount: number;
  missingItens: number;
  orderValue: number;
  orderValueFinish: number;
  orderWithTax: number;
  orderWithoutTax: number;
  product: Product[];
  tax: number;
  externalId: string;
  hour: string;
  minimumOrder: number;
  name: string;
  star: string;
}

interface Product {
  image: string[];
  name: string;
  obs: string;
  orderQuant: number;
  orderUnit: string;
  price: number;
  priceUnique: number;
  priceUniqueWithTaxAndDiscount: number;
  priceWithoutTax: number;
  quant: number;
  quotationUnit: string;
  sku: string;
}
