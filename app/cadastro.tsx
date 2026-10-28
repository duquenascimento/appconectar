import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack, Text, View, YStack } from 'tamagui';
import { SignUpMobile } from '@/src/components/pages/sign/SignUpMobile';
import { ReferralLanding } from '@/src/components/pages/sign/landing/ReferralLanding';
import { SignUpWeb } from '@/src/components/pages/sign/SignUpWeb';
import { getPromoterNameByCode } from '@/src/services/promoterService';
import { handleRegister } from '@/src/services/signHandlers';

const positionOptions = [
  { label: 'Pessoa Física', value: 'Pessoa Física' },
  { label: 'Proprietário(a)/Sócio(a)', value: 'Proprietário(a)/Sócio(a)' },
  { label: 'Diretor(a)', value: 'Diretor(a)' },
  { label: 'Coordenador(a)', value: 'Coordenador(a)' },
  { label: 'Gerente', value: 'Gerente' },
  { label: 'Comprador(a)', value: 'Comprador(a)' },
  { label: 'Caixa/Financeiro', value: 'Caixa/Financeiro' },
  { label: 'Chef/Cozinheiro(a)', value: 'Chef/Cozinheiro(a)' },
  { label: 'Sous Chef', value: 'Sous Chef' },
  { label: 'Maître', value: 'Maître' },
  { label: 'Nutricionista', value: 'Nutricionista' },
  { label: 'Estoquista', value: 'Estoquista' },
  { label: 'Barista', value: 'Barista' },
  { label: 'Barman', value: 'Barman' },
  { label: 'Auxiliar de cozinha', value: 'Auxiliar de cozinha' },
  { label: 'Garçom(ete)', value: 'Garçom(ete)' },
  { label: 'Auxiliar de limpeza', value: 'Auxiliar de limpeza' },
  { label: 'Outros', value: 'Outros' },
];

function noop() {}

export default function Cadastro() {
  const { indicacao } = useLocalSearchParams<{ indicacao?: string }>();
  const [promoterName, setPromoterName] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!indicacao) {
      setPromoterName(undefined);
      return;
    }

    let active = true;
    getPromoterNameByCode(indicacao).then((name) => {
      if (active) setPromoterName(name);
    });

    return () => {
      active = false;
    };
  }, [indicacao]);

  const handleButtonPress = () => {
    router.replace('/');
  };

  const isWeb = Platform.OS === 'web';
  const landingCode = isWeb ? indicacao : undefined;

  return (
    <Stack backgroundColor="$background" height="100%">
      {landingCode && (
        <ReferralLanding
          code={landingCode}
          promoterName={promoterName}
          positionOptions={positionOptions}
          onRegisterPress={handleRegister}
          onLoginPress={handleButtonPress}
        />
      )}
      {isWeb && !landingCode && (
        <View height="100%">
          <SignUpWeb
            page="SignUp"
            positionOptions={positionOptions}
            onRegisterPress={handleRegister}
            onButtonPress={handleButtonPress}
            modal={noop}
          />
        </View>
      )}
      {!isWeb && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView nestedScrollEnabled contentContainerStyle={{ flexGrow: 1 }}>
            <SignUpMobile
              page="SignUp"
              positionOptions={positionOptions}
              onRegisterPress={handleRegister}
              onButtonPress={handleButtonPress}
              modal={noop}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </Stack>
  );
}
