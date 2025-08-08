import * as Yup from 'yup'

const acaoNaFalhaEnum = ['ignorar', 'indisponivel'] as const
const tipoProdutoEnum = ['fixar', 'remover'] as const
const tipoFornecedorEnum = ['qualquer', 'melhor_avaliado', 'especifico'] as const

const produtoPreferenciaSchema = Yup.object({
  produto_sku: Yup.string().optional(),
  classe: Yup.string().optional(),
  fornecedores: Yup.array(Yup.string().uuid()).min(1, 'Informe ao menos um fornecedor'),
  acao_na_falha: Yup.string().oneOf(acaoNaFalhaEnum)
})

export const preferenciaProdutoSchema = Yup.object({
  ordem: Yup.number().integer().min(1),
  tipo: Yup.string().oneOf(tipoProdutoEnum),
  produtos: Yup.array(produtoPreferenciaSchema).min(1, 'Adicione ao menos um produto')
})

export const combinacaoValidationSchema = Yup.object({
  restaurant_id: Yup.string().uuid().required('Obrigatório'),
  nome: Yup.string().required('Informe um nome'),
  bloquear_fornecedores: Yup.boolean().required(),
  dividir_em_maximo: Yup.number().integer().min(1).required(),
  preferencia_fornecedor_tipo: Yup.string().oneOf(tipoFornecedorEnum).required(),
  definir_preferencia_produto: Yup.boolean().required(),
  preferencias_hard: Yup.boolean(),

  fornecedores_bloqueados: Yup.array(Yup.string()).when('bloquear_fornecedores', {
    is: true,
    then: (schema) => schema.min(1, 'Ou defina fornecedores bloqueados ou desmarque essa opção'),
    otherwise: (schema) => schema.max(0, 'Remova os fornecedores bloqueados se não for usar a opção')
  }),

  fornecedores_especificos: Yup.array(Yup.string()).when('preferencia_fornecedor_tipo', {
    is: 'especifico',
    then: (schema) => schema.min(1, 'Informe ao menos um fornecedor específico ou selecione outra opção'),
    otherwise: (schema) => schema.max(0, 'Remova os fornecedores específicos ao alterar o tipo')
  }),

  preferencias: Yup.array(preferenciaProdutoSchema).when(['definir_preferencia_produto', 'fornecedores_especificos'], {
    is: (definir: boolean, fornecedores: string[]) => definir && fornecedores.length > 0,
    then: (schema) => schema.min(1, 'Adicione ao menos uma preferência de produto'),
    otherwise: (schema) => schema.max(0, 'Remova as preferências se não estiver definindo ou não houver fornecedores')
  })
})
