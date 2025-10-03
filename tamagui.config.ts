import { config, mediaQueryDefaultActive, selectionStyles } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'

// Objeto com as propriedades principais do objeto config
const tamaguiOptions = {
  animations: config.animations,
  themes: config.themes,
  tokens: config.tokens,
  fonts: config.fonts,
  media: config.media,
  shorthands: config.shorthands,
  selectionStyles,
  settings: {
    mediaQueryDefaultActive,
  },
  components: {
    ...((config as any).components || {}),
  }
}

const tamaguiConfig = createTamagui(tamaguiOptions)

export type Conf = typeof tamaguiConfig
declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}

export default tamaguiConfig