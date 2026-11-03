import DropDownPicker, { type DropDownPickerProps } from 'react-native-dropdown-picker';
import {
  REGISTER_FIELD_FOCUS_COLOR,
  RegisterFieldFrame,
  registerBorderColor,
} from '@/src/components/pages/register/RegisterField';
import { useRegisterLayout } from '@/src/components/pages/register/useRegisterLayout';

// Altura padrão do Input do Tamagui ($true), usada no nativo, onde o hook não define medidas.
const NATIVE_FIELD_HEIGHT = 44;

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
};

export function RegisterSelect({
  label,
  required,
  hint,
  error,
  marginTop,
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
        }}
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
