import type { ComponentProps, ReactNode } from 'react';
import { Input, Text, View } from 'tamagui';
import { useRegisterLayout } from '@/src/components/pages/register/useRegisterLayout';

export const REGISTER_FIELD_FOCUS_COLOR = '#049A63';

export const registerBorderColor = (hasError: boolean) => (hasError ? 'red' : 'lightgray');

export const registerBoxProps = (hasError: boolean) => ({
  backgroundColor: 'white',
  borderRadius: 2,
  borderColor: registerBorderColor(hasError),
  focusStyle: { borderColor: REGISTER_FIELD_FOCUS_COLOR, borderWidth: 1 },
  hoverStyle: { borderColor: REGISTER_FIELD_FOCUS_COLOR, borderWidth: 1 },
  focusVisibleStyle: { outlineWidth: 0 },
});

type RegisterFieldFrameProps = {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string | false;
  marginTop?: number;
  children: ReactNode;
};

export function RegisterFieldFrame({
  label,
  required,
  hint,
  error,
  marginTop = 15,
  children,
}: RegisterFieldFrameProps) {
  return (
    <View marginTop={marginTop}>
      <View alignItems="center" flexDirection="row" gap={8}>
        <Text>
          {label}
          {required && <Text style={{ color: 'red', marginLeft: 3 }}>*</Text>}
        </Text>
        {hint && (
          <Text fontSize={10} color="gray">
            {hint}
          </Text>
        )}
      </View>
      {children}
      {error ? (
        <Text color="red" fontSize={12}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

type RegisterFieldProps = Omit<ComponentProps<typeof Input>, 'children'> &
  Omit<RegisterFieldFrameProps, 'children'>;

export function RegisterField({
  label,
  required,
  hint,
  error,
  marginTop,
  ...inputProps
}: RegisterFieldProps) {
  const { field } = useRegisterLayout();

  return (
    <RegisterFieldFrame
      label={label}
      required={required}
      hint={hint}
      error={error}
      marginTop={marginTop}
    >
      <Input {...registerBoxProps(!!error)} {...field} {...inputProps} />
    </RegisterFieldFrame>
  );
}
