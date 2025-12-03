export enum AcaoNaFalha {
  IGNORAR = 'ignorar',
  INDISPONIVEL = 'indisponivel',
}

export enum TipoProduto {
  FIXAR = 'fixar',
  REMOVER = 'remover',
}

export enum TipoFornecedor {
  QUALQUER = 'qualquer',
  ESPECIFICO = 'especifico',
}

export interface ProdutoPreferencia {
  produto_sku?: string;
  classe?: string;
  acao_na_falha: AcaoNaFalha;
  // TODO:  this should be removed and used only in the PreferenciaProduto
  //        as the list of fornecedores isn't per product preference
  fornecedores: string[];
}

export interface PreferenciaProduto {
  ordem: number;
  tipo: TipoProduto;
  produtos: ProdutoPreferencia[];
  fornecedores: string[];
}

export interface Combinacao {
  restaurant_id: string;
  nome: string;
  bloquear_fornecedores?: boolean;
  dividir_em_maximo: number;
  preferencia_fornecedor_tipo?: TipoFornecedor;
  fornecedores_bloqueados?: string[];
  fornecedores_especificos?: string[];
  definir_preferencia_produto: boolean;
  preferencias?: PreferenciaProduto[];
  preferencias_hard?: boolean;
}
export interface Combination {
  id: string;
  combination: string;
  supplier?: string;
  delivery?: string;
  createdAt?: string;
  missingItems?: number;
  totalValue?: number;
}
