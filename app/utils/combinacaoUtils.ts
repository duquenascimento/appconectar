import { Combinacao } from "@/src/types/combinationTypes" 

export function transformCombinacaoForSave(data: any): Combinacao {
  return {
    ...data,
    preferencias: data.preferencias?.map((pref: any) => ({
      ...pref,
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