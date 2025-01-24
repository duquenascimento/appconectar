import { Text, YStack, Input, Button, XStack, Image, View, Stack, Dialog, Adapt, Sheet, Spinner } from 'tamagui';
import Icons from '@expo/vector-icons/Ionicons'
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, type NativeScrollEvent, type NativeSyntheticEvent, Platform, ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    Home: undefined;
    Products: undefined
};

type HomeScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const { width } = Dimensions.get('window');
const platform = Platform.OS;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
let dataSignup: { email: string, password: string }

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
    if (password === confirmPassword && password.length >= 8) { setPasswordValid(true); return true }
    setPasswordValid(false);
    return false
}

export function Sign({ navigation }: HomeScreenProps) {
    const [currentPage, setCurrentPage] = useState('SignIn');
    const [visiblePage, setVisiblePage] = useState(true)
    const scrollRef = useRef<ScrollView>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const checkLogin = useCallback(async () => {
        try {
            const token = await SecureStore.getItemAsync('token')
            if (token == null) return
            const response = await fetch('http://192.168.201.96:9841/auth/checkLogin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            });

            if (response.ok) {
                navigation.replace('Products')
            }
        } catch (err) {
            console.log(err)
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        checkLogin();
    }, []);

    const handleButtonPress = (page: string) => {
        if (platform === 'web') {
            setVisiblePage(!visiblePage)
            setCurrentPage(page)
        }
        else {
            if (scrollRef.current != null) scrollRef.current.scrollTo({ x: page === 'SignUp' ? width : 0 });
        }
    }

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const page = (event.nativeEvent.contentOffset.x > width / 2) ? 'SignUp' : 'SignIn';
        setCurrentPage(page);
    }

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#04BF7B" />
            </View>
        );
    }

    return (
        <Stack bg={"$background"} height='100%'>
            <ScrollView
                horizontal
                pagingEnabled
                onScroll={handleScroll}
                ref={scrollRef}
            >
                <View width={width} height='100%' display={platform === 'web' ? !visiblePage ? 'none' : 'flex' : 'flex'}>
                    {platform === 'web' ?
                        <SignInWeb page={currentPage} onButtonPress={handleButtonPress}></SignInWeb>
                        :
                        <SignInMobile page={currentPage} onButtonPress={handleButtonPress} navigation={navigation}></SignInMobile>
                    }
                </View>
                <View width={width} height='100%' display={platform === 'web' ? visiblePage ? 'none' : 'flex' : 'flex'}>
                    {platform === 'web' ?
                        <SignUpWeb page={currentPage} onButtonPress={handleButtonPress}></SignUpWeb>
                        :
                        <SignUpMobile page={currentPage} onButtonPress={handleButtonPress} navigation={navigation}></SignUpMobile>
                    }
                </View>
            </ScrollView>
        </Stack>
    );
}

/* Mobile: */

