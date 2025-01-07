import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View, Text, Input, Button, ScrollView, Checkbox } from "tamagui";
import Icons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { DialogInstance } from "../index";
import { TextInputMask } from 'react-native-masked-text';
import { deleteStorage, getStorage, getToken, setStorage } from "../utils/utils";
import DropDownPicker from 'react-native-dropdown-picker';
import { formatCNPJ } from '../utils/formatCNPJ'
import { formatCep } from '../utils/formatCep'
import { encontrarInscricaoRJ } from '../utils/encontrarInscricaoEstadual'
import { dividirLogradouro } from '../utils/DividirLogradouro'

type RootStackParamList = {
    Home: undefined;
    Products: undefined
    Confirm: undefined
    Prices: undefined
    RegisterFinished: undefined
};

type HomeScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

interface Empresa {
    inscricoes_estaduais: any | null;
    msg: string;
    cnpj: string;
    identificador_matriz_filial: number;
    descricao_matriz_filial: string;
    razao_social: string;
    nome_fantasia: string;
    situacao_cadastral: number;
    descricao_situacao_cadastral: string;
    data_situacao_cadastral: string;
    motivo_situacao_cadastral: number;
    nome_cidade_exterior: string | null;
    codigo_natureza_juridica: number;
    data_inicio_atividade: string;
    cnae_fiscal: number;
    cnae_fiscal_descricao: string;
    descricao_tipo_de_logradouro: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cep: string;
    uf: string;
    codigo_municipio: number;
    municipio: string;
    ddd_telefone_1: string;
    ddd_telefone_2: string | null;
    ddd_fax: string | null;
    qualificacao_do_responsavel: number;
    capital_social: number;
    porte: number;
    descricao_porte: string;
    opcao_pelo_simples: boolean;
    data_opcao_pelo_simples: string | null;
    data_exclusao_do_simples: string | null;
    opcao_pelo_mei: boolean;
    situacao_especial: string | null;
    data_situacao_especial: string | null;
    cnaes_secundarios: CnaeSecundario[];
    qsa: Socio[];
}

interface CnaeSecundario {
    codigo: number;
    descricao: string;
}

interface CheckCnpj {
    data: Empresa
    status: number
    msg: string
}

interface Socio {
    identificador_de_socio: number;
    nome_socio: string;
    cnpj_cpf_do_socio: string;
    codigo_qualificacao_socio: number;
    percentual_capital_social: number;
    data_entrada_sociedade: string;
    cpf_representante_legal: string | null;
    nome_representante_legal: string | null;
    codigo_qualificacao_representante_legal: string | null;
}


