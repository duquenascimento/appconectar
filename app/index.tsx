import { Text, Input, YStack, Button, XStack, Image, View, Stack, Dialog, Adapt, Sheet } from 'tamagui'
import Icons from '@expo/vector-icons/Ionicons'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Dimensions, Linking, Modal, type NativeScrollEvent, type NativeSyntheticEvent, Platform, ScrollView } from 'react-native'
import { type NativeStackNavigationProp } from '@react-navigation/native-stack'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { deleteToken, getToken, setToken } from './utils/utils'
import { openURL } from 'expo-linking'
import { VersionInfo } from './utils/VersionApp'
import DropDownPicker from 'react-native-dropdown-picker'
import { TextInputMask } from 'react-native-masked-text'

type RootStackParamList = {
  Home: undefined
  Products: undefined
  Confirm: undefined
  Prices: undefined
  Register: undefined
  Cart: undefined
  FinalConfirm: undefined
}

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>
}

const { width } = Dimensions.get('window')
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
let dataSignup: { email: string; password: string; name: string; position: string; phone: string }
let dataSignin: { email: string; password: string }

const emailIsValid = (email: string, updateStateFn: Function): boolean | undefined => {
  if (email.length > 1) {
    const valid = emailRegex.test(email)
    updateStateFn(valid)
    return valid
  }
  if (email.length <= 1) {
    updateStateFn(true)
    return true
  }
}

const passwordIsValid = (password: string, confirmPassword: string, setPasswordValid: Function) => {
  if (password === confirmPassword && password.length >= 8) {
    setPasswordValid(true)
    return true
  }
  setPasswordValid(false)
  return false
}

