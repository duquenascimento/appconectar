import DropDownPicker, { type DropDownPickerProps } from 'react-native-dropdown-picker';
import {
  REGISTER_FIELD_FOCUS_COLOR,
  RegisterFieldFrame,
  registerBorderColor,
} from '@/src/components/pages/register/RegisterField';
import { useRegisterLayout } from '@/src/components/pages/register/useRegisterLayout';

// Altura padrão do Input do Tamagui ($true), usada no nativo, onde o hook não define medidas.
const NATIVE_FIELD_HEIGHT = 44;

// Para listas lado a lado em tela estreita: menos espaço interno e em volta da seta.
const COMPACT_PADDING = 8;
const COMPACT_ARROW_GAP = 4;

type SingleSelectProps = Extract<DropDownPickerProps<string>, { multiple?: false }>;

type RegisterSelectProps = Omit<
  SingleSelectProps,
  'style' | 'dropDownContainerStyle' | 'listMode' | 'dropDownDirection'
> & {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string | false;
  marginTop?: number;
  compact?: boolean;
};

export function RegisterSelect({
  label,
  required,
  hint,
  error,
  marginTop,
  compact,
  ...pickerProps
}: RegisterSelectProps) {
  const { field, dropdownText } = useRegisterLayout();
  const borderColor = pickerProps.open ? REGISTER_FIELD_FOCUS_COLOR : registerBorderColor(!!error);

  return (
    <RegisterFieldFrame
      label={label}
      required={required}
      hint={hint}
      error={error}
      marginTop={marginTop}
    >
      <DropDownPicker
        listMode="SCROLLVIEW"
        dropDownDirection="BOTTOM"
        {...dropdownText}
        style={{
          borderWidth: 1,
          borderColor,
          borderRadius: 2,
          minHeight: field.height ?? NATIVE_FIELD_HEIGHT,
          ...(compact && { paddingHorizontal: COMPACT_PADDING }),
        }}
        arrowIconContainerStyle={compact ? { marginLeft: COMPACT_ARROW_GAP } : undefined}
        dropDownContainerStyle={{
          position: 'relative',
          top: 0,
          marginTop: -1,
          borderColor,
          borderRadius: 2,
        }}
        {...pickerProps}
      />
    </RegisterFieldFrame>
  );
}
