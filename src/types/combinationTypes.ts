export enum AcaoNaFalha {
  IGNORAR = 'ignorar',
  INDISPONIVEL = 'indisponivel'
}

export enum TipoProduto {
  FIXAR = 'fixar',
  REMOVER = 'remover'
}

export enum TipoFornecedor {
  QUALQUER = 'qualquer',
  MELHOR_AVALIADO = 'melhor_avaliado',
  ESPECIFICO = 'especifico'
}

export interface ProdutoPreferencia {
  produto_sku?: string
  classe?: string
  fornecedores: string[]
  acao_na_falha: AcaoNaFalha
}

export interface PreferenciaProduto {
  ordem: number
  tipo: TipoProduto
  produtos: ProdutoPreferencia[]
}

export interface Combinacao {
  restaurant_id: string
  nome: string
  bloquear_fornecedores?: boolean
  dividir_em_maximo: number
  preferencia_fornecedor_tipo?: TipoFornecedor
  fornecedores_bloqueados?: string[]
  fornecedores_especificos?: string[]
  definir_preferencia_produto: boolean
  preferencias?: PreferenciaProduto[]
  preferencias_hard?: boolean
}
