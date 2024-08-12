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
import ImageViewer from 'react-native-image-zoom-viewer';
import { deleteStorage, getStorage, getToken, setStorage } from '../utils/utils';

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

type ProductBoxProps = Product & { saveCart: (cart: TCart, isCart: boolean) => Promise<void>, cart: Map<string, TCart>, cartInside: Map<string, TCart>, setConfirmDeleteItem: (cart: TCart) => void, setImage: (imageString: string) => void, setModalVisible: (status: boolean) => void };

const ProductBox = React.memo((produto: ProductBoxProps) => {
    const [open, setOpen] = useState(false);
    const [quant, setQuant] = useState(produto.firstUnit);
    const [valueQuant, setValueQuant] = useState(Number(produto.amount) || 0);
    const [obsC, setObs] = useState(produto.obs);

    const obsRef = useRef('');
    const quantRef = useRef(produto.firstUnit);

    const isCart = useMemo(() => {
        return produto.cart.has(produto.id);
    }, [produto.cart, produto.id]);

    useEffect(() => {
        const cartProduct = produto.cartInside.get(produto.id)
        if (cartProduct != null) {
            obsRef.current = cartProduct.obs
            setObs(cartProduct.obs)
            setValueQuant(Number(cartProduct.amount))
        }
    }, [produto.cartInside, produto.id])

    const toggleOpen = useCallback(() => setOpen(prev => !prev), []);

    const handleAddToCart = async (isMinor: boolean, isObs: boolean, text: string) => {
        const currentObs = obsRef.current;
        const currentQuant = quantRef.current;
        let value = (Number((isObs ? valueQuant : isMinor ? (valueQuant - currentQuant) : (valueQuant + currentQuant)).toFixed(3)))
        if (value < 0) value = 0
        setValueQuant(value);
        produto.saveCart({ amount: value, productId: produto.id, obs: text ? text : currentObs } satisfies TCart, isCart);
    }

    return (
        <View style={{ flex: 1, minHeight: 40, borderWidth: 1, borderRadius: 12, borderColor: '#F0F2F6' }}>
            <View style={{ flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, flexDirection: 'row', minHeight: 40, backgroundColor: 'white', borderRadius: 12, ...(open ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } : {}) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View p={Platform.OS === 'web' ? 10 : 5}>
                        <View onPress={() => {
                            produto.setImage(produto.image[0])
                            produto.setModalVisible(true)
                        }}>
                            <Image source={{ uri: produto.image[0] }} style={{ width: 60, height: 60 }} />
                        </View>
                        <View
                            style={{
                                position: 'absolute',
                                bottom: 3,
                                left: 0,
                                backgroundColor: 'black',
                                borderRadius: 10,
                                width: 25,
                                height: 25,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderColor: 'white',
                                borderWidth: 1,
                                cursor: 'pointer'
                            }}
                            ml={Platform.OS === 'web' ? 10 : 5}
                            onPress={() => {
                                produto.setConfirmDeleteItem({ amount: valueQuant, productId: produto.id, obs: obsRef.current })
                            }}
                        >
                            <Icons name='trash-bin' color='white' size={15}></Icons>
                        </View>
                    </View>
                    <View style={{ marginLeft: 8, maxWidth: 162 }}>
                        <Text style={{ fontSize: 12 }}>{produto.name}</Text>
                        <Text style={{ color: '#aaa', fontSize: 10 }}>
                            Obs.: {obsC || '--'}
                        </Text>
                    </View>
                </View>
                <View mr={Platform.OS === 'web' ? 10 : 5} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text fontWeight='800'>{valueQuant} {produto.orderUnit.replace('Unid', 'Un')}</Text>
                    <Icons onPress={toggleOpen} name={open ? "chevron-up" : "chevron-down"} style={{ paddingLeft: 10 }} size={25} color="lightgray" />
                </View>
            </View>
            {open && (
                <View style={{ minHeight: 85, borderTopWidth: 1, borderTopColor: '#ccc', paddingHorizontal: 8, gap: 8, borderBottomWidth: 0, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, backgroundColor: '#fff', justifyContent: 'center', transform: [{ translateY: 0 }] }}>
                    <View paddingHorizontal={Platform.OS === 'web' ? 10 : 5} style={{ flexDirection: 'row' }} f={1} alignItems="center" marginTop={10}>
                        <View justifyContent={Platform.OS === 'web' ? 'flex-end' : 'flex-start'} mr={Platform.OS === 'web' ? 35 : 0} flexDirection="row" f={1} gap={8}>
                            {Platform.OS === 'web' && (
                                <View alignSelf="flex-start" flex={1}>
                                    <XStack style={{ backgroundColor: '#F0F2F6', paddingRight: 14, borderWidth: 0, borderRadius: 20, alignItems: 'center', flexDirection: 'row', zIndex: 20, height: 36 }}>
                                        <Input
                                            focusVisibleStyle={{ outlineWidth: 0 }}
                                            placeholder="Observação para entrega..."
                                            style={{ backgroundColor: 'transparent', borderWidth: 0, borderColor: 'transparent', flex: 1, fontSize: 10 }}
                                            maxLength={999}
                                            onChangeText={(text) => {
                                                setObs(text);
                                            }}
                                            value={obsC}
                                        />
                                    </XStack>
                                </View>
                            )}
                            <Button
                                onPress={() => {
                                    setQuant(produto.firstUnit);
                                    quantRef.current = produto.firstUnit;
                                }}
                                style={{
                                    backgroundColor: quant === produto.firstUnit ? '#0BC07D' : '#F0F2F6',
                                    height: 30,
                                    minWidth: 48,
                                    borderRadius: 12,
                                }}
                            >
                                <Text color={quant === produto.firstUnit ? '#fff' : '#000'}>{produto.firstUnit}</Text>
                            </Button>
                            <Button
                                onPress={() => {
                                    setQuant(produto.secondUnit);
                                    quantRef.current = produto.secondUnit;
                                }}
                                style={{
                                    backgroundColor: quant === produto.secondUnit ? '#0BC07D' : '#F0F2F6',
                                    height: 30,
                                    minWidth: 48,
                                    borderRadius: 12,
                                }}
                            >
                                <Text color={quant === produto.secondUnit ? '#fff' : '#000'}>{produto.secondUnit}</Text>
                            </Button>
                            <Button
                                onPress={() => {
                                    setQuant(produto.thirdUnit);
                                    quantRef.current = produto.thirdUnit;
                                }}
                                style={{
                                    backgroundColor: quant === produto.thirdUnit ? '#0BC07D' : '#F0F2F6',
                                    height: 30,
                                    minWidth: 48,
                                    borderRadius: 12,
                                }}
                            >
                                <Text color={quant === produto.thirdUnit ? '#fff' : '#000'}>{produto.thirdUnit}</Text>
                            </Button>
                        </View>
                        <View borderColor="#F0F2F6" borderWidth={1} p={3} borderRadius={18} flexDirection="row" justifyContent="flex-end" gap={16}>
                            <Icons
                                name="remove"
                                color="#04BF7B"
                                size={24}
                                onPress={() => {
                                    const probValue = valueQuant - quant;
                                    if (probValue > 0) setValueQuant(Number((valueQuant - quant).toFixed(3)));
                                    if (probValue <= 0) setValueQuant(0);
                                    handleAddToCart(true, false, '')
                                }}
                            />
                            <Text>{valueQuant}</Text>
                            <Icons name="add" color="#04BF7B" size={24} onPress={() => { handleAddToCart(false, false, '') }} />
                        </View>
                    </View>
                    {Platform.OS !== 'web' && (
                        <View alignSelf="flex-start" flex={1}>
                            <XStack style={{ backgroundColor: '#F0F2F6', borderWidth: 0, borderRadius: 20, alignItems: 'center', flexDirection: 'row', zIndex: 20, height: 36 }}>
                                <Input
                                    focusVisibleStyle={{ outlineWidth: 0 }}
                                    placeholder="Observação para entrega..."
                                    style={{ backgroundColor: 'transparent', borderWidth: 0, borderColor: 'transparent', flex: 1, fontSize: 10 }}
                                    maxLength={999}
                                    onChangeText={(text) => {
                                        setObs(text);
                                    }}
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
    const [isModalVisible, setModalVisible] = useState(false);
    const [image, setImage] = useState<string>('')

    const handleSetImage = (imageString: string): void => {
        setImage(imageString)
    }

    const handleSetModalVisible = (status: boolean): void => {
        setModalVisible(status)
    }

    const flatListRef = useRef<VirtualizedList<Product>>(null);

    const deleteItemFromCart = debounce(async (cartToDelete: TCart) => {
        const deleteItem = async (): Promise<void> => {
            const token = await getToken();
            await fetch(`${process.env.EXPO_PUBLIC_API_URL}/cart/delete-item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, productId: cartToDelete.productId })
            });
            if (Itens.size < 1) navigation.replace('Products')
            return
        }

        let Itens: Map<string, TCart>

        setCart((prevCart) => {
            const newCart = new Map(prevCart);

            newCart.delete(cartToDelete.productId);
            setCartToExclude((prevCartToExclude) => {
                const newCartToExclude = new Map(prevCartToExclude);
                newCartToExclude.set(cartToDelete.productId, cartToDelete);
                return newCartToExclude;
            });

            // Save updated cart to AsyncStorage
            setStorage('cart', JSON.stringify(Array.from(newCart.entries())));
            setStorage('cart', JSON.stringify(Array.from(newCart.entries())));
            setProducts((prevProducts) => {
                return [...prevProducts.filter(item => item.id !== cartToDelete.productId)]
            })

            Itens = newCart

            setConfirmDeleteItem(false)
            if (newCart.size < 1) {
                deleteItem()
            } else {
                setLoading(false)
            }

            return newCart;
        });

        deleteItem()

    }, 300)

    const loadCart = useCallback(async (): Promise<Map<string, TCart>> => {
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

    const saveCart = debounce(async (cart: TCart, isCart: boolean) => {
        setCart((prevCart) => {
            const newCart = new Map(prevCart);

            if (cart.amount === 0) {
                if (isCart) {
                    newCart.delete(cart.productId);
                    setCartToExclude((prevCartToExclude) => {
                        const newCartToExclude = new Map(prevCartToExclude)
                        newCartToExclude.set(cart.productId, cart)
                        return newCartToExclude
                    })
                }
            } else {
                newCart.set(cart.productId, cart);
                setCartToExclude((prevCartToExclude) => {
                    const newCartToExclude = new Map(prevCartToExclude)
                    newCartToExclude.delete(cart.productId)

                    return newCartToExclude
                })
            }
            setStorage('cart', JSON.stringify(Array.from(newCart.entries())));
            setCartInside(newCart)
            return newCart;
        });
    }, 300)

    const loadProducts = useCallback(async () => {
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
            if (cart.data.length < 1) return []
            return cart.data; // Ajuste conforme a estrutura de resposta da sua API
        } catch (error) {
            console.error('Erro ao carregar favoritos:', error);
            return [];
        }
    }, [])

    const handleTrashItemState = (cart: TCart) => {
        setItemToDelete(cart)
        setConfirmDeleteItem(true)
    }

    const saveCartArray = useCallback(async (carts: Map<string, TCart>, cartsToExclude: Map<string, TCart>) => {
        const token = await getToken();
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
    }, []);

    useEffect(() => {
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
        setDisplayedProducts(products);
    }, [products, cart, cartInside]);

    const renderProduct = useCallback(
        ({ item }: { item: Product }) => <ProductBox key={item.id} setImage={handleSetImage} setModalVisible={handleSetModalVisible} {...item} saveCart={saveCart} cart={cart} cartInside={cartInside} setConfirmDeleteItem={handleTrashItemState} />,
        [saveCart, cart, cartInside]
    );

    const MemoizedProductBox = React.memo(ProductBox);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#04BF7B" />
            </View>
        );
    }

    return (
        <Stack pt={20} style={{ backgroundColor: '#F0F2F6', height: '100%', position: 'relative' }}>
            <Modal visible={isModalVisible} transparent={true} onRequestClose={() => {
                setModalVisible(false)
            }}>
                <ImageViewer
                    imageUrls={[{
                        url: image
                    }]}
                    enableSwipeDown={true}
                    onSwipeDown={() => setModalVisible(false)}
                />
            </Modal>
            <View style={{ height: 50, flex: 1, paddingTop: 20 }}>
                <View height={50} alignItems='center' style={{ alignItems: 'center', paddingLeft: 20, paddingRight: 20, flexDirection: 'row' }}>
                    <Icons onPress={async () => {
                        setLoading(true)
                        await saveCartArray(cart, cartToExclude)
                        navigation.replace('Products')
                    }
                    } size={25} name='chevron-back'></Icons>
                    <Text f={1} textAlign='center' fontSize={20}>Meu carrinho</Text>
                </View>

                <View style={{ backgroundColor: '#F0F2F6', flex: 1, padding: 16 }}>
                    <VirtualizedList
                        ref={flatListRef}
                        style={{ flex: 1 }}
                        data={MemoizedProductBox}
                        getItemCount={() => displayedProducts.length}
                        getItem={(data, index) => displayedProducts[index]}
                        keyExtractor={(item) => item.id}
                        renderItem={renderProduct}
                        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                        initialNumToRender={10}
                        windowSize={4}
                    />
                </View>

                <View backgroundColor='#F0F2F6' display={confirmDelte ? 'none' : 'flex'} px={20} style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 20 }} height={70}>
                    <View backgroundColor='#F0F2F6' {...Platform.OS === 'web' ? {minWidth: '50%'} : {}} flexDirection='row' justifyContent='center' gap={5}>
                        <View justifyContent='center' alignItems='center'>
                            <Button backgroundColor='black' onPress={async () => {
                                setConfirmDelete(true)
                            }}>
                                <Icons name='trash' color='white' size={20}></Icons>
                            </Button>
                        </View>
                        <Button borderRadius={10} onPress={() => {
                            setLoading(true)
                            saveCartArray(cart, cartToExclude)
                            navigation.replace('Prices')
                        }} justifyContent='center' alignItems='center' backgroundColor='#04BF7B' f={1}>
                            <Text fontSize={16} color='white'>Ver cotações</Text>
                            <Icons size={18} style={{ paddingLeft: 10 }} color='white' name='arrow-forward'></Icons>
                        </Button>
                    </View>
                </View>

                {confirmDelte && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>

                        <Modal
                            transparent={true}
                        >
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' }}>
                                <View style={{ maxWidth: 400, backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                    <View flexDirection='row' mb={30} alignItems='center'>
                                        <View paddingHorizontal={30}>
                                            <Text fontSize={18}>Apagar carrinho</Text>
                                        </View>
                                    </View>
                                    <View marginBottom={20}>
                                        <Text style={{ fontSize: 16, marginBottom: 5 }}>Deseja apagar o carrinho e remover todos os produtos adicionados?</Text>
                                        <Text style={{ fontSize: 10, color: 'gray', textAlign: 'left' }}>Esta ação não podera ser desfeita</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 10 }}>

                                        <TouchableOpacity style={{ flex: 1 }}>
                                            <Button backgroundColor='#04BF7B' onPress={() => setConfirmDelete(false)}>
                                                <Text color='white'>Cancelar</Text>
                                            </Button>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={{ flex: 1 }} >
                                            <Button width='100%' backgroundColor='black' onPress={async () => {
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
                                                deleteStorage('cart')
                                                deleteStorage('cart')
                                                navigation.replace('Products')
                                            }}>
                                                <Text color='white'>Apagar</Text>
                                            </Button>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </View>
                )}
                {confirmDeleteItem && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>

                        <Modal
                            transparent={true}
                        >
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' }}>
                                <View style={{ maxWidth: 400, backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                    <View flexDirection='row' mb={30} alignItems='center'>
                                        <Text f={1} fontSize={18}>Remover item</Text>
                                    </View>
                                    <View marginBottom={20}>
                                        <Text style={{ fontSize: 16, marginBottom: 5 }}>Deseja remover o item do carrinho?</Text>
                                        <Text style={{ fontSize: 10, color: 'gray', textAlign: 'left' }}>Esta ação não podera ser desfeita</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 10 }}>

                                        <TouchableOpacity style={{ flex: 1 }}>
                                            <Button backgroundColor='#04BF7B' onPress={() => setConfirmDeleteItem(false)}>
                                                <Text color='white'>Cancelar</Text>
                                            </Button>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={{ flex: 1 }} >
                                            <Button backgroundColor='black' onPress={async () => {
                                                setLoading(true)
                                                if (itemToDelete != null) deleteItemFromCart(itemToDelete)

                                            }}>
                                                <Text color='white'>Remover</Text>
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
