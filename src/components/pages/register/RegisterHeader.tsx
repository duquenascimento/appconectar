import Icons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'tamagui';
import { useRegisterLayout } from './useRegisterLayout';

export function RegisterHeader(props: { step: number }) {
  const { step } = props;
  const { isWeb, containerProps } = useRegisterLayout();

  return (
    <View {...containerProps}>
      <View
        marginBottom={10}
        paddingTop={isWeb ? 32 : 50}
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize={20}>Cadastro</Text>
        <View paddingTop={20} justifyContent="center" flexDirection="row">
          <View alignItems="center">
            <Icons name="disc" />
            <Text fontSize={10}>Empresa</Text>
          </View>
          <View
            marginTop={5}
            backgroundColor={step > 1 ? 'black' : 'lightgray'}
            width={50}
            height={2}
          />
          <View alignItems="center">
            <Icons color={step > 1 ? 'black' : 'lightgray'} name="disc" />
            <Text color={step > 1 ? 'black' : 'lightgray'} fontSize={10}>
              Contato
            </Text>
          </View>
          <View
            marginTop={5}
            backgroundColor={step === 3 ? 'black' : 'lightgray'}
            width={50}
            height={2}
          />
          <View alignItems="center">
            <Icons color={step > 2 ? 'black' : 'lightgray'} name="disc" />
            <Text color={step > 2 ? 'black' : 'lightgray'} fontSize={10}>
              Entrega
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