export function SignInMobile(props: { page: string, onButtonPress: (page: string) => void, navigation: NativeStackNavigationProp<RootStackParamList, "Home"> }) {
    const [showPw, setShowPw] = useState(true);

    return (

        <YStack px={24} f={1} justifyContent='center' alignItems='center'>
            <Image src={require('../../assets/logo-conectar-positivo.png')} width='80%' height='10%' mb='$9'></Image>

            <Text alignSelf='flex-start' fontSize='$8'>Bem vindo de volta</Text>
            <Text alignSelf='flex-start' color='$gray10Dark'>Insira suas credenciais abaixo para acessar a sua conta.</Text>

            <XStack backgroundColor='white' borderWidth={1} borderRadius={9} borderColor='lightgray' mt='$3.5' alignItems='center' flexDirection='row' zIndex={20}>
                <Input placeholder='Email' backgroundColor='$colorTransparent' borderWidth='$0' borderColor='$colorTransparent' f={1} maxLength={256} />
            </XStack>
            <XStack backgroundColor='white' pr='$3.5' borderWidth={1} borderRadius={9} borderColor='lightgray' mt='$3.5' alignItems='center' flexDirection='row' zIndex={20}>
                <Input placeholder='Senha' backgroundColor='$colorTransparent' borderWidth='$0' borderColor='$colorTransparent' secureTextEntry={showPw} f={1} mr='$3.5' maxLength={20} />
                <Icons name={showPw ? 'eye' : 'eye-off'} size={24} onPress={() => { setShowPw(!showPw) }}></Icons>
            </XStack>

            <Button mt='$3.5' backgroundColor='#04BF7B' color='white' fontWeight='$10' width={230}>Entrar</Button>

            <Text color='$gray10Dark' mt='$3.5'>Ou entre com</Text>
            <Button backgroundColor='white' borderColor='lightgray' width={230} mt='$5'><Icons name='logo-google' />Continuar com Google</Button>
            <Button backgroundColor='white' borderColor='lightgray' width={230} mt='$3.5'><Icons name='logo-microsoft' />Continuar com Microsoft</Button>

            <Text fontSize='$5' mt='$5' fontWeight='$15' cursor='pointer'>Esqueceu sua senha?</Text>

            <XStack mt='$9' borderColor='$gray7Light' borderWidth={1} borderRadius={9}>
                <Button width='50%' borderTopRightRadius={0} borderBottomRightRadius={0} height='$5' bg={props.page === 'SignIn' ? '$gray1Light' : '$background'}>Entrar</Button>
                <Button width='50%' borderTopLeftRadius={0} borderBottomLeftRadius={0} height='$5' bg={props.page === 'SignUp' ? '$gray1Light' : '$background'} onPress={() => props.onButtonPress('SignUp')}>Criar conta</Button>
            </XStack>
        </YStack>
    );
}

