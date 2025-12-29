import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getAllProducts, getProductClasses } from '../services/productsService'
import { Product, ProductClass } from '../types/productTypes'

type ProductContextType = {
  productsContext: Product[]
  isLoading: boolean
  classe: ProductClass[]
}

const ProductContext = createContext<ProductContextType | null>(null)

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
  const [productsContext, setProductsContext] = useState<Product[]>([])
  const [classe, setClasse] = useState<ProductClass[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const classes = await getProductClasses();
        setClasse(classes);
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
        const products = await getAllProducts()
        setProductsContext(products)
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
