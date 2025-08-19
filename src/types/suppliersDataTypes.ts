interface SelectedProductInCart {
  productId: string;
  amount: number;
  value: number;
  valueWithoutFee: number;
  unitValue: number;
  unitValueWithoutFee: number;
}

export interface ChosenSupplierQuote {
  id: string;
  nome: string;
  resultadoCotacao: {
    totalOrderValue: number;
    supplier: {
      id: string;
      orderValue: number;
      orderValueWithoutFee: number;
      feeUsed: number;
      discountUsed: number;
      cart: SelectedProductInCart[];
      name: string;
    }[];
    status: string;
    terminationCondition: string;
  };
}

interface SupplierProduct {
  price: number;
  priceWithoutTax: number;
  name: string;
  sku: string;
  image: string[];
  quant: number;
  orderQuant: number;
  quotationUnit?: string;
  obs: string;
  priceUnique: number;
  orderUnit: string;
  priceUniqueWithTaxAndDiscount: number;
}

export interface AvailableSupplier {
  supplier: {
    name: string;
    externalId: string;
    missingItens: number;
    minimumOrder: number;
    star: string;
    hour: string;
    discount: {
      orderValue: number;
      discount: number;
      orderWithoutTax: number;
      orderWithTax: number;
      tax: number;
      missingItens: number;
      orderValueFinish: number;
      product: SupplierProduct[];
    };
  };
}

export interface FinalProductItem {
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
}

export interface OutputSupplier {
  supplier: {
    name: string;
    externalId: string;
    image?: string;
    missingItens: number;
    minimumOrder: number;
    hour: string;
    star: string;
    discount: {
      orderValue: number;
      discount: number;
      orderWithoutTax: number;
      orderWithTax: number;
      tax: number;
      missingItens: number;
      orderValueFinish: number;
      product: FinalProductItem[];
      sku: string;
    };
  };
}
