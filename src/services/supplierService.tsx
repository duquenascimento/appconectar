import axios from 'axios'
const API_URL = process.env.EXPO_PUBLIC_API_DBCONECTAR_URL

export const getAllSuppliers = async () => {
  try {
    const response = await axios.get(`${API_URL}/system/fornecedores`)
    return response.data.data
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error)
    throw error
  }
}

export interface Supplier {
  id: string
  idExterno: string
  nomeFornecedor: string
  razaoSocial: string
  responsavel: string
  telefoneContato: string
  cnpj: string
  inscricaoEstadual: string
  email: string
  senha: string
  emailFinanceiro: string
  logradouro: string
  complemento: string
  telefoneResponsavelEntregas: string
  cep: string
  ativo: boolean
  nomeResponsavelEntregas: string
  emails: string | null
  numero: string
  bloqueio: boolean
  dataCadastro: string
  dataAlteracao: string
  responsavelCadastro: string
  responsavelAlteracao: string | null
  mondayHorario: string
  tuesdayHorario: string
  wednesdayHorario: string
  thursdayHorario: string
  fridayHorario: string
  saturdayHorario: string
  sundayHorario: string
  zonaSulMinimo: string
  centroMinimo: string
  zonaOesteBarraJacarepaguaMinimo: string
  zonaOesteMinimo: string
  zonaNorteGrandeMeierMinimo: string
  zonaNorteIlhaGovLeopoldinaMinimo: string
  zonaNorteMinimo: string
  niteroiMinimo: string
  zonaNorteGrandeTijucaMinimo: string
  urlRelatorio: string
  nota: string
}
