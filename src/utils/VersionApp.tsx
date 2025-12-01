import { Platform } from 'react-native'
import { Text, View } from 'tamagui'
import { getStorage } from './utils'

export function VersionInfo () {
  return (
    <View position="absolute" bottom={2} right={10}>
      <Text fontSize={10} color="gray">
        v{process.env.EXPO_PUBLIC_VERSION}
      </Text>
    </View>
  )
}

export const SaveUserAppInfo = async () => {
  try {
    const appVersionExpo = process.env.EXPO_PUBLIC_VERSION
    const appOS = Platform.OS
    const data = await getStorage('selectedRestaurant')
    const restaurant = data ? JSON.parse(data) : null
    const externalId = restaurant?.restaurant?.externalId ?? null
    const statusId = restaurant?.restaurant?.registrationReleasedNewApp ? 8 : 4

    const userAppData = {
      externalId,
      appVersionExpo,
      appOS,
      statusId
    }
    await fetch(`${process.env.EXPO_PUBLIC_API_URL}/version/app`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        externalId: userAppData.externalId,
        version: userAppData.appVersionExpo,
        OperationalSystem: userAppData.appOS,
        statusId: userAppData.statusId
      })
    })
  } catch (error) {
    console.error('Erro ao salvar dados do app:', error)
  }
}

export const checkVersion = async ():Promise<any> => {
  try {
    const data = await getStorage('selectedRestaurant')
    const restaurant = data ? JSON.parse(data) : null
    const externalId = restaurant?.restaurant?.externalId ?? null

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/version/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        externalId: externalId
      })
    })
    if (!response.ok) {
      console.error('Versão do usuário não encontrada:', response)
    }
    const json = await response.json()
    return json
  } catch (error) {
    console.error('Erro ao checar versão do app:', error)
  }
}


