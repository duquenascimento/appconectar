import axios from 'axios'
import { Product, ProductClass } from '../types/productTypes'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export const getProductClasses = async (): Promise<ProductClass[]> => {
  try {
    const response = await axios.get(
      `${API_URL}/classes-produto`,
      { headers: { 'Content-Type': 'application/json' } }
    )
    return response.data.data
  } catch (error) {
    console.error('Erro ao buscar classes de produtos:', error)
    throw error
  }
}

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const response = await axios.post(
      `${API_URL}/product/list`,
      {},
      { headers: { 'Content-Type': 'application/json' } }
    )
    return response.data.data
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error)
    throw error
  }
}
