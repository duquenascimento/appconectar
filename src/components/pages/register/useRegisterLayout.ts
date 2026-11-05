import { Platform } from 'react-native';
import { useResponsiveness } from '@/src/components/hooks/useResponsiveness';

export const REGISTER_MAX_WIDTH = 600;

const FIELD_FONT_SIZE = 16;
const TOUCH_HEIGHT_DESKTOP = 44;
const TOUCH_HEIGHT_MOBILE = 48;

// "Escolha um horário" só cabe em uma linha, na coluna estreita, com 11 px abaixo desta largura.
const NARROW_SCREEN_WIDTH = 380;
const HOUR_PLACEHOLDER_FONT_SIZE = 12;
const HOUR_PLACEHOLDER_FONT_SIZE_NARROW = 11;

export function useRegisterLayout() {
  const { isLargeScreen, screenWidth } = useResponsiveness();
  const isWeb = Platform.OS === 'web';
  const touchHeight = isLargeScreen ? TOUCH_HEIGHT_DESKTOP : TOUCH_HEIGHT_MOBILE;

  const field: { fontSize?: number; height?: number } = isWeb
    ? { fontSize: FIELD_FONT_SIZE, height: touchHeight }
    : {};

  const dropdownText = isWeb
    ? {
        textStyle: { fontSize: FIELD_FONT_SIZE },
        placeholderStyle: { fontSize: FIELD_FONT_SIZE },
        listItemLabelStyle: { fontSize: FIELD_FONT_SIZE },
        listItemContainerStyle: { height: TOUCH_HEIGHT_DESKTOP },
      }
    : {};

  const hourPlaceholderFontSize = () => {
    if (isLargeScreen) return FIELD_FONT_SIZE;
    return screenWidth < NARROW_SCREEN_WIDTH
      ? HOUR_PLACEHOLDER_FONT_SIZE_NARROW
      : HOUR_PLACEHOLDER_FONT_SIZE;
  };

  const hourPlaceholderStyle = { fontSize: hourPlaceholderFontSize() };

  const containerProps = isWeb
    ? { width: '100%' as const, maxWidth: REGISTER_MAX_WIDTH, alignSelf: 'center' as const }
    : {};

  return {
    isWeb,
    isLargeScreen,
    pagePadding: isWeb ? 16 : 20,
    touchHeight: isWeb ? touchHeight : undefined,
    field,
    dropdownText,
    hourPlaceholderStyle,
    containerProps,
  };
}
