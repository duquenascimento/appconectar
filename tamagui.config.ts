import { config } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'
import { themes, tokens } from '@tamagui/themes'

const tamaguiConfig = createTamagui({
  ...config,
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
})

export default tamaguiConfig
export type Conf = typeof tamaguiConfig
declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}
