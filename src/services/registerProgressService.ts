import { saveProgressApi, getProgressApi } from '@/app/utils/register.api'
import { getToken, setStorage } from '@/app/utils/utils'
import { jwtDecode } from 'jwt-decode'

type DecodedToken = { id: string }

function getUserPrefix(token: string): string {
  const decoded = jwtDecode<DecodedToken>(token)
  if (!decoded?.id) throw new Error('Token inválido')
  return decoded.id
}

export async function saveStepData(values: any, currentStep: number) {
  try {
    const token = await getToken()
    if (!token) throw new Error('Token não encontrado')

    const prefix = getUserPrefix(token)

    const dataToStore: { [key: string]: string } = {}
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        dataToStore[`${key}_${prefix}`] = String(value)
      }
    })
    dataToStore[`step_${prefix}`] = String(currentStep)

    const storagePromises = Object.entries(dataToStore).map(([key, value]) => setStorage(key, value))
    await Promise.all(storagePromises)

    // salva no backend também
    await saveProgressApi(currentStep, values)
  } catch (error) {
    console.error('Erro ao salvar dados no storage/backend:', error)
  }
}

export async function loadProgress() {
  const token = await getToken()
  if (!token) throw new Error('Token não encontrado')

  try {
    const data = await getProgressApi()
    if (data.progress) {
      await saveStepData(data.progress.values, data.progress.step)
      return data.progress
    }
  } catch {
    throw new Error('Erro ao buscar progresso do servidor')
  }
}
