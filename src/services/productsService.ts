import axios from 'axios'
const API_URL = process.env.EXPO_PUBLIC_API_URL

export const getAllProducts = async () => {
  try {
    const response = await axios.post(`${API_URL}/product/list`)
    return response.data.data
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error)
    throw error
  }
}

export interface ProductResponse {
  name: string
  orderUnit: string
  quotationUnit: string
  convertedWeight: number
  class: string
  sku: string
  image: string[]
  firstUnit: number
  secondUnit: number
  thirdUnit: number
  mediumWeight: number
  id: string
  active: boolean
  createdBy: string
  createdAt: string 
  changedBy: string
  updatedAt: string 
}
