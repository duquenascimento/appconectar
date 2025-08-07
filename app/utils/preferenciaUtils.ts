import { Combinacao, PreferenciaProduto } from '@/src/types/combinationTypes'

export const addPreferencia = (combinacao: Combinacao, nova: PreferenciaProduto): Combinacao => {
  return {
    ...combinacao,
    preferencias: [...(combinacao.preferencias || []), nova]
  }
}

export const updatePreferencia = (combinacao: Combinacao, index: number, atualizada: PreferenciaProduto): Combinacao => {
  const prefs = [...(combinacao.preferencias || [])]
  prefs[index] = atualizada

  return {
    ...combinacao,
    preferencias: prefs
  }
}

export const removePreferencia = (combinacao: Combinacao, index: number): Combinacao => {
  const prefs = [...(combinacao.preferencias || [])]
  prefs.splice(index, 1)

  return {
    ...combinacao,
    preferencias: prefs
  }
}
