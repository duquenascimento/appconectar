export interface Product {
  price: number;
  priceWithoutTax: number;
  name: string;
  sku: string;
  quant: number;
  orderQuant: number;
  obs: string;
  priceUnique: number;
  priceUniqueWithTaxAndDiscount: number;
  image: string[];
  orderUnit: string;
  quotationUnit: string;
}

export interface Discount {
  orderValue: number;
  discount: number;
  orderWithoutTax: number;
  orderWithTax: number;
  tax: number;
  missingItens: number;
  orderValueFinish: number;
  product: Product[];
  sku: string;
}

export interface SameDayOrder {
  id: string;
  deliveryDate: Date;
  orderDocument: string | null;
}

export interface Supplier {
  name: string;
  externalId: string;
  image: string;
  missingItens: number;
  minimumOrder: number;
  hour: string;
  discount: Discount;
  star: string;
  orderId?: string;
  sameDayOrders: SameDayOrder[];
}

export interface SupplierData {
  supplier: Supplier;
}

export interface SuppliersQuotationDTO {
  availableSuppliers: SupplierData[];
  unavailableSuppliers: SupplierData[];
}

export interface GetSuppliersQuotationResponseDTO {
  success: boolean;
  statusCode: number;
  data: SuppliersQuotationDTO;
}
