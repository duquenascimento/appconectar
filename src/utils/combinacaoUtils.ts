import { Combinacao, Combination, CombinationMissingProducts } from "@/src/types/combinationTypes";
import { QuotationApiResponseData } from "../services/combinationsService";
import { SupplierData } from '../types/types';


export function transformCombinacaoForSave(data: any): Combinacao {
  return {
    ...data,
    preferencias: data.preferencias?.map((pref: any) => ({
      ...pref,
      fornecedores: pref.fornecedores || (pref.produtos || [])[0]?.fornecedor_id ? [(pref.produtos || [])[0].fornecedor_id] : [],
      produtos: pref.produtos.map((produto: any) => {
        const transformed = {
          ...produto,
          fornecedores: produto.fornecedor_id ? [produto.fornecedor_id] : [],
          acao_na_falha: produto.acao_na_falha || pref.acao_na_falha,
        }

        // Remover campos com valor null (mutuamente exclusivos)
        if (transformed.produto_sku === null) {
          delete transformed.produto_sku
        }
        if (transformed.classe === null) {
          delete transformed.classe
        }
        if (produto.fornecedor_id !== undefined) {
          delete transformed.fornecedor_id
        }

        return transformed
      }),
    })) || [],

    // Garantir arrays definidos
    fornecedores_bloqueados: data.fornecedores_bloqueados || [],
    fornecedores_especificos: data.fornecedores_especificos || [],

    // Valor padrão
    preferencias_hard: data.preferencias_hard ?? false,
  }
}

const getProductNameBySku = (sku: string, suppliers: SupplierData[]) => {
  for (const supplier of suppliers) {
    const product = supplier.supplier.discount.product.find((p) => p.sku === sku);
    if (product) {
      return product.name;
    }
  }

  return 'Produto desconhecido';
};

export function transformCombinationFromApi(data: QuotationApiResponseData[], totalItens: number, suppliers: SupplierData[]): Combination[] {
  const transformed: Combination[] = data.map((item) => {
    const suppliersNames =
      item.resultadoCotacao?.supplier?.map((c) => c.name.split('-')[0]).join(' + ') ||
      'N/A';
    const cartItens =
      item.resultadoCotacao?.supplier?.reduce((acc, cesta) => {
        return acc + (cesta.cart?.length || 0);
      }, 0) || 0;
    const missingItems = totalItens - cartItens;

    const missingProducts: CombinationMissingProducts[] =
      item.resultadoCotacao?.missingProducts?.map((sku) => ({
        code: sku,
        name: getProductNameBySku(sku, suppliers),
      })) ?? [];

    return {
      id: item.id,
      combination: item.nome,
      supplier: suppliersNames,
      totalValue: item.resultadoCotacao?.totalOrderValue,
      missingItems: missingItems < 0 ? 0 : missingItems,
      missingProducts: missingProducts,
      terminationCondition: item.resultadoCotacao.status === 'ok' ? undefined : item.resultadoCotacao?.terminationCondition,
      sameDayOrders: item.resultadoCotacao?.supplier?.flatMap((s) => s.sameDayOrders) || [],
    };
  });

  return transformed;
}
