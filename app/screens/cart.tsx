import {
    View,
    Text,
    Stack,
    Button,
    XStack,
    Input,
    Image,
    debounce
} from 'tamagui';
import Icons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Modal, Platform, TouchableOpacity, VirtualizedList } from 'react-native';
import { deleteStorage, getStorage, getToken, setStorage } from '../utils/utils';
import DialogInstanceNotification from '../../src/components/modais/DialogInstanceNotification';

type RootStackParamList = {
    Home: undefined;
    Products: undefined;
    Prices: undefined
};

type HomeScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

type Product = {
    name: string;
    orderUnit: string;
    quotationUnit: string;
    convertedWeight: number;
    class: string;
    sku: string;
    id: string;
    active: true;
    createdBy: string;
    createdAt: string;
    changedBy: string;
    updatedAt: string;
    image: string[];
    favorite?: boolean;
    obs?: string;
    amount?: number;
    mediumWeight: number
    firstUnit: number
    secondUnit: number
    thirdUnit: number
};

type TCart = {
    productId: string
    amount: number
    obs: string
}

type ProductBoxProps = Product & { saveCart: (cart: TCart, isCart: boolean) => Promise<void>, cart: Map<string, TCart>, cartInside: Map<string, TCart>, setConfirmDeleteItem: (cart: TCart) => void};

