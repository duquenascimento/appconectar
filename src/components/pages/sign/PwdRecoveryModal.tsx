import { useState } from "react";
import { Modal } from "react-native";
import { Button, Input, Text, View, XStack } from "tamagui";
import Icons from '@expo/vector-icons/Ionicons';
import { authChangePassword, authRecoveryCheck, authRecoveryPassword } from "@/src/services/authService";
import { isAxiosError } from "axios";
import { PasswordChangeRequest } from "@/src/types/userTypes";

export const PwRecoveryModal = ({
  onClose,
}: {
  onClose: () => void;
}) => {
  const [emailModal, setEmailModal] = useState<string>('');
  const [codeModal, setCodeModal] = useState<string>('');
  const [passwordModal, setPasswordModal] = useState<string>('');
  const [confirmPasswordModal, setConfirmPasswordModal] = useState<string>('');
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [showPassword, setShowPassword] = useState(true);
  const [step, setStep] = useState<number>(1);
  const [erro, setErro] = useState<string>('');

  const onSubmit = async () => {
    setErro('');

    switch(step) {
      case 1:
        try {
          await authRecoveryPassword(emailModal);
          setStep(2);
        } catch (error) {
          let errorMessage = 'Houve um erro ao requisitar a recuperação de senha.';
          if (isAxiosError(error)) {
            errorMessage = error.response?.data?.msg ?? error.response?.data?.message;
            if (errorMessage === 'user not exist') {
              errorMessage = 'Usuário não existe';
            }
          }
          setErro(errorMessage);
        }
        break;
      case 2:
        try {
          await authRecoveryCheck(emailModal, codeModal);
          setStep(3);
        } catch (error) {
          let errorMessage = 'Houve um erro ao verificar o código de recuperação de senha.';
          if (isAxiosError(error)) {
            errorMessage = error.response?.data?.msg ?? error.response?.data?.message;
            if (errorMessage === 'invalid code') {
              errorMessage = 'Código inválido';
            }
          }
          setErro(errorMessage);
        }
        break;
      case 3:
        if (passwordModal.length < 8) {
          setErro('A senha deve ter no mínimo 8 caracteres.');
          setIsPasswordValid(false);
          return;
        }
        if (passwordModal !== confirmPasswordModal) {
          setErro('As senhas não conferem.');
          setIsPasswordValid(false);
          return;
        }
        setIsPasswordValid(true);
        try {
          const changeData = {
            email: emailModal.toLowerCase(),
            codeSent: codeModal,
            newPW: passwordModal,
          } as PasswordChangeRequest;
          const response = await authChangePassword(changeData);
          setStep(4);
        } catch (error) {
          let errorMessage = 'Houve um erro ao redefinir a senha.';
          if (isAxiosError(error)) {
            errorMessage = error.response?.data?.msg ?? error.response?.data?.message;
            if (errorMessage === 'invalid code') {
              errorMessage = 'Código inválido ou expirado.';
            }
          }
          setErro(errorMessage);
        }
        break;
      default:
        break;
    }
  };

  return (
    <View flex={1} justifyContent="center" alignItems="center" backgroundColor="$white9">
      <Modal transparent={true}>
        <View
          flex={1}
          justifyContent="center"
          alignItems="center"
          backgroundColor="rgba(0, 0, 0, 0.9)"
        >
          <View
            paddingBottom={15}
            paddingHorizontal={15}
            paddingTop={15}
            backgroundColor="white"
            borderRadius={10}
            justifyContent="center"
          >
            <Text>Redefinição de senha</Text>
            {(step === 1 || step === 2) && (
              <>
                <Text paddingTop={5} fontSize={10}>
                  Informe o e-mail abaixo e insira o código enviado
                </Text>
                <Input
                  testID="input-email-recuperacao-senha"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  marginTop={15}
                  marginBottom={15}
                  onChangeText={setEmailModal}
                  placeholder="E-mail"
                  value={emailModal}
                  focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                  hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                />
                {step === 2 && (
                  <Input
                    testID="input-codigo-recuperacao-senha"
                    autoCapitalize="none"
                    onChangeText={setCodeModal}
                    maxLength={5}
                    placeholder="Código"
                    value={codeModal}
                    focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                    hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                  />
                )}
              </>
            )}
            {step === 3 && (
              <>
                <Text paddingTop={15} fontSize={10}>
                  Sua nova senha deve ter no mínimo 8 caracteres.
                </Text>
                <XStack
                  marginTop={10}
                  paddingRight="$3.5"
                  borderWidth={1}
                  borderRadius={9}
                  borderColor={isPasswordValid ? 'lightgray' : 'red'}
                  alignItems="center"
                >
                  <Input
                    autoCapitalize="none"
                    placeholder="Nova senha"
                    secureTextEntry={showPassword}
                    flex={1}
                    marginRight="$3.5"
                    backgroundColor="transparent"
                    borderWidth={0}
                    value={passwordModal}
                    onChangeText={setPasswordModal}
                  />
                  <Icons
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={24}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                </XStack>
                <XStack
                  marginTop={10}
                  marginBottom={15}
                  paddingRight="$3.5"
                  borderWidth={1}
                  borderRadius={9}
                  borderColor={isPasswordValid ? 'lightgray' : 'red'}
                  alignItems="center"
                >
                  <Input
                    autoCapitalize="none"
                    placeholder="Confirmar nova senha"
                    secureTextEntry={showPassword}
                    flex={1}
                    marginRight="$3.5"
                    backgroundColor="transparent"
                    borderWidth={0}
                    value={confirmPasswordModal}
                    onChangeText={setConfirmPasswordModal}
                  />
                  <Icons
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={24}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                </XStack>
              </>
            )}
            {step === 4 && (
              <Text fontSize={20} marginTop={15} marginBottom={15}>
                Senha redefinida com sucesso
              </Text>
            )}
            {erro && (
              <Text color="red" marginTop={5}>
                {erro}
              </Text>
            )}
            {step === 4 ? (
              <View
                height={70}
                paddingTop={15}
                gap={5}
                justifyContent="space-between"
                flexDirection="row"
              >
                <Button onPress={onClose} backgroundColor="#04BF7B" flex={1}>
                  <Text paddingLeft={5} fontSize={12} color="white">
                    Fechar
                  </Text>
                </Button>
              </View>
            ) : (
              <View
                height={70}
                paddingTop={15}
                gap={5}
                justifyContent="space-between"
                flexDirection="row"
              >
                <Button
                  onPress={() => {
                    setStep(1);
                    setErro('');
                    setPasswordModal('');
                    setConfirmPasswordModal('');
                    setEmailModal('');
                    setCodeModal('');
                    onClose();
                  }}
                  backgroundColor="black"
                  flex={1}
                >
                  <Text paddingLeft={5} fontSize={12} color="white">
                    Cancelar
                  </Text>
                </Button>
                <Button
                  testID="botao-avancar"
                  onPress={onSubmit}
                  backgroundColor="#04BF7B"
                  flex={1}
                >
                  <Text paddingLeft={5} fontSize={12} color="white">
                    Avançar
                  </Text>
                </Button>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};