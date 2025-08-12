export function transformCombinacaoForSave(data: any) {
  return {
    ...data,

    // Transformar preferencias
    preferencias: data.preferencias?.map((pref: any) => ({
      ...pref,
      produtos: pref.produtos.map((produto: any) => ({
        ...produto,
        fornecedores: produto.fornecedor_id ? [produto.fornecedor_id] : [],
        acao_na_falha: produto.acao_na_falha || pref.acao_na_falha,
        // Remover o campo antigo
        fornecedor_id: undefined
      }))
    })),

    preferencias_hard: data.preferencias_hard ?? false
  }
}