export function SignUpMobile(props: { page: string, onButtonPress: (page: string) => void, navigation: NativeStackNavigationProp<RootStackParamList, "Home"> }) {
    const [showPw, setShowPw] = useState(true);
    const [showConfirmPw, setShowConfirmPw] = useState(true);
    const [emailValid, setEmailValid] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordValid, setPasswordValid] = useState(true)
    const [erros, setErros] = useState([])
    const [registerInvalid, setRegisterInvalid] = useState(false)
    const [loading, setLoading] = useState(false);

    const register = async (email: string, emailValid: boolean, password: string, passwordValid: boolean, registerInvalid: Function, setErros: Function) => {
        if (email.length > 1 && emailValid && password.length >= 8 && passwordValid) {
            dataSignup = {
                email,
                password
            }

            try {
                setLoading(true)
                const response = await fetch('http://192.168.201.96:9841/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dataSignup)
                });

                if (response.ok) {
                    const res = await response.json()
                    await SecureStore.setItemAsync('token', res.token)
                    props.navigation.replace('Products')
                }

            } catch (err) {
                console.log(err)
                setLoading(false)
            }


        } else {
            const erros = []
            if (!emailValid && email.length > 0) erros.push('E-mail inválido')
            if (!email.length) erros.push('O e-mail não pode estar em branco')
            if (password.length < 8) erros.push('A senha precisa ter 8 digitos ou mais')
            if (!passwordValid) erros.push('As duas senhas precisam ser iguais')

            if (erros.length > 0) {
                registerInvalid(true)
                setErros(erros)
                return false
            }

        }
    }

    return (
        <YStack px={24} f={1} justifyContent='center' alignItems='center'>
            <DialogInstance openModal={registerInvalid} setRegisterInvalid={setRegisterInvalid} erros={erros} />
            <Image src={require('../../assets/logo-conectar-positivo.png')} width='80%' height='10%' mb='$9'></Image>

            <YStack padding="$3" display={loading ? 'flex' : 'none'} position='absolute' backgroundColor='$white9' opacity={0.8} width={width} height='100%' f={1} alignItems="center" zIndex={9999999999}>
                <Spinner size="large" top='50%' color="$green10" />
            </YStack>

            <Text alignSelf='flex-start' fontSize='$8'>Criar conta</Text>
            <Text alignSelf='flex-start' color='$gray10Dark'>Vamos começar preenchendo as informações abaixo.</Text>

            <XStack
                backgroundColor='white'
                pr='$3.5'
                borderWidth={1}
                borderRadius={9}
                {...emailValid ? { borderColor: 'lightgray' } : { borderColor: '$red10' }}
                mt='$3.5'
                alignItems='center'
                flexDirection='row'
                zIndex={20}>
                <Input
                    placeholder='Email' onChangeText={(email) => {
                        setEmail(email); emailIsValid(email, setEmailValid)
                    }}
                    textContentType='emailAddress'
                    backgroundColor='$colorTransparent'
                    borderWidth='$0'
                    f={1}
                    maxLength={256}
                />
            </XStack>

            <XStack backgroundColor='white' pr='$3.5' borderWidth={1} borderRadius={9} borderColor='lightgray' mt='$3.5' mb='$3.5' alignItems='center' flexDirection='row' zIndex={20}>
                <Input
                    placeholder='Senha'
                    backgroundColor='$colorTransparent'
                    borderWidth='$0'
                    borderColor='$colorTransparent'
                    secureTextEntry={showPw}
                    f={1}
                    mr='$3.5'
                    maxLength={35}
                    onChangeText={(e) => {
                        setPassword(e)
                        passwordIsValid(e, confirmPassword, setPasswordValid)
                    }}
                />
                <Icons name={showPw ? 'eye' : 'eye-off'} size={24} onPress={() => { setShowPw(!showPw) }}></Icons>
            </XStack>
            <XStack
                backgroundColor='white'
                pr='$3.5'
                borderWidth={1}
                borderRadius={9}
                alignItems='center'
                flexDirection='row'
                zIndex={20}
                {...passwordValid ? { borderColor: 'lightgray' } : { borderColor: '$red10' }}
            >
                <Input
                    placeholder='Confirmar senha'
                    backgroundColor='$colorTransparent'
                    borderWidth='$0'
                    borderColor='$colorTransparent'
                    secureTextEntry={showConfirmPw}
                    f={1}
                    mr='$3.5'
                    maxLength={35}
                    onChangeText={(e) => {
                        setConfirmPassword(e)
                        passwordIsValid(e, password, setPasswordValid)
                    }}
                />
                <Icons name={showConfirmPw ? 'eye' : 'eye-off'} size={24} onPress={() => { setShowConfirmPw(!showConfirmPw) }}></Icons>
            </XStack>

            <Button mt='$3.5' backgroundColor='#04BF7B' color='white' fontWeight='$10' width={230} onPress={async () => {
                await register(email, emailValid, password, passwordValid, setRegisterInvalid, setErros)
            }}>Cadastrar</Button>

            <Text color='$gray10Dark' mt='$3.5'>Ou cadastre com</Text>
            <Button backgroundColor='white' borderColor='lightgray' width={230} mt='$5'><Icons name='logo-google' />Continuar com Google</Button>
            <Button backgroundColor='white' borderColor='lightgray' width={230} mt='$3.5'><Icons name='logo-microsoft' />Continuar com Microsoft</Button>

            <XStack mt='$9' borderColor='$gray7Light' borderWidth={1} borderRadius={9}>
                <Button width='50%' borderTopRightRadius={0} borderBottomRightRadius={0} height='$5' bg={props.page === 'SignIn' ? '$gray1Light' : '$background'} onPress={() => props.onButtonPress('SignIn')}>Entrar</Button>
                <Button width='50%' borderTopLeftRadius={0} borderBottomLeftRadius={0} height='$5' bg={props.page === 'SignUp' ? '$gray1Light' : '$background'}>Criar conta</Button>
            </XStack>
        </YStack>
    )
}

/* Web: */