export function Register({ navigation }: HomeScreenProps) {
    const [cnpj, setCnpj] = useState<string>('')
    const [stateNumberId, setStateNumberId] = useState<string>('')
    const [cityNumberId, setCityNumberId] = useState<string>('')
    const [restaurantName, setRestaurantName] = useState<string>('')
    const [legalRestaurantName, setLegalRestaurantName] = useState<string>('')
    const [zipcode, setZipcode] = useState<string>('')
    const [neigh, setNeigh] = useState<string>('')
    const [street, setStreet] = useState<string>('')
    const [localNumber, setLocalNumber] = useState<string>('')
    const [complement, setComplement] = useState<string>('')
    const [phone, setPhone] = useState<string>('')
    const [alternativePhone, setAlternativePhone] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [alternativeEmail, setAlternativeEmail] = useState<string>('')
    const [step, setStep] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(true);
    const [noStateNumberId, setNoStateNumberId] = useState<boolean>(false)
    const [minHour, setMinHour] = useState<string>('')
    const [maxHour, setMaxHour] = useState<string>('')
    const [closeDoor, setCloseDoor] = useState<boolean>(false);
    const [deliveryObs, setDeliveryObs] = useState<string>('')
    const [weeklyOrderAmount, setWeeklyOrderAmount] = useState<string>('')
    const [orderValue, setOrderValue] = useState<string>('')
    const [paymentWay, setpaymentWay] = useState<string>('')
    const [minhours, setMinhours] = useState<string[]>([]);
    const [maxhours, setMaxhours] = useState<string[]>([]);
    const [localType, setLocalType] = useState<string>('')
    const [city, setCity] = useState<string>('')
    const [erros, setErros] = useState<string[]>([])
    const [registerInvalid, setRegisterInvalid] = useState(false)
    const [emailValid, setEmailValid] = useState(false)
    const [emailAlternativeValid, setEmailAlternativeValid] = useState(false)
    const [isCepValid, setIsCepValid] = useState(true); // Nova variável de estado
    const [inviteCode, setInviteCode] = useState('')
    const [minHourOpen, setMinHourOpen] = useState(false)
    const [maxHourOpen, setMaxHourOpen] = useState(false)
    const [paymentWayOpen, setPaymentWayOpen] = useState(false)

    useEffect(() => {
        const hours = [];
        for (let hour = 0; hour < 22; hour++) {
            hours.push(`${String(hour).padStart(2, '0')}:00`);
            hours.push(`${String(hour).padStart(2, '0')}:30`);
        }
        hours.push("22:00");
        setMinhours(hours);
    }, []);

    useEffect(() => {
        if (minHour) {
            let [hour, minute] = minHour.split(':').map(Number);
            hour += 1;
            minute += 30;
            if (minute >= 60) {
                minute -= 60;
                hour += 1;
            }

            const maxOptions = [];
            while (hour < 24) {
                maxOptions.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
                minute += 30;
                if (minute >= 60) {
                    minute -= 60;
                    hour += 1;
                }
            }
            setMaxhours(maxOptions);
            setMaxHour(maxOptions[0])
        } else {
            setMaxhours([]);
        }
    }, [minHour]);

    const cepChange = async (value: string) => {
        try {
            const format = value.replace(/\D/g, '');
            if (format.length === 8) {
                setLoading(true);
                const response = await fetch(`https://viacep.com.br/ws/${format}/json/`);
                const result = await response.json();
                if (response.ok && !result.erro) {
                    const endereco: any = dividirLogradouro(result.logradouro)
                    await Promise.all([
                        setNeigh(result.bairro.toUpperCase()), 
                        setStreet(endereco.logradouro),
                        setLocalNumber(''), 
                        setComplement(''),
                        setLocalType(endereco.tipoLogradouro), 
                        setCity(result.localidade)
                    ]);
                    setIsCepValid(true); 
                } else {
                    setIsCepValid(false); 
                }
            } else {
                setIsCepValid(false);
            }
            setZipcode(value); // Atualiza o valor do CEP no estado
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            setIsCepValid(false); 
        } finally {
            const cepFormatado = formatCep(value);
            setZipcode(cepFormatado);
            setLoading(false);
        }
    };
    
    // Função para aplicar o estilo da borda
    const getCepBorderStyle = () => ({
        borderColor: isCepValid ? '#049A63' : 'red',
        borderWidth: 1,
    });

    const initData = async () => {
        try {
            const [
                cnpjAsync,
                stateNumberIdAsync,
                cityNumberIdAsync,
                restaurantNameAsync,
                legalRestaurantNameAsync,
                zipcodeAsync,
                neighAsync,
                streetAsync,
                localNumberAsync,
                complementAsync,
                phoneAsync,
                alternativePhoneAsync,
                emailAsync,
                alternativeEmailAsync,
                stepAsync,
                noStateNumberIdAsync,
                minHourAsync,
                maxHourAsync,
                closeDoorAsync,
                deliveryObsAsync,
                weeklyOrderAmountAsync,
                paymentWayAsync,
                orderValueAsync,
                localtype,
                city,
                inviteCode
            ] = await Promise.all([
                getStorage('cnpj'),
                getStorage('stateNumberId'),
                getStorage('cityNumberId'),
                getStorage('restaurantName'),
                getStorage('legalRestaurantName'),
                getStorage('zipcode'),
                getStorage('neigh'),
                getStorage('street'),
                getStorage('localNumber'),
                getStorage('complement'),
                getStorage('phone'),
                getStorage('alternativePhone'),
                getStorage('email'),
                getStorage('alternativeEmail'),
                getStorage('step'),
                getStorage('noStateNumberId'),
                getStorage('minHour'),
                getStorage('maxHour'),
                getStorage('closeDoor'),
                getStorage('deliveryObs'),
                getStorage('weeklyOrderAmount'),
                getStorage('paymentWay'),
                getStorage('orderValue'),
                getStorage('localType'),
                getStorage('city'),
                getStorage('inviteCode')
            ]);

            await Promise.all([
                setCnpj(cnpjAsync ?? ''),
                setStateNumberId(stateNumberIdAsync ?? ''),
                setCityNumberId(cityNumberIdAsync ?? ''),
                setRestaurantName(restaurantNameAsync ?? ''),
                setLegalRestaurantName(legalRestaurantNameAsync ?? ''),
                setZipcode(zipcodeAsync ?? ''),
                setNeigh(neighAsync ?? ''),
                setStreet(streetAsync ?? ''),
                setLocalNumber(localNumberAsync ?? ''),
                setComplement(complementAsync ?? ''),
                setPhone(phoneAsync ?? ''),
                setAlternativePhone(alternativePhoneAsync ?? ''),
                setEmail(emailAsync ?? ''),
                setAlternativeEmail(alternativeEmailAsync ?? ''),
                setStep(stepAsync ? parseInt(stepAsync) : 0),
                setNoStateNumberId(noStateNumberIdAsync === 'true'),
                setMinHour(minHourAsync ?? ''),
                setMaxHour(maxHourAsync ?? ''),
                setCloseDoor(closeDoorAsync === 'true'),
                setOrderValue(orderValueAsync ?? ''),
                setDeliveryObs(deliveryObsAsync ?? ''),
                setWeeklyOrderAmount(weeklyOrderAmountAsync ?? ''),
                setpaymentWay(paymentWayAsync || ''),
                setLocalType(localtype ?? ''),
                setCity(city ?? ''),
                setInviteCode(inviteCode ?? '')
            ])
        } finally {
            setLoading(false)
        }

    }

    useEffect(() => {
        initData()
    }, [])

    const handleNextBtn = async () => {
        try {
            setLoading(true)
            if (step === 3) {
                console.log(JSON.stringify({
                    token: await getToken(),
                    cnpj: cnpj.replace(/\D/g, ''),
                    alternativeEmail,
                    email,
                    alternativePhone,
                    phone,
                    complement,
                    localNumber,
                    street,
                    neigh,
                    zipcode: zipcode.replace(/\D/g, ''),
                    legalRestaurantName,
                    restaurantName,
                    cityNumberId,
                    stateNumberId,
                    paymentWay,
                    orderValue: Number(orderValue.replace(/[^\d,]/g, '').replace(',', '.')),
                    weeklyOrderAmount,
                    deliveryObs,
                    closeDoor,
                    maxHour,
                    minHour,
                    localType,
                    city,
                    inviteCode
                }))

                console.log('BODY:', JSON.stringify({
                    token: await getToken(),
                    cnpj: cnpj.replace(/\D/g, ''),
                    alternativeEmail,
                    email,
                    alternativePhone,
                    phone,
                    complement,
                    localNumber,
                    street,
                    neigh,
                    zipcode: zipcode.replace(/\D/g, ''),
                    legalRestaurantName,
                    restaurantName,
                    cityNumberId,
                    stateNumberId,
                    paymentWay,
                    orderValue: Number(orderValue.replace(/[^\d,]/g, '').replace(',', '.')),
                    weeklyOrderAmount,
                    deliveryObs,
                    closeDoor,
                    maxHour,
                    minHour,
                    localType,
                    city,
                    inviteCode
                }))
                const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/register/full-register`, {
                    method: 'POST',
                    body: JSON.stringify({
                        token: await getToken(),
                        cnpj: cnpj.replace(/\D/g, ''),
                        alternativeEmail,
                        email,
                        alternativePhone,
                        phone,
                        complement,
                        localNumber,
                        street,
                        neigh,
                        zipcode: zipcode.replace(/\D/g, ''),
                        legalRestaurantName,
                        restaurantName,
                        cityNumberId,
                        stateNumberId,
                        paymentWay,
                        orderValue: Number(orderValue.replace(/[^\d,]/g, '').replace(',', '.')),
                        weeklyOrderAmount,
                        deliveryObs,
                        closeDoor,
                        maxHour,
                        minHour,
                        localType,
                        city,
                        inviteCode
                    }),
                    headers: {
                        'Content-type': 'application/json'
                    }
                })
                if (response.ok) {
                    await Promise.all([
                        deleteStorage('cnpj'),
                        deleteStorage('stateNumberId'),
                        deleteStorage('cityNumberId'),
                        deleteStorage('restaurantName'),
                        deleteStorage('legalRestaurantName'),
                        deleteStorage('zipcode'),
                        deleteStorage('neigh'),
                        deleteStorage('street'),
                        deleteStorage('localNumber'),
                        deleteStorage('complement'),
                        deleteStorage('phone'),
                        deleteStorage('alternativePhone'),
                        deleteStorage('email'),
                        deleteStorage('alternativeEmail'),
                        deleteStorage('step'),
                        deleteStorage('noStateNumberId'),
                        deleteStorage('minHour'),
                        deleteStorage('maxHour'),
                        deleteStorage('closeDoor'),
                        deleteStorage('deliveryObs'),
                        deleteStorage('weeklyOrderAmount'),
                        deleteStorage('orderValue'),
                        deleteStorage('paymentWay'),
                        deleteStorage('localType'),
                        deleteStorage('city'),
                        deleteStorage('inviteCode'),
                        setStorage('role', 'registered')
                    ])


                    navigation.replace('RegisterFinished')
                }
            } else if (step === 0) {
                const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/register/checkCnpj`, {
                    method: 'POST',
                    body: JSON.stringify({
                        cnpj: cnpj.replace(/\D/g, '')
                    }),
                    headers: {
                        'Content-type': 'application/json'
                    }
                })
                const result: CheckCnpj = await response.json()       
                if (response.ok) {
                    const endereco: any = dividirLogradouro(result.data.logradouro)
                    const IE = encontrarInscricaoRJ(result.data.inscricoes_estaduais)
                    await Promise.all([
                        setLegalRestaurantName(result.data.razao_social), setZipcode(result.data.cep.replace(/(\d{5})(\d{3})/, '$1-$2')),
                        setNeigh(result.data.bairro), setStreet(endereco.logradouro),
                        setLocalNumber(result.data.numero), setComplement(result.data.complemento ?? ''),
                        setLocalType(endereco.tipoLogradouro), setCity(result.data.municipio),
                        setStateNumberId(IE ?? '')
                    ])
                    setNoStateNumberId(!IE)
                    setStep(step + 1)
                } else {
                    const erros: string[] = []
                    if (result.msg) {
                        if (result.msg === 'already exists') erros.push('Este cnpj já existe na plataforma, utilize outro ou logue ao invés disso')
                        if (result.msg === 'invalid cnpj') erros.push('Este cnpj não é válido')
                        setErros(erros)
                        setRegisterInvalid(true)
                    }
                }
            }

        } finally {
            const tempStep = step !== 0 ? step + 1 < 0 ? 0 : step + 1 > 3 ? 3 : step + 1 : 0
            setEmailValid(testEmail(email))
            setEmailAlternativeValid(testEmail(alternativeEmail))
            if (tempStep !== 0) setStep(tempStep)
            await Promise.all([
                setStorage('cnpj', cnpj),
                setStorage('stateNumberId', stateNumberId),
                setStorage('cityNumberId', cityNumberId),
                setStorage('restaurantName', restaurantName),
                setStorage('legalRestaurantName', legalRestaurantName),
                setStorage('zipcode', zipcode),
                setStorage('neigh', neigh),
                setStorage('street', street),
                setStorage('localNumber', localNumber),
                setStorage('complement', complement),
                setStorage('phone', phone),
                setStorage('alternativePhone', alternativePhone),
                setStorage('email', email),
                setStorage('alternativeEmail', alternativeEmail),
                setStorage('step', tempStep.toString()),
                setStorage('noStateNumberId', `${noStateNumberId}`),
                setStorage('minHour', minHour),
                setStorage('maxHour', maxHour),
                setStorage('closeDoor', `${closeDoor}`),
                setStorage('deliveryObs', deliveryObs),
                setStorage('weeklyOrderAmount', weeklyOrderAmount),
                setStorage('orderValue', orderValue),
                setStorage('paymentWay', paymentWay),
                setStorage('localType', localType),
                setStorage('city', city),
                setStorage('inviteCode', inviteCode)
            ])
            setLoading(false)
        }
    }

    const handleCnpjChange = (text: string) => {
        setCnpj(formatCNPJ(text));
    }


    const handleBackBtn = async () => {
        setLoading(true)
        const tempStep = step - 1 < 0 ? 0 : step - 1 > 3 ? 3 : step - 1
        await Promise.all([
            setStep(tempStep),
            setStorage('cnpj', cnpj),
            setStorage('stateNumberId', stateNumberId),
            setStorage('cityNumberId', cityNumberId),
            setStorage('restaurantName', restaurantName),
            setStorage('legalRestaurantName', legalRestaurantName),
            setStorage('zipcode', zipcode),
            setStorage('neigh', neigh),
            setStorage('street', street),
            setStorage('localNumber', localNumber),
            setStorage('complement', complement),
            setStorage('phone', phone),
            setStorage('alternativePhone', alternativePhone),
            setStorage('email', email),
            setStorage('alternativeEmail', alternativeEmail),
            setStorage('step', tempStep.toString()),
            setStorage('noStateNumberId', `${noStateNumberId}`),
            setStorage('minHour', minHour),
            setStorage('maxHour', maxHour),
            setStorage('closeDoor', `${closeDoor}`),
            setStorage('deliveryObs', deliveryObs),
            setStorage('weeklyOrderAmount', weeklyOrderAmount),
            setStorage('orderValue', orderValue),
            setStorage('paymentWay', paymentWay),
            setStorage('localType', localType),
            setStorage('city', city),
            setStorage('inviteCode', inviteCode)
        ])
        setLoading(false)
    }

    const handleEmailChange = (text: string) => {
        // Remover caracteres indesejados e garantir o formato de e-mail
        const formattedText = text
            .replace(/[^a-zA-Z0-9@._-]/g, '') // Remove caracteres não permitidos
            .toLowerCase(); // Converte para minúsculas

        setEmail(formattedText);
        setEmailValid(testEmail(formattedText))
    };

    const testEmail = (text: string) => {
        const test = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Remove as aspas ao redor da expressão regular
        return test.test(text);
    };

    const validateInput = (value: string) => value.length >= 8;

    const getBorderStyle = (value: string) => ({
        borderColor: validateInput(value) ? '#049A63' : 'red',
        borderWidth: 1,
    });


    // Função para validar e formatar e-mail alternativo
    const handleAlternativeEmailChange = (text: string) => {
        const formattedText = text
            .replace(/[^a-zA-Z0-9@._-]/g, '')
            .toLowerCase();

        setAlternativeEmail(formattedText);
        setEmailAlternativeValid(testEmail(formattedText))
    };

    const handleCheckBox = async () => {
        await setNoStateNumberId(!noStateNumberId)
    }

    const handleCheckBoxCloseDoor = async () => {
        await setCloseDoor(!closeDoor)
    }

    if (loading) {
        return (
            <View flex={1} justifyContent='center' alignItems='center'>
                <ActivityIndicator size="large" color="#04BF7B" />
            </View>
        );
    }

    return (
        <View flex={1} backgroundColor='#F0F2F6'>
            <DialogInstance openModal={registerInvalid} setRegisterInvalid={setRegisterInvalid} erros={erros} />
            <View mb={10} pt={50} alignItems="center" justifyContent="center">
                <Text fontSize={20}>Cadastro</Text>
                <View pt={20} justifyContent="center" flexDirection="row">
                    <View alignItems="center">
                        <Icons name="disc"></Icons>
                        <Text fontSize={10}>Empresa</Text>
                    </View>
                    <View mt={5} backgroundColor={step > 1 ? 'black' : 'lightgray'} width={50} height={2}></View>
                    <View alignItems="center">
                        <Icons color={step > 1 ? 'black' : 'lightgray'} name="disc"></Icons>
                        <Text color={step > 1 ? 'black' : 'lightgray'} fontSize={10}>Contato</Text>
                    </View>
                    <View mt={5} backgroundColor={step === 3 ? 'black' : 'lightgray'} width={50} height={2}></View>
                    <View alignItems="center">
                        <Icons color={step > 2 ? 'black' : 'lightgray'} name="disc"></Icons>
                        <Text color={step > 2 ? 'black' : 'lightgray'} fontSize={10}>Entrega</Text>
                    </View>
                </View>
            </View>
            <ScrollView>
                {
                    step === 0
                        ?
                        <View f={1} mt={20} p={20}>
                            <Text fontSize={12} mb={5} color='gray'>Dados do restaurante</Text>
                            <View backgroundColor='white' borderColor='lightgray' borderWidth={1} borderRadius={5} p={10}>
                                <Text>Nome na fachada da rua</Text>
                                <Input onChangeText={setRestaurantName} value={restaurantName} backgroundColor='white' borderRadius={2} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                                    hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}></Input>
                                <Text mt={15}>CNPJ</Text>
                                <Input onChangeText={handleCnpjChange} value={cnpj} keyboardType="number-pad" backgroundColor='white' borderRadius={2} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                                    hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}></Input>
                            </View>
                        </View>
                        :
                        step === 1
                            ?
                            <View f={1} mt={20} p={20}>
                                <Text fontSize={12} mb={5} color='gray'>Dados do restaurante</Text>
                                <View backgroundColor='white' borderColor='lightgray' borderWidth={1} borderRadius={5} p={10}>
                                    <Text>Nome na fachada da rua</Text>
                                    <Input onChangeText={setRestaurantName} value={restaurantName} backgroundColor='white' borderRadius={2} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                                        hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}></Input>
                                    <Text mt={15}>CNPJ</Text>
                                    <Input disabled={step >= 1 ? true : false} opacity={step >= 1 ? 0.5 : 1} onChangeText={setCnpj} value={cnpj} keyboardType="number-pad" backgroundColor='white' borderRadius={2} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                                        hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}></Input>
                                    <View opacity={noStateNumberId ? 0.5 : 1} marginTop={15} alignItems="center" flexDirection="row" gap={8}>
                                        <Text>Inscrição estadual</Text>
                                        <Text fontSize={10} color='gray'>Min. 8 digitos</Text>
                                    </View>
                                    <Input
                                        onChangeText={setStateNumberId}
                                        value={stateNumberId}
                                        keyboardType="number-pad"
                                        backgroundColor="white"
                                        borderRadius={2}
                                        focusStyle={getBorderStyle(stateNumberId)}
                                        hoverStyle={getBorderStyle(stateNumberId)}
                                        disabled={noStateNumberId}
                                        opacity={noStateNumberId ? 0.5 : 1}
                                        placeholder={noStateNumberId ? 'Isento' : ''}
                                    />
                                    <View mt={15} alignItems="center" flexDirection="row">
                                        <Checkbox onPress={handleCheckBox}>
                                            {noStateNumberId ? <Icons name="checkmark"></Icons> : <></>}
                                        </Checkbox>
                                        <Text paddingLeft={5} fontSize={12}>Sou isento de IE</Text>
                                    </View>
                                    {noStateNumberId &&
                                        <>
                                            <View marginTop={15} alignItems="center" flexDirection="row" gap={8}>
                                                <Text>Inscrição municipal</Text>
                                                <Text fontSize={10} color='gray'>Min. 8 digitos</Text>
                                            </View>
                                            <Input
                                                onChangeText={setCityNumberId}
                                                value={cityNumberId}
                                                keyboardType="number-pad"
                                                backgroundColor="white"
                                                borderRadius={2}
                                                focusStyle={getBorderStyle(cityNumberId)}
                                                hoverStyle={getBorderStyle(cityNumberId)}
                                            />
                                        </>}
                                    <Text mt={15}>Razão Social</Text>
                                    <Input disabled opacity={0.5} onChangeText={setLegalRestaurantName} value={legalRestaurantName} backgroundColor='white' borderRadius={2} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                                        hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}></Input>
                                </View>
                                <Text fontSize={12} mt={10} mb={5} color='gray'>Endereço</Text>
                                <View backgroundColor='white' borderColor='lightgray' borderWidth={1} borderRadius={5} p={10}>
                                    <View marginTop={15} alignItems="center" flexDirection="row" gap={8}>
                                        <Text>Cep</Text>
                                        <Text fontSize={10} color='gray'>8 digitos</Text>
                                    </View>
                                    <Input
                                        onChangeText={cepChange}
                                        value={zipcode}
                                        backgroundColor="white"
                                        borderRadius={2}
                                        focusStyle={getCepBorderStyle()}
                                        hoverStyle={getCepBorderStyle()}
                                    />
                                    <Text mt={15}>Bairro</Text>
                                    <Input disabled opacity={0.5} onChangeText={setNeigh} value={neigh} keyboardType="number-pad" backgroundColor='white' borderRadius={2} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                                        hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}></Input>
                                    <Text mt={15}>Logradouro</Text>
                                    <Input onChangeText={setStreet} value={street} backgroundColor='white' borderRadius={2} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                                        hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}></Input>
                                    <Text mt={15}>Número</Text>
                                    <Input onChangeText={setLocalNumber} value={localNumber} backgroundColor='white' borderRadius={2} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                                        hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}></Input>
                                    <Text mt={15}>Complemento</Text>
                                    <Input onChangeText={setComplement} value={complement} backgroundColor='white' borderRadius={2} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                                        hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}></Input>
                                </View>
                            </View>
                            :
                            step === 2 ?
                                <View flex={10} marginTop={20} padding={20}>
                                    <Text fontSize={12} marginBottom={5} color='gray'>Contato</Text>
                                    <View backgroundColor='white' borderColor='lightgray' borderWidth={1} borderRadius={5} padding={10}>
                                        <View alignItems="center" flexDirection="row" gap={8}>
                                            <Text>Telefone</Text>
                                            <Text fontSize={10} color='gray'>Para comunicados sobre os pedidos</Text>
                                        </View>
                                        <TextInputMask
                                            type={'cel-phone'}
                                            value={phone}
                                            onChangeText={setPhone}
                                            style={{ backgroundColor: 'white', borderRadius: 2, borderWidth: 1, borderColor: 'lightgray', padding: 10 }}
                                            placeholder="(00) 00000-0000"
                                        />

                                        <View marginTop={15} alignItems="center" flexDirection="row" gap={8}>
                                            <Text>Telefone alternativo</Text>
                                            <Text fontSize={10} color='gray'>Opcional</Text>
                                        </View>
                                        <TextInputMask
                                            type={'cel-phone'}
                                            value={alternativePhone}
                                            onChangeText={setAlternativePhone}
                                            style={{ backgroundColor: 'white', borderRadius: 2, borderWidth: 1, borderColor: 'lightgray', padding: 10 }}
                                            placeholder="(00) 00000-0000"
                                        />

                                        <View marginTop={15} alignItems="center" flexDirection="row" gap={8}>
                                            <Text>E-mail</Text>
                                            <Text fontSize={10} color='gray'>Para comunicados</Text>
                                        </View>
                                        <Input
                                            value={email}
                                            onChangeText={handleEmailChange}
                                            backgroundColor='white' borderRadius={2} borderColor='lightgray'
                                            placeholder="exemplo@exemplo.com"
                                            focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                                            hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                                        />

                                        <View marginTop={15} alignItems="center" flexDirection="row" gap={8}>
                                            <Text>E-mail alternativo</Text>
                                            <Text fontSize={10} color='gray'>Opcional</Text>
                                        </View>
                                        <Input
                                            value={alternativeEmail}
                                            onChangeText={handleAlternativeEmailChange}
                                            backgroundColor='white' borderRadius={2} borderColor='lightgray'
                                            placeholder="exemplo@exemplo.com"
                                            focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                                            hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                                        />
                                    </View>
                                </View>
                                :
                                step === 3 ?
                                    <View f={1} mt={20} p={20}>
                                        <Text fontSize={12} mb={5} color='gray'>Entrega</Text>
                                        <View backgroundColor='white' borderColor='lightgray' borderWidth={1} borderRadius={5} p={10}>
                                            <View borderColor='lightgray' borderWidth={0.5} p={5} gap={5} flexDirection="row">
                                                <Icons size={25} color='gray' name="information-circle"></Icons>
                                                <View justifyContent="center">
                                                    <Text maxWidth='99%' color='gray' fontSize={10}>Você deve definir pelo menos 1 hora e 30 minutos de diferença entre o horário mais cedo e o horário mais tarde para sua entrega.</Text>
                                                </View>
                                            </View>
                                            <View flexDirection="row" gap={20}>
                                                <View flex={1}>
                                                    <Text marginTop={15}>Quero receber de</Text>
                                                    <View flex={1} borderWidth={0.5} borderColor='lightgray'>
                                                        <DropDownPicker
                                                            value={minHour}
                                                            style={{
                                                                borderWidth: 1,
                                                                borderColor: 'lightgray',
                                                                borderRadius: 5,
                                                                zIndex: 1000,
                                                            }}
                                                            listMode="MODAL"
                                                            dropDownDirection="TOP"
                                                            setValue={setMinHour}
                                                            items={minhours.map((item) => { return { label: item, value: item } })}
                                                            multiple={false}
                                                            open={minHourOpen}
                                                            setOpen={setMinHourOpen}
                                                            placeholder="Escolha um horário"
                                                        >
                                                        </DropDownPicker>
                                                    </View>
                                                </View>
                                                <View flex={1}>
                                                    <Text marginTop={15}>Até</Text>
                                                    <View flex={1} borderWidth={0.5} borderColor='lightgray'>
                                                    <DropDownPicker
                                                            value={maxHour}
                                                            style={{
                                                                borderWidth: 1,
                                                                borderColor: 'lightgray',
                                                                borderRadius: 5,
                                                                flex: 1,
                                                            }}
                                                            listMode="MODAL"
                                                            dropDownDirection="TOP"
                                                            setValue={setMaxHour}
                                                            items={maxhours.map((item) => { return { label: item, value: item } })}
                                                            multiple={false}
                                                            open={maxHourOpen}
                                                            setOpen={setMaxHourOpen}
                                                            placeholder=""
                                                        >
                                                        </DropDownPicker>
                                                    </View>
                                                </View>
                                            </View>
                                            <View mt={15} alignItems="center" flexDirection="row">
                                                <Checkbox onPress={handleCheckBoxCloseDoor}>
                                                    {closeDoor ? <Icons name="checkmark"></Icons> : <></>}
                                                </Checkbox>
                                                <Text paddingLeft={5} fontSize={12}>Aceito receber de portas fechadas</Text>
                                            </View>
                                            <Text mt={15}>Obs de entrega</Text>
                                            <Input onChangeText={setDeliveryObs} value={deliveryObs} backgroundColor='white' borderRadius={2} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                                                hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}></Input>
                                        </View>
                                        <Text mt={10} fontSize={12} mb={5} color='gray'>Perfil de compra</Text>
                                        <View backgroundColor='white' borderColor='lightgray' borderWidth={1} borderRadius={5} p={10}>
                                            <Text>Quantos dias na semana você costuma pedir?</Text>
                                            <TextInputMask type="only-numbers" placeholder="0" onChangeText={(value) => { setWeeklyOrderAmount(value) }} value={weeklyOrderAmount} keyboardType="number-pad" style={{ padding: 8, backgroundColor: 'white', borderRadius: 2, borderWidth: 1, borderColor: 'lightgray' }}></TextInputMask>
                                            <Text mt={15}>Qual o valor médio de um pedido?</Text>
                                            <TextInputMask placeholder="R$ 000" type="only-numbers" onChangeText={(value) => setOrderValue(value)} value={orderValue} style={{ padding: 8, backgroundColor: 'white', borderRadius: 2, borderWidth: 1, borderColor: 'lightgray' }} keyboardType="number-pad"></TextInputMask>
                                        </View>
                                        <Text mt={10} fontSize={12} mb={5} color='gray'>Formato de pagamento</Text>
                                        <View backgroundColor='white' borderColor='lightgray' borderWidth={1} borderRadius={5} p={10}>
                                            <Text>Qual o formato de pagamento preferido?</Text>
                                            <View marginTop={10} justifyContent="flex-start" borderWidth={0.5} borderColor='lightgray'>
                                            <DropDownPicker
                                                            value={paymentWay}
                                                            style={{
                                                                borderWidth: 1,
                                                                borderColor: 'lightgray',
                                                                borderRadius: 5,
                                                                flex: 1,
                                                            }}
                                                            setValue={setpaymentWay}
                                                            listMode="MODAL"
                                                            dropDownDirection="TOP"
                                                            items={[{ label: 'Diário: 7 dias após a entrega', value: 'DI07' }, { label: 'Semanal: vencimento na quarta', value: 'UQ10' }]}
                                                            multiple={false}
                                                            open={paymentWayOpen}
                                                            setOpen={setPaymentWayOpen}
                                                            placeholder=""
                                                        >
                                                        </DropDownPicker>
                                            </View>
                                            <View mt={15} borderColor='lightgray' borderWidth={0.5} p={5} gap={5} flexDirection="row">
                                                <Icons size={25} color='gray' name="information-circle"></Icons>
                                                <View justifyContent="center">
                                                    <Text maxWidth='100%' color='gray' fontSize={10}>Prazos são sujeitos a avaliação de crédito</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <Text mt={10} fontSize={12} mb={5} color='gray'>Código do promotor</Text>
                                        <View backgroundColor='white' borderColor='lightgray' borderWidth={1} borderRadius={5} p={10}>
                                        <Input onChangeText={(text) => {
                                            setInviteCode(text.toUpperCase())
                                        }} backgroundColor='white' borderRadius={2} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                                        hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }} maxLength={5} value={inviteCode}></Input>
                                        </View>
                                    </View>
                                    :
                                    <></>

                }
            </ScrollView>
            <View paddingHorizontal={20} height={60} justifyContent="center" gap={15} flexDirection="row">
                <Button f={1} borderColor='lightgray' display={step > 0 ? 'flex' : 'none'} borderWidth={0.5} backgroundColor='white' onPress={() => {
                    handleBackBtn()
                }}><Text>Voltar</Text></Button>
                <Button disabled={
                    step === 0 && cnpj.length === 18 && restaurantName
                        ?
                        false
                        :
                        step === 1 && cnpj.length === 18 && restaurantName && legalRestaurantName && zipcode.length === 9 && neigh && street && localNumber && (stateNumberId.length >= 8 || cityNumberId.length >= 8)
                            ?
                            false
                            :
                            step === 2 && phone.length >= 14 && emailValid && (alternativePhone.length ? alternativePhone.length >= 14 : true) && (alternativeEmail.length ? emailAlternativeValid : true)
                                ?
                                false
                                :
                                step === 3 && minHour && maxHour && orderValue && weeklyOrderAmount && paymentWay
                                    ?
                                    false
                                    :
                                    true
                } opacity={
                    step === 0 && cnpj.length === 18 && restaurantName
                        ?
                        1
                        :
                        step === 1 && cnpj.length === 18 && restaurantName && legalRestaurantName && zipcode.length === 9 && neigh && street && localNumber && (stateNumberId.length >= 8 || cityNumberId.length >= 8)
                            ?
                            1
                            :
                            step === 2 && phone.length >= 14 && emailValid && (alternativePhone.length ? alternativePhone.length >= 14 : true) && (alternativeEmail.length ? emailAlternativeValid : true)
                                ?
                                1
                                :
                                step === 3 && minHour && maxHour && orderValue && weeklyOrderAmount && paymentWay
                                    ?
                                    1
                                    :
                                    0.3
                } f={1} backgroundColor='#04BF7B' onPress={() => {
                    handleNextBtn()
                }}><Text color='white'>Avançar</Text></Button>
            </View>
        </View>
    )
}
