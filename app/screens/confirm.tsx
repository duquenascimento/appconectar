import { type NativeStackNavigationProp } from "@react-navigation/native-stack";
import { type SupplierData } from "./prices";
import { useCallback, useEffect, useState } from "react";
import { View, Image, Text, Stack, ScrollView, Button, Dialog, XStack, Sheet, Adapt } from "tamagui";
import { ActivityIndicator } from "react-native";
import Icons from '@expo/vector-icons/Ionicons';
import { DateTime } from "luxon";
import { deleteStorage, getStorage, getToken, setStorage } from "../utils/utils";
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

type RootStackParamList = {
    Home: undefined;
    Products: undefined;
    Cart: undefined;
    Prices: undefined;
    FinalConfirm: undefined;
};

type HomeScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

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
                        Houve algum(ns) problema(s)
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

function DialogInstanceNotification(props: { openModal: boolean, setRegisterInvalid: Function }) {
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
                    <Dialog.Title>Pronto!</Dialog.Title>
                    <Dialog.Description>
                        Sua notificação foi agendada
                    </Dialog.Description>

                    <Text>As 13h você será alertado em sua barra de notificação, até logo.</Text>

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

export function Confirm({ navigation }: HomeScreenProps) {
    const [supplier, setSupplier] = useState<SupplierData>({} as SupplierData);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedRestaurant, setSelectedRestaurant] = useState<any>()
    const [loadingToConfirm, setLoadingToConfirm] = useState<boolean>(false);
    const [dots, setDots] = useState('');
    const [showErros, setShowErros] = useState<string[]>([])
    const [booleanErros, setBooleanErros] = useState(false)
    const [showNotification, setShowNotification] = useState(false)

    useEffect(() => {
        if (loadingToConfirm) {
            const interval = setInterval(() => {
                setDots((prevDots) => {
                    if (prevDots.length === 3) {
                        return '';
                    } else {
                        return prevDots + '.';
                    }
                });
            }, 500); // Adjust the interval as needed

            return () => clearInterval(interval); // Cleanup the interval on component unmount
        }
    }, [loadingToConfirm]);

    const loadSupplier = useCallback(async () => {
        const supplierText = await getStorage('supplierSelected')
        if (!supplierText) return
        const supplier = JSON.parse(supplierText)
        console.log('AQUI2: ', supplier)
        setSupplier(supplier)
    }, [])

    useEffect(() => {
        const loadSupplierAsync = async () => {
            try {
                await loadSupplier()
                const selectedRestaurantText = await getStorage('selectedRestaurant')
                if (!selectedRestaurantText) return
                const selectedRestaurant = JSON.parse(selectedRestaurantText)
                setSelectedRestaurant(selectedRestaurant)
            } catch (err) {
                console.error(err)
                navigation.replace('Prices')
            } finally {
                setLoading(false)
            }

        }
        loadSupplierAsync()
    }, [loadSupplier, navigation])

    interface PaymentDescriptions {
        [key: string]: string;
    }


    const getPaymentDescription = (paymentWay: string) => {
        const paymentDescriptions: PaymentDescriptions = {
            "DI00": "Diário: no dia da entrega",
            "DI01": "Diário: 1 dia após entrega",
            "DI02": "Diário: 2 dias após entrega",
            "DI07": "Diário: 7 dias após entrega",
            "DI10": "Diário: 10 dias após entrega",
            "DI14": "Diário: 14 dias após entrega",
            "DI15": "Diário: 15 dias após entrega",
            "DI28": "Diário: 28 dias após entrega",
            "US08": "Semanal: vencimento na segunda",
            "UQ10": "Semanal: vencimento na quarta",
            "UX12": "Semanal: vencimento na sexta",
            "BX10": "Bissemanal: vencimento na segunda",
            "BX12": "Bissemanal: vencimento na quarta",
            "BX16": "Bissemanal: vencimento na sexta",
            "ME01": "Mensal: vencimento dia 1",
            "ME05": "Mensal: vencimento dia 5",
            "ME10": "Mensal: vencimento dia 10",
            "ME15": "Mensal: vencimento dia 15",
            "AV01": "À Vista: pix no dia anterior à entrega",
            "AV00": "À Vista: pix no dia da entrega"
        };

        return paymentDescriptions[paymentWay] || '';
    }

    const isBefore13Hours = () => {
        const currentDate = DateTime.now().setZone('America/Sao_Paulo');
        const currentHour = Number(
            `${currentDate.hour.toString().padStart(2, '0')}${currentDate.minute.toString().padStart(2, '0')}${currentDate.second.toString().padStart(2, '0')}`
        );
        return (130000 >= currentHour)
    }

    const isOpen = () => {
        const currentDate = DateTime.now().setZone('America/Sao_Paulo');
        const currentHour = Number(
            `${currentDate.hour.toString().length < 2 ? `0${currentDate.hour}` : currentDate.hour}${currentDate.minute.toString().length < 2 ? `0${currentDate.minute}` : currentDate.minute}${currentDate.second.toString().length < 2 ? `0${currentDate.second}` : currentDate.second}`
        );
        return (Number(supplier.supplier.hour.replaceAll(':', '')) >= currentHour && supplier.supplier.minimumOrder <= supplier.supplier.discount.orderValueFinish && supplier.supplier.missingItens > 0)
    }

    function getSecondsUntil13h() {
        const now = DateTime.now().setZone('America/Sao_Paulo').toJSDate() // Data e hora atual
        const target = new Date(); // Cria uma nova data (hoje)

        target.setHours(13, 0, 0, 0); // Define 13h00 na data atual

        const differenceInMillis = target.getTime() - now.getTime(); // Diferença em milissegundos

        // Converter milissegundos para segundos
        const differenceInSeconds = Math.floor(differenceInMillis / 1000);

        // Verifica se o horário já passou e retorna o valor (negativo ou positivo)
        return differenceInSeconds;
    }

    console.log(getSecondsUntil13h());


    const getPaymentDate = (paymentWay: string): string => {
        const today = new Date();
        const todayUTC = new Date(today.getTime() + today.getTimezoneOffset() * 60000);

        const offset = -3; // Horário padrão de São Paulo é UTC-3
        const deliveryDay = new Date(todayUTC.getFullYear(), todayUTC.getMonth(), todayUTC.getDate(), todayUTC.getHours() + offset, todayUTC.getMinutes());
        deliveryDay.setDate(deliveryDay.getDate() + 1); // Definir o dia da entrega como 1 dia após o dia atual

        const calculateNextWeekday = (date: Date, day: number): Date => {
            const resultDate = new Date(date);
            resultDate.setDate(date.getDate() + ((day + (7 - date.getDay())) % 7));
            return resultDate;
        };

        const calculateNextBimonthly = (date: Date, day1: number, day2: number): Date => {
            const day = date.getDate();
            if (day < day1) {
                return new Date(date.getFullYear(), date.getMonth(), day1);
            } else if (day < day2) {
                return new Date(date.getFullYear(), date.getMonth(), day2);
            } else {
                return new Date(date.getFullYear(), date.getMonth() + 1, day1);
            }
        };

        const calculateNextMonthly = (date: Date, day: number): Date => {
            const nextDate = new Date(date.getFullYear(), date.getMonth(), day);
            if (date.getDate() >= day) {
                nextDate.setMonth(date.getMonth() + 1);
            }
            // Verificar se o próximo mês tem o dia desejado (ex.: 30 de fevereiro não existe)
            if (nextDate.getMonth() !== (date.getMonth() + 1) % 12) {
                nextDate.setDate(0); // Definir para o último dia do mês anterior
            }
            return nextDate;
        };

        const paymentDescriptions: PaymentDescriptions = {
            "DI00": deliveryDay.toLocaleDateString('pt-BR'),
            "DI01": new Date(deliveryDay.getFullYear(), deliveryDay.getMonth(), deliveryDay.getDate() + 1).toLocaleDateString('pt-BR'),
            "DI02": new Date(deliveryDay.getFullYear(), deliveryDay.getMonth(), deliveryDay.getDate() + 2).toLocaleDateString('pt-BR'),
            "DI07": new Date(deliveryDay.getFullYear(), deliveryDay.getMonth(), deliveryDay.getDate() + 7).toLocaleDateString('pt-BR'),
            "DI10": new Date(deliveryDay.getFullYear(), deliveryDay.getMonth(), deliveryDay.getDate() + 10).toLocaleDateString('pt-BR'),
            "DI14": new Date(deliveryDay.getFullYear(), deliveryDay.getMonth(), deliveryDay.getDate() + 14).toLocaleDateString('pt-BR'),
            "DI15": new Date(deliveryDay.getFullYear(), deliveryDay.getMonth(), deliveryDay.getDate() + 15).toLocaleDateString('pt-BR'),
            "DI28": new Date(deliveryDay.getFullYear(), deliveryDay.getMonth(), deliveryDay.getDate() + 28).toLocaleDateString('pt-BR'),
            "US08": calculateNextWeekday(deliveryDay, 1).toLocaleDateString('pt-BR'), // Próxima segunda-feira
            "UQ10": calculateNextWeekday(deliveryDay, 3).toLocaleDateString('pt-BR'), // Próxima quarta-feira
            "UX12": calculateNextWeekday(deliveryDay, 5).toLocaleDateString('pt-BR'), // Próxima sexta-feira
            "BX10": calculateNextBimonthly(deliveryDay, 10, 25).toLocaleDateString('pt-BR'), // Bissemanal nos dias 10 e 25
            "BX12": calculateNextBimonthly(deliveryDay, 12, 26).toLocaleDateString('pt-BR'), // Bissemanal nos dias 12 e 26
            "BX16": calculateNextBimonthly(deliveryDay, 16, 30).toLocaleDateString('pt-BR'), // Bissemanal nos dias 16 e 30
            "ME01": calculateNextMonthly(deliveryDay, 1).toLocaleDateString('pt-BR'), // Mensal no dia 1
            "ME05": calculateNextMonthly(deliveryDay, 5).toLocaleDateString('pt-BR'), // Mensal no dia 5
            "ME10": calculateNextMonthly(deliveryDay, 10).toLocaleDateString('pt-BR'), // Mensal no dia 10
            "ME15": calculateNextMonthly(deliveryDay, 15).toLocaleDateString('pt-BR'), // Mensal no dia 15
            "AV01": new Date(deliveryDay.getFullYear(), deliveryDay.getMonth(), deliveryDay.getDate() - 1).toLocaleDateString('pt-BR'), // À Vista: no dia anterior à entrega
            "AV00": deliveryDay.toLocaleDateString('pt-BR') // À Vista: no dia da entrega
        };

        return paymentDescriptions[paymentWay] || '';
    }

    if (loading) {
        return (
            <View flex={1} justifyContent="center" alignItems="center">
                <ActivityIndicator size="large" color="#04BF7B" />
            </View>
        );
    }

    if (loadingToConfirm) {
        return (
            <View backgroundColor='#e3e6e7' flex={1} justifyContent="center" alignItems="center">
                <Image width={300} height={300} source={require('../../assets/images/korzina.gif')} />
                <Text fontWeight='800' pt={20}>Estamos confirmando o seu pedido{dots}</Text>
            </View>
        );
    }

    return (
        <Stack backgroundColor='white' pt={20} height='100%' position="relative">
            <DialogInstance openModal={booleanErros} setRegisterInvalid={setBooleanErros} erros={showErros} />
            <DialogInstanceNotification openModal={showNotification} setRegisterInvalid={setShowNotification}/>
            <View backgroundColor='white' flexDirection="row" height={80}>
                <View flexDirection="row" f={1}>
                    <View pl={10} justifyContent="center">
                        <Image source={{ uri: `https://cdn.conectarhortifruti.com.br/files/images/supplier/${supplier?.supplier.externalId}.jpg` }}
                            width={50} height={50} borderRadius={50} />
                    </View>
                    <View ml={10} justifyContent="center">
                        <Text fontSize={16}>{supplier?.supplier.name}</Text>
                        <View flexDirection="row" alignItems="center">
                            <Icons color='orange' name="star"></Icons>
                            <Text color='gray' pl={4}>{supplier?.supplier.star}</Text>
                        </View>
                    </View>
                </View>
                <View pr={30} flexDirection="row" justifyContent="center" alignItems="center">
                    <Icons size={25} name="close" onPress={() => {
                        setLoading(true)
                        deleteStorage('supplierSelected')
                        navigation.replace('Prices')
                    }}></Icons>
                </View>
            </View>

            <ScrollView backgroundColor='white'>
                <View backgroundColor='white' p={15}>
                    <View alignItems="center" paddingHorizontal={5} borderColor='gray' minHeight={40} flexDirection="row" borderWidth={0.5}>
                        <Icons color='gray' size={24} name="warning"></Icons>
                        <Text color='gray' ml={5} margin={5} textBreakStrategy="simple" fontSize={12}>Podem ocorrer pequenas variações de peso/tamanho nos produtos, comum ao hortifrúti.</Text>
                    </View>
                    <View pt={25}>
                        <Text>Produtos selecionados</Text>
                    </View>
                </View>
                <View paddingHorizontal={16} flex={1} backgroundColor='white'>
                    {supplier.supplier.discount.product.sort((a, b) => {
                        if (a.price === 0 && b.price !== 0) {
                            return -1
                        }
                        if (a.price !== 0 && b.price === 0) {
                            return 1
                        }
                        return a.name.localeCompare(b.name);
                    }).map(item => {
                        return (
                            <View key={item.sku} borderBottomColor='lightgray' paddingVertical={1} borderBottomWidth={0.5}>
                                <View flexDirection="row" alignItems="center">
                                    <View f={1} flexDirection="row" alignItems="center">
                                        <View padding={5}>
                                            <Image source={{ uri: item.image[0], width: 50, height: 50 }}></Image>
                                        </View>
                                        <View maxWidth={150}>
                                            <Text>{item.name}</Text>
                                            <Text fontSize={12} color='gray'>Obs: {item.obs ? item.obs : ''}</Text>
                                        </View>
                                    </View>
                                    <View>
                                        <Text fontWeight='800' color={item.price ? 'black' : 'red'} alignSelf="flex-end" fontSize={16}>{item.price ? 'R$ ' + item.price.toFixed(2).replace('.', ',') : 'Indisponível'}</Text>
                                        <View alignSelf="flex-end" flexDirection="row" alignItems="center">
                                            <Text pr={5} fontSize={12}>{item.quant} {item.orderUnit.replace('Unid', 'Un')}</Text>
                                            <Text color='gray'>
                                                | {item.priceUniqueWithTaxAndDiscount ? 'R$ ' + item.priceUniqueWithTaxAndDiscount.toFixed(2).replace('.', ',') : 'R$ ----'}
                                                /{item.orderUnit.replace('Unid', 'Un')}
                                            </Text>
                                        </View>

                                    </View>

                                </View>

                            </View>
                        )
                    })}
                </View>
                <View backgroundColor='white' marginTop={20} paddingVertical={16} paddingHorizontal={16}>
                    <View flexDirection="row">
                        <Text fontSize={14} color='gray' f={1}>Subtotal</Text>
                        <Text>R$ {supplier.supplier.discount.orderValueFinish.toFixed(2).replace('.', ',')}</Text>
                    </View>
                    <View pt={10} flexDirection="row">
                        <Text fontSize={14} color='gray' f={1}>Descontos</Text>
                        <Text>R$ 0,00</Text>
                    </View>
                    <View pt={10} flexDirection="row">
                        <View f={1}>
                            <Text fontSize={18} >Total</Text>
                            <Text fontSize={14} color='gray'>{supplier.supplier.discount.product.length} item(s) | {supplier.supplier.discount.product.length - supplier.supplier.missingItens} faltante(s)</Text>
                        </View>

                        <Text fontSize={18}>R$ {supplier.supplier.discount.orderValueFinish.toFixed(2).replace('.', ',')}</Text>
                    </View>
                    <View marginVertical={20} borderWidth={0.5} borderColor='lightgray'></View>
                    <View flexDirection="row">
                        <Text fontSize={14} color='gray' f={1}>Formato pagamento</Text>
                        <Text>{getPaymentDescription(selectedRestaurant.restaurant.paymentWay)}</Text>
                    </View>
                    <View pt={10} flexDirection="row">
                        <Text fontSize={14} color='gray' f={1}>Vencimento</Text>
                        <Text>{getPaymentDate(selectedRestaurant.restaurant.paymentWay)}</Text>
                    </View>
                    <View marginVertical={20} borderWidth={0.5} borderColor='lightgray'></View>
                    <View flexDirection="row">
                        <Text fontSize={14} color='gray' f={1}>Restaurante</Text>
                        <Text>{selectedRestaurant.restaurant.name}</Text>
                    </View>
                    <View alignItems="center" pt={10} flexDirection="row">
                        <Text fontSize={14} color='gray' f={1}>Endereço</Text>
                        <Text maxWidth={200}>
                            {(selectedRestaurant.restaurant.addressInfos[0].localType ?? '').toUpperCase()} {(selectedRestaurant.restaurant.addressInfos[0].address ?? '').toUpperCase()}, {selectedRestaurant.restaurant.addressInfos[0].localNumber}, {(selectedRestaurant.restaurant.addressInfos[0].complement ?? '').toUpperCase()} - {(selectedRestaurant.restaurant.addressInfos[0].neighborhood ?? '').toUpperCase()}, {(selectedRestaurant.restaurant.addressInfos[0].city ?? '').toUpperCase()}
                        </Text>
                    </View>
                    <View pt={10} flexDirection="row">
                        <Text fontSize={14} color='gray' f={1}>Horário</Text>
                        <Text>{selectedRestaurant.restaurant.addressInfos[0].initialDeliveryTime.substring(11, 16)} - {selectedRestaurant.restaurant.addressInfos[0].finalDeliveryTime.substring(11, 16)}</Text>
                    </View>
                    <View alignItems="center" pt={10} flexDirection="row">
                        <Text fontSize={14} color='gray' f={1}>Obs entrega:</Text>
                        <Text maxWidth={200}>{selectedRestaurant.restaurant.addressInfos[0].deliveryInformation || '--'}</Text>
                    </View>
                    <View pt={10} flexDirection="row">
                        <Text fontSize={14} color='gray' f={1}>Entregar para</Text>
                        <Text>{selectedRestaurant.restaurant.addressInfos[0].responsibleReceivingName || '--'}</Text>
                    </View>
                    <View pt={10} flexDirection="row">
                        <Text fontSize={14} color='gray' f={1}>Telefone</Text>
                        <Text>{selectedRestaurant.restaurant.addressInfos[0].responsibleReceivingPhoneNumber || '--'}</Text>
                    </View>
                </View>
            </ScrollView>
            <View pt={10} px={10}>
                <Text mx='auto' color='red' fontSize={10} textAlign="center" display={isBefore13Hours() ? 'flex' : 'none'}>A confirmação só pode ser feita após as 13h{Platform.OS === 'web' ? '.' : ', agende uma notificação para alertar no horário'}</Text>
            </View>
            <View backgroundColor='white' gap={10} flexDirection="row" p={10} justifyContent="center" alignItems="center">
                <Button onPress={() => { navigation.replace('Cart') }} width={170} backgroundColor='#000'><Text color='white'>Alterar itens</Text></Button>
                <Button onPress={async () => {
                    try {
                        if (isBefore13Hours() && Platform.OS !== 'web') {
                            const { status } = await Notifications.getPermissionsAsync();
                            if (status !== 'granted') {
                                const result = await Notifications.requestPermissionsAsync();
                                if (result.status !== 'granted') {
                                    console.log('No notification permissions granted!');
                                    return;
                                }
                            }
                            console.log('Permission granted');
                            const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
                            const isAlreadyScheduled = scheduledNotifications.some(
                                (notification) =>
                                    notification.content.title === "Confirme o seu pedido" &&
                                    notification.content.body === 'O seu pedido já pode ser confirmado!'
                            );
                    
                            if (isAlreadyScheduled) {
                                console.log('Notification already scheduled!');
                            } else {
                                await Notifications.scheduleNotificationAsync({
                                    content: {
                                        title: "Confirme o seu pedido",
                                        body: 'O seu pedido já pode ser confirmado!',
                                    },
                                    trigger: { seconds: getSecondsUntil13h() },
                                });
                                console.log('Notification scheduled');
                            }

                            setShowNotification(true)
                        } else {
                            setLoadingToConfirm(true)
                            const token = await getToken();
                            if (!token) return new Map();

                            const body = {
                                token,
                                supplier: supplier.supplier,
                                restaurant: selectedRestaurant
                            }

                            // console.log(JSON.stringify(body))

                            console.log('final: ', JSON.stringify(body))

                            let erros = []

                            if (!isOpen() && !selectedRestaurant.restaurant.allowClosedSupplier) erros.push('O fornecedor está fechado')
                            if (isBefore13Hours() && Platform.OS === 'web') erros.push('O pedido só pode ser confirmado após as 13h')
                            if (supplier.supplier.minimumOrder > supplier.supplier.discount.orderValueFinish &&
                                !selectedRestaurant.restaurant.allowMinimumOrder)
                                erros.push('O valor do pedido não atingiu o mínimo do fornecedor')
                            
                            setShowErros(erros)

                            if (!erros.length) {
                                const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/confirm`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(body)
                                });
                                if (result.ok) {
                                    const response = await result.json()
                                    await setStorage('finalConfirmData', JSON.stringify(response.data))
                                    navigation.replace('FinalConfirm')
                                } else {
                                    setLoadingToConfirm(false)
                                }
                            } else {
                                console.log('falhou')
                                setBooleanErros(true)
                                setLoadingToConfirm(false)
                            }
                        }
                    } catch (err) {
                        console.log(err)
                    }
                }} width={170} backgroundColor='#04BF7B'>
                    <Text fontSize={13} color='white'>{isBefore13Hours() && Platform.OS !== 'web' ? 'Agendar notificação' : 'Confirmar pedido'}</Text>
                </Button>
            </View>
        </Stack >
    )
}