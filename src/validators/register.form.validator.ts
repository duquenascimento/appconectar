import * as Yup from 'yup'

// Helper para validação de telefone
const phoneRegExp = /^\(\d{2}\) \d{4,5}-\d{4}$/

export const step0Validation = Yup.object().shape({
  document: Yup.string()
    .required('CPF/CNPJ é obrigatório')
    .test('document-valid', 'Documento inválido', (value) => {
      const onlyNumbers = value?.replace(/\D/g, '') || '';
      // Validação do CPF (11 dígitos) ou CNPJ (14 dígitos)
      return onlyNumbers.length === 11 || onlyNumbers.length === 14;
    }),
  restaurantName: Yup.string().required('Nome do restaurante é obrigatório').min(3, 'Mínimo 3 caracteres')
})

export const step1Validation = Yup.object().shape({
  document: Yup.string().required('CPF/CNPJ é obrigatório'),
  
  stateNumberId: Yup.string().when(['noStateNumberId', 'document'], {
    is: (noStateNumberId: boolean, document: string) => {
      const isCnpj = document?.replace(/\D/g, '').length === 14;
      return !noStateNumberId && isCnpj;
    },
    then: (schema) => schema.required('Inscrição estadual é obrigatória').min(8, 'Inscrição inválida! Mínimo de 8 dígitos'),
    otherwise: (schema) => schema.notRequired()
  }),

  cityNumberId: Yup.string().when(['noStateNumberId', 'document'], {
    is: (noStateNumberId: boolean, document: string) => {
      const isCnpj = document?.replace(/\D/g, '').length === 14;
      return noStateNumberId && isCnpj;
    },
    then: (schema) => schema.required('Inscrição municipal é obrigatória').min(8, 'Inscrição inválida! Mínimo de 8 dígitos'),
    otherwise: (schema) => schema.notRequired()
  }),

  legalRestaurantName: Yup.string().when('document', {
    is: (document: string) => document?.replace(/\D/g, '').length === 14,
    then: (schema) => schema.required('Razão social é obrigatória'),
    otherwise: (schema) => schema.notRequired()
  }),

  zipcode: Yup.string()
    .required('CEP é obrigatório')
    .min(9, 'CEP inválido')
    .test('cep-valid', 'CEP inválido', async (value) => {
      if (!value || value.replace(/\D/g, '').length !== 8) return false
      try {
        const response = await fetch(`https://viacep.com.br/ws/${value.replace(/\D/g, '')}/json/`)
        const result = await response.json()
        return !result.erro
      } catch {
        return false
      }
    }),

  neigh: Yup.string()
  .required('Bairro é obrigatório.')
  .min(3, 'Informe um bairro válido (mín. 3 letras)'),

  localType: Yup.string().required('Tipo de local é obrigatório.'),
  street: Yup.string().required('Logradouro é obrigatório.'),

  localNumber: Yup.string().required('Número é obrigatório. Se não houver, digitar S/N'),
  complement: Yup.string()
})

export const step2Validation = Yup.object().shape({
  document: Yup.string(), // Reference to check if CPF or CNPJ
  
  email: Yup
    .string()
    .email('E-mail inválido')
    .matches(
      /\.(com|net|org|br|co|gov|io|dev)$/i, // Domínios válidos (case-insensitive)
      'O e-mail deve terminar com um domínio válido (ex: .com, .net, .org, .br)'
    )
    .required('E-mail é obrigatório'),

  alternativeEmail: Yup.string()
    .nullable()
    .email('E-mail alternativo inválido')
    .when('email', (email, schema) => {
      return !email ? schema.required('Pelo menos um e-mail é obrigatório') : schema
    }),

  paymentWay: Yup.string().required('Forma de pagamento é obrigatória'),

  emailBilling: Yup.string().when('document', {
    is: (document: string) => document?.replace(/\D/g, '').length === 14,
    then: (schema) => schema
      .email('E-mail de cobrança inválido')
      .matches(
        /\.(com|net|org|br|co|gov|io|dev)$/i,
        'O e-mail de cobrança deve terminar com um domínio válido (ex: .com, .net, .br)'
      )
      .required('E-mail de cobrança é obrigatório'),
    otherwise: (schema) => schema.notRequired()
  }),

  financeResponsibleName: Yup.string().when('document', {
    is: (document: string) => document?.replace(/\D/g, '').length === 14,
    then: (schema) => schema.min(2, 'Nome muito curto').required('Nome do responsável financeiro é obrigatório'),
    otherwise: (schema) => schema.notRequired()
  }),

  financeResponsiblePhoneNumber: Yup.string().when('document', {
    is: (document: string) => document?.replace(/\D/g, '').length === 14,
    then: (schema) => schema
      .matches(/\(\d{2}\)\s?\d{4,5}-\d{4}/, 'Telefone inválido')
      .required('Telefone do responsável é obrigatório'),
    otherwise: (schema) => schema.notRequired()
  })
})

export const step3Validation = Yup.object().shape({
  minHour: Yup.string().required('Horário inicial é obrigatório'),
  maxHour: Yup.string()
    .required('Horário final é obrigatório')
    .test('time-diff', 'Diferença mínima de 1h30', function (value) {
      const { minHour } = this.parent
      if (!minHour || !value) return true

      const [minH, minM] = minHour.split(':').map(Number)
      const [maxH, maxM] = value.split(':').map(Number)
      const diff = maxH * 60 + maxM - (minH * 60 + minM)

      return diff >= 90
    }),
  weeklyOrderAmount: Yup.string().required('Frequência de pedidos é obrigatória'),
  orderValue: Yup.string().required('Valor médio é obrigatório')
})