const ProductBox = React.memo((produto: ProductBoxProps) => {
    const [open, setOpen] = useState(false);
    const [quant, setQuant] = useState(produto.firstUnit ? produto.firstUnit : 1);
    const [valueQuant, setValueQuant] = useState(Number(produto.amount) || 0);
    const [obsC, setObs] = useState(produto.obs);

    const obsRef = useRef('');
    const quantRef = useRef(produto.firstUnit ? produto.firstUnit : 1);
    const handleObsChange = (text: string) => {setObs(text); setObs(text)};

    const isCart = useMemo(() => {
        return produto.cart.has(produto.id);
    }, [produto.cart, produto.id]);

    useEffect(() => {
        const cartProduct = produto.cart.get(produto.id);
        if (cartProduct) {
            obsRef.current = cartProduct.obs;
            setObs(cartProduct.obs);
            setValueQuant(Number(cartProduct.amount));
        }
    }, [produto.cart, produto.id]);


    const handleValueQuantChange = (delta: number) => {
        setValueQuant(prevValue => {
            const newValue = Number((prevValue + delta).toFixed(3));
            if (newValue > 0) {
                return newValue;
            }
            produto.setConfirmDeleteItem({ amount: valueQuant, productId: produto.id, obs: obsRef.current });
            return prevValue; // Mantém o valor anterior se for zero ou negativo
        });
    };

    const toggleOpen = useCallback(() => setOpen(prev => !prev), []);

    useEffect(() => {
        if (isCart) {
            produto.saveCart({ amount: valueQuant, productId: produto.id, obs: obsC ?? '' }, isCart);
        }
    }, [valueQuant, isCart, produto.id, produto.saveCart, obsC]);


    const handleQuantityChange = (newQuant: number) => {
        setQuant(newQuant);
        quantRef.current = newQuant;
    };

    return (
        <View flex={1} minHeight={40} borderWidth={1} borderRadius={12} borderColor="#F0F2F6">
            <View onPress={toggleOpen} flex={1} justifyContent="space-between" alignItems="center" paddingHorizontal={8} flexDirection="row" minHeight={40} backgroundColor="white" borderRadius={12} borderBottomLeftRadius={open ? 0 : 12} borderBottomRightRadius={open ? 0 : 12}>
                <View flexDirection="row" alignItems="center">
                    <View p={Platform.OS === 'web' ? 10 : 5}>
                        <View>
                            <Image source={{ uri: produto.image[0] }} width={60} height={60} />
                        </View>
                        <View
                            ml={Platform.OS === 'web' ? 10 : 5}
                            onPress={() => {
                                produto.setConfirmDeleteItem({ amount: valueQuant, productId: produto.id, obs: obsRef.current });
                            }}
                            backgroundColor="black"
                            borderRadius={10}
                            width={25}
                            height={25}
                            alignItems="center"
                            justifyContent="center"
                            borderColor="white"
                            borderWidth={1}
                            cursor="pointer"
                            position="absolute"
                            bottom={3}
                            left={0}
                        >
                            <Icons name='trash-bin' color='white' size={15} />
                        </View>
                    </View>
                    <View marginLeft={8} maxWidth={162}>
                        <Text fontSize={12}>{produto.name}</Text>
                        <Text color="#aaa" fontSize={10}>
                            Obs.: {obsC || '--'}
                        </Text>
                    </View>
                </View>
                <View mr={Platform.OS === 'web' ? 10 : 5} gap={Platform.OS === 'web' ? 15 : 0} flexDirection="row" alignItems="center">
                    <Text fontWeight="800">{valueQuant} {produto.orderUnit.replace('Unid', 'Un')}</Text>
                    <Icons name={open ? "chevron-up" : "chevron-down"} paddingLeft={10} size={25} color="lightgray" />
                </View>
            </View>
            {open && (
                <View borderTopColor="#ccc" borderTopWidth={1} minHeight={Platform.OS === 'web' ? 50 : 85} paddingHorizontal={8} gap={8} borderBottomWidth={0} borderBottomLeftRadius={12} borderBottomRightRadius={12} backgroundColor="white" justifyContent="center">
                    <View paddingHorizontal={Platform.OS === 'web' ? 10 : 5} flexDirection="row" alignItems="center" marginTop={Platform.OS === 'web' ? 0 : 10}>
                        <View justifyContent={Platform.OS === 'web' ? 'flex-end' : 'flex-start'} flex={1} alignItems='center' mr={Platform.OS === 'web' ? 35 : 0} flexDirection="row" gap={8}>
                            {Platform.OS === 'web' && (
                                <View alignSelf="flex-start" flex={1}>
                                    <XStack backgroundColor="#F0F2F6" paddingRight={14} borderWidth={0} borderRadius={20} alignItems="center" flexDirection="row" zIndex={20} height={36}>
                                        <Input
                                            focusVisibleStyle={{ outlineWidth: 0 }}
                                            placeholder="Observação para entrega..."
                                            backgroundColor="transparent"
                                            borderWidth={0}
                                            borderColor="transparent"
                                            flex={1}
                                            fontSize={10}
                                            maxLength={999}
                                            onChangeText={handleObsChange}
                                            value={obsC}
                                        />
                                    </XStack>
                                </View>
                            )}
                            <Button
                                onPress={() => handleQuantityChange(produto.firstUnit ? produto.firstUnit : 1)}
                                backgroundColor={quant === (produto.firstUnit ? produto.firstUnit : 1) ? '#0BC07D' : '#F0F2F6'}
                                height={30}
                                minWidth={48}
                                borderRadius={12}
                            >
                                <Text color={quant === (produto.firstUnit ? produto.firstUnit : 1) ? '#fff' : '#000'}>{produto.firstUnit ? produto.firstUnit : 1}</Text>
                            </Button>
                            <Button
                                onPress={() => handleQuantityChange(produto.secondUnit ? produto.secondUnit : 5)}
                                backgroundColor={quant === (produto.secondUnit ? produto.secondUnit : 5) ? '#0BC07D' : '#F0F2F6'}
                                height={30}
                                minWidth={48}
                                borderRadius={12}
                            >
                                <Text color={quant === (produto.secondUnit ? produto.secondUnit : 5) ? '#fff' : '#000'}>{produto.secondUnit ? produto.secondUnit : 5}</Text>
                            </Button>
                            <Button
                                onPress={() => handleQuantityChange(produto.thirdUnit ? produto.thirdUnit : 10)}
                                backgroundColor={quant === (produto.thirdUnit ? produto.thirdUnit : 10) ? '#0BC07D' : '#F0F2F6'}
                                height={30}
                                minWidth={48}
                                borderRadius={12}
                            >
                                <Text color={quant === (produto.thirdUnit ? produto.thirdUnit : 10) ? '#fff' : '#000'}>{produto.thirdUnit ? produto.thirdUnit : 10}</Text>
                            </Button>
                        </View>
                        <View borderColor="#F0F2F6" borderWidth={1} p={3} borderRadius={18} flexDirection="row" justifyContent="flex-end" gap={16}>
                            <Icons
                                name="remove"
                                color="#04BF7B"
                                size={24}
                                onPress={() => handleValueQuantChange(-quant)}
                            />
                            <Text>{valueQuant}</Text>
                            <Icons name="add" color="#04BF7B" size={24} onPress={() => handleValueQuantChange(quant)} />
                        </View>
                    </View>
                    {Platform.OS !== 'web' && (
                        <View>
                            <XStack backgroundColor="#F0F2F6" paddingRight={14} borderWidth={0} borderRadius={20} alignItems="center" flexDirection="row" height={36} marginBottom={5}>
                                <Input
                                    focusVisibleStyle={{ outlineWidth: 0 }}
                                    placeholder="Observação para entrega..."
                                    backgroundColor="transparent"
                                    borderWidth={0}
                                    borderColor="transparent"
                                    flex={1}
                                    fontSize={10}
                                    maxLength={999}
                                    onChangeText={handleObsChange}
                                    value={obsC}
                                />
                            </XStack>
                        </View>
                    )}
                </View>
            )}
        </View>
    );

});

