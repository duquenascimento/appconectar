
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Product = {
  name: string
  orderUnit: string
  quotationUnit: string
  convertedWeight: number
  class: string
  sku: string
  id: string
  active: true
  createdBy: string
  createdAt: string
  changedBy: string
  updatedAt: string
  image: string[]
  favorite?: boolean
  mediumWeight: number
  firstUnit: number
  secondUnit: number
  thirdUnit: number
  obs: string
}

export type Classe = {
  id: string
  nome: string
  ativo: boolean
}

type ProductContextType = {
  productsContext: Product[]
  isLoading: boolean
  classe: Classe[]
}

const ProductContext = createContext<ProductContextType | null>(null)

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
  const [productsContext, setProductsContext] = useState<Product[]>([])
  const [classe, setClasse] = useState<Classe[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/classes-produto`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const classeResult = await result.json()
        setClasse(classeResult.data)
      } catch (err) {
        console.error('Erro ao buscar classes:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClass()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/product/list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: '{}'
        })
        const productsResult = await result.json()
        setProductsContext(productsResult.data)
      } catch (err) {
        console.error('Erro ao buscar produtos:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const value = useMemo(() => ({ productsContext, isLoading, classe }), [productsContext, isLoading, classe])

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export const useProductContext = (): ProductContextType => {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProductContext deve ser usado dentro de ProductProvider')
  }
  return context
}
