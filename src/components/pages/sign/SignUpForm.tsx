import { useResponsiveness } from '@/src/components/hooks/useResponsiveness';
import { useAuthContext } from '@/src/contexts/auth.context';
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from '@/src/utils/validateFields';
import Icons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ActivityIndicator, Linking } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { TextInputMask } from 'react-native-masked-text';
import { Button, Input, Text, View, XStack, YStack } from 'tamagui';
import { ValidationDialog } from './ValidationDialog';

const FIELD_FONT_SIZE = 16;
const FIELD_HEIGHT_DESKTOP = 44;
const FIELD_HEIGHT_MOBILE = 48;

export function SignUpForm(props: {
  positionOptions: { label: string; value: string }[];
  onRegisterPress: (
    name: string,
    position: string,
    phone: string,
    email: string,
    password: string,
    registerInvalid: Function,
    setLoading: Function,
    setErros: Function,
    saveLogin: Function,
  ) => void;
}) {
  const [showPw, setShowPw] = useState(true);
  const [showConfirmPw, setShowConfirmPw] = useState(true);
  const [name, setName] = useState('');
  const [nameValid, setNameValid] = useState(true);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState('');
  const [positionItems, setPositionItems] = useState(props.positionOptions);
  const [phone, setPhone] = useState('');
  const [phoneValid, setPhoneValid] = useState(true);
  const [emailValid, setEmailValid] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordValid, setPasswordValid] = useState(true);
  const [erros, setErros] = useState([]);
  const [registerInvalid, setRegisterInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const { saveLogin } = useAuthContext();
  const { isLargeScreen } = useResponsiveness();
  const fieldHeight = isLargeScreen ? FIELD_HEIGHT_DESKTOP : FIELD_HEIGHT_MOBILE;

  if (loading) {
    return (
      <View width="100%" paddingVertical={48} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
      </View>
    );
  }

  return (
    <YStack width="100%" alignItems="center">
      {registerInvalid && (
        <ValidationDialog
          openModal={registerInvalid}
          setRegisterInvalid={setRegisterInvalid}
          erros={erros}
        />
      )}

      <XStack
        width="100%"
        backgroundColor="white"
        borderWidth={1}
        borderRadius={9}
        borderColor={name.length > 0 && !nameValid ? 'red' : 'lightgray'}
        marginTop="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
      >
        <Input
          data-testid="cadastro-input-nome"
          placeholder="Nome"
          autoComplete="name"
          textContentType="name"
          autoCapitalize="words"
          onChangeText={(e) => {
            setName(e);
            setNameValid(validateName(e) === null);
          }}
          value={name}
          backgroundColor="$colorTransparent"
          borderWidth="0"
          flex={1}
          width="100%"
          height={fieldHeight}
          fontSize={FIELD_FONT_SIZE}
          focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
          hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
        />
      </XStack>

      <XStack
        width="100%"
        borderWidth={1}
        backgroundColor="white"
        borderRadius={9}
        marginTop="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={30}
      >
        <DropDownPicker
          testID="cadastro-select-cargo"
          open={open}
          value={position}
          items={positionItems}
          setOpen={setOpen}
          setValue={setPosition}
          setItems={setPositionItems}
          placeholder="Selecione o cargo"
          style={{
            borderColor: 'lightgray',
            height: fieldHeight,
          }}
          textStyle={{ fontSize: FIELD_FONT_SIZE }}
          dropDownContainerStyle={{
            borderColor: 'lightgray',
          }}
          listMode="SCROLLVIEW"
        />
      </XStack>

      <XStack
        width="100%"
        backgroundColor="white"
        borderWidth={1}
        borderRadius={9}
        overflow="hidden"
        borderColor={phone.length === 0 ? 'lightgray' : phoneValid ? 'lightgray' : 'red'}
        marginTop="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
        hoverStyle={{
          borderColor: '#049A63',
          borderWidth: 1,
        }}
        focusStyle={{
          borderColor: '#049A63',
          borderWidth: 1,
        }}
      >
        <TextInputMask
          testID="cadastro-input-telefone"
          type="cel-phone"
          options={{
            maskType: 'BRL',
            withDDD: true,
            dddMask: '(99) ',
          }}
          value={phone}
          onChangeText={(text: string) => {
            setPhone(text);
            setPhoneValid(validatePhone(text) === null);
          }}
          placeholder="Telefone"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          onBlur={() => {
            setPhoneValid(validatePhone(phone) === null);
          }}
          style={{
            backgroundColor: 'white',
            borderRadius: 8,
            paddingHorizontal: 12,
            height: fieldHeight,
            fontSize: FIELD_FONT_SIZE,
            width: '100%',
            borderWidth: 0,
          }}
        />
      </XStack>

      <XStack
        width="100%"
        backgroundColor="white"
        borderWidth={1}
        borderRadius={9}
        borderColor={email.length > 0 && !emailValid ? 'red' : 'lightgray'}
        marginTop="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
      >
        <Input
          data-testid="cadastro-input-email"
          autoCapitalize="none"
          placeholder="Email"
          keyboardType="email-address"
          autoComplete="email"
          onChangeText={(text) => {
            setEmail(text);
            setEmailValid(validateEmail(text) === null);
          }}
          value={email}
          textContentType="emailAddress"
          backgroundColor="$colorTransparent"
          borderWidth="$0"
          flex={1}
          maxLength={256}
          height={fieldHeight}
          fontSize={FIELD_FONT_SIZE}
          focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
          hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
        />
      </XStack>
      <XStack
        width="100%"
        backgroundColor="white"
        paddingRight="$3.5"
        borderWidth={1}
        borderRadius={9}
        borderColor={
          password.length === 0
            ? 'lightgray' // Cinza se vazio
            : passwordValid
              ? 'lightgray'
              : 'red' // Vermelho se inválido
        }
        marginTop="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
        focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
        hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
      >
        <Input
          data-testid="cadastro-input-senha"
          autoCapitalize="none"
          placeholder="Senha"
          autoComplete="new-password"
          textContentType="newPassword"
          backgroundColor="$colorTransparent"
          borderWidth="$0"
          borderColor="$colorTransparent"
          secureTextEntry={showPw}
          flex={1}
          marginRight="$3.5"
          height={fieldHeight}
          fontSize={FIELD_FONT_SIZE}
          value={password}
          maxLength={20}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordValid(validatePassword(text) === null && text === confirmPassword);
          }}
          focusStyle={{ outlineStyle: 'none' }}
        />
        <Icons
          name={showPw ? 'eye' : 'eye-off'}
          size={24}
          onPress={() => {
            setShowPw(!showPw);
          }}
        />
      </XStack>
      <XStack
        width="100%"
        backgroundColor="white"
        paddingRight="$3.5"
        borderWidth={1}
        borderRadius={9}
        borderColor={
          confirmPassword.length === 0
            ? 'lightgray' // Cinza se vazio
            : passwordValid
              ? 'lightgray'
              : 'red' // Vermelho se inválido
        }
        marginTop="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
        focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
        hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
      >
        <Input
          data-testid="cadastro-input-confirmar-senha"
          autoCapitalize="none"
          placeholder="Confirmar senha"
          autoComplete="new-password"
          textContentType="newPassword"
          backgroundColor="$colorTransparent"
          borderWidth="$0"
          borderColor="$colorTransparent"
          secureTextEntry={showConfirmPw}
          flex={1}
          marginRight="$3.5"
          height={fieldHeight}
          fontSize={FIELD_FONT_SIZE}
          maxLength={20}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setPasswordValid(text === password); // Valida se é igual à senha principal
          }}
          focusStyle={{ outlineStyle: 'none' }}
        />
        <Icons
          name={showConfirmPw ? 'eye' : 'eye-off'}
          size={24}
          onPress={() => {
            setShowConfirmPw(!showConfirmPw);
          }}
        />
      </XStack>

      <Button
        data-testid="cadastro-botao-cadastrar"
        onPress={() =>
          props.onRegisterPress(
            name,
            position,
            phone,
            email,
            password,
            setRegisterInvalid,
            setLoading,
            setErros,
            saveLogin,
          )
        }
        hoverStyle={{ backgroundColor: '#03a86c' }}
        marginTop="$3.5"
        backgroundColor="#04BF7B"
        color="white"
        fontWeight="$10"
        fontSize={FIELD_FONT_SIZE}
        height={fieldHeight}
        width="100%"
      >
        Cadastrar
      </Button>

      <Text
        marginTop={5}
        color="gray"
        cursor="pointer"
        onPress={() => {
          Linking.openURL(
            'https://www.conectarhortifruti.com.br/termos/politica-de-privacidade',
          ).catch((err) => console.error('Erro ao abrir URL:', err));
        }}
      >
        Politica de privacidade
      </Text>
    </YStack>
  );
}
