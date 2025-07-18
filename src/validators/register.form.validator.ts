import * as Yup from 'yup'

// Helper para validação de telefone
const phoneRegExp = /^\(\d{2}\) \d{4,5}-\d{4}$/

export const step0Validation = Yup.object().shape({
  cnpj: Yup.string()
    .required('CNPJ é obrigatório')
    .min(18, 'CNPJ inválido')
    .test('cnpj-valid', 'CNPJ inválido', (value) => {
      // Você pode adicionar lógica de validação real do CNPJ aqui
      return value?.replace(/\D/g, '').length === 14
    }),
  restaurantName: Yup.string().required('Nome do restaurante é obrigatório').min(3, 'Mínimo 3 caracteres')
})

export const step1Validation = Yup.object().shape({
  stateNumberId: Yup.string().when('noStateNumberId', {
    is: false,
    then: (schema) => schema.required('Inscrição estadual é obrigatória').min(8, 'Inscrição inválida! Mínimo de 8 dígitos')
  }),

  cityNumberId: Yup.string().when('noStateNumberId', {
    is: true,
    then: (schema) => schema.required('Inscrição municipal é obrigatória').min(8, 'Inscrição inválida! Mínimo de 8 dígitos')
  }),

  legalRestaurantName: Yup.string().required('Razão social é obrigatória'),

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

  street: Yup.string().required('Logradouro é obrigatório.'),

  localNumber: Yup.string().required('Número é obrigatório. Se não houver, digitar S/N'),
  complement: Yup.string()
})

export const step2Validation = Yup.object().shape({
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

    emailBilling: Yup
    .string()
    .email('E-mail de cobrança inválido')
    .matches(
      /\.(com|net|org|br|co|gov|io|dev)$/i,
      'O e-mail de cobrança deve terminar com um domínio válido (ex: .com, .net, .br)'
    )
    .required('E-mail de cobrança é obrigatório'),

  financeResponsibleName: Yup.string().min(2, 'Nome muito curto').required('Nome do responsável financeiro é obrigatório'),

  financeResponsiblePhoneNumber: Yup.string()
    .matches(/\(\d{2}\)\s?\d{4,5}-\d{4}/, 'Telefone inválido')
    .required('Telefone do responsável é obrigatório')
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
