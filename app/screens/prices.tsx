import { type NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Stack, Text, View, Image, Button, Input } from "tamagui";
import Icons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, VirtualizedList } from "react-native";
import React from "react";
import { DateTime } from 'luxon'
import { Picker } from "@react-native-picker/picker";
import { getToken, setStorage } from "../utils/utils";

type RootStackParamList = {
    Home: undefined;
    Products: undefined;
    Cart: undefined;
    Confirm: undefined
};

type HomeScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export interface Product {
    price: number;
    priceWithoutTax: number;
    name: string;
    sku: string;
    quant: number;
    orderQuant: number;
    obs: string;
    priceUnique: number;
    priceUniqueWithTaxAndDiscount: number;
    image: string[];
    orderUnit: string;
}

export interface Discount {
    orderValue: number;
    discount: number;
    orderWithoutTax: number;
    orderWithTax: number;
    tax: number;
    missingItens: number;
    orderValueFinish: number;
    products: Product[];
}

export interface Supplier {
    name: string;
    externalId: string;
    missingItens: number;
    minimumOrder: number;
    hour: string;
    discount: Discount;
    star: string
}

export interface SupplierData {
    supplier: Supplier;
}

type SelectItem = {
    name: string;
    addressInfos: any[]
}

const SupplierBox = ({ supplier, available, goToConfirm, selectedRestaurant }: { supplier: SupplierData, star: string, available: boolean, selectedRestaurant: any, goToConfirm: (supplier: SupplierData, selectedRestaurant: any) => void }) => {
    const isOpen = () => {
        const currentDate = DateTime.now().setZone('America/Sao_Paulo');
        const currentHour = Number(
            `${currentDate.hour.toString().length < 2 ? `0${currentDate.hour}` : currentDate.hour}${currentDate.minute.toString().length < 2 ? `0${currentDate.minute}` : currentDate.minute}${currentDate.second.toString().length < 2 ? `0${currentDate.second}` : currentDate.second}`
        );
        return (Number(supplier.supplier.hour.replaceAll(':', '')) < currentHour && supplier.supplier.missingItens > 0)
    }

    return (
        <View opacity={!isOpen() ? 1 : 0.4} onPress={() => {
            if (supplier.supplier.missingItens > 0) {
                goToConfirm(supplier, selectedRestaurant)
            }
        }} flexDirection="row" borderBottomWidth={0.1} borderBottomColor='lightgray'>
            <View flexDirection="row" f={1}>
                <View p={5}>
                    <Image source={{ uri: `https://cdn.conectarhortifruti.com.br/files/images/supplier/${supplier.supplier.externalId}.jpg` }}
                        style={{ width: 50, height: 50, borderRadius: 50 }} />
                </View>
                <View ml={10} justifyContent="center">
                    <Text fs={16}>{supplier.supplier.name}</Text>
                    <View flexDirection="row" alignItems="center">
                        <Icons color='orange' name="star"></Icons>
                        <Text pl={4}>{supplier.supplier.star}</Text>
                    </View>
                </View>
            </View>
            <View justifyContent="center">
                <View>
                    <Text textAlign="left" fontSize={16} fontWeight="800">R$ {supplier.supplier.discount.orderValueFinish.toFixed(2).replace('.', ',')}</Text>
                    {available ? (
                        <Text color={(supplier.supplier.discount.products.length - supplier.supplier.missingItens) > 0 ? 'red' : 'black'} fontSize={12}>{supplier.supplier.discount.products.length - supplier.supplier.missingItens} iten(s) faltante(s)</Text>
                    ) : (
                        isOpen() ? (
                            <Text color='red' fontSize={12}>Fechado às {supplier.supplier.hour.substring(0, 5)}</Text>
                        ) : (
                            <Text color='red' fontSize={12}>Mínimo R${supplier.supplier.minimumOrder.toFixed(2).replace('.', ',')}</Text>
                        )
                    )}
                </View>
            </View>
            <View pl={10} justifyContent="center">
                {!available && supplier.supplier.missingItens < 1 ?
                    <View></View>
                    :
                    <Icons name="chevron-forward" size={24}></Icons>
                }

            </View>
        </View>
    );
};

