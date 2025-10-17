import { 
  config, 
  animations, 
  fonts, 
  themes, 
  tokens, 
  mediaQueryDefaultActive, 
  selectionStyles, 
} from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'

// Objeto com as propriedades principais do objeto config e as alterações em components
const tamaguiOptions = {
  animations,
  themes,
  tokens,
  fonts,
  selectionStyles,
  components: {
    ...((config as any).components || {})
  }, 
  settings: {
    mediaQueryDefaultActive,
    defaultFont: '$body',
    fastSchemeChange: true,
    shouldAddPrefersColorThemes: true,
    themeClassNameOnRoot: true,
  }
}

const tamaguiConfig = createTamagui(tamaguiOptions)

export type Conf = typeof tamaguiConfig
declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}

export default tamaguiConfig