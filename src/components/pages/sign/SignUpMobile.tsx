import { Button, Image, Input, Text, View, XStack, YStack } from 'tamagui';
import Icons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { useAuthContext } from '@/src/contexts/auth.context';
import { ActivityIndicator, Linking, Platform } from 'react-native';
import { ValidationDialog } from './ValidationDialog';
import DropDownPicker from 'react-native-dropdown-picker';
import { TextInputMask } from 'react-native-masked-text';
import { validateEmail, validatePassword, validatePhone } from '@/src/utils/validateFields';
import { VersionInfo } from '@/src/utils/VersionApp';

export function SignUpMobile(props: {
  page: string;
  positionOptions: { label: string; value: string }[];
  onButtonPress: (page: string) => void;
  onRegisterPress: (
    name: string,
    position: string,
    phone: string,
    email: string,
    password: string,
    registerInvalid: Function,
    setLoading: Function,
    setErros: Function,
    saveAuthToken: Function,
  ) => void;
  modal: () => void;
}) {
  const [showPw, setShowPw] = useState(true);
  const [showConfirmPw, setShowConfirmPw] = useState(true);
  const [name, setName] = useState('');
  const [nameValid, setNameValid] = useState(false);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState('');
  const [positionItems, setPositionItems] = useState(props.positionOptions);
  const [phone, setPhone] = useState('');
  const [phoneValid, setPhoneValid] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordValid, setPasswordValid] = useState(true);
  const [erros, setErros] = useState([]);
  const [registerInvalid, setRegisterInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const { saveAuthToken } = useAuthContext();

  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
      </View>
    );
  }

  return (
    <YStack paddingHorizontal={24} flex={1} justifyContent="center" alignItems="center">
      <ValidationDialog
        openModal={registerInvalid}
        setRegisterInvalid={setRegisterInvalid}
        erros={erros}
      />
      <Image
        src={require('@assets/images/logo-conectar-positivo.png')}
        objectFit="contain"
        maxWidth={200}
        height={80}
        marginBottom="$6"
      />

      <Text alignSelf="flex-start" fontSize="$8">
        Criar conta
      </Text>
      <Text alignSelf="flex-start" color="$gray10Dark">
        Preencha com os seus dados abaixo:
      </Text>

      <XStack
        width="$100"
        backgroundColor="white"
        borderWidth={1}
        borderRadius={9}
        borderColor={name.length > 0 && !nameValid ? '$red10' : 'lightgray'}
        marginTop="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
        hoverStyle={{
          borderColor: name.length > 0 && !nameValid ? '$red10' : '#049A63',
          borderWidth: 1,
        }}
        focusStyle={{
          borderColor: name.length > 0 && !nameValid ? '$red10' : '#049A63',
          borderWidth: 1,
        }}
      >
        <Input
          placeholder="Nome"
          onChangeText={(e) => {
            setName(e);
            setNameValid(e.length > 1);
          }}
          value={name}
          backgroundColor="$colorTransparent"
          borderWidth={0}
          flex={1}
          style={{
            paddingHorizontal: 12,
            paddingVertical: Platform.OS === 'android' ? 8 : 10,
            includeFontPadding: false,
            textAlignVertical: 'center',
          }}
        />
      </XStack>

      <XStack style={{ zIndex: 50, width: '100%' }} marginTop="$3.5">
        <DropDownPicker
          open={open}
          value={position}
          items={positionItems}
          setOpen={setOpen}
          setValue={setPosition}
          setItems={setPositionItems}
          placeholder="Selecione o cargo"
          style={{
            borderColor: 'lightgray',
            height: 50,
          }}
          dropDownContainerStyle={{
            borderColor: 'lightgray',
            zIndex: 50,
          }}
          listMode={Platform.OS === 'ios' ? 'MODAL' : 'SCROLLVIEW'}
        />
      </XStack>

      <XStack
        width="$100"
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
          onBlur={() => {
            setPhoneValid(validatePhone(phone) === null);
          }}
          style={{
            backgroundColor: 'white',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            width: '100%',
            borderWidth: 0,
          }}
        />
      </XStack>

      <XStack
        width="$100"
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
          autoCapitalize="none"
          placeholder="Email"
          onChangeText={(email) => {
            setEmail(email);
            setEmailValid(validateEmail(email) === null);
          }}
          value={email}
          textContentType="emailAddress"
          backgroundColor="$colorTransparent"
          borderWidth="$0"
          flex={1}
          maxLength={256}
          focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
          hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
        />
      </XStack>
      <XStack
        width="$100"
        backgroundColor="white"
        paddingRight="$3.5"
        borderWidth={1}
        borderRadius={9}
        borderColor={password.length === 0 ? 'lightgray' : passwordValid ? 'lightgray' : 'red'}
        marginTop="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
        focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
        hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
      >
        <Input
          autoCapitalize="none"
          placeholder="Senha"
          backgroundColor="$colorTransparent"
          borderWidth="$0"
          borderColor="$colorTransparent"
          secureTextEntry={showPw}
          flex={1}
          marginRight="$3.5"
          maxLength={20}
          value={password}
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
        width="$100"
        backgroundColor="white"
        paddingRight="$3.5"
        borderWidth={1}
        borderRadius={9}
        borderColor={
          confirmPassword.length === 0 ? 'lightgray' : passwordValid ? 'lightgray' : 'red'
        }
        marginTop="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
        focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
        hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
      >
        <Input
          autoCapitalize="none"
          placeholder="Confirmar senha"
          backgroundColor="$colorTransparent"
          borderWidth="$0"
          borderColor="$colorTransparent"
          secureTextEntry={showConfirmPw}
          flex={1}
          marginRight="$3.5"
          maxLength={20}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setPasswordValid(text === password);
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
        marginTop="$3.5"
        backgroundColor="#04BF7B"
        color="white"
        fontWeight="$10"
        width={230}
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
            saveAuthToken,
          )
        }
      >
        Cadastrar
      </Button>

      {/* <Text color='$gray10Dark' marginTop='$3.5'>Ou cadastre com</Text>
            <Button backgroundColor='white' borderColor='lightgray' width={230} marginTop='$5'><Icons name='logo-google' />Continuar com Google</Button>
            <Button backgroundColor='white' borderColor='lightgray' width={230} marginTop='$3.5'><Icons name='logo-microsoft' />Continuar com Microsoft</Button> */}

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

      <XStack marginTop="$9" borderColor="$gray7Light" borderWidth={1} borderRadius={9}>
        <Button
          width="50%"
          borderTopRightRadius={0}
          borderBottomRightRadius={0}
          height="$5"
          backgroundColor={props.page !== 'SignIn' ? '$gray1Light' : '$background'}
          onPress={() => props.onButtonPress('SignIn')}
        >
          Entrar
        </Button>
        <Button
          width="50%"
          borderTopLeftRadius={0}
          borderBottomLeftRadius={0}
          height="$5"
          backgroundColor={props.page !== 'SignUp' ? '$gray1Light' : '$background'}
        >
          Criar conta
        </Button>
      </XStack>
      <VersionInfo />
    </YStack>
  );
}
