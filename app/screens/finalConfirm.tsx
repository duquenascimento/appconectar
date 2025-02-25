import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View, Image, Text, Button } from "tamagui";
import Icons from '@expo/vector-icons/Ionicons';
import { SupplierData } from "./prices";
import { useCallback, useEffect, useState } from "react";
import { clearStorage, getStorage } from "../utils/utils";

type RootStackParamList = {
    Home: undefined;
    Products: undefined;
    Cart: undefined;
    Prices: undefined;
};

type HomeScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

interface RestaurantInfo {
    restName: string;
    address: string;
    maxHour: string;
    minHour: string;
    deliveryDateFormated: string;
    paymentWay: string;
}

interface PaymentDescriptions {
    [key: string]: string;
}


export function FinalConfirm({ navigation }: HomeScreenProps) {
    const [supplier, setSupplier] = useState<SupplierData>();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [deliveryData, setDeliveryData] = useState<RestaurantInfo>();
    const loadSupplier = useCallback(async () => {
        const supplierText = await getStorage('supplierSelected')
        const deliveryDataText = await getStorage('finalConfirmData')
        if (supplierText) {
            const supplier = JSON.parse(supplierText)
            setSupplier(supplier)
        }
        if (deliveryDataText) {
            const deliveryDataResult = JSON.parse(deliveryDataText)
            setDeliveryData(deliveryDataResult)
        }
        await clearStorage()
    }, [])
    useEffect(() => {
        const loadSupplierAsync = async () => {
            try {
                await loadSupplier()
            } catch (err) {
                console.error(err)
                navigation.replace('Prices')
            }

        }
        loadSupplierAsync()
    }, [loadSupplier, navigation])

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    return (
        <View padding={30} backgroundColor='#F0F2F6' f={1} justifyContent="center" alignItems="center">
            <Icons size={90} color='#04BF7B' name="checkmark-circle"></Icons>
            <Text pb={25} fontSize={30}>Pedido confirmado!</Text>
            <View padding={15} backgroundColor='white' borderRadius={5} width='80%'>
                <View borderBottomColor='gray' borderBottomWidth={0.5} flexDirection="row">
                    <Image source={{ uri: `https://cdn.conectarhortifruti.com.br/files/images/supplier/${supplier?.supplier.externalId}.jpg` }}
                        width={50} height={50} borderRadius={50}/>
                    <View ml={5} justifyContent="center" f={1}>
                        <Text>{supplier?.supplier.name}</Text>
                        <View alignItems="center" flexDirection="row">
                            <Icons color='orange' name="star"></Icons>
                            <Text color='gray' pl={4}>{supplier?.supplier.star}</Text>
                        </View>
                    </View>
                    <View pr={5} justifyContent="center">
                        <Text fontSize={16} fontWeight='800'>R$ {supplier?.supplier.discount.orderValueFinish.toString().replace('.', ',')}</Text>
                    </View>
                </View>
                <View alignItems="center" mt={15} flexDirection="row">
                    <Icons size={20} name="location"></Icons>
                    <View ml={10}>
                        <Text fontSize={16}>{deliveryData?.restName}</Text>
                        <Text fontSize={12}>{deliveryData?.address}</Text>
                    </View>
                </View>
                <View alignItems="center" mt={15} flexDirection="row">
                    <Icons size={20} name="time"></Icons>
                    <View ml={10}>
                        <Text fontSize={16}>Entre {deliveryData?.minHour} e {deliveryData?.maxHour}</Text>
                        <Text fontSize={12}>{deliveryData?.deliveryDateFormated}</Text>
                    </View>
                </View>
                <View alignItems="center" mt={15} flexDirection="row">
                    <Icons size={20} name="cash"></Icons>
                    <View ml={10}>
                        <Text fontSize={16}>Venc. {getPaymentDate(deliveryData?.paymentWay ?? '')}</Text>
                        <Text fontSize={12}>{getPaymentDescription(deliveryData?.paymentWay ?? '')}</Text>
                    </View>
                </View>
                <View paddingTop={40}>
                    <Button onPress={async () => {
                        navigation.replace('Products')
                    }} backgroundColor='#04BF7B'><Icons size={20} color='white' name="checkmark"></Icons></Button>
                </View>
                {/* <View alignItems="center" mt={15} flexDirection="row">
                    <Icons size={20} name="location"></Icons>
                    <View ml={10}>
                        <Text fontSize={16}>{deliveryData?.restName}</Text>
                        <Text fontSize={12}>{deliveryData?.address.toUpperCase()}</Text>
                    </View>
                </View>
                <View alignItems="center" mt={15} flexDirection="row">
                    <Icons size={20} name="time"></Icons>
                    <View ml={10}>
                        <Text fontSize={16}>Entre {deliveryData?.minHour} e {deliveryData?.maxHour}</Text>
                        <Text fontSize={12}>{new Date(deliveryData?.deliveryDateFormated as string).toLocaleDateString('pt-BR')}</Text>
                    </View>
                </View>
                <View alignItems="center" mt={15} flexDirection="row">
                    <Icons size={20} name="cash"></Icons>
                    <View ml={10}>
                        <Text fontSize={16}>Venc. {getPaymentDate(deliveryData?.paymentWay as string)}</Text>
                        <Text fontSize={12}>{getPaymentDescription(deliveryData?.paymentWay as string)}</Text>
                    </View>
                </View>
                <View paddingTop={40}>
                    <Button onPress={async () => {
                        navigation.replace('Products')
                    }} backgroundColor='#04BF7B'><Icons size={20} color='white' name="checkmark"></Icons></Button>
                </View> */}
            </View>
        </View>
    )
}