export function Prices({ navigation }: HomeScreenProps) {
    const [loading, setLoading] = useState<boolean>(true);
    const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
    const [unavailableSupplier, setUnavailableSupplier] = useState<SupplierData[]>([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState<any>()
    const [showRestInfo, setShowRestInfo] = useState<boolean>(false)
    const [minhours, setMinhours] = useState<string[]>([]);
    const [maxhours, setMaxhours] = useState<string[]>([]);
    const [minHour, setMinHour] = useState<string>('')
    const [maxHour, setMaxHour] = useState<string>('')
    const [editInfos, setEditInfos] = useState<boolean>(false)
    const [allRestaurants, setAllRestaurants] = useState<SelectItem[]>([])
    const [city, setCity] = useState<string>()
    const [zipCode, setZipCode] = useState<string>()
    const [localType, setLocalType] = useState<string>()
    const [street, setStreet] = useState<string>()
    const [localNumber, setLocalNumber] = useState<string>()
    const [neighborhood, setNeighborhood] = useState<string>()
    const [responsibleReceivingName, setResponsibleReceivingName] = useState<string>()
    const [responsibleReceivingPhoneNumber, setResponsibleReceivingPhoneNumber] = useState<string>()
    const [deliveryInformation, setDeliveryInformation] = useState<string>()
    const [complement, setComplement] = useState<string>()
    const [tab, setTab] = useState<string>('onlySupplier')

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleSelectedRest = async (rest: any) => {
        setSelectedRestaurant(rest)
        updateAddress(rest)
    }

    useEffect(() => {
        if (minHour) {
            let [minHourValue, minMinuteValue] = minHour.split(':').map(Number);
            let [maxHourValue, maxMinuteValue] = maxHour ? maxHour.split(':').map(Number) : [0, 0];

            // Adiciona 1h30m à minHour
            let hour = minHourValue + 1;
            let minute = minMinuteValue + 30;
            if (minute >= 60) {
                minute -= 60;
                hour += 1;
            }

            // Verifica se o maxHour existente é menor que o novo tempo
            const maxExistingInMinutes = maxHourValue * 60 + maxMinuteValue;
            const minPlus1Hour30InMinutes = hour * 60 + minute;

            if (maxExistingInMinutes < minPlus1Hour30InMinutes) {
                maxHourValue = hour;
                maxMinuteValue = minute;
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
            setMaxHour(`${String(maxHourValue).padStart(2, '0')}:${String(maxMinuteValue).padStart(2, '0')}`);
        } else {
            setMaxhours([]);
        }
    }, [maxHour, minHour]);


    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleChangeAddress = (minHour: string, maxHour: string, neigh: string) => {
        let newValue
        setSelectedRestaurant((prevValue: any) => {
            newValue = prevValue
            newValue.addressInfos[0].initialDeliveryTime = `2024-01-01T${minHour}:00.000Z`
            newValue.addressInfos[0].finalDeliveryTime = `2024-01-01T${maxHour}:00.000Z`
            return newValue
        })
        updateAddress(newValue)
    }

    const loadRestaurants = async () => {
        try {
            const token = await getToken();
            if (token == null) return [];
            const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/restaurant/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token
                })
            });
            if (!result.ok) return []
            const restaurants = await result.json();
            if (restaurants.data.length < 1) return []
            return restaurants.data
        } catch (error) {
            console.error('Erro ao carregar restaurantes:', error);
            return [];
        }
    }

    const goToConfirm = async (supplier: SupplierData, selectedRestaurant: any) => {
        try {
            setLoading(true)
            await setStorage('supplierSelected', JSON.stringify(supplier))
            await setStorage('restaurantSelected', JSON.stringify(selectedRestaurant))
            navigation.replace('Confirm')
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const loadPrices = useCallback(async (selectedRestaurant?: any) => {
        try {
            const token = await getToken();
            if (!token) return new Map();

            const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/price/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, selectedRestaurant: selectedRestaurant ?? items[0] })
            });
            const response = await result.json();
            const currentDate = DateTime.now().setZone('America/Sao_Paulo');
            const currentHour = Number(
                `${currentDate.hour.toString().length < 2 ? `0${currentDate.hour}` : currentDate.hour}${currentDate.minute.toString().length < 2 ? `0${currentDate.minute}` : currentDate.minute}${currentDate.second.toString().length < 2 ? `0${currentDate.second}` : currentDate.second}`
            );
            const supplier = (response.data as SupplierData[]).filter(item => {
                return Number(item.supplier.hour.replaceAll(':', '')) >= currentHour && item.supplier.minimumOrder <= item.supplier.discount.orderValueFinish && item.supplier.missingItens > 0;
            });
            const supplierUnavailable = (response.data as SupplierData[]).filter(item => (Number(item.supplier.hour.replaceAll(':', '')) < currentHour || item.supplier.minimumOrder > item.supplier.discount.orderValueFinish) && item.supplier.missingItens > 0);

            const sortedSuppliers = supplier.sort((a, b) => {
                const diffA = a.supplier.discount.products.length - a.supplier.missingItens;
                const diffB = b.supplier.discount.products.length - b.supplier.missingItens;

                if (diffA !== diffB) {
                    return diffA - diffB;
                }

                const notaA = a.supplier.star === '(NOVO)' ? 0 : Number(a.supplier.star)
                const notaB = b.supplier.star === '(NOVO)' ? 0 : Number(b.supplier.star)

                if (notaA !== notaB) {
                    return notaB - notaA
                }

                return a.supplier.discount.orderValueFinish - b.supplier.discount.orderValueFinish;
            });

            const sortedUnavailableSuppliers = supplierUnavailable.sort((a, b) => {
                // Converter horário para número para ambos fornecedores
                const hourA = Number(a.supplier.hour.replaceAll(':', ''));
                const hourB = Number(b.supplier.hour.replaceAll(':', ''));

                // Ordenar primeiro pelos horários de forma decrescente
                if (hourA !== hourB) {
                    return hourB - hourA;
                }

                // Se os horários forem iguais, ordenar pelos produtos de desconto e itens ausentes de forma crescente
                const diffA = a.supplier.discount.products.length - a.supplier.missingItens;
                const diffB = b.supplier.discount.products.length - b.supplier.missingItens;

                if (diffA !== diffB) {
                    return diffA - diffB;
                }

                const notaA = a.supplier.star === '(NOVO)' ? 0 : Number(a.supplier.star)
                const notaB = b.supplier.star === '(NOVO)' ? 0 : Number(b.supplier.star)

                if (notaA !== notaB) {
                    return notaB - notaA
                }

                // Se ambos os critérios acima forem iguais, ordenar pelo valor final do pedido de forma crescente
                return a.supplier.discount.orderValueFinish - b.supplier.discount.orderValueFinish;
            });


            setSuppliers(sortedSuppliers);
            setUnavailableSupplier(sortedUnavailableSuppliers);

        } catch (error) {
            console.error('Error loading products:', error);
        }
    }, []);

    const loadPricesAux = useCallback(async (rest: any) => {
        try {
            const token = await getToken();
            if (!token) return new Map();

            const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/price/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, selectedRestaurant: rest })
            });
            const response = await result.json();
            const currentDate = DateTime.now().setZone('America/Sao_Paulo');
            const currentHour = Number(
                `${currentDate.hour.toString().length < 2 ? `0${currentDate.hour}` : currentDate.hour}${currentDate.minute.toString().length < 2 ? `0${currentDate.minute}` : currentDate.minute}${currentDate.second.toString().length < 2 ? `0${currentDate.second}` : currentDate.second}`
            );
            const supplier = (response.data as SupplierData[]).filter(item => {
                return Number(item.supplier.hour.replaceAll(':', '')) >= currentHour && item.supplier.minimumOrder <= item.supplier.discount.orderValueFinish && item.supplier.missingItens > 0;
            });
            const supplierUnavailable = (response.data as SupplierData[]).filter(item => (Number(item.supplier.hour.replaceAll(':', '')) < currentHour || item.supplier.minimumOrder > item.supplier.discount.orderValueFinish) && item.supplier.missingItens > 0);

            const sortedSuppliers = supplier.sort((a, b) => {
                const diffA = a.supplier.discount.products.length - a.supplier.missingItens;
                const diffB = b.supplier.discount.products.length - b.supplier.missingItens;

                if (diffA !== diffB) {
                    return diffA - diffB;
                }

                const notaA = a.supplier.star === '(NOVO)' ? 0 : Number(a.supplier.star)
                const notaB = b.supplier.star === '(NOVO)' ? 0 : Number(b.supplier.star)

                if (notaA !== notaB) {
                    return notaB - notaA
                }

                return a.supplier.discount.orderValueFinish - b.supplier.discount.orderValueFinish;
            });

            const sortedUnavailableSuppliers = supplierUnavailable.sort((a, b) => {
                // Converter horário para número para ambos fornecedores
                const hourA = Number(a.supplier.hour.replaceAll(':', ''));
                const hourB = Number(b.supplier.hour.replaceAll(':', ''));

                // Ordenar primeiro pelos horários de forma decrescente
                if (hourA !== hourB) {
                    return hourB - hourA;
                }

                // Se os horários forem iguais, ordenar pelos produtos de desconto e itens ausentes de forma crescente
                const diffA = a.supplier.discount.products.length - a.supplier.missingItens;
                const diffB = b.supplier.discount.products.length - b.supplier.missingItens;

                if (diffA !== diffB) {
                    return diffA - diffB;
                }

                const notaA = a.supplier.star === '(NOVO)' ? 0 : Number(a.supplier.star)
                const notaB = b.supplier.star === '(NOVO)' ? 0 : Number(b.supplier.star)

                if (notaA !== notaB) {
                    return notaB - notaA
                }

                // Se ambos os critérios acima forem iguais, ordenar pelo valor final do pedido de forma crescente
                return a.supplier.discount.orderValueFinish - b.supplier.discount.orderValueFinish;
            });


            setSuppliers(sortedSuppliers);
            setUnavailableSupplier(sortedUnavailableSuppliers);

        } catch (error) {
            console.error('Error loading products:', error);
        }
    }, []);

    useEffect(() => {
        const loadPricesAsync = async () => {
            try {
                const restaurants = await loadRestaurants()
                items = restaurants
                setMinHour(items[0].addressInfos[0].initialDeliveryTime.substring(11, 15))
                setSelectedRestaurant(items[0])
                setAllRestaurants(items)
                await loadPrices();
                const hours = [];
                for (let hour = 0; hour < 22; hour++) {
                    hours.push(`${String(hour).padStart(2, '0')}:00`);
                    hours.push(`${String(hour).padStart(2, '0')}:30`);
                }
                hours.push('22:00')
                setMinhours(hours);
                setMinHour(items[0].addressInfos[0].initialDeliveryTime.substring(11, 16))
                setMaxHour(items[0].addressInfos[0].finalDeliveryTime.substring(11, 16))
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadPricesAsync();
    }, [loadPrices]);

    const updateAddress = async (rest: any) => {
        try {
            setLoading(true)
            setMinHour(rest.addressInfos[0].initialDeliveryTime.substring(11, 15))
            setSelectedRestaurant(rest)
            await loadPricesAux(rest)
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const combinedSuppliers = useMemo(() => {

        const itens: any[] = [];
        if (suppliers.length) itens.push({ initialSeparator: true })
        itens.push(...suppliers.map(item => ({ ...item, available: true })))
        if (unavailableSupplier.length) itens.push({ separator: true })
        itens.push(...unavailableSupplier.map(item => ({ ...item, available: false })))

        return itens
    }, [suppliers, unavailableSupplier]);

    const getItem = (data: SupplierData[], index: number) => data[index];
    const getItemCount = (data: SupplierData[]) => data.length;
    const renderItem =
        ({ item }: { item: any }) => {
            if (item.separator) {
                return <Text pb={10} pt={10} opacity={60} fontSize={12}>Fornecedores indisponíveis</Text>
            }
            if (item.initialSeparator) {
                return <Text pb={5} opacity={60} mt={10} fontSize={12}>Fornecedores disponíveis</Text>
            }
            return <SupplierBox supplier={item} star={item.star} available={item.available} selectedRestaurant={selectedRestaurant} goToConfirm={goToConfirm} />;
        }

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#04BF7B" />
            </View>
        );
    }

    return (
        <Stack pt={20} style={{ backgroundColor: '#F0F2F6', height: '100%', position: 'relative' }}>
            <View style={{ height: 50, flex: 1, paddingTop: 20 }}>
                <View height={50} pb={20} alignItems='center' style={{ alignItems: 'center', paddingLeft: 20, paddingRight: 20, flexDirection: 'row' }}>
                    <Icons onPress={() => { navigation.replace('Cart') }} size={25} name='chevron-back'></Icons>
                    <Text f={1} textAlign='center' fontSize={20}>Cotações</Text>
                </View>
                <View borderRadius={50} flexDirection="row" justifyContent="space-between" height={50}>
                    <View onPress={() => { setTab('plus') }} cursor="pointer" hoverStyle={{ opacity: 0.75 }}
                        {...tab !== 'onlySupplier' ? { borderBottomColor: 'gray', borderBottomWidth: 0.5 } : {}}
                        {...tab === 'onlySupplier' ? { backgroundColor: 'white' } : {}}
                        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <Text>Conéctar+</Text>
                    </View>
                    <View onPress={() => { setTab('onlySupplier') }} cursor="pointer" hoverStyle={{ opacity: 0.75 }}
                        {...tab === 'onlySupplier' ? { borderBottomColor: 'gray', borderBottomWidth: 0.5 } : {}}
                        {...tab !== 'onlySupplier' ? { backgroundColor: 'white' } : {}} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <Text>Por fornecedor</Text>
                    </View>
                </View>

                <View style={{ backgroundColor: 'white', flex: 1, paddingHorizontal: 5 }}>
                    <View p={10} paddingTop={0} height='100%'>
                        {tab === 'onlySupplier' &&
                            <VirtualizedList
                                style={{ marginBottom: 5, flexGrow: 1 }}
                                data={combinedSuppliers}
                                getItemCount={getItemCount}
                                getItem={getItem}
                                keyExtractor={(item, index) => item.supplier ? item.supplier.name : `separator-${index}`}
                                renderItem={renderItem}
                                ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
                                initialNumToRender={10}
                                windowSize={4}
                                scrollEnabled={true}
                            />}
                            {
                                tab !== 'onlySupplier' && 
                                <View p={20} mt={10}>
                                    <Text pb={10} pt={10} opacity={60} fontSize={12}>Minhas combinações</Text>
                                </View>
                            }

                    </View>
                </View>
                <View onPress={() => {
                    setNeighborhood(selectedRestaurant.addressInfos[0].neighborhood)
                    setCity(selectedRestaurant.addressInfos[0].city)
                    setLocalType(selectedRestaurant.addressInfos[0].localType)
                    setLocalNumber(selectedRestaurant.addressInfos[0].localNumber)
                    setResponsibleReceivingName(selectedRestaurant.addressInfos[0].responsibleReceivingName)
                    setResponsibleReceivingPhoneNumber(selectedRestaurant.addressInfos[0].responsibleReceivingPhoneNumber)
                    setZipCode(selectedRestaurant.addressInfos[0].zipCode.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2'))
                    setStreet(selectedRestaurant.addressInfos[0].address)
                    setComplement(selectedRestaurant.addressInfos[0].complement)
                    setDeliveryInformation(selectedRestaurant.addressInfos[0].deliveryInformation)
                    setEditInfos(true)
                }} backgroundColor='#F0F2F6' paddingBottom={10} paddingTop={10} paddingHorizontal={20}>
                    <View flexDirection="row" alignItems="center">
                        <View p={10} mr={10} flexDirection="row" f={1} borderColor='lightgray' borderRadius={5} borderWidth={1} paddingHorizontal={10} backgroundColor='white' alignItems="center">
                            <Icons size={20} color='gray' name="storefront"></Icons>
                            <View ml={20}></View>
                            <Text fontSize={12}>{selectedRestaurant.name}</Text>
                        </View>
                        <View p={10} mr={10} flexDirection="row" f={1} borderColor='lightgray' borderRadius={5} borderWidth={1} paddingHorizontal={10} backgroundColor='white' alignItems="center">
                            <Icons size={20} color='gray' name="time"></Icons>
                            <View ml={20}></View>
                            <Text fontSize={12}>{selectedRestaurant.addressInfos[0].initialDeliveryTime.substring(11, 16)} - {selectedRestaurant.addressInfos[0].finalDeliveryTime.substring(11, 16)}</Text>
                        </View>
                        <Icons size={20} onPress={() => { setShowRestInfo(!showRestInfo) }} name={showRestInfo ? "chevron-up" : "chevron-down"}></Icons>
                    </View>
                    {/* <Text pl={5} display={showRestInfo ? "none" : "flex"} pt={5} color='gray' fontSize={12}>
                        {selectedRestaurant.addressInfos[0].localType} {selectedRestaurant.addressInfos[0].address}, {selectedRestaurant.addressInfos[0].localNumber}. {selectedRestaurant.addressInfos[0].complement} - {selectedRestaurant.addressInfos[0].neighborhood}, {selectedRestaurant.addressInfos[0].city}
                    </Text> */}
                    <View display={showRestInfo ? "flex" : "none"}>
                        <View pt={5} flexDirection="row" alignItems="center">
                            <View p={10} mr={10} flexDirection="row" f={1} borderColor='lightgray' borderRadius={5} borderWidth={1} paddingHorizontal={10} backgroundColor='white' alignItems="center">
                                <Icons size={20} color='gray' name="location"></Icons>
                                <View ml={20}></View>
                                <Text numberOfLines={1} overflow="scroll" ellipsizeMode="tail" fontSize={12}>{selectedRestaurant.addressInfos[0].localType} {selectedRestaurant.addressInfos[0].address}, {selectedRestaurant.addressInfos[0].localNumber}. {selectedRestaurant.addressInfos[0].complement} - {selectedRestaurant.addressInfos[0].neighborhood}, {selectedRestaurant.addressInfos[0].city}</Text>
                            </View>
                            <View p={10} mr={10} flexDirection="row" f={1} borderColor='lightgray' borderRadius={5} borderWidth={1} paddingHorizontal={10} backgroundColor='white' alignItems="center">
                                <Icons size={20} color='gray' name="chatbox"></Icons>
                                <View ml={20}></View>
                                <Text fontSize={12}>{selectedRestaurant.addressInfos[0].deliveryInformation}</Text>
                            </View>
                        </View>
                        <View pt={5} flexDirection="row" alignItems="center">
                            <View p={10} mr={10} flexDirection="row" f={1} borderColor='lightgray' borderRadius={5} borderWidth={1} paddingHorizontal={10} backgroundColor='white' alignItems="center">
                                <Icons size={20} color='gray' name="person"></Icons>
                                <View ml={20}></View>
                                <Text fontSize={12}>{selectedRestaurant.addressInfos[0].responsibleReceivingName}</Text>
                            </View>
                            <View p={10} mr={10} flexDirection="row" f={1} borderColor='lightgray' borderRadius={5} borderWidth={1} paddingHorizontal={10} backgroundColor='white' alignItems="center">
                                <Icons size={20} color='gray' name="call"></Icons>
                                <View ml={20}></View>
                                <Text fontSize={12}>{selectedRestaurant.addressInfos[0].responsibleReceivingPhoneNumber}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                {editInfos && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>

                        <Modal
                            transparent={true}
                        >
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' }}>
                                <View pb={15} paddingHorizontal={15} pt={15} $xl={{ minWidth: '40%' }} $sm={{ minWidth: '90%' }} style={{ backgroundColor: 'white', borderRadius: 10, justifyContent: 'center' }}>
                                    <Text pl={5} fontSize={12} color='gray'>Restaurante</Text>
                                    <Picker onValueChange={(value) => {
                                        setLoading(true)
                                        const rest = allRestaurants.find((item) => { if (item.name === value) return item })
                                        setSelectedRestaurant(rest)
                                        setNeighborhood(rest?.addressInfos[0].neighborhood)
                                        setCity(rest?.addressInfos[0].city)
                                        setLocalType(rest?.addressInfos[0].localType)
                                        setLocalNumber(rest?.addressInfos[0].localNumber)
                                        setResponsibleReceivingName(rest?.addressInfos[0].responsibleReceivingName)
                                        setResponsibleReceivingPhoneNumber(rest?.addressInfos[0].responsibleReceivingPhoneNumber)
                                        setZipCode(rest?.addressInfos[0].zipCode.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2'))
                                        setStreet(rest?.addressInfos[0].address)
                                        setComplement(rest?.addressInfos[0].complement)
                                        setDeliveryInformation(rest?.addressInfos[0].deliveryInformation)
                                        setMaxHour(rest?.addressInfos[0].finalDeliveryTime.substring(11, 16))
                                        setMinHour(rest?.addressInfos[0].initialDeliveryTime.substring(11, 16))
                                        setLoading(false)
                                    }} selectedValue={selectedRestaurant.name} style={{ padding: 10, borderColor: 'lightgray', borderRadius: 5 }}>
                                        {allRestaurants.map((item) => (<Picker.Item label={item.name} key={item.name} />))}
                                    </Picker>
                                    <View pt={15} gap={5} justifyContent="space-between" flexDirection="row">
                                        <View style={{ flex: 1 }}>
                                            <Text pl={5} fontSize={12} color='gray'>A partir de</Text>
                                            <Picker onValueChange={setMinHour} selectedValue={minHour} style={{ padding: 10, borderColor: 'lightgray', borderRadius: 5 }}>
                                                {minhours.map((item) => (<Picker.Item label={item} key={item} />))}
                                            </Picker>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text pl={5} fontSize={12} color='gray'>Até</Text>
                                            <Picker onValueChange={setMaxHour} selectedValue={maxHour} style={{ padding: 10, borderColor: 'lightgray', borderRadius: 5, color: 'black' }}>
                                                {maxhours.map((item) => (<Picker.Item label={item} key={item} />))}
                                            </Picker>
                                        </View>
                                    </View>
                                    <Text pt={15} pl={5} fontSize={12} color='gray'>Cep</Text>
                                    <Input maxLength={9} backgroundColor='white' borderColor='lightgray' borderRadius={5} onChangeText={async (value) => {
                                        const cleaned = value.replace(/\D/g, '');
                                        const formatted = cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');

                                        if (formatted.length === 9) {
                                            setLoading(true)
                                            const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${formatted}`)
                                            const result = await response.json()
                                            if (response.ok) {
                                                const street = result.street.split(' ')
                                                street.shift()
                                                console.log(street)
                                                setCity(result.city.toUpperCase())
                                                setNeighborhood(result.neighborhood.toUpperCase())
                                                setLocalType(result.street.split(' ')[0].toUpperCase())
                                                setLocalNumber('')
                                                setStreet(street.join(' ').toUpperCase())
                                            }
                                            setLoading(false)
                                        }

                                        setZipCode(formatted);
                                    }} value={zipCode} />
                                    <Text pt={15} pl={5} fontSize={12} color='gray'>Logradouro</Text>
                                    <View flexDirection="row">
                                        <Picker onValueChange={setLocalType} selectedValue={(localType ?? 'RUA').toUpperCase()} style={{ flex: 1, padding: 10, fontSize: 10, borderColor: 'lightgray', borderRadius: 5, color: 'black', borderTopRightRadius: 0, borderBottomRightRadius: 0, maxWidth: 150, overflow: 'visible' }}>
                                            <Picker.Item label="ALAMEDA" key="ALAMEDA" />
                                            <Picker.Item label="AVENIDA" key="AVENIDA" />
                                            <Picker.Item label="BECO" key="BECO" />
                                            <Picker.Item label="BOULEVARD" key="BOULEVARD" />
                                            <Picker.Item label="CAMINHO" key="CAMINHO" />
                                            <Picker.Item label="CHÁCARA" key="CHÁCARA" />
                                            <Picker.Item label="CIRCUITO" key="CIRCUITO" />
                                            <Picker.Item label="CONJUNTO" key="CONJUNTO" />
                                            <Picker.Item label="EIXO" key="EIXO" />
                                            <Picker.Item label="ESTAÇÃO" key="ESTAÇÃO" />
                                            <Picker.Item label="ESTRADA" key="ESTRADA" />
                                            <Picker.Item label="FAVELA" key="FAVELA" />
                                            <Picker.Item label="JARDIM" key="JARDIM" />
                                            <Picker.Item label="LADEIRA" key="LADEIRA" />
                                            <Picker.Item label="LARGO" key="LARGO" />
                                            <Picker.Item label="PARQUE" key="PARQUE" />
                                            <Picker.Item label="PASSARELA" key="PASSARELA" />
                                            <Picker.Item label="PASSEIO" key="PASSEIO" />
                                            <Picker.Item label="PRAÇA" key="PRAÇA" />
                                            <Picker.Item label="QUADRA" key="QUADRA" />
                                            <Picker.Item label="RAMPA" key="RAMPA" />
                                            <Picker.Item label="RODOVIA" key="RODOVIA" />
                                            <Picker.Item label="RUA" key="RUA" />
                                            <Picker.Item label="TRAVESSA" key="TRAVESSA" />
                                            <Picker.Item label="VIA" key="VIA" />
                                            <Picker.Item label="VIADUTO" key="VIADUTO" />
                                            <Picker.Item label="VIELA" key="VIELA" />
                                            <Picker.Item label="VILA" key="VILA" />
                                        </Picker>
                                        <Input onChangeText={(value) => {
                                            const formattedValue = value.replace(/[^A-Za-z\s]/g, '')
                                            setStreet(formattedValue);
                                        }} flex={1} backgroundColor='white' borderColor='lightgray' borderRadius={5} borderTopLeftRadius={0} borderBottomLeftRadius={0} value={street} />
                                    </View>
                                    <View height={70} pt={15} gap={5} justifyContent="space-between" flexDirection="row">
                                        <View style={{ flex: 1 }}>
                                            <Text pl={5} fontSize={12} color='gray'>Nº</Text>
                                            <Input
                                                fontSize={14}
                                                flex={1}
                                                backgroundColor='white'
                                                borderColor='lightgray'
                                                borderRadius={5}
                                                value={localNumber}
                                                keyboardType="numeric"
                                                onChangeText={(value) => {
                                                    const formattedValue = value.replace(/[^0-9]/g, '');
                                                    setLocalNumber(formattedValue);
                                                }}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text pl={5} fontSize={12} color='gray'>Bairro</Text>
                                            <Input color='gray' fontSize={14} disabled flex={1} backgroundColor='white' borderColor='lightgray' borderRadius={5} value={neighborhood} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text pl={5} fontSize={12} color='gray'>Cidade</Text>
                                            <Input color='gray' fontSize={14} disabled flex={1} backgroundColor='white' borderColor='lightgray' borderRadius={5} value={city} />
                                        </View>
                                    </View>
                                    <View height={70} pt={15} gap={5} justifyContent="space-between" flexDirection="row">
                                        <View style={{ flex: 1 }}>
                                            <Text pl={5} fontSize={12} color='gray'>Resp. recebimento</Text>
                                            <Input
                                                fontSize={14}
                                                flex={1}
                                                backgroundColor='white'
                                                borderColor='lightgray'
                                                borderRadius={5}
                                                value={responsibleReceivingName}
                                                onChangeText={(value) => {
                                                    // Remove todos os caracteres que não sejam letras ou espaços
                                                    const formattedValue = value.replace(/[^A-Za-z\s]/g, '');
                                                    setResponsibleReceivingName(formattedValue);
                                                }}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text pl={5} fontSize={12} color='gray'>Cel Resp. recebimento</Text>
                                            <Input
                                                maxLength={15}
                                                fontSize={14}
                                                flex={1}
                                                backgroundColor='white'
                                                borderColor='lightgray'
                                                borderRadius={5}
                                                value={responsibleReceivingPhoneNumber}
                                                keyboardType="phone-pad"
                                                onChangeText={(value) => {
                                                    // Remove todos os caracteres que não sejam dígitos
                                                    let onlyNums = value.replace(/\D/g, '');

                                                    if (onlyNums.length > 10) {
                                                        // Formato moderno (celular): (XX) XXXXX-XXXX
                                                        onlyNums = onlyNums.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
                                                    } else if (onlyNums.length > 6) {
                                                        // Formato convencional (fixo): (XX) XXXX-XXXX
                                                        onlyNums = onlyNums.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
                                                    } else if (onlyNums.length > 2) {
                                                        // Formato parcial: (XX) XXXX
                                                        onlyNums = onlyNums.replace(/(\d{2})(\d{0,4})/, '($1) $2');
                                                    } else if (onlyNums.length > 0) {
                                                        // Formato parcial: (XX
                                                        onlyNums = onlyNums.replace(/(\d{0,2})/, '($1');
                                                    }

                                                    setResponsibleReceivingPhoneNumber(onlyNums);
                                                }}
                                            />
                                        </View>
                                    </View>
                                    <View height={70} pt={15} gap={5} justifyContent="space-between" flexDirection="row">
                                        <View style={{ flex: 1 }}>
                                            <Text pl={5} fontSize={12} color='gray'>Info de entrega</Text>
                                            <Input
                                                fontSize={14}
                                                flex={1}
                                                backgroundColor='white'
                                                borderColor='lightgray'
                                                borderRadius={5}
                                                value={deliveryInformation}
                                                onChangeText={(value) => {
                                                    setDeliveryInformation(value);
                                                }}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text pl={5} fontSize={12} color='gray'>Complemento</Text>
                                            <Input
                                                fontSize={14}
                                                flex={1}
                                                backgroundColor='white'
                                                borderColor='lightgray'
                                                borderRadius={5}
                                                value={complement}
                                                onChangeText={(value) => {
                                                    setComplement(value);
                                                }}
                                            />
                                        </View>
                                    </View>
                                    <View height={70} pt={15} gap={5} justifyContent="space-between" flexDirection="row">
                                        <Button onPress={() => setEditInfos(false)} backgroundColor='black' style={{ flex: 1 }}>
                                            <Text pl={5} fontSize={12} color='white'>Cancelar</Text>
                                        </Button>
                                        <Button onPress={async () => {
                                            setLoading(true)
                                            const rest: SelectItem = selectedRestaurant
                                            const addressInfo = rest.addressInfos[0]

                                            addressInfo.neighborhood = neighborhood
                                            addressInfo.city = city
                                            addressInfo.localType = localType
                                            addressInfo.localNumber = localNumber
                                            addressInfo.responsibleReceivingName = responsibleReceivingName;
                                            addressInfo.responsibleReceivingPhoneNumber = responsibleReceivingPhoneNumber;
                                            addressInfo.zipCode = zipCode?.replaceAll(' ', '').replace('-', '')
                                            addressInfo.address = street;
                                            addressInfo.complement = complement;
                                            addressInfo.deliveryInformation = deliveryInformation;
                                            addressInfo.finalDeliveryTime = `1970-01-01T${maxHour}:00.000Z`;
                                            addressInfo.initialDeliveryTime = `1970-01-01T${minHour}:00.000Z`;

                                            await Promise.all([loadPrices(rest), fetch(`${process.env.EXPO_PUBLIC_API_URL}/address/update`, {
                                                body: JSON.stringify({
                                                    ...rest
                                                }),
                                                headers: {
                                                    'Content-Type': 'application/json'
                                                },
                                                method: 'POST'
                                            })])

                                            setEditInfos(false)
                                            setLoading(false)
                                        }} backgroundColor='#04BF7B' style={{ flex: 1 }}>
                                            <Text pl={5} fontSize={12} color='white'>Salvar</Text>
                                        </Button>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </View>
                )}
            </View>
        </Stack>
    );
}

let items: SelectItem[] = []
