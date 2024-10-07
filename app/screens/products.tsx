import {
    View,
    Select,
    Image,
    YStack,
    XStack,
    Text,
    Adapt,
    Sheet,
    Input,
    Button,
    Stack,
    ScrollView
} from 'tamagui';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Icons from '@expo/vector-icons/Ionicons';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Platform,
    TouchableOpacity,
} from 'react-native';
import React from 'react';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import ImageViewer from 'react-native-image-zoom-viewer';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { clearStorage, deleteStorage, deleteToken, getStorage, getToken, setStorage } from '../utils/utils';

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
    mediumWeight: number
    firstUnit: number;
    secondUnit: number
    thirdUnit: number
}

type HomeScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
}

type RootStackParamList = {
    Home: undefined;
    Products: undefined;
    Cart: undefined
    Sign: undefined
}

type Cart = {
    productId: string
    amount: number
    obs: string
}

type SelectItem = {
    name: string;
}

type ProductBoxProps = Product &
{
    toggleFavorite: (productId: string) => void,
    favorites: Product[],
    saveCart: ((cart: Cart, isCart: boolean) => Promise<void>),
    cart: Map<string, Cart>
    setImage: (imageString: string) => void
    setModalVisible: (status: boolean) => void
    mediumWeight: number,
    firstUnit: number,
    secondUnit: number,
    thirdUnit: number,
    currentClass: string
}

const CartButton = ({ cartSize, isScrolling, onPress }: any) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(50);

    useEffect(() => {
        if (cartSize > 0 && !isScrolling) {
            opacity.value = withTiming(1, { duration: 600 });
            translateY.value = withTiming(0, { duration: 600 });
        } else {
            opacity.value = withTiming(0, { duration: 250 });
            translateY.value = withTiming(50, { duration: 250 });
        }
    }, [cartSize, isScrolling, opacity, translateY]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    if (Platform.OS === 'web') {
        return (
            <div
                style={{
                    position: 'absolute',
                    bottom: 65,
                    left: 0,
                    right: 0,
                    display: cartSize <= 0 ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    pointerEvents: 'none'
                }}
            >
                <button
                    style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        pointerEvents: 'auto'
                    }}
                    onClick={onPress}
                >
                    <div
                        style={{
                            backgroundColor: '#FFA500',
                            width: 160,
                            height: 25,
                            borderRadius: 24,
                            padding: '8px 16px',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Icons size={25} color='white' name='cart' />
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: -1,
                                    right: -5,
                                    backgroundColor: 'white',
                                    borderRadius: 10,
                                    width: 15,
                                    height: 15,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid #FFA500',
                                    fontSize: 9,
                                    color: '#FFA500',
                                }}
                            >
                                {cartSize}
                            </div>
                        </div>
                        <span style={{ color: '#fff', paddingLeft: 8 }}>Carrinho</span>
                    </div>
                </button>
            </div>
        );
    }

    return (
        <Animated.View style={[{
            position: 'absolute',
            bottom: 65,
            left: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
        }, animatedStyle]}>
            <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
                <View
                    style={{
                        backgroundColor: '#FFA500',
                        width: 160,
                        height: 45,
                        borderRadius: 24,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'auto'
                    }}
                >
                    <View>
                        <Icons size={25} color='white' name='cart' />
                        <View
                            style={{
                                position: 'absolute',
                                bottom: -1,
                                right: -5,
                                backgroundColor: 'white',
                                borderRadius: 10,
                                width: 15,
                                height: 15,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderColor: '#FFA500',
                                borderWidth: 1
                            }}
                        >
                            <Text style={{ fontSize: 9, color: '#FFA500' }}>{cartSize}</Text>
                        </View>
                    </View>
                    <Text style={{ color: '#fff', paddingLeft: 8 }}>Carrinho</Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};


