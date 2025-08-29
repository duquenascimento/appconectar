import { getToken } from "./utils"

export async function saveProgressApi(step: number, values: any) {
   const token = await getToken()
  await fetch(`${process.env.EXPO_PUBLIC_API_URL}/register/save-progress`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ step, values }),
  })
}

export async function getProgressApi() {
  const token = await getToken()
  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/register/progress`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    console.log('Erro ao buscar progresso:', response)
    throw new Error('Erro ao buscar progresso')
  }
  if (response.status === 204) {
    return {
      statusCode: 204
    }
  }
  return await response.json()
}