export function SignInWeb(props: { page: string, onButtonPress: (page: string) => void }) {
    const [showPw, setShowPw] = useState(true);

    return (

        <YStack px={24} f={1} justifyContent='center' alignItems='center'>
            <Image src={require('../../assets/logo-conectar-positivo.svg')} width='$18' height='$7' mb='$9'></Image>

            <Stack width='$20'>
                <Text fontSize='$8'>Bem vindo de volta</Text>
                <Text color='$gray10Dark'>Insira suas credenciais abaixo para acessar a sua conta.</Text>
            </Stack>

            <XStack width='$20' backgroundColor='white' borderWidth={1} borderRadius={9} borderColor='lightgray' mt='$3.5' alignItems='center' flexDirection='row' zIndex={20}>
                <Input focusStyle={{ outlineStyle: 'none' }} placeholder='Email' backgroundColor='$colorTransparent' borderWidth='$0' borderColor='$colorTransparent' f={1} maxLength={256} width='100%' />
            </XStack>
            <XStack width='$20' backgroundColor='white' pr='$3.5' borderWidth={1} borderRadius={9} borderColor='lightgray' mt='$3.5' alignItems='center' flexDirection='row' zIndex={20}>
                <Input focusStyle={{ outlineStyle: 'none' }} placeholder='Senha' backgroundColor='$colorTransparent' borderWidth='$0' borderColor='$colorTransparent' secureTextEntry={showPw} f={1} mr='$3.5' maxLength={20} />
                <Icons name={showPw ? 'eye' : 'eye-off'} size={24} onPress={() => { setShowPw(!showPw) }}></Icons>
            </XStack>

            <Button hoverStyle={{ backgroundColor: '#03a86c' }} mt='$3.5' backgroundColor='#04BF7B' color='white' fontWeight='$10' width='$20'>Entrar</Button>

            <Text color='$gray10Dark' mt='$3.5'>Ou entre com</Text>
            <Button backgroundColor='white' borderColor='lightgray' width='$18' mt='$5'><Icons name='logo-google' />Continuar com Google</Button>
            <Button backgroundColor='white' borderColor='lightgray' width='$18' mt='$3.5'><Icons name='logo-microsoft' />Continuar com Microsoft</Button>

            <Text fontSize='$5' mt='$5' fontWeight='$15' cursor='pointer'>Esqueceu sua senha?</Text>

            <XStack mt='$9' borderColor='$gray7Light' borderWidth={1} borderRadius={9} width='$20'>
                <Button width='50%' borderTopRightRadius={0} borderBottomRightRadius={0} height='$5' bg={props.page === 'SignIn' ? '$gray1Light' : '$background'}>Entrar</Button>
                <Button width='50%' borderTopLeftRadius={0} borderBottomLeftRadius={0} height='$5' bg={props.page === 'SignUp' ? '$gray1Light' : '$background'} onPress={() => props.onButtonPress('SignUp')}>Criar conta</Button>
            </XStack>
        </YStack>
    );
}