const ProductBox = React.memo(({
    id, name, image, mediumWeight, firstUnit, secondUnit, thirdUnit,
    orderUnit, toggleFavorite, favorites, saveCart,
    cart, setImage, setModalVisible, currentClass
}: ProductBoxProps) => {
    const [quant, setQuant] = useState<number>(firstUnit ? firstUnit : 1);
    const [valueQuant, setValueQuant] = useState(0);
    const [obs, setObs] = useState('');
    const [open, setOpen] = useState<boolean>(false);

    const obsRef = useRef('');
    const quantRef = useRef<number>(firstUnit);

    useEffect(() => {
        obsRef.current = obs;
    }, [obs]);

    const isFavorite = useMemo(() => favorites.some(favorite => favorite.id === id), [favorites, id]);
    const isCart = useMemo(() => cart.has(id), [cart, id]);

    const toggleOpen = useCallback(() => setOpen(prev => !prev), []);

    useEffect(() => {
        const cartProduct = cart.get(id);
        if (cartProduct) {
            obsRef.current = cartProduct.obs;
            setObs(cartProduct.obs);
            setValueQuant(Number(cartProduct.amount));
        }
    }, [cart, id]);

    useEffect(() => {
        saveCart({ amount: valueQuant, productId: id, obs }, isCart);
    }, [obs, valueQuant, isCart, id, saveCart]);

    const handleQuantityChange = (newQuant: number) => {
        setQuant(newQuant);
        quantRef.current = newQuant;
    };

    const handleObsChange = (text: string) => setObs(text);

    const handleValueQuantChange = (delta: number) => {
        setValueQuant(prevValue => Math.max(0, Number((prevValue + delta).toFixed(3))));
    };

    return (
        <Stack onPress={toggleOpen} flex={1} minHeight={40} borderWidth={1} borderRadius={12} borderColor="#F0F2F6">
            <View flex={1} justifyContent="space-between" alignItems="center" paddingHorizontal={8} flexDirection="row" minHeight={40} backgroundColor="white" borderRadius={12} borderBottomLeftRadius={open || isCart || (isFavorite && currentClass === 'Favoritos') ? 0 : 12} borderBottomRightRadius={open || isCart || (isFavorite && currentClass === 'Favoritos') ? 0 : 12}>
                <View flexDirection="row" alignItems="center">
                    <View p={Platform.OS === 'web' ? 10 : 0} onPress={(e) => {
                        e.stopPropagation();
                        setImage(image[0]);
                        setModalVisible(true);
                    }}>
                        <Image source={{ uri: image[0] }} width={60} height={60} />
                    </View>
                    <View marginLeft={8} maxWidth={Platform.OS === 'web' ? 250 : 140}>
                        <Text fontSize={12}>{name}</Text>
                        <Text color="#aaa" fontSize={10}>
                            Apróx. {mediumWeight}{(orderUnit === 'Unid' ? 'Kg' : 'Un')}
                        </Text>
                    </View>
                </View>
                <View mr={10} flexDirection="row" alignItems="center" gap={16} cursor="pointer">
                    <Icons size={24} name={isFavorite ? 'heart' : 'heart-outline'} color="red" onPress={() => toggleFavorite(id)} />
                    {(isFavorite && currentClass === 'Favoritos') || isCart ? <></> :
                        isCart ?
                            <View borderColor='#FFA500' borderWidth={1} borderRadius={50} gap={8} justifyContent='center' alignItems='center' p={8} height={36} width={80} flexDirection='row'>
                                <Text fontSize={12} fontWeight='800'>{valueQuant}<Text fontSize={8} color='gray'>{orderUnit.replace('Unid', 'Un')}</Text></Text>
                                <Icons name='pencil-sharp' color='#FFA500' size={15} />
                            </View>
                            :
                            <Icons name={open ? "close-circle" : "add-circle"} size={36} color="#0BC07D" />
                    }
                </View>
            </View>
            {(open || isCart || (isFavorite && currentClass === 'Favoritos')) && (
                <View onPress={(e) => e.stopPropagation()} minHeight={Platform.OS === 'web' ? 50 : 85} borderTopWidth={1} borderTopColor='#ccc' paddingHorizontal={8} gap={8} borderBottomWidth={0} borderBottomLeftRadius={12} borderBottomRightRadius={12} backgroundColor='white' justifyContent='center' transform={[{ translateY: 0 }]}>
                    <View paddingHorizontal={Platform.OS === 'web' ? 10 : 0} flexDirection='row' alignItems="center" marginTop={Platform.OS === 'web' ? 0 : 10}>
                        <View justifyContent={Platform.OS === 'web' ? 'flex-end' : 'flex-start'} alignItems='center' flex={1} mr={Platform.OS === 'web' ? 35 : 0} flexDirection="row" gap={8}>
                            {Platform.OS === 'web' && (
                                <View alignSelf="flex-start" flex={1}>
                                    <XStack backgroundColor='#F0F2F6' flex={1} paddingRight={14} borderWidth={0} borderRadius={20} alignItems='center' flexDirection='row' height={36}>
                                        <Input
                                            focusVisibleStyle={{ outlineWidth: 0 }}
                                            placeholder="Observação para entrega..."
                                            backgroundColor="transparent"
                                            borderWidth={0}
                                            borderColor="transparent"
                                            flex={1}
                                            fontSize={10}
                                            maxLength={999}
                                            onPress={(e) => e.stopPropagation()}
                                            onChangeText={handleObsChange}
                                            value={obs}
                                        />
                                    </XStack>
                                </View>
                            )}
                            <Button
                                onPress={(e) => {e.stopPropagation();handleQuantityChange(firstUnit ? firstUnit : 1)}}
                                backgroundColor={quant === (firstUnit ? firstUnit : 1) ? '#0BC07D' : '#F0F2F6'}
                                height={30}
                                minWidth={48}
                                borderRadius={12}
                            >
                                <Text color={quant === (firstUnit ? firstUnit : 1) ? '#fff' : '#000'}>{firstUnit ? firstUnit : 1}</Text>
                            </Button>
                            <Button
                                onPress={(e) => {e.stopPropagation();handleQuantityChange(secondUnit ? secondUnit : 5)}}
                                backgroundColor={quant === (secondUnit ? secondUnit : 5) ? '#0BC07D' : '#F0F2F6'}
                                color={quant === secondUnit ? '#fff' : '#000'}
                                height={30}
                                minWidth={48}
                                borderRadius={12}
                            >
                                <Text color={quant === (secondUnit ? secondUnit : 5) ? '#fff' : '#000'}>{secondUnit ? secondUnit : 5}</Text>
                            </Button>
                            <Button
                                onPress={(e) => {e.stopPropagation();handleQuantityChange(thirdUnit ? thirdUnit : 10)}}
                                backgroundColor={quant === (thirdUnit ? thirdUnit : 10) ? '#0BC07D' : '#F0F2F6'}
                                height={30}
                                color={quant === thirdUnit ? '#fff' : '#000'}
                                minWidth={48}
                                borderRadius={12}
                            >
                                <Text color={quant === (thirdUnit ? thirdUnit : 10) ? '#fff' : '#000'}>{thirdUnit ? thirdUnit : 10}</Text>
                            </Button>
                        </View>
                        <View alignItems='center' borderColor="#F0F2F6" borderWidth={1} p={4} borderRadius={18} flexDirection="row" gap={16}>
                            <Icons
                                name="remove"
                                color="#04BF7B"
                                size={24}
                                onPress={(e) => {e.stopPropagation(); handleValueQuantChange(-quant)}}
                            />
                            <Text>{valueQuant} {orderUnit.replace('Unid', 'Un')}</Text>
                            <Icons
                                name="add"
                                color="#04BF7B"
                                size={24}
                                onPress={(e) => {e.stopPropagation(); handleValueQuantChange(quant)}}
                            />
                        </View>
                    </View>
                    {Platform.OS !== 'web' && (
                        <View>
                            <XStack backgroundColor='#F0F2F6' paddingRight={14} borderWidth={0} borderRadius={20} alignItems='center' flexDirection='row' marginBottom={10} height={36}>
                                <Input
                                    placeholder="Observação para entrega..."
                                    backgroundColor="transparent"
                                    borderWidth={0}
                                    borderColor="transparent"
                                    flex={1}
                                    fontSize={10}
                                    maxLength={999}
                                    onPress={(e) => e.stopPropagation()}
                                    onChangeText={handleObsChange}
                                    value={obs}
                                />
                            </XStack>
                        </View>
                    )}
                </View>
            )}
        </Stack>
    );

}, (prevProps, nextProps) => {
    // Função de comparação personalizada
    return prevProps.id === nextProps.id &&
        prevProps.currentClass === nextProps.currentClass &&
        prevProps.favorites.length === nextProps.favorites.length &&
        prevProps.cart.size === nextProps.cart.size
})


