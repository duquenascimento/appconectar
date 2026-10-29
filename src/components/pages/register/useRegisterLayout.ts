import { Platform } from 'react-native';
import { useResponsiveness } from '@/src/components/hooks/useResponsiveness';

export const REGISTER_MAX_WIDTH = 600;

const FIELD_FONT_SIZE = 16;
const TOUCH_HEIGHT_DESKTOP = 44;
const TOUCH_HEIGHT_MOBILE = 48;

export function useRegisterLayout() {
  const { isLargeScreen } = useResponsiveness();
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
    containerProps,
  };
}
