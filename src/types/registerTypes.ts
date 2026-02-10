export interface RestaurantFullRegisterData {
  token: string
  document: string
  stateNumberId?: string
  cityNumberId?: string
  restaurantName: string
  legalRestaurantName?: string
  zipcode: string
  neigh: string
  street: string
  localNumber: string
  complement?: string
  phone?: string
  alternativePhone?: string
  email: string
  alternativeEmail?: string
  step?: number
  loading?: boolean
  noStateNumberId: boolean
  minHour: string
  maxHour: string
  closeDoor: boolean
  deliveryObs: string
  responsibleReceivingName?: string
  responsibleReceivingPhoneNumber?: string
  weeklyOrderAmount: string
  orderValue: string
  paymentWay: string
  localType: string
  city: string
  inviteCode?: string
  emailBilling?: string
  financeResponsibleName?: string
  financeResponsiblePhoneNumber?: string
}

export type RestaurantRegisterPayload = Omit<RestaurantFullRegisterData, 'token' | 'step' | 'loading' | 'noStateNumberId'>

export interface CheckDocumentData {
  document: string
}

export interface CheckDocumentResult {
  status: number
  data: DocumentDataResponse
}

export interface QsaSocio {
  pais: string | null
  nome_socio: string
  codigo_pais: number | null
  faixa_etaria: string
  cnpj_cpf_do_socio: string
  qualificacao_socio: string
  codigo_faixa_etaria: number | null
  data_entrada_sociedade: string
  identificador_de_socio: number | null
  cpf_representante_legal: string
  nome_representante_legal: string
  codigo_qualificacao_socio: number | null
  qualificacao_representante_legal: string
  codigo_qualificacao_representante_legal: number
}

export interface InscricaoEstadual {
  inscricao_estadual: string
  ativo: boolean
  estado: string
}

export interface CnpjDataResponse {
  cnpj: string
  razao_social: string
  nome_fantasia: string
  capital_social: number
  data_inicio_atividade: string | null
  email: string | null
  cep: string
  logradouro: string
  numero: string | null
  complemento: string | null
  bairro: string
  municipio: string
  uf: string
  ddd_telefone_1: string | null
  ddd_telefone_2: string | null
  ddd_fax: string | null
  cnae_fiscal: number
  cnae_fiscal_descricao: string
  natureza_juridica: string
  porte: string
  qsa: QsaSocio[]
  situacao_cadastral: number
  descricao_situacao_cadastral: string
  opcao_pelo_simples: boolean | null
  data_opcao_pelo_simples: string | null
  data_exclusao_do_simples: string | null
  inscricao_estadual: string | null
  inscricao_municipal: string | null
  inscricoes_estaduais: InscricaoEstadual[]
}

export interface CpfDataResponse {
  document: string
}

export type DocumentDataResponse = CnpjDataResponse | CpfDataResponse