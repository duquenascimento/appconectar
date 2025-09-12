import { config } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'
import { themes, tokens } from '@tamagui/themes'

const tamaguiConfig = createTamagui({
  //themes,
  //tokens,
  ...config,
  components: {
    Portal: true, // 👈 Essencial para o modal funcionar!
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
    Adapt: true
    */
  }
})

export default tamaguiConfig

export type Conf = typeof tamaguiConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}
