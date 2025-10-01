import { Platform } from 'react-native'
import { config } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'
import { themes, tokens } from '@tamagui/themes'

const tamaguiOptions =
  Platform.OS === 'ios'
    ? {
        themes,
        tokens,
        components: {
          Portal: true,
          ...((config as any).components || {}),
          Dialog: true,
          Sheet: true,
          Button: false,
          Text: false,
          Input: true,
          XStack: true,
          YStack: true,
          Image: false,
          View: false,
          Stack: false,
          Adapt: true
        }
      }
    : {
        ...config,
        components: {
          Portal: true,
          ...((config as any).components || {})
          /*
          Dialog: true,
          Sheet: true,
          Button: false,
          Text: false,
          Input: true,
          XStack: true,
          YStack: true,
          Image: false,
          View: false,
          Stack: false,
          Adapt: true,
          */
        }
      }

const tamaguiConfig = createTamagui(tamaguiOptions)

export default tamaguiConfig
export type Conf = typeof tamaguiConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}
