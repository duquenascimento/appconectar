import { animations, config, fonts, media, mediaQueryDefaultActive, selectionStyles, shorthands, themes, tokens } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'

// Objeto com as propriedades principais do objeto config e as alterações em components
const tamaguiOptions = {
  animations,
  themes,
  media,
  shorthands,
  tokens,
  fonts,
  selectionStyles,
  settings: {
    mediaQueryDefaultActive,
  },
  components: {
    ...((config as any).components || {}),
    Portal: true,
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

const tamaguiConfig = createTamagui(tamaguiOptions)

export type Conf = typeof tamaguiConfig
declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}

export default tamaguiConfig