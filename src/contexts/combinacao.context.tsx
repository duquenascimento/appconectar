import { createContext, useContext, useMemo, useState, ReactNode, useEffect } from 'react'
import { TipoFornecedor, Combinacao, PreferenciaProduto } from '../types/combinationTypes'
import { addPreferencia as addPrefUtil, updatePreferencia as updatePrefUtil, removePreferencia as removePrefUtil } from '@/app/utils/preferenciaUtils'
import { getStorage, setStorage } from '@/app/utils/utils'

type CombinacaoContextType = {
  combinacao: Combinacao
  setCombinacao: (novaCombinacao: Combinacao) => void
  updateCampo: <K extends keyof Combinacao>(campo: K, valor: Combinacao[K]) => void
  resetCombinacao: () => void
  updateCombinacao: (update: Combinacao) => void
}

const combinacaoInicial: Combinacao = {
  restaurant_id: '',
  nome: '',
  dividir_em_maximo: 1,
  definir_preferencia_produto: false,
  bloquear_fornecedores: false,
  preferencia_fornecedor_tipo: TipoFornecedor.QUALQUER,
  fornecedores_bloqueados: [],
  fornecedores_especificos: [],
  preferencias: [],
  preferencias_hard: false
}

const CombinacaoContext = createContext({} as CombinacaoContextType)

export function CombinacaoProvider({ children }: { children: ReactNode }) {
  const [combinacao, setCombinacaoState] = useState<Combinacao>(combinacaoInicial)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const json = await getStorage('combinacao')
        if (json) {
          const dados: Combinacao = JSON.parse(json)
          setCombinacaoState(dados)
        }
      } catch (error) {
        console.warn('Falha ao carregar combinacao do Storage')
      }
    }
    carregarDados()
  }, [])

  useEffect(() => {
    if (combinacao.restaurant_id !== '') {
      setStorage('combinacao', JSON.stringify(combinacao)).catch((e) => {
        console.warn('Falha ao salvar combinacao no Storage')
      })
    }
  }, [combinacao])

  const addPreferencia = (preferencia: PreferenciaProduto) => {
    setCombinacaoState((prev) => addPrefUtil(prev, preferencia))
  }

  const updatePreferencia = (index: number, nova: PreferenciaProduto) => {
    setCombinacaoState((prev) => updatePrefUtil(prev, index, nova))
  }

  const removePreferencia = (index: number) => {
    setCombinacaoState((prev) => removePrefUtil(prev, index))
  }

  const setCombinacao = (novaCombinacao: Combinacao) => {
    setCombinacaoState(novaCombinacao)
  }

  const updateCampo = <K extends keyof Combinacao>(campo: K, valor: Combinacao[K]) => {
    setCombinacaoState((prev) => ({
      ...prev,
      [campo]: valor
    }))
  }

  const updateCombinacao = (update: Combinacao) => {
    setCombinacaoState(update)
  }

  const resetCombinacao = () => {
    setCombinacaoState(combinacaoInicial)
  }

  const value = useMemo(
    () => ({
      combinacao,
      setCombinacao,
      updateCampo,
      resetCombinacao,
      addPreferencia,
      updatePreferencia,
      removePreferencia,
      updateCombinacao
    }),
    [combinacao]
  )
  return <CombinacaoContext.Provider value={value}>{children}</CombinacaoContext.Provider>
}

export function useCombinacao() {
  const context = useContext(CombinacaoContext)
  if (!context) {
    throw new Error('useCombinacao deve ser usado dentro de um CombinacaoProvider')
  }
  return context
}