ProductBox.displayName = 'ProductBox'

export function Cart({ navigation }: HomeScreenProps) {
    const [loading, setLoading] = useState<boolean>(true);
    const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<Map<string, TCart>>(new Map());
    const [products, setProducts] = useState<Product[]>([]);
    const [cartToExclude, setCartToExclude] = useState<Map<string, TCart>>(new Map());
    const [cartInside, setCartInside] = useState<Map<string, TCart>>(new Map());
    const [confirmDelte, setConfirmDelete] = useState<boolean>(false)
    const [confirmDeleteItem, setConfirmDeleteItem] = useState<boolean>(false)
    const [itemToDelete, setItemToDelete] = useState<TCart>()
    const [alertItems, setAlertItems] = useState<Product[]>([]);;
    const [showNotification, setShowNotification] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalSubtitle, setModalSubtitle] = useState('');
    const [modalDescription, setModalDescription] = useState('');
    const [modalButtonText, setModalButtonText] = useState('Ok');
    const [modalOnConfirm, setModalOnConfirm] = useState<() => void>(() => { });


    useEffect(() => {
        setStorage('cart', JSON.stringify(Array.from(cart.entries()))).then()
    }, [cart])

    const flatListRef = useRef<VirtualizedList<Product>>(null);

    const deleteItemFromCart = debounce(async (cartToDelete: TCart) => {
        console.log('aqui deleteItemFromCart')
        const token = await getToken();

        setCart((prevCart) => {
            const newCart = new Map(prevCart);

            // Remove o item do carrinho
            newCart.delete(cartToDelete.productId);

            // Atualiza o estado de exclusão
            setCartToExclude((prevCartToExclude) => {
                const newCartToExclude = new Map(prevCartToExclude);
                newCartToExclude.set(cartToDelete.productId, cartToDelete);
                return newCartToExclude;
            });

            // Salva o carrinho atualizado no AsyncStorage
            console.log('deleteItemFromCart: ', newCart)
            setStorage('cart', JSON.stringify(Array.from(newCart.entries())));

            // Atualiza os produtos
            setProducts((prevProducts) => {
                return prevProducts.filter(item => item.id !== cartToDelete.productId);
            });

            fetch(`${process.env.EXPO_PUBLIC_API_URL}/cart/delete-item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, productId: cartToDelete.productId })
            }).then(res => res).then((result => {
                if(result.ok) {
                    if (newCart.size < 1) {
                        deleteStorage('cart').then()
                        navigation.replace('Products');
                    }

                }
            })).finally(() => {setLoading(false);setConfirmDeleteItem(false)})
            return newCart;
        });
    }, 300);

    const loadCart = useCallback(async (): Promise<Map<string, TCart>> => {
        console.log('aqui LoadCart')
        try {
            const token = await getToken();
            if (!token) return new Map();

            const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/cart/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token })
            });

            if (!result.ok) return new Map();

            const cart = await result.json();
            console.log('cartloaded: ', cart )
            if (!cart.data || cart.data.length < 1) return new Map();

            // Converte o array de cart para um Map
            const cartMap = new Map<string, TCart>(cart.data.map((item: TCart) => [item.productId, item]));

            const localCartString = await getStorage('cart');
            const localCart = localCartString ? new Map<string, TCart>(JSON.parse(localCartString)) : new Map();
            localCart.forEach((value, key) => {
                cartMap.set(key, value);
            });
            setCartInside(cartMap)

            return cartMap;
        } catch (error) {
            console.error('Erro ao carregar carrinho:', error);
            return new Map();
        }
    }, []);

    const saveCart = useCallback(async (cart: TCart, isCart: boolean) => {
        console.log('aqui saveCart')
        let newCart = new Map()
        const attCart = async (): Promise<void> => {
            setCart((prevCart) => {
                newCart = new Map(prevCart);

                if (cart.amount === 0) {
                    if (isCart) {
                        newCart.delete(cart.productId);
                        setCartToExclude((prevCartToExclude) => {
                            const newCartToExclude = new Map(prevCartToExclude);
                            newCartToExclude.set(cart.productId, cart);
                            return newCartToExclude;
                        });
                    }
                } else {
                    newCart.set(cart.productId, cart);
                    setCartToExclude((prevCartToExclude) => {
                        const newCartToExclude = new Map(prevCartToExclude);
                        newCartToExclude.delete(cart.productId);
                        return newCartToExclude;
                    });
                }


                return newCart;
            });
        }
        await attCart()
        await setStorage('cart', JSON.stringify(Array.from(newCart.entries())));
    }, [])

    const loadProducts = useCallback(async () => {
        console.log('aqui loadProducts')
        try {
            const token = await getToken();
            if (token == null) return [];
            const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/cart/full-list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token
                })
            });
            if (!result.ok) return []
            const cart = await result.json();
            if (cart.data.length < 1) return [];

            const alertItems = cart.data.filter((item: Product) =>
                item.name.toLowerCase().includes('caixa') || item.name.toLowerCase().includes('saca')
            );

            setAlertItems(alertItems);

            return cart.data; 
        } catch (error) {
            console.error('Erro ao carregar favoritos:', error);
            return [];
        }
    }, []);


    const showModal = (title: string, subtitle: string, description: string, buttonText: string, onConfirm: () => void) => {
        setModalTitle(title);
        setModalSubtitle(subtitle);
        setModalDescription(description);
        setModalButtonText(buttonText);
        setModalOnConfirm(() => onConfirm);
        setShowNotification(true);
    };

    const checkAlertItems = (products: Product[]) => {
        const alertItems = products.filter((item: Product) =>
            item.name.toLowerCase().includes('caixa') || item.name.toLowerCase().includes('saca')
        );

        if (alertItems.length > 0) {
            const alertMessage = alertItems.map(item => item.name).join('\n');
            showModal(
                'Atenção!',
                'Itens em caixa ou saca',
                `Os seguintes itens são vendidos em caixa ou saca:\n${alertMessage}`,
                'Entendi',
                () => setShowNotification(false)
            );
        }
    };

    useEffect(() => {
        if (alertItems.length > 0) {
            checkAlertItems(alertItems);
        }
    }, [alertItems]);

    const handleTrashItemState = (cart: TCart) => {
        console.log('aqui handleTrashItemState')
        setItemToDelete(cart)
        setConfirmDeleteItem(true)
    }

    const saveCartArray = useCallback(async (carts: Map<string, TCart>, cartsToExclude: Map<string, TCart>) => {
        console.log('aqui saveCartArray')
        const token = await getToken()
        if (token == null) return [];
        await fetch(`${process.env.EXPO_PUBLIC_API_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token,
                carts: Array.from(carts.values()),
                cartToExclude: Array.from(cartsToExclude.values())
            })
        });
        setCartToExclude(new Map());
    }, []);

    useEffect(() => {
        console.log('aqui useEffect1')
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const cart = await loadCart();
                const products = await loadProducts();
                if (cart.size > 0) setCart(cart)
                if (products.length > 0) setProducts(products)
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [loadCart, loadProducts]);

    useEffect(() => {
        console.log('aqui useEffect2')
        setDisplayedProducts(products.sort((a, b) => a.name.localeCompare(b.name)));
    }, [products, cart, cartInside]);

    const renderProduct = useCallback(
        ({ item }: { item: Product }) => <ProductBox key={item.id} {...item} saveCart={saveCart} cart={cart} cartInside={cartInside} setConfirmDeleteItem={handleTrashItemState} />,
        [saveCart, cart, cartInside]
    );

    const MemoizedProductBox = React.memo(ProductBox);

    if (loading) {
        return (
            <View flex={1} justifyContent='center' alignItems='center'>
                <ActivityIndicator size="large" color="#04BF7B" />
            </View>
        );
    }

    return (
        <Stack pt={20} backgroundColor='#F0F2F6' height='100%' position='relative'>
            <View height={50} flex={1} paddingTop={20}>
                <View height={50} alignItems='center' paddingLeft={20} paddingRight={20} flexDirection='row'>
                    <Icons onPress={async () => {
                        setLoading(true)
                        await saveCartArray(cart, cartToExclude)
                        navigation.replace('Products')
                    }
                    } size={25} name='chevron-back'></Icons>
                    <Text f={1} textAlign='center' fontSize={20}>Meu carrinho</Text>
                </View>

                <View backgroundColor='#F0F2F6' flex={1} padding={16}>
                    <VirtualizedList
                        ref={flatListRef}
                        style={{ flex: 1 }}
                        data={MemoizedProductBox}
                        getItemCount={() => displayedProducts.length}
                        getItem={(data, index) => displayedProducts[index]}
                        keyExtractor={(item) => item.id}
                        renderItem={renderProduct}
                        ItemSeparatorComponent={() => <View height={8}/>}
                        initialNumToRender={10}
                        windowSize={4}
                    />
                </View>

                <View backgroundColor='#F0F2F6' display={confirmDelte ? 'none' : 'flex'} px={20}
                    justifyContent='center' alignItems='center' flexDirection='row' gap={20} height={70}>
                    <View backgroundColor='#F0F2F6' {...Platform.OS === 'web' ? { minWidth: '50%' } : {}} flexDirection='row' justifyContent='center' gap={5}>
                        <View justifyContent='center' alignItems='center'>
                            <Button backgroundColor='black' onPress={async () => {
                                setConfirmDelete(true)
                            }}>
                                <Icons name='trash' color='white' size={20}></Icons>
                            </Button>
                        </View>
                        <Button
                            borderRadius={10}
                            onPress={() => {
                                setLoading(true);
                                checkAlertItems(products);
                                saveCartArray(cart, cartToExclude).then(() => {
                                    navigation.replace('Prices');
                                });
                            }}
                            justifyContent='center'
                            alignItems='center'
                            backgroundColor='#04BF7B'
                            f={1}
                        >
                            <Text fontSize={16} color='white'>Ver cotações</Text>
                            <Icons size={18} style={{ paddingLeft: 10 }} color='white' name='arrow-forward'></Icons>
                        </Button>
                    </View>
                    <DialogInstanceNotification
                        openModal={showNotification}
                        setOpenModal={setShowNotification}
                        title={modalTitle}
                        subtitle={modalSubtitle}
                        description={modalDescription}
                        buttonText={modalButtonText}
                        onConfirm={modalOnConfirm}
                    />
                </View>

                {confirmDelte && (
                    <View flex={1} justifyContent='center' alignItems='center' backgroundColor='white'>
                        <Modal transparent={true}>
                            <View flex={1} justifyContent='center' alignItems='center' backgroundColor='rgba(0, 0, 0, 0.9)'>
                                <View maxWidth={400} width='90%' backgroundColor='white' padding={20} borderRadius={10} alignItems='center' justifyContent='center'>
                                    <View flexDirection='row' marginBottom={15} alignItems='flex-start' justifyContent='flex-start' width='100%'>
                                        <View flex={1}>
                                            <Text fontSize={22}>Apagar carrinho</Text>
                                        </View>
                                    </View>
                                    <View marginBottom={20} width='100%'>
                                        <Text fontSize={16} marginBottom={5}>Deseja apagar o carrinho e remover todos os produtos adicionados?</Text>
                                        <Text fontSize={10} color='gray' textAlign='left'>Esta ação não poderá ser desfeita</Text>
                                    </View>
                                    <View gap={5} flexDirection='row' justifyContent='space-between' width='100%' alignItems='center'>
                                        <TouchableOpacity style={{ flex: 1 }}>
                                            <Button backgroundColor='#04BF7B' onPress={() => setConfirmDelete(false)}>
                                                <Text color='white' textAlign='center'>Cancelar</Text>
                                            </Button>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ flex: 1 }}>
                                            <Button backgroundColor='black' onPress={async () => {
                                                setLoading(true)
                                                const token = await getToken();
                                                if (token == null) return [];
                                                await fetch(`${process.env.EXPO_PUBLIC_API_URL}/cart/delete-by-id`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({
                                                        token
                                                    })
                                                });
                                                deleteStorage('cart');
                                                navigation.replace('Products');
                                            }}>
                                                <Text color='white' textAlign='center'>Apagar</Text>
                                            </Button>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </View>

                )}
                {confirmDeleteItem && (
                    <View flex={1} justifyContent='center' alignItems='center' backgroundColor='white'>
                        <Modal transparent={true}>
                            <View flex={1} justifyContent='center' alignItems='center' backgroundColor='rgba(0, 0, 0, 0.9)'>
                                <View maxWidth={400} width='90%' backgroundColor='white' padding={20} borderRadius={10} alignItems='center' justifyContent='center'>
                                    <View flexDirection='row' marginBottom={15} alignItems='flex-start' justifyContent='flex-start' width='100%'>
                                        <Text flex={1} fontSize={22}>Remover item</Text>
                                    </View>
                                    <View marginBottom={20} width='100%'>
                                        <Text fontSize={16} marginBottom={5}>Deseja remover o item do carrinho?</Text>
                                        <Text fontSize={10} color='gray' textAlign='left'>Esta ação não poderá ser desfeita</Text>
                                    </View>
                                    <View gap={5} flexDirection='row' justifyContent='space-between' width='100%'>
                                        <TouchableOpacity style={{ flex: 1 }}>
                                            <Button backgroundColor='#04BF7B' onPress={() => setConfirmDeleteItem(false)}>
                                                <Text color='white' textAlign='center'>Cancelar</Text>
                                            </Button>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ flex: 1 }}>
                                            <Button backgroundColor='black' onPress={async () => {
                                                setLoading(true)
                                                if (itemToDelete != null) deleteItemFromCart(itemToDelete)
                                            }}>
                                                <Text color='white' textAlign='center'>Remover</Text>
                                            </Button>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </View>

                )}
            </View>
        </Stack>
    )
}