ProductBox.displayName = 'ProductBox'


type CustomSelectProps = {
    items: SelectItem[];
    native?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ items, ...props }) => {
    const [val, setVal] = useState('');

    const handleChange = async (value: string) => {
        setVal(value)
        await setStorage('selectedRestaurant', JSON.stringify({ restaurant: items.filter(item => { if (typeof item.name != 'undefined' ? item.name : '' === value) return item }) }))
    }

    return (
        <Select value={val} onValueChange={(value) => {
            handleChange(value)
        }} disablePreventBodyScroll {...props}>
            <Select.Trigger
                style={{
                    backgroundColor: 'transparent',
                    paddingRight: 20,
                    alignItems: 'flex-start',
                    paddingLeft: 0,
                    paddingVertical: 0,
                    borderWidth: 0,
                    width: 220,
                }}
                pressStyle={{ backgroundColor: 'transparent' }}
                iconAfter={<Icons name="chevron-down" />}
            >
                <Select.Value
                    style={{ fontSize: 16, fontWeight: '900' }}
                    placeholder={typeof items[0].name != 'undefined' ? items[0].name : ''}
                />
            </Select.Trigger>

            <Adapt when="sm" platform="touch">
                <Sheet
                    native={!!props.native}
                    modal
                    dismissOnSnapToBottom
                    animation="bouncy"
                >
                    <Sheet.Overlay />
                    <Sheet.Frame>
                        <Sheet.ScrollView>
                            <Adapt.Contents />
                        </Sheet.ScrollView>
                    </Sheet.Frame>
                </Sheet>
            </Adapt>

            <Select.Content zIndex={200_000}>
                <Select.ScrollUpButton
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        width: '100%',
                        height: 12,
                    }}
                >
                    <YStack style={{ zIndex: 10 }}>
                        <Icons name="chevron-up" size={20} />
                    </YStack>
                </Select.ScrollUpButton>
                <Select.Viewport style={{ minWidth: 200 }}>
                    <Select.Group>
                        <Select.Label>Restaurantes</Select.Label>
                        {useMemo(
                            () =>
                                items.map((item, i) => (
                                    <Select.Item
                                        index={i}
                                        key={typeof item.name != 'undefined' ? item.name : ''}
                                        value={typeof item.name != 'undefined' ? item.name.toLowerCase() : ''}
                                    >
                                        <Select.ItemText>{typeof item.name != 'undefined' ? item.name : ''}</Select.ItemText>
                                        <Select.ItemIndicator style={{ marginLeft: 'auto' }}>
                                            <Icons name="checkmark" size={16} />
                                        </Select.ItemIndicator>
                                    </Select.Item>
                                )),
                            [items]
                        )}
                    </Select.Group>
                    {props.native && (
                        <YStack
                            style={{
                                position: 'absolute',
                                right: 0,
                                top: 0,
                                bottom: 0,
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 16,
                                pointerEvents: 'none',
                            }}
                        >
                            <Icons name="chevron-down" />
                        </YStack>
                    )}
                </Select.Viewport>

                <Select.ScrollDownButton
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        width: '100%',
                        height: 12,
                    }}
                >
                    <YStack style={{ zIndex: 10 }}>
                        <Icons name="chevron-down" size={20} />
                    </YStack>
                </Select.ScrollDownButton>
            </Select.Content>
        </Select>
    );
}

