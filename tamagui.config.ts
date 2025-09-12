import { config } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'
import { themes, tokens } from '@tamagui/themes'

const tamaguiConfig = createTamagui({
  themes,
  tokens,
  components: {
    Dialog: true,
    Portal: true, // 👈 Essencial para o modal funcionar!
    Sheet: true,
    Button: true,
    Text: true,
    Input: true,
    XStack: true,
    YStack: true,
    Image: true,
    View: true,
    Stack: true,
    Adapt: true,
  }
})

export default tamaguiConfig

export type Conf = typeof tamaguiConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}