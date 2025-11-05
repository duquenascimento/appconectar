import { Combinacao, PreferenciaProduto } from '@/src/types/combinationTypes'

export function addPreferencia (combinacao: Combinacao, nova: PreferenciaProduto): Combinacao  {
  return {
    ...combinacao,
    preferencias: [...(combinacao.preferencias || []), nova]
  }
}

export function  updatePreferencia  (combinacao: Combinacao, index: number, atualizada: PreferenciaProduto): Combinacao  {
  const prefs = [...(combinacao.preferencias || [])]
  prefs[index] = atualizada

  return {
    ...combinacao,
    preferencias: prefs
  }
}

export function  removePreferencia (combinacao: Combinacao, index: number): Combinacao {
  const prefs = [...(combinacao.preferencias || [])]
  prefs.splice(index, 1)

  return {
    ...combinacao,
    preferencias: prefs
  }
}

export function  resetarPreferencias (combinacao: Combinacao): Combinacao {
  return {
    ...combinacao,
    definir_preferencia_produto: false,
    preferencias: []
  }
}

