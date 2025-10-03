import { 
  animations, 
  config, 
  fonts, 
  mediaQueryDefaultActive, 
  selectionStyles, 
  themes, 
  tokens 
} from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'

// Objeto com as propriedades principais do objeto config e as alterações em components
const tamaguiOptions = {
  animations,
  themes,
  tokens,
  fonts,
  selectionStyles,
  settings: {
    mediaQueryDefaultActive,
  },
  components: {
    ...((config as any).components || {})
  }
}

const tamaguiConfig = createTamagui(tamaguiOptions)

export type Conf = typeof tamaguiConfig
declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}

export default tamaguiConfig