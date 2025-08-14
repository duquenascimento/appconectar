import * as Yup from 'yup'

const acaoNaFalhaEnum = ['ignorar', 'indisponivel'] as const
const tipoProdutoEnum = ['fixar', 'remover'] as const
const tipoFornecedorEnum = ['qualquer', 'especifico'] as const

const produtoPreferenciaSchema = Yup.object({
  produto_sku: Yup.string().optional(),
  classe: Yup.string().optional(),
  fornecedores: Yup.array(Yup.string()).min(1, 'Informe ao menos um fornecedor.'),
  acao_na_falha: Yup.string().oneOf(acaoNaFalhaEnum)
})


export const preferenciaProdutoSchema = Yup.object({
  ordem: Yup.number().integer().min(1),
  tipo: Yup.string().oneOf(tipoProdutoEnum),
  produtos: Yup.array(produtoPreferenciaSchema).min(1, 'Adicione ao menos um produto')
})

export const combinacaoValidationSchema = Yup.object({
  restaurant_id: Yup.string().uuid().required('O ID do restaurante é obrigatório.'),
  nome: Yup.string().required('O nome da combinação é obrigatório.'),
  bloquear_fornecedores: Yup.boolean().required(),
  dividir_em_maximo: Yup.number().integer().min(2, 'Selecione o máximo de fornecedores.').required(),
  preferencia_fornecedor_tipo: Yup.string().oneOf(tipoFornecedorEnum).required(),
  definir_preferencia_produto: Yup.boolean().required(),
  preferencias_hard: Yup.boolean(),

  fornecedores_bloqueados: Yup.array(Yup.string()).when('bloquear_fornecedores', {
    is: true,
    then: (schema) => schema.min(1, 'Defina fornecedores bloqueados ou desmarque essa opção.'),
    otherwise: (schema) => schema.max(0, 'Remova os fornecedores bloqueados se não for usar a opção.')
  }),

  fornecedores_especificos: Yup.array(Yup.string()).test(
    'min-fornecedores-especificos',
    (value, context) => {
        const { preferencia_fornecedor_tipo, dividir_em_maximo } = context.parent;
        
        if (preferencia_fornecedor_tipo === 'especifico') {
            const minSuppliers = dividir_em_maximo;
            
            if (!value || value.length < minSuppliers) {
                return context.createError({ message: `Selecione pelo menos ${minSuppliers} fornecedor(es) específico(s).` });
            }
        }
        
        return true;
    }
  ),

  preferencias: Yup.array(preferenciaProdutoSchema).when(['definir_preferencia_produto', 'fornecedores_especificos'], {
    is: (definir: boolean, fornecedores: string[]) => definir && fornecedores.length > 0,
    then: (schema) => schema.min(1, 'Adicione ao menos uma preferência de produto.'),
    otherwise: (schema) => schema.max(0, 'Remova as preferências se não estiver definindo ou não houver fornecedores.')
  })
})