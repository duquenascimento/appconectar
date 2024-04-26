import { Text, YStack, Input, Button, XStack, Image, View, Stack } from 'tamagui';
import Icons from '@expo/vector-icons/Ionicons'
import { useRef, useState } from 'react';
import { Dimensions, type NativeScrollEvent, type NativeSyntheticEvent, Platform, ScrollView } from 'react-native';

const { width } = Dimensions.get('window');
const platform = Platform.OS;

export function Sign() {
    const [currentPage, setCurrentPage] = useState('SignIn');
    const [visiblePage, setVisiblePage] = useState(true)
    const scrollRef = useRef<ScrollView>(null);

    const handleButtonPress = (page: string) => {
        if(platform === 'web'){
            setVisiblePage(!visiblePage)
            setCurrentPage(page)
        }
        else{
            if(scrollRef.current != null) scrollRef.current.scrollTo({ x: page === 'SignUp' ? width : 0 });
        }
    }

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const page = (event.nativeEvent.contentOffset.x > width / 2) ? 'SignUp' : 'SignIn';
        setCurrentPage(page);
    }

    return(
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
                <SignInMobile page={currentPage} onButtonPress={handleButtonPress}></SignInMobile>
            }
        </View>
        <View width={width} height='100%' display={platform === 'web' ? visiblePage ? 'none' : 'flex' : 'flex'}>
            {platform === 'web' ? 
                <SignUpWeb page={currentPage} onButtonPress={handleButtonPress}></SignUpWeb>
                :
                <SignUpMobile page={currentPage} onButtonPress={handleButtonPress}></SignUpMobile>
            }
        </View>
    </ScrollView>
    );
}

/* Mobile: */

export function SignInMobile(props: { page: string, onButtonPress: (page: string) => void }) {
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

export function SignUpMobile(props: { page: string, onButtonPress: (page: string) => void }) {
    const [showPw, setShowPw] = useState(true);
    const [showConfirmPw, setShowConfirmPw] = useState(true);

    return (
    <YStack px={24} f={1} justifyContent='center' alignItems='center'>
        <Image src={require('../../assets/logo-conectar-positivo.png')} width='80%' height='10%' mb='$9'></Image>

        <Text alignSelf='flex-start' fontSize='$8'>Criar conta</Text>
        <Text alignSelf='flex-start' color='$gray10Dark'>Vamos começar preenchendo as informações abaixo.</Text>

        <XStack backgroundColor='white' pr='$3.5' borderWidth={1} borderRadius={9} borderColor='lightgray' mt='$3.5' alignItems='center' flexDirection='row' zIndex={20}>
            <Input placeholder='Email' backgroundColor='$colorTransparent' borderWidth='$0' borderColor='$colorTransparent' f={1} maxLength={256} />
        </XStack>
        <XStack backgroundColor='white' pr='$3.5' borderWidth={1} borderRadius={9} borderColor='lightgray' mt='$3.5' mb='$3.5' alignItems='center' flexDirection='row' zIndex={20}>
            <Input placeholder='Senha' backgroundColor='$colorTransparent' borderWidth='$0' borderColor='$colorTransparent' secureTextEntry={showPw} f={1} mr='$3.5' maxLength={20} />
            <Icons name={showPw ? 'eye' : 'eye-off'} size={24} onPress={() => { setShowPw(!showPw) }}></Icons>
        </XStack>
        <XStack backgroundColor='white' pr='$3.5' borderWidth={1} borderRadius={9} borderColor='lightgray' alignItems='center' flexDirection='row' zIndex={20}>
            <Input placeholder='Confirmar senha' backgroundColor='$colorTransparent' borderWidth='$0' borderColor='$colorTransparent' secureTextEntry={showConfirmPw} f={1} mr='$3.5' maxLength={20} />
            <Icons name={showConfirmPw ? 'eye' : 'eye-off'} size={24} onPress={() => { setShowConfirmPw(!showConfirmPw) }}></Icons>
        </XStack>

        <Button mt='$3.5' backgroundColor='#04BF7B' color='white' fontWeight='$10' width={230}>Cadastrar</Button>

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
                <Input focusStyle={{outlineStyle: 'none'}} placeholder='Email' backgroundColor='$colorTransparent' borderWidth='$0' borderColor='$colorTransparent' f={1} maxLength={256} width='100%' />
            </XStack>
            <XStack width='$20' backgroundColor='white' pr='$3.5' borderWidth={1} borderRadius={9} borderColor='lightgray' mt='$3.5' alignItems='center' flexDirection='row' zIndex={20}>
                <Input focusStyle={{outlineStyle: 'none'}} placeholder='Senha' backgroundColor='$colorTransparent' borderWidth='$0' borderColor='$colorTransparent' secureTextEntry={showPw} f={1} mr='$3.5' maxLength={20} />
                <Icons name={showPw ? 'eye' : 'eye-off'} size={24} onPress={() => { setShowPw(!showPw) }}></Icons>
            </XStack>

            <Button hoverStyle={{backgroundColor: '#03a86c'}} mt='$3.5' backgroundColor='#04BF7B' color='white' fontWeight='$10' width='$20'>Entrar</Button>

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
                <Input focusStyle={{outlineStyle: 'none'}} placeholder='Email' backgroundColor='$colorTransparent' borderWidth='$0' borderColor='$colorTransparent' f={1} maxLength={256} width='100%' />
            </XStack>
            <XStack width='$20' backgroundColor='white' pr='$3.5' borderWidth={1} borderRadius={9} borderColor='lightgray' mt='$3.5' alignItems='center' flexDirection='row' zIndex={20}>
                <Input focusStyle={{outlineStyle: 'none'}} placeholder='Senha' backgroundColor='$colorTransparent' borderWidth='$0' borderColor='$colorTransparent' secureTextEntry={showPw} f={1} mr='$3.5' maxLength={20} />
                <Icons name={showPw ? 'eye' : 'eye-off'} size={24} onPress={() => { setShowPw(!showPw) }}></Icons>
            </XStack>
            <XStack width='$20' backgroundColor='white' pr='$3.5' borderWidth={1} borderRadius={9} borderColor='lightgray' mt='$3.5' alignItems='center' flexDirection='row' zIndex={20}>
                <Input focusStyle={{outlineStyle: 'none'}} placeholder='Confirmar senha' backgroundColor='$colorTransparent' borderWidth='$0' borderColor='$colorTransparent' secureTextEntry={showConfirmPw} f={1} mr='$3.5' maxLength={20} />
                <Icons name={showConfirmPw ? 'eye' : 'eye-off'} size={24} onPress={() => { setShowConfirmPw(!showConfirmPw) }}></Icons>
            </XStack>

            <Button hoverStyle={{backgroundColor: '#03a86c'}} mt='$3.5' backgroundColor='#04BF7B' color='white' fontWeight='$10' width='$20'>Cadastrar</Button>

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