const PwRecovery = ({ close, loading }: { close: () => void; loading: (active: boolean) => void }) => {
  const [emailModal, setEmailModal] = useState<string>('')
  const [codeModal, setCodeModal] = useState<string>('')
  const [passwordModal, setPasswordModal] = useState<string>('')
  const [step2, setStep2] = useState<boolean>(false)
  const [step3, setStep3] = useState<boolean>(false)
  const [step4, setStep4] = useState<boolean>(false)
  const [erro, setErro] = useState<string>('')

  return (
    <View flex={1} justifyContent="center" alignItems="center" backgroundColor="$white9">
      <Modal transparent={true}>
        <View flex={1} justifyContent="center" alignItems="center" backgroundColor="rgba(0, 0, 0, 0.9)">
          <View pb={15} paddingHorizontal={15} pt={15} $xl={{ minWidth: '40%' }} $sm={{ minWidth: '90%' }} backgroundColor="white" borderRadius={10} justifyContent="center">
            <Text>Redefinição de senha</Text>
            {step4 && (
              <Text fontSize={20} mt={15} mb={15}>
                Senha redefinida com sucesso
              </Text>
            )}
            {!step3 && !step4 && (
              <>
                <Text pt={5} fontSize={10}>
                  Informe o e-mail abaixo e insira o código enviado
                </Text>
                <Input autoCapitalize="none" keyboardType="email-address" mt={15} mb={15} onChangeText={setEmailModal} placeholder="E-mail" value={emailModal} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }} hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}></Input>
                {step2 && <Input autoCapitalize="none" onChangeText={setCodeModal} maxLength={5} placeholder="Código" value={codeModal} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }} hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}></Input>}
                {erro && <Text color="red">{erro}</Text>}
              </>
            )}
            {step3 && !step4 && <Input autoCapitalize="none" mt={15} mb={15} onChangeText={setPasswordModal} placeholder="Nova senha" value={passwordModal} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }} hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}></Input>}
            {!step4 && (
              <View height={70} pt={15} gap={5} justifyContent="space-between" flexDirection="row">
                <Button
                  onPress={() => {
                    setStep2(false)
                    setStep3(false)
                    setErro('')
                    setPasswordModal('')
                    setEmailModal('')
                    setCodeModal('')
                    close()
                  }}
                  backgroundColor="black"
                  flex={1}
                >
                  <Text pl={5} fontSize={12} color="white">
                    Cancelar
                  </Text>
                </Button>
                <Button
                  onPress={async () => {
                    if (step3) {
                      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/pwChange`, {
                        method: 'POST',
                        body: JSON.stringify({
                          email: emailModal.toLowerCase(),
                          codeSent: codeModal,
                          newPW: passwordModal
                        }),
                        headers: {
                          'Content-Type': 'application/json'
                        }
                      })
                      const result = await response.json()
                      if (!response.ok) {
                        if (result.msg === 'invalid code') setErro('Usuário não existe')
                      } else {
                        setStep3(false)
                        setStep4(true)
                      }
                    } else {
                      setErro('')
                      if (!step2) {
                        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/recovery`, {
                          method: 'POST',
                          body: JSON.stringify({
                            email: emailModal.toLowerCase()
                          }),
                          headers: {
                            'Content-Type': 'application/json'
                          }
                        })
                        const result = await response.json()
                        if (!response.ok) {
                          if (result.msg === 'user not exist') setErro('Usuário não existe')
                        } else {
                          setStep2(true)
                        }
                      } else {
                        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/recoveryCheck`, {
                          method: 'POST',
                          body: JSON.stringify({
                            email: emailModal.toLowerCase(),
                            codeSent: codeModal
                          }),
                          headers: {
                            'Content-Type': 'application/json'
                          }
                        })
                        const result = await response.json()
                        if (!response.ok) {
                          if (result.msg === 'invalid code') setErro('Código inválido')
                        } else {
                          setStep3(true)
                        }
                      }
                    }
                  }}
                  backgroundColor="#04BF7B"
                  flex={1}
                >
                  <Text pl={5} fontSize={12} color="white">
                    Avançar
                  </Text>
                </Button>
              </View>
            )}
            {step4 && (
              <View height={70} pt={15} gap={5} justifyContent="space-between" flexDirection="row">
                <Button
                  onPress={() => {
                    close()
                  }}
                  backgroundColor="#04BF7B"
                  flex={1}
                >
                  <Text pl={5} fontSize={12} color="white">
                    Fechar
                  </Text>
                </Button>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}

export function Sign({ navigation }: HomeScreenProps) {
  const [currentPage, setCurrentPage] = useState('SignIn')
  const [visiblePage, setVisiblePage] = useState(true)
  const scrollRef = useRef<ScrollView>(null)
  const [loading, setLoading] = useState(true)
  const [closeModal, setCloseModal] = useState<boolean>(false)

  const handleCloseModal = () => {
    setCloseModal(!closeModal)
  }

  const handleLoading = (active: boolean) => {
    setLoading(active)
  }

  const checkLogin = useCallback(async () => {
    try {
      const token = await getToken()
      if (token == null) {
        setLoading(false)
        return
      }
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/checkLogin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })

      if (response.ok) {
        const role = await AsyncStorage.getItem('role')
        if (role === 'registering') {
          navigation.replace('Register')
        } else {
          navigation.replace('Products')
        }
      } else {
        await AsyncStorage.clear()
        await deleteToken()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [navigation])

  useEffect(() => {
    checkLogin()
  }, [checkLogin])

  const handleButtonPress = (page: string) => {
    if (Platform.OS === 'web') {
      setVisiblePage(!visiblePage)
      setCurrentPage(page)
    } else if (scrollRef.current != null) {
      scrollRef.current.scrollTo({ x: page === 'SignUp' ? width : 0 })
    }
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = event.nativeEvent.contentOffset.x > width / 2 ? 'SignUp' : 'SignIn'
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
      </View>
    )
  }

  return (
    <Stack bg={'$background'} height="100%">
      {closeModal && <PwRecovery close={handleCloseModal} loading={handleLoading} />}
      <ScrollView horizontal pagingEnabled onScroll={handleScroll} ref={scrollRef} scrollEnabled={Platform.OS !== 'web'}>
        {Platform.OS === 'web' ? (
          <>
            {visiblePage ? (
              <View width={width} height="100%">
                <SignInWeb page={currentPage} navigation={navigation} onButtonPress={handleButtonPress} modal={handleCloseModal} />
              </View>
            ) : (
              <View width={width} height="100%">
                <SignUpWeb page={currentPage} navigation={navigation} onButtonPress={handleButtonPress} modal={handleCloseModal} />
              </View>
            )}
          </>
        ) : (
          <>
            <View width={width} height="100%">
              <SignInMobile page={currentPage} onButtonPress={handleButtonPress} navigation={navigation} modal={handleCloseModal} />
            </View>
            <View width={width} height="100%">
              <SignUpMobile page={currentPage} onButtonPress={handleButtonPress} navigation={navigation} modal={handleCloseModal} />
            </View>
          </>
        )}
      </ScrollView>
    </Stack>
  )
}

/* Mobile: */

export function SignInMobile(props: { page: string; onButtonPress: (page: string) => void; navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>; modal: () => void }) {
  const [showPw, setShowPw] = useState(true)
  const [registerInvalid, setRegisterInvalid] = useState(false)
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [erros, setErros] = useState([])
  const [loading, setLoading] = useState(false)

  const login = async (email: string, password: string, registerInvalid: Function, setErros: Function) => {
    if (email.length && password.length && email.length <= 256 && password.length <= 35) {
      dataSignin = {
        email: email.toLowerCase(),
        password
      }

      try {
        setLoading(true)
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataSignin)
        })

        const res: {
          data: { token: string; role: string[] }
          status: number
          msg: string | null
        } = await response.json()
        if (response.ok) {
          await Promise.all([setToken(res.data.token), AsyncStorage.setItem('role', res.data.role[0])])
          if (res.data.role.includes('registering')) {
            props.navigation.replace('Register')
          } else {
            props.navigation.replace('Products')
          }
        } else {
          if (res.msg) {
            const erros = []
            if (res.msg === 'invalid password') erros.push('Senha inválida')
            if (res.msg === 'user not found') erros.push('Usuário não encontrado')

            if (erros.length > 0) {
              registerInvalid(true)
              setErros(erros)
            }
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    } else {
      const erros = []
      if (!email.length) erros.push('O e-mail não pode estar em branco')
      if (email.length > 256) erros.push('O e-mail precisar ter 256 ou menos caracteres')
      if (!password.length) erros.push('A senha não pode estar em branco')
      if (password.length > 35) erros.push('A senha precisar ter 35 ou menos caracteres')

      if (erros.length > 0) {
        registerInvalid(true)
        setErros(erros)
        return false
      }
    }
  }

  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
      </View>
    )
  }

  return (
    <YStack px={24} f={1} justifyContent="center" alignItems="center">
      <DialogInstance openModal={registerInvalid} setRegisterInvalid={setRegisterInvalid} erros={erros} />
      <Image src={require('../assets/images/logo-conectar-positivo.png')} objectFit="contain" maxWidth={200} height={80} mb="$9"></Image>
      <Text alignSelf="center" fontSize="$8">
        Bem-vindo
      </Text>
      <Text alignSelf="flex-start" color="$gray10Dark">
        Insira suas credenciais abaixo para acessar a sua conta.
      </Text>

      <XStack backgroundColor="white" borderWidth={1} borderRadius={9} borderColor="lightgray" mt="$3.5" alignItems="center" flexDirection="row" zIndex={20}>
        <Input autoCapitalize="none" placeholder="Email" onChangeText={setEmail} backgroundColor="$colorTransparent" borderWidth="$0" borderColor="$colorTransparent" f={1} maxLength={256} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }} value={email} hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }} />
      </XStack>
      <XStack backgroundColor="white" pr="$3.5" borderWidth={1} borderRadius={9} borderColor="lightgray" mt="$3.5" alignItems="center" flexDirection="row" zIndex={20}>
        <Input autoCapitalize="none" placeholder="Senha" onChangeText={setPassword} backgroundColor="$colorTransparent" borderWidth="$0" borderColor="$colorTransparent" secureTextEntry={showPw} f={1} mr="$3.5" maxLength={35} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }} value={password} hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }} />
        <Icons
          name={showPw ? 'eye' : 'eye-off'}
          size={24}
          onPress={() => {
            setShowPw(!showPw)
          }}
        ></Icons>
      </XStack>

      <Button
        mt="$3.5"
        backgroundColor="#04BF7B"
        color="white"
        fontWeight="$10"
        width={230}
        onPress={async () => {
          await login(email, password, setRegisterInvalid, setErros)
        }}
      >
        Entrar
      </Button>

      {/* <Text color='$gray10Dark' mt='$3.5'>Ou entre com</Text>
            <Button backgroundColor='white' borderColor='lightgray' width={230} mt='$5'><Icons name='logo-google' />Continuar com Google</Button>
            <Button backgroundColor='white' borderColor='lightgray' width={230} mt='$3.5'><Icons name='logo-microsoft' />Continuar com Microsoft</Button> */}

      <Text onPress={props.modal} fontSize="$5" mt="$5" fontWeight="$15" cursor="pointer">
        Esqueceu sua senha?
      </Text>
      <Text
        mt={5}
        color="gray"
        cursor="pointer"
        onPress={() => {
          Linking.openURL('https://www.conectarhortifruti.com.br/termos/politica-de-privacidade').catch((err) => console.error('Erro ao abrir URL:', err))
        }}
      >
        Politica de privacidade
      </Text>

      <XStack mt="$9" borderColor="$gray7Light" borderWidth={1} borderRadius={9}>
        <Button width="50%" borderTopRightRadius={0} borderBottomRightRadius={0} height="$5" bg={props.page !== 'SignIn' ? '$gray1Light' : '$background'}>
          Entrar
        </Button>
        <Button width="50%" borderTopLeftRadius={0} borderBottomLeftRadius={0} height="$5" bg={props.page !== 'SignUp' ? '$gray1Light' : '$background'} onPress={() => props.onButtonPress('SignUp')}>
          Criar conta
        </Button>
      </XStack>
      <VersionInfo />
    </YStack>
  )
}

export function SignUpMobile(props: { page: string; onButtonPress: (page: string) => void; navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>; modal: () => void }) {
  const [showPw, setShowPw] = useState(true)
  const [showConfirmPw, setShowConfirmPw] = useState(true)
  const [name, setName] = useState('')
  const [nameValid, setNameValid] = useState(false)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState('')
  const [positionItems, setPositionItems] = useState([
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
    { label: 'Outros', value: 'Outros' }
  ])
  const [phone, setPhone] = useState('')
  const [phoneValid, setPhoneValid] = useState(false)
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [emailValid, setEmailValid] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordValid, setPasswordValid] = useState(true)
  const [erros, setErros] = useState([])
  const [registerInvalid, setRegisterInvalid] = useState(false)
  const [loading, setLoading] = useState(false)

  const validatePhone = (value: string) => {
    const numeric = value.replace(/\D/g, '')
    return /^\d{10,11}$/.test(numeric)
  }

  const register = async (name: string, nameValid: boolean, position: string, phone: string, phoneValid: boolean, email: string, emailValid: boolean, password: string, passwordValid: boolean, registerInvalid: Function, setErros: Function) => {
    const erros: string[] = []
    if (email.length > 1 && emailValid && name.length > 1 && nameValid && position.length > 1 && phone.length > 1 && phoneValid && password.length >= 8 && passwordValid) {
      dataSignup = {
        email: email.toLowerCase(),
        password,
        name,
        position,
        phone
      }
      try {
        setLoading(true)
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataSignup)
        })

        if (response.ok) {
          const res: {
            data: { token: string; role: string[] }
            status: number
          } = await response.json()
          await Promise.all([setToken(res.data.token), AsyncStorage.setItem('role', res.data.role[0])])
          if (res.data.role.includes('registering')) {
            props.navigation.replace('Register')
          } else {
            props.navigation.replace('Products')
          }
        } else {
          const res: {
            data: { token: string; role: string[] }
            status: number
            msg: string | null
          } = await response.json()
          if (res.msg === 'email already exists') erros.push('Este e-mail já existe na plataforma, utilize outro ou logue ao invés disso')
          if (erros.length > 0) {
            registerInvalid(true)
            setErros(erros)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    } else {
      if (!name.length) erros.push('O nome não pode estar em branco')
      if (!nameValid) erros.push('Nome inválido')
      if (!position) erros.push('O cargo não pode estar em branco')
      if (!phone.length) erros.push('O telefone não pode estar em branco')
      if (!phoneValid) erros.push('Telefone inválido')
      if (!emailValid && email.length > 0) erros.push('E-mail inválido')
      if (!email.length) erros.push('O e-mail não pode estar em branco')
      if (email.length > 256) erros.push('O e-mail precisar ter 256 ou menos caracteres')
      if (password.length < 8) erros.push('A senha precisa ter 8 digitos ou mais')
      if (!passwordValid) erros.push('As duas senhas precisam ser iguais')

      if (erros.length > 0) {
        registerInvalid(true)
        setErros(erros)
        return false
      }
    }
  }

  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
      </View>
    )
  }

  return (
    <YStack px={24} f={1} justifyContent="center" alignItems="center">
      <DialogInstance openModal={registerInvalid} setRegisterInvalid={setRegisterInvalid} erros={erros} />
      <Image src={require('../assets/images/logo-conectar-positivo.png')} objectFit="contain" maxWidth={200} height={80} mb="$6"></Image>

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
        borderColor={
          name.length > 0 && !nameValid ? '$red10' : 'lightgray'
        }
        mt="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
        hoverStyle={{
          borderColor: name.length > 0 && !nameValid ? '$red10' : '#049A63',
          borderWidth: 1
        }}
        focusStyle={{
          borderColor: name.length > 0 && !nameValid ? '$red10' : '#049A63',
          borderWidth: 1
        }}
      >
        <Input
          placeholder="Nome"
          onChangeText={(e) => {
            setName(e)
            setNameValid(e.length > 1)
          }}
          value={name}
          backgroundColor="$colorTransparent"
          borderWidth={0}
          flex={1}
          style={{
            paddingHorizontal: 12,
            paddingVertical: Platform.OS === 'android' ? 8 : 10, 
            includeFontPadding: false,
            textAlignVertical: 'center'
          }}
        />
      </XStack>

      <XStack style={{ zIndex: 50, width: '100%' }} mt="$3.5">
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
            height: 50
          }}
          dropDownContainerStyle={{
            borderColor: 'lightgray',
            zIndex: 50
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
        mt="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
        hoverStyle={{
          borderColor: '#049A63',
          borderWidth: 1
        }}
        focusStyle={{
          borderColor: '#049A63',
          borderWidth: 1
        }}
      >
        <TextInputMask
          type="cel-phone"
          options={{
            maskType: 'BRL',
            withDDD: true,
            dddMask: '(99) '
          }}
          value={phone}
          onChangeText={(text: string) => {
            setPhone(text)
            setPhoneValid(validatePhone(text))
          }}
          placeholder="Telefone"
          keyboardType="phone-pad"
          onBlur={() => {
            setPhoneValid(validatePhone(phone))
          }}
          style={{
            backgroundColor: 'white',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            width: '100%',
            borderWidth: 0
          }}
        />
      </XStack>

      <XStack width="$100" backgroundColor="white" borderWidth={1} borderRadius={9} borderColor={email.length > 0 && !emailValid ? 'red' : 'lightgray'} mt="$3.5" alignItems="center" flexDirection="row" zIndex={20}>
        <Input
          autoCapitalize="none"
          placeholder="Email"
          onChangeText={(email) => {
            setEmail(email)
            emailIsValid(email, setEmailValid)
          }}
          value={email}
          textContentType="emailAddress"
          backgroundColor="$colorTransparent"
          borderWidth="$0"
          f={1}
          maxLength={256}
          focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
          hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
        />
      </XStack>
      <XStack
        width="$100"
        backgroundColor="white"
        pr="$3.5"
        borderWidth={1}
        borderRadius={9}
        borderColor={
          password.length === 0
            ? 'lightgray'
            : passwordValid
            ? 'lightgray'
            : 'red'
        }
        mt="$3.5"
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
          f={1}
          mr="$3.5"
          maxLength={20}
          value={password}
          onChangeText={(text) => {
            setPassword(text)
            passwordIsValid(text, confirmPassword, setPasswordValid)
          }}
          focusStyle={{ outlineStyle: 'none' }}
        />
        <Icons
          name={showPw ? 'eye' : 'eye-off'}
          size={24}
          onPress={() => {
            setShowPw(!showPw)
          }}
        />
      </XStack>
      <XStack
        width="$100"
        backgroundColor="white"
        pr="$3.5"
        borderWidth={1}
        borderRadius={9}
        borderColor={
          confirmPassword.length === 0
            ? 'lightgray'
            : passwordValid
            ? 'lightgray'
            : 'red'
        }
        mt="$3.5"
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
          f={1}
          mr="$3.5"
          maxLength={20}
          onChangeText={(text) => {
            setConfirmPassword(text)
            setPasswordValid(text === password)
          }}
          focusStyle={{ outlineStyle: 'none' }}
        />
        <Icons
          name={showConfirmPw ? 'eye' : 'eye-off'}
          size={24}
          onPress={() => {
            setShowConfirmPw(!showConfirmPw)
          }}
        />
      </XStack>

      <Button
        mt="$3.5"
        backgroundColor="#04BF7B"
        color="white"
        fontWeight="$10"
        width={230}
        onPress={async () => {
          await register(name, nameValid, position, phone, phoneValid, email, emailValid, password, passwordValid, setRegisterInvalid, setErros)
        }}
      >
        Cadastrar
      </Button>

      {/* <Text color='$gray10Dark' mt='$3.5'>Ou cadastre com</Text>
            <Button backgroundColor='white' borderColor='lightgray' width={230} mt='$5'><Icons name='logo-google' />Continuar com Google</Button>
            <Button backgroundColor='white' borderColor='lightgray' width={230} mt='$3.5'><Icons name='logo-microsoft' />Continuar com Microsoft</Button> */}

      <Text
        mt={5}
        color="gray"
        cursor="pointer"
        onPress={() => {
          Linking.openURL('https://www.conectarhortifruti.com.br/termos/politica-de-privacidade').catch((err) => console.error('Erro ao abrir URL:', err))
        }}
      >
        Politica de privacidade
      </Text>

      <XStack mt="$9" borderColor="$gray7Light" borderWidth={1} borderRadius={9}>
        <Button width="50%" borderTopRightRadius={0} borderBottomRightRadius={0} height="$5" bg={props.page !== 'SignIn' ? '$gray1Light' : '$background'} onPress={() => props.onButtonPress('SignIn')}>
          Entrar
        </Button>
        <Button width="50%" borderTopLeftRadius={0} borderBottomLeftRadius={0} height="$5" bg={props.page !== 'SignUp' ? '$gray1Light' : '$background'}>
          Criar conta
        </Button>
      </XStack>
      <VersionInfo />
    </YStack>
  )
}

/* Web: */

export function SignInWeb(props: { page: string; onButtonPress: (page: string) => void; navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>; modal: () => void }) {
  const [showPw, setShowPw] = useState(true)
  const [registerInvalid, setRegisterInvalid] = useState(false)
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [erros, setErros] = useState([])
  const [loading, setLoading] = useState(false)

  const login = async (email: string, password: string, registerInvalid: Function, setErros: Function) => {
    if (email.length && password.length && email.length <= 256 && password.length <= 35) {
      dataSignin = {
        email: email.toLowerCase(),
        password
      }

      try {
        setLoading(true)
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataSignin)
        })
        const res: {
          data: { token: string; role: string[] }
          status: number
          msg: string | null
        } = await response.json()
        if (response.ok) {
          await Promise.all([setToken(res.data.token), AsyncStorage.setItem('role', res.data.role[0])])
          if (res.data.role.includes('registering')) {
            props.navigation.replace('Register')
          } else {
            props.navigation.replace('Products')
          }
        } else {
          if (res.msg) {
            const erros = []
            if (res.msg === 'invalid password') erros.push('Senha inválida')
            if (res.msg === 'user not found') erros.push('Usuário não encontrado')

            if (erros.length > 0) {
              registerInvalid(true)
              setErros(erros)
            }
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    } else {
      const erros = []
      if (!email.length) erros.push('O e-mail não pode estar em branco')
      if (email.length > 256) erros.push('O e-mail precisar ter 256 ou menos caracteres')
      if (!password.length) erros.push('A senha não pode estar em branco')
      if (password.length > 35) erros.push('A senha precisar ter 35 ou menos caracteres')

      if (erros.length > 0) {
        registerInvalid(true)
        setErros(erros)
        return false
      }
    }
  }

  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
      </View>
    )
  }

  return (
    <YStack px={24} f={1} justifyContent="center" alignItems="center">
      <DialogInstance openModal={registerInvalid} setRegisterInvalid={setRegisterInvalid} erros={erros} />
      <Image src={require('../assets/images/logo-conectar-positivo.svg')} width={240} height={80} objectFit="fill" mb="$8" />

      <Stack width="$20">
        <Text fontSize="$8">Bem-vindo</Text>
        <Text color="$gray10Dark">Insira suas credenciais abaixo para acessar a sua conta.</Text>
      </Stack>

      <XStack width="$20" backgroundColor="white" borderWidth={1} borderRadius={9} borderColor="lightgray" mt="$3.5" alignItems="center" flexDirection="row" zIndex={20}>
        <Input autoCapitalize="none" onChangeText={setEmail} focusStyle={{ outlineStyle: 'none' }} value={email} placeholder="Email" backgroundColor="$colorTransparent" borderWidth="$0" borderColor="$colorTransparent" f={1} maxLength={256} width="100%" />
      </XStack>
      <XStack width="$20" backgroundColor="white" pr="$3.5" borderWidth={1} borderRadius={9} borderColor="lightgray" mt="$3.5" alignItems="center" flexDirection="row" zIndex={20} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }} hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}>
        <Input autoCapitalize="none" onChangeText={setPassword} focusStyle={{ outlineStyle: 'none' }} value={password} placeholder="Senha" backgroundColor="$colorTransparent" borderWidth="$0" borderColor="$colorTransparent" secureTextEntry={showPw} f={1} mr="$3.5" maxLength={20} />
        <Icons
          name={showPw ? 'eye' : 'eye-off'}
          size={24}
          onPress={() => {
            setShowPw(!showPw)
          }}
        ></Icons>
      </XStack>

      <Button
        onPress={async () => {
          await login(email, password, setRegisterInvalid, setErros)
        }}
        hoverStyle={{ backgroundColor: '#03a86c' }}
        mt="$3.5"
        backgroundColor="#04BF7B"
        color="white"
        fontWeight="$10"
        width="$20"
      >
        Entrar
      </Button>

      {/* <Text color='$gray10Dark' mt='$3.5'>Ou entre com</Text>
            <Button backgroundColor='white' borderColor='lightgray' width='$18' mt='$5'><Icons name='logo-google' />Continuar com Google</Button>
            <Button backgroundColor='white' borderColor='lightgray' width='$18' mt='$3.5'><Icons name='logo-microsoft' />Continuar com Microsoft</Button> */}

      <Text onPress={props.modal} fontSize="$5" mt="$5" fontWeight="$15" cursor="pointer">
        Esqueceu sua senha?
      </Text>

      <Text
        mt={5}
        color="gray"
        cursor="pointer"
        onPress={() => {
          Linking.openURL('https://www.conectarhortifruti.com.br/termos/politica-de-privacidade').catch((err) => console.error('Erro ao abrir URL:', err))
        }}
      >
        Politica de privacidade
      </Text>

      <XStack mt="$9" borderColor="$gray7Light" borderWidth={1} borderRadius={9} width="$20">
        <Button width="50%" borderTopRightRadius={0} borderBottomRightRadius={0} height="$5" bg={props.page !== 'SignIn' ? '$gray1Light' : '$background'}>
          Entrar
        </Button>
        <Button width="50%" borderTopLeftRadius={0} borderBottomLeftRadius={0} height="$5" bg={props.page !== 'SignUp' ? '$gray1Light' : '$background'} onPress={() => props.onButtonPress('SignUp')}>
          Criar conta
        </Button>
      </XStack>
      <VersionInfo />
    </YStack>
  )
}

export function SignUpWeb(props: { page: string; onButtonPress: (page: string) => void; navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>; modal: () => void }) {
  const [showPw, setShowPw] = useState(true)
  const [showConfirmPw, setShowConfirmPw] = useState(true)
  const [name, setName] = useState('')
  const [nameValid, setNameValid] = useState(true)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState('')
  const [positionItems, setPositionItems] = useState([
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
    { label: 'Outros', value: 'Outros' }
  ])
  const [phone, setPhone] = useState('')
  const [phoneValid, setPhoneValid] = useState(true)
  const [emailValid, setEmailValid] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordValid, setPasswordValid] = useState(true)
  const [erros, setErros] = useState([])
  const [registerInvalid, setRegisterInvalid] = useState(false)
  const [loading, setLoading] = useState(false)

  const validatePhone = (value: string) => {
    const numeric = value.replace(/\D/g, '')
    return /^\d{10,11}$/.test(numeric)
  }

  const register = async (name: string, nameValid: boolean, position: string, phone: string, phoneValid: boolean, email: string, emailValid: boolean, password: string, passwordValid: boolean, registerInvalid: Function, setErros: Function) => {
    const erros: string[] = []
    if (email.length > 1 && emailValid && name.length > 1 && nameValid && position.length > 1 && phone.length > 1 && phoneValid && password.length >= 8 && passwordValid) {
      dataSignup = {
        email: email.toLowerCase(),
        password,
        name,
        position,
        phone
      }
      try {
        setLoading(true)
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataSignup)
        })

        if (response.ok) {
          const res: {
            data: { token: string; role: string[] }
            status: number
          } = await response.json()
          await Promise.all([setToken(res.data.token), AsyncStorage.setItem('role', res.data.role[0])])
          if (res.data.role.includes('registering')) {
            props.navigation.replace('Register')
          } else {
            props.navigation.replace('Products')
          }
        } else {
          const res: {
            data: { token: string; role: string[] }
            status: number
            msg: string | null
          } = await response.json()
          if (res.msg === 'email already exists') erros.push('Este e-mail já existe na plataforma, utilize outro ou logue ao invés disso')
          if (erros.length > 0) {
            registerInvalid(true)
            setErros(erros)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    } else {
      if (!name.length) erros.push('O nome não pode estar em branco')
      if (!nameValid) erros.push('Nome inválido')
      if (!position) erros.push('O cargo não pode estar em branco')
      if (!phone.length) erros.push('O telefone não pode estar em branco')
      if (!phoneValid) erros.push('Telefone inválido')
      if (!emailValid && email.length > 0) erros.push('E-mail inválido')
      if (!email.length) erros.push('O e-mail não pode estar em branco')
      if (email.length > 256) erros.push('O e-mail precisar ter 256 ou menos caracteres')
      if (password.length < 8) erros.push('A senha precisa ter 8 digitos ou mais')
      if (!passwordValid) erros.push('As duas senhas precisam ser iguais')

      if (erros.length > 0) {
        registerInvalid(true)
        setErros(erros)
        return false
      }
    }
  }

  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
      </View>
    )
  }

  return (
    <YStack px={24} f={1} justifyContent="center" alignItems="center">
      <Image src={require('../assets/images/logo-conectar-positivo.svg')} width={240} height={80} objectFit="fill" mb="$6" />
      {registerInvalid && <DialogInstance openModal={registerInvalid} setRegisterInvalid={setRegisterInvalid} erros={erros} />}

      <Stack width="$20">
        <Text fontSize="$8">Criar conta</Text>
        <Text color="$gray10Dark">Preencha com os seus dados abaixo:</Text>
      </Stack>

      <XStack width="$20" backgroundColor="white" borderWidth={1} borderRadius={9} borderColor={name.length > 0 && !nameValid ? 'red' : 'lightgray'} mt="$3.5" alignItems="center" flexDirection="row" zIndex={20}>
        <Input
          placeholder="Nome"
          onChangeText={(e) => {
            setName(e)
            setNameValid(e.length > 1)
          }}
          value={name}
          backgroundColor="$colorTransparent"
          borderWidth="0"
          f={1}
          width="100%"
          focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
          hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
        />
      </XStack>

      <XStack width="$20" borderWidth={1} backgroundColor="white" borderRadius={9} mt="$3.5" alignItems="center" flexDirection="row" zIndex={30}>
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
            height: 50
          }}
          dropDownContainerStyle={{
            borderColor: 'lightgray'
          }}
          listMode="SCROLLVIEW"
        />
      </XStack>

      <XStack
        width="$20"
        backgroundColor="white"
        borderWidth={1}
        borderRadius={9}
        overflow="hidden"
        borderColor={phone.length === 0 ? 'lightgray' : phoneValid ? 'lightgray' : 'red'}
        mt="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
        hoverStyle={{
          borderColor: '#049A63',
          borderWidth: 1
        }}
        focusStyle={{
          borderColor: '#049A63',
          borderWidth: 1
        }}
      >
        <TextInputMask
          type="cel-phone"
          options={{
            maskType: 'BRL',
            withDDD: true,
            dddMask: '(99) '
          }}
          value={phone}
          onChangeText={(text: string) => {
            setPhone(text)
            setPhoneValid(validatePhone(text))
          }}
          placeholder="Telefone"
          keyboardType="phone-pad"
          onBlur={() => {
            setPhoneValid(validatePhone(phone))
          }}
          style={{
            backgroundColor: 'white',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            width: '100%',
            borderWidth: 0
          }}
        />
      </XStack>

      <XStack width="$20" backgroundColor="white" borderWidth={1} borderRadius={9} borderColor={email.length > 0 && !emailValid ? 'red' : 'lightgray'} mt="$3.5" alignItems="center" flexDirection="row" zIndex={20}>
        <Input
          autoCapitalize="none"
          placeholder="Email"
          onChangeText={(email) => {
            setEmail(email)
            emailIsValid(email, setEmailValid)
          }}
          value={email}
          textContentType="emailAddress"
          backgroundColor="$colorTransparent"
          borderWidth="$0"
          f={1}
          maxLength={256}
          focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
          hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
        />
      </XStack>
      <XStack
        width="$20"
        backgroundColor="white"
        pr="$3.5"
        borderWidth={1}
        borderRadius={9}
        borderColor={
          password.length === 0
            ? 'lightgray' // Cinza se vazio
            : passwordValid
            ? 'lightgray'
            : 'red' // Vermelho se inválido
        }
        mt="$3.5"
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
          f={1}
          mr="$3.5"
          value={password}
          maxLength={20}
          onChangeText={(text) => {
            setPassword(text)
            passwordIsValid(text, confirmPassword, setPasswordValid)
          }}
          focusStyle={{ outlineStyle: 'none' }}
        />
        <Icons
          name={showPw ? 'eye' : 'eye-off'}
          size={24}
          onPress={() => {
            setShowPw(!showPw)
          }}
        />
      </XStack>
      <XStack
        width="$20"
        backgroundColor="white"
        pr="$3.5"
        borderWidth={1}
        borderRadius={9}
        borderColor={
          confirmPassword.length === 0
            ? 'lightgray' // Cinza se vazio
            : passwordValid
            ? 'lightgray'
            : 'red' // Vermelho se inválido
        }
        mt="$3.5"
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
          f={1}
          mr="$3.5"
          maxLength={20}
          onChangeText={(text) => {
            setConfirmPassword(text)
            setPasswordValid(text === password) // Valida se é igual à senha principal
          }}
          focusStyle={{ outlineStyle: 'none' }}
        />
        <Icons
          name={showConfirmPw ? 'eye' : 'eye-off'}
          size={24}
          onPress={() => {
            setShowConfirmPw(!showConfirmPw)
          }}
        />
      </XStack>

      <Button
        onPress={async () => {
          await register(name, nameValid, position, phone, phoneValid, email, emailValid, password, passwordValid, setRegisterInvalid, setErros)
        }}
        hoverStyle={{ backgroundColor: '#03a86c' }}
        mt="$3.5"
        backgroundColor="#04BF7B"
        color="white"
        fontWeight="$10"
        width="$20"
      >
        Cadastrar
      </Button>

      {/* <Text color='$gray10Dark' mt='$3.5'>Ou cadastre com</Text>
            <Button backgroundColor='white' borderColor='lightgray' width='$18' mt='$5'><Icons name='logo-google' />Continuar com Google</Button>
            <Button backgroundColor='white' borderColor='lightgray' width='$18' mt='$3.5'><Icons name='logo-microsoft' />Continuar com Microsoft</Button> */}

      <Text
        mt={5}
        color="gray"
        cursor="pointer"
        onPress={() => {
          Linking.openURL('https://www.conectarhortifruti.com.br/termos/politica-de-privacidade').catch((err) => console.error('Erro ao abrir URL:', err))
        }}
      >
        Politica de privacidade
      </Text>

      <XStack mt="$6" borderColor="$gray7Light" borderWidth={1} borderRadius={9} width="$20">
        <Button width="50%" borderTopRightRadius={0} borderBottomRightRadius={0} height="$5" bg={props.page !== 'SignIn' ? '$gray1Light' : '$background'} onPress={() => props.onButtonPress('SignIn')}>
          Entrar
        </Button>
        <Button width="50%" borderTopLeftRadius={0} borderBottomLeftRadius={0} height="$5" bg={props.page !== 'SignUp' ? '$gray1Light' : '$background'}>
          Criar conta
        </Button>
      </XStack>
      <VersionInfo />
    </YStack>
  )
}

export function DialogInstance(props: { openModal: boolean; setRegisterInvalid: Function; erros: string[]; cnpj?: string }) {
  return (
    <Dialog modal open={props.openModal}>
      <Adapt when="sm" platform="touch">
        <Sheet
          animationConfig={{
            type: 'spring',
            damping: 20,
            mass: 0.5,
            stiffness: 200
          }}
          animation="medium"
          zIndex={200000}
          modal
          dismissOnSnapToBottom
          snapPointsMode="fit"
        >
          <Sheet.Frame padding="$4" gap="$4">
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay animation="quickest" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        </Sheet>
      </Adapt>

      <Dialog.Portal>
        <Dialog.Overlay key="overlay" animation="quick" opacity={0.5} enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />

        <Dialog.Content
          bordered
          elevate
          key="content"
          animateOnly={['transform', 'opacity']}
          animation={[
            'quicker',
            {
              opacity: {
                overshootClamping: true
              }
            }
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
        >
          <Dialog.Title>Ops!</Dialog.Title>
          <Dialog.Description>Houve alguns probleminhas, corrija antes de continuar</Dialog.Description>

          {props.erros.map((erro) => {
            return <Text key={erro}>{erro}</Text>
          })}

          <XStack alignSelf="center" gap="$4">
            <Dialog.Close displayWhenAdapted asChild>
              {/* Envolva os botões em um container único */}
              <XStack gap="$4">
                <Button width="$20" theme="active" aria-label="Close" backgroundColor="#04BF7B" color="$white1" onPress={() => props.setRegisterInvalid(false)}>
                  Ok
                </Button>
                {props.erros.find((erro) => erro === 'Este cnpj já existe na plataforma, utilize outro ou logue ao invés disso') && (
                  <Button
                    width="$20"
                    theme="active"
                    backgroundColor="#FFA500"
                    color="$white1"
                    onPress={() => {
                      let msg = `Olá! Gostaria de acessar a conta com o CNPJ ${props.cnpj ?? ''}, pode me ajudar?`
                      msg = encodeURIComponent(msg).replace('!', '%21').replace("'", '%27').replace('(', '%28').replace(')', '%29').replace('*', '%2A')

                      const endpoint = `https://wa.me/5521999954372?text=${msg}`
                      openURL(endpoint).catch((err) => console.error(`Erro ao redirecionar ao Whatsapp: ${err}`))
                    }}
                  >
                    Suporte
                  </Button>
                )}
              </XStack>
            </Dialog.Close>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  )
}
