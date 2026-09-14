import { OrderByDirection } from './SharedTypes';
import { SameDayOrder } from './types';

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
  quotationUnit: string;
  obs: string;
  priceUnique: number;
  orderUnit: string;
  priceUniqueWithTaxAndDiscount: number;
  scheduled: boolean;
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
    sameDayOrders: SameDayOrder[];
    openingTime?: string;
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
  quotationUnit: string;
  scheduled: boolean;
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
    sameDayOrders: SameDayOrder[];
    openingTime?: string;
  };
}

export interface CombinationSupplier {
  id: string;
  idexterno: string;
  nomefornecedor: string;
  nota: string;
  horarioabertura: string | undefined;
}

export type FornecedorOrderBy = 'nomefornecedor' | 'nota' | 'idexterno';

export interface SuppliersRouteFilterParams {
  neighborhood: string;
  blockedBySuppliers: string[];
}

export interface GetAllSuppliersParams {
  orderBy?: FornecedorOrderBy;
  order?: OrderByDirection;
  routeFilters?: SuppliersRouteFilterParams;
}

export interface SupplierApiDb {
  id: string;
  idexterno: string;
  nomefornecedor: string;
  razaosocial: string;
  responsavel: string;
  telefonecontato: string;
  cnpj: string;
  inscricaoestadual?: string | null;
  email: string;
  ativo: boolean;
  nomeresponsavelentregas: string;
  bloqueio: boolean;
  datacadastro: string;
  dataalteracao: string;
  responsavelalteracao?: string | null;
  urlrelatorio: string;
  nota: string;
}