let classItems: { name: string }[] = []

export function Products({ navigation }: HomeScreenProps) {
    const [currentClass, setCurrentClass] = useState('Favoritos');
    const [productsList, setProductsList] = useState<Product[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
    const [favorites, setFavorites] = useState<Product[]>([])
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<Map<string, Cart>>(new Map());
    const [cartToExclude, setCartToExclude] = useState<Map<string, Cart>>(new Map());
    const [isModalVisible, setModalVisible] = useState(false);
    const [image, setImage] = useState<string>('')
    const [skeletonLoading, setSkeletonLoading] = useState<boolean>(false)
    const [isScrolling, setIsScrolling] = useState(false);

    const flatListRef = useRef<FlatList<Product>>(null);

    const handleScroll = () => {
        if (!isScrolling) {
            setIsScrolling(true);
        }
    };

    const handleScrollEnd = () => {
        setIsScrolling(false);
    };


    const loadProducts = useCallback(async () => {
        try {
            const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/product/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: '{}',
            });
            const products = await result.json();

            setProductsList(products.data);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }, [])

    const loadFavorites = useCallback(async () => {
        try {
            const token = await getToken()
            if (token == null) return [];
            const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/favorite/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token
                })
            });
            if (!result.ok) return []
            const favorites = await result.json();
            if (favorites.data.length < 1) return []
            return favorites.data; // Ajuste conforme a estrutura de resposta da sua API
        } catch (error) {
            console.error('Erro ao carregar favoritos:', error);
            return [];
        }
    }, []);

    const loadCart = async (): Promise<Map<string, Cart>> => {
        try {
            const token = await getToken()
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
            const cartMap = new Map<string, Cart>(cart.data.map((item: Cart) => [item.productId, item]));

            // Load local cart from AsyncStorage
            // const localCartInsideString = await getStorage('cart-inside');
            // const localCartInside = localCartInsideString ? new Map<string, Cart>(JSON.parse(localCartInsideString)) : new Map();

            const localCartString = await getStorage('cart');
            const localCart = localCartString ? new Map<string, Cart>(JSON.parse(localCartString)) : new Map();

            console.log(localCart)

            // Merge local cart with server cart
            localCart.forEach((value, key) => {
                cartMap.set(key, value);
            });

            // localCartInside.forEach((value, key) => {
            //     cartMap.set(key, value);
            // });

            await deleteStorage('cart-inside')
            await setStorage('cart', JSON.stringify(Array.from(cartMap.entries())));

            return cartMap;
        } catch (error) {
            console.error('Erro ao carregar carrinho:', error);
            return new Map();
        }
    }

    const loadRestaurants = useCallback(async () => {
        try {
            const token = await getToken()
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
    }, []);

    const saveCart = useCallback(async (cart: Cart, isCart: boolean) => {
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

    const saveCartArray = useCallback(async (carts: Map<string, Cart>, cartsToExclude: Map<string, Cart>) => {
        const token = await getToken()
        if (token == null) return [];
        console.log(JSON.stringify({
            token,
            carts: Array.from(carts.values()),
            cartToExclude: Array.from(cartsToExclude.values())
        }))
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
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const [favs, cartMap, restaurants] = await Promise.all([loadFavorites(), loadCart(), loadRestaurants(), loadProducts()])
                const verduraKg = restaurants.filter((rest: any) => {
                    return rest.verduraKg === true
                })
                if (verduraKg.length) {
                    classItems = [
                        { name: 'Favoritos' },
                        { name: 'Fruta' },
                        { name: 'Legumes' },
                        { name: 'Verduras - KG' },
                        { name: 'Especiarias' },
                        { name: 'Granja' },
                        { name: 'Cogumelos e trufas' },
                        { name: 'Higienizados' }
                    ]
                } else {
                    classItems = [
                        { name: 'Favoritos' },
                        { name: 'Fruta' },
                        { name: 'Legumes' },
                        { name: 'Verduras' },
                        { name: 'Especiarias' },
                        { name: 'Granja' },
                        { name: 'Cogumelos e trufas' },
                        { name: 'Higienizados' }
                    ]
                }

                setStorage('selectedRestaurant', JSON.stringify({ restaurant: restaurants[0] }))
                if (favs.length > 0) {
                    setFavorites(favs); // Atualiza o estado dos favoritos
                }
                if (cartMap.size > 0) {
                    setCart(cartMap); // Atualiza o estado do carrinho
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [loadFavorites, loadProducts, loadRestaurants]);

    const addToFavorites = useCallback(async (productId: string) => {
        try {
            const token = await getToken()
            if (token == null) return;
            // Atualizar o estado localmente
            const productToAdd = productsList?.find(product => product.id === productId);
            if (productToAdd) {
                setFavorites([...favorites, productToAdd]);
            }
            const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/favorite/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId,
                    token,
                }),
            });
            if (!result.ok) return null;


        } catch (error) {
            console.error('Erro ao adicionar aos favoritos:', error);
        }
    }, [favorites, productsList]);


    const removeFromFavorites = useCallback(async (productId: string) => {
        try {
            const token = await getToken()
            setFavorites(favorites.filter(favorite => favorite.id !== productId));
            if (token == null) return;
            const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/favorite/del`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId,
                    token,
                }),
            });
            if (!result.ok) return null;

            // Atualizar o estado localmente

        } catch (error) {
            console.error('Erro ao remover dos favoritos:', error);
        }
    }, [favorites]);

    const toggleFavorite = useCallback(async (productId: string) => {
        const isCurrentlyFavorite = favorites.some(favorite => favorite.id === productId);
        if (isCurrentlyFavorite) {
            await removeFromFavorites(productId);
        } else {
            await addToFavorites(productId);
        }
    }, [favorites, addToFavorites, removeFromFavorites]);

    useEffect(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
        }
    }, [currentClass, searchQuery]);

    useEffect(() => {
        if (productsList) {
            productsList.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
        }
    }, [productsList]);


    const filteredProducts = useMemo(() => {
        let products = productsList || [];

        if (currentClass === 'Favoritos') {
            products = favorites;
        } else {
            products = productsList?.filter(product => product.class.toLowerCase() === currentClass.toLowerCase()) || [];
        }

        if (searchQuery) {
            const excludeClass = classItems[3].name === 'Verduras - KG' ? 'Verduras' : 'Verduras - KG';
            products = productsList?.filter(product => {
                return product.name.toLowerCase().includes(searchQuery.toLowerCase()) && product.class.toUpperCase() !== excludeClass.toUpperCase()
            }) ?? []
        }

        return products.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }, [currentClass, productsList, favorites, searchQuery]);

    useEffect(() => {
        setDisplayedProducts(filteredProducts);
        setSkeletonLoading(false);
    }, [filteredProducts]);

    const handlePress = useCallback((name: string) => {
        setSearchQuery('')
        if (name !== currentClass) {
            setSkeletonLoading(true);
            setCurrentClass(name);
        }
    }, [currentClass]);

    const renderClassItem = useCallback(
        ({ item }: { item: SelectItem }) => (
            <TouchableOpacity
                style={{
                    padding: 8,
                    ...(currentClass.toLowerCase() === item.name.toLowerCase()
                        ? { borderBottomWidth: 1.5, borderBottomColor: '#04BF7B' }
                        : {}),
                    justifyContent: 'center',
                }}
                onPress={() => handlePress(item.name)}
            >
                <Text
                    style={{
                        color:
                            currentClass.toLowerCase() !== item.name.toLowerCase()
                                ? '#aaa'
                                : '#04BF7B',
                        fontSize: 14,
                        width: 90,
                        textAlign: 'center',
                    }}
                >
                    {item.name}
                </Text>
            </TouchableOpacity>
        ),
        [currentClass, handlePress]
    );

    const handleSetImage = (imageString: string): void => {
        setImage(imageString)
    }

    const handleSetModalVisible = (status: boolean): void => {
        setModalVisible(status)
    }

    const renderProduct = useCallback(
        ({ item }: { item: Product }) => <ProductBox currentClass={currentClass} setModalVisible={handleSetModalVisible} setImage={handleSetImage} key={item.id} toggleFavorite={toggleFavorite} {...item} favorites={favorites} saveCart={saveCart} cart={cart} />,
        [cart, currentClass, favorites, saveCart, toggleFavorite]
    );

    //const MemoizedProductBox = React.memo(ProductBox);

    if (loading) {
        return (
            <View flex={1} justifyContent="center" alignItems="center">
                <ActivityIndicator size="large" color="#04BF7B" />
            </View>
        );
    }

    return (
        <Stack pt={20} backgroundColor="#f9f9f9" height="100%" position="relative">
            <Modal visible={isModalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center' }}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={{ width: '100%', height: '80%', backgroundColor: 'white', borderRadius: 10, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
                        <ImageViewer
                            imageUrls={[{ url: image }]}
                            enableSwipeDown={true}
                            onSwipeDown={() => setModalVisible(false)}
                            style={{ width: '100%', height: '100%' }}
                        />
                        <TouchableOpacity
                            style={{
                                position: 'absolute',
                                top: 30,
                                right: 30,
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                borderRadius: 20,
                                padding: 10,
                                zIndex: 1
                            }}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>X</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>




            <View height={40} flex={1} paddingTop={8}>
                {/* <View alignItems="center" paddingLeft={20} flexDirection="row">
                    <Circle height={46} width={46} padding={12} backgroundColor="#F0F2F6">
                        <Image source={require('../../assets/images/icon-conectar-positivo.png')} height={32} width={32} />
                    </Circle>
                    <YStack paddingLeft={10} paddingTop={10}>
                        <Text color="#666">Entregar para</Text>
                        <CustomSelect items={items} />
                    </YStack>
                </View> */}

                <XStack
                    backgroundColor="#F0F2F6"
                    marginHorizontal={20}
                    marginTop={30}
                    paddingRight={14}
                    borderWidth={0}
                    borderRadius={20}
                    alignItems="center"
                    flexDirection="row"
                    margin={10}
                >
                    <Input
                        placeholder="Buscar produtos..."
                        backgroundColor="transparent"
                        borderWidth={0}
                        borderColor="transparent"
                        focusVisibleStyle={{ outlineWidth: 0 }}
                        outlineStyle='none'
                        flex={1}
                        marginRight={14}
                        maxLength={50}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <Icons name="search" size={24} color="#04BF7B" />
                </XStack>

                <FlatList
                    style={{ maxHeight: 50, marginTop: 5, minHeight: 50 }}
                    data={classItems}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.name}
                    renderItem={renderClassItem}
                />

                <View backgroundColor="#F0F2F6" flex={1} padding={16} borderTopColor="#aaa" borderTopWidth={0.5}>
                    {currentClass.toLowerCase() === 'favoritos' && favorites.length < 1 && !searchQuery ?
                        <View flex={1} paddingTop={50} alignItems="center">
                            <Text pl={15} marginBottom={5} alignSelf="center" fontSize={14} color="#A9A9A9" textAlign="center">
                            Para adicionar produtos à sua lista de favoritos, pesquise ou navegue pelas abas para encontrar o produto desejado e clique no ícone de favoritar
                                <Text> </Text>
                            </Text>
                            <Icons name="heart-outline" size={25} color="gray" />
                        </View>
                        :
                        !skeletonLoading ?
                            <FlatList
                                ref={flatListRef}
                                data={displayedProducts}
                                renderItem={renderProduct}
                                keyExtractor={(item) => item.id}
                                onEndReachedThreshold={0.5}
                                onEndReached={loadProducts}
                                onScroll={handleScroll}
                                onMomentumScrollBegin={handleScroll}
                                onMomentumScrollEnd={handleScrollEnd}
                                ItemSeparatorComponent={() => (<View height={8}></View>)}
                            />
                            :
                            <ScrollView>
                                <View flex={1} minHeight={40} borderWidth={1} borderRadius={12} borderColor="#F0F2F6">
                                    {[...Array(7)].map((_, index) => (
                                        <View key={index} justifyContent="space-between" alignItems="center" marginTop={8} paddingHorizontal={8} flexDirection="row" minHeight={80} backgroundColor="white" borderRadius={12}>
                                            <MotiView style={{ flexDirection: 'row', alignItems: 'center', marginLeft: Platform.OS === 'web' ? 10 : 0 }}>
                                                <Skeleton colorMode="light" height={60} width={60} />
                                                <View marginLeft={8} rowGap={5}>
                                                    <Skeleton colorMode="light" height={20} width={250} />
                                                    <Skeleton colorMode="light" height={10} width={50} />
                                                </View>
                                            </MotiView>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                    }
                </View>
                <View justifyContent="center" alignItems="center" flexDirection="row" gap={100} height={55} borderTopWidth={0.2} borderTopColor="lightgray">
                    <View onPress={() => navigation.replace('Products')} padding={10} marginVertical={10} borderRadius={8} flexDirection="column" justifyContent="center" alignItems="center" width={80} height={70}>
                        <Icons name="home" size={20} color="#04BF7B" />
                        <Text fontSize={12} color="#04BF7B">Home</Text>
                    </View>
                    {/* <View padding={10} marginVertical={10} borderRadius={8} flexDirection="column" justifyContent="center" alignItems="center" width={80} height={70}>
                        <Icons name="journal" size={20} color="gray" />
                        <Text fontSize={12} color="gray">Pedidos</Text>
                    </View>
                    <View padding={10} marginVertical={10} borderRadius={8} flexDirection="column" justifyContent="center" alignItems="center" width={80} height={70}>
                        <Icons name="document" size={20} color="gray" />
                        <Text fontSize={12} color="gray">Relatórios</Text>
                    </View> */}
                    <View onPress={async () => {
                        setLoading(true);
                        await saveCartArray(cart, cartToExclude);
                        await Promise.all([clearStorage(), deleteToken()]);
                        navigation.replace('Sign');
                    }} padding={10} marginVertical={10} borderRadius={8} flexWrap="nowrap" flexDirection="column" justifyContent="center" alignItems="center" width={80} height={70}>
                        <Icons name="log-out" size={20} color="gray" />
                        <Text fontSize={12} color="gray">Sair</Text>
                    </View>
                </View>
            </View>

            <CartButton
                cartSize={cart.size}
                isScrolling={isScrolling}
                onPress={async () => {
                    setLoading(true);
                    await saveCartArray(cart, cartToExclude);
                    navigation.replace('Cart');
                }}
            />
        </Stack>
    );

}