export function SignUpWeb(props: { page: string, onButtonPress: (page: string) => void }) {
    const [showPw, setShowPw] = useState(true);
    const [showConfirmPw, setShowConfirmPw] = useState(true);

    return (

        <YStack px={24} f={1} justifyContent='center' alignItems='center'>
            <Image src={require('../../assets/logo-conectar-positivo.svg')} width='$18' height='$7' mb='$9'></Image>

            <Stack width='$20'>
                <Text fontSize='$8'>Criar conta</Text>
                <Text color='$gray10Dark'>Vamos começar preenchendo as informações abaixo.</Text>
            </Stack>

            <XStack width='$20' backgroundColor='white' borderWidth={1} borderRadius={9} borderColor='lightgray' mt='$3.5' alignItems='center' flexDirection='row' zIndex={20}>
                <Input focusStyle={{ outlineStyle: 'none' }} placeholder='Email' backgroundColor='$colorTransparent' borderWidth='$0' borderColor='$colorTransparent' f={1} maxLength={256} width='100%' />
            </XStack>
            <XStack width='$20' backgroundColor='white' pr='$3.5' borderWidth={1} borderRadius={9} borderColor='lightgray' mt='$3.5' alignItems='center' flexDirection='row' zIndex={20}>
                <Input focusStyle={{ outlineStyle: 'none' }} placeholder='Senha' backgroundColor='$colorTransparent' borderWidth='$0' borderColor='$colorTransparent' secureTextEntry={showPw} f={1} mr='$3.5' maxLength={20} />
                <Icons name={showPw ? 'eye' : 'eye-off'} size={24} onPress={() => { setShowPw(!showPw) }}></Icons>
            </XStack>
            <XStack width='$20' backgroundColor='white' pr='$3.5' borderWidth={1} borderRadius={9} borderColor='lightgray' mt='$3.5' alignItems='center' flexDirection='row' zIndex={20}>
                <Input focusStyle={{ outlineStyle: 'none' }} placeholder='Confirmar senha' backgroundColor='$colorTransparent' borderWidth='$0' borderColor='$colorTransparent' secureTextEntry={showConfirmPw} f={1} mr='$3.5' maxLength={20} />
                <Icons name={showConfirmPw ? 'eye' : 'eye-off'} size={24} onPress={() => { setShowConfirmPw(!showConfirmPw) }}></Icons>
            </XStack>

            <Button hoverStyle={{ backgroundColor: '#03a86c' }} mt='$3.5' backgroundColor='#04BF7B' color='white' fontWeight='$10' width='$20'>Cadastrar</Button>

            <Text color='$gray10Dark' mt='$3.5'>Ou cadastre com</Text>
            <Button backgroundColor='white' borderColor='lightgray' width='$18' mt='$5'><Icons name='logo-google' />Continuar com Google</Button>
            <Button backgroundColor='white' borderColor='lightgray' width='$18' mt='$3.5'><Icons name='logo-microsoft' />Continuar com Microsoft</Button>

            <XStack mt='$6' borderColor='$gray7Light' borderWidth={1} borderRadius={9} width='$20'>
                <Button width='50%' borderTopRightRadius={0} borderBottomRightRadius={0} height='$5' bg={props.page === 'SignIn' ? '$gray1Light' : '$background'} onPress={() => props.onButtonPress('SignIn')}>Entrar</Button>
                <Button width='50%' borderTopLeftRadius={0} borderBottomLeftRadius={0} height='$5' bg={props.page === 'SignUp' ? '$gray1Light' : '$background'}>Criar conta</Button>
            </XStack>
        </YStack>
    );
}

export function DialogInstance(props: { openModal: boolean, setRegisterInvalid: Function, erros: string[] }) {
    return (
        <Dialog modal open={props.openModal}>
            <Adapt when="sm" platform="touch">
                <Sheet animationConfig={{
                    type: 'spring',
                    damping: 20,
                    mass: 0.5,
                    stiffness: 200,
                }} animation="medium" zIndex={200000} modal dismissOnSnapToBottom snapPointsMode='fit'>
                    <Sheet.Frame padding="$4" gap="$4">
                        <Adapt.Contents />
                    </Sheet.Frame>
                    <Sheet.Overlay
                        animation="quickest"
                        enterStyle={{ opacity: 0 }}
                        exitStyle={{ opacity: 0 }}
                    />
                </Sheet>
            </Adapt>

            <Dialog.Portal>
                <Dialog.Overlay
                    key="overlay"
                    animation="quick"
                    opacity={0.5}
                    enterStyle={{ opacity: 0 }}
                    exitStyle={{ opacity: 0 }}
                />

                <Dialog.Content
                    bordered
                    elevate
                    key="content"
                    animateOnly={['transform', 'opacity']}
                    animation={[
                        'quicker',
                        {
                            opacity: {
                                overshootClamping: true,
                            },
                        },
                    ]}
                    enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
                    exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
                    gap="$4"
                >
                    <Dialog.Title>Ops!</Dialog.Title>
                    <Dialog.Description>
                        Houve alguns probleminhas, corrija antes de continuar
                    </Dialog.Description>

                    {props.erros.map(erro => {
                        return (
                            <Text key={erro}>- {erro}</Text>
                        )
                    })}

                    <XStack alignSelf="center" gap="$4">
                        <Dialog.Close displayWhenAdapted asChild>
                            <Button width='$20' theme="active" aria-label="Close" backgroundColor='#04BF7B' color='$white1' onPress={() => props.setRegisterInvalid(false)}>
                                Ok
                            </Button>
                        </Dialog.Close>
                    </XStack>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    )
}