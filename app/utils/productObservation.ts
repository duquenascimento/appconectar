import { getStorage, setStorage } from "./utils"

export const saveProductObservations = async (map: Map<string, string>): Promise<void> => {
  try {
    const serialized = JSON.stringify(Array.from(map.entries()))
    await setStorage('productObservations', serialized)
  } catch (error) {
    console.error('Erro ao salvar observações:', error)
  }
}

export const loadProductObservations = async (): Promise<Map<string, string>> => {
  try {
    const obsString = await getStorage('productObservations')
    if (!obsString) return new Map()
    return new Map(JSON.parse(obsString))
  } catch (error) {
    console.error('Erro ao carregar observações:', error)
    return new Map()
  }
}