import {
    View,
    Select,
    Image,
    Circle,
    YStack,
    XStack,
    Text,
    Adapt,
    Sheet,
    type SelectProps,
    Input,
    Button,
    Stack,
} from 'tamagui';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Icons from '@expo/vector-icons/Ionicons';
import {
    ActivityIndicator,
    FlatList,
    ListRenderItem,
    TouchableOpacity,
    VirtualizedList,
    type ImageURISource,
} from 'react-native';
import React from 'react';
import * as SecureStore from 'expo-secure-store';


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
};

type SelectItem = {
    name: string;
};

type ProductBoxProps = Product & { toggleFavorite: (productId: string) => void, favorites: Product[] };

const ProductBox: React.FC<ProductBoxProps> = React.memo(
    ({ id, name, image, convertedWeight, orderUnit, toggleFavorite, favorites }) => {
        const [open, setOpen] = useState(false);
        const [quant, setQuant] = useState(1);
        const [valueQuant, setValueQuant] = useState(0);
        const [obs, setObs] = useState('');

        // Derive the favorite state directly from props
        const isFavorite = useMemo(() => {
            return favorites.some(favorite => favorite.id === id);
        }, [favorites, id]);

        const toggleOpen = useCallback(() => setOpen(prev => !prev), []);

        return (
            <View
                style={{
                    flex: 1,
                    minHeight: 40,
                    borderWidth: 1,
                    borderRadius: 12,
                    borderColor: '#F0F2F6',
                }}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingHorizontal: 8,
                        flexDirection: 'row',
                        minHeight: 40,
                        backgroundColor: 'white',
                        borderRadius: 12,
                        ...(open ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } : {}),
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={{ uri: image[0] }}
                            style={{ width: 60, height: 60 }}
                        />
                        <View style={{ marginLeft: 8, maxWidth: 162 }}>
                            <Text style={{ fontSize: 12 }}>{name}</Text>
                            <Text style={{ color: '#aaa', fontSize: 10 }}>
                                Apróx. {convertedWeight}
                                {orderUnit !== 'Kg' ? 'un' : convertedWeight < 1 ? 'g' : 'kg'}
                                /{orderUnit === 'Kg' ? 'un' : 'kg'}
                            </Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <Icons
                            size={24}
                            name={isFavorite ? 'heart' : 'heart-outline'}
                            color="red"
                            onPress={() => toggleFavorite(id)}
                        />
                        <Icons
                            onPress={toggleOpen}
                            name="add-circle"
                            size={36}
                            color="#0BC07D"
                        />
                    </View>
                </View>
                {open && (
                    <View
                        style={{
                            minHeight: 85,
                            borderTopWidth: 1,
                            borderTopColor: '#ccc',
                            paddingHorizontal: 8,
                            gap: 8,
                            borderBottomWidth: 0,
                            borderBottomLeftRadius: 12,
                            borderBottomRightRadius: 12,
                            backgroundColor: '#fff',
                            justifyContent: 'center',
                            transform: [{ translateY: 0 }],
                        }}
                    >
                        <View style={{ flexDirection: 'row' }} f={1} alignItems="center" marginTop={10}>
                            <View flexDirection="row" f={1} gap={8}>
                                <Button
                                    onPress={() => {
                                        setQuant(1);
                                    }}
                                    style={{
                                        backgroundColor: quant === 1 ? '#0BC07D' : '#F0F2F6',
                                        height: 30,
                                        color: quant === 1 ? '#fff' : '#000',
                                        minWidth: 48,
                                        borderRadius: 12,
                                    }}
                                >
                                    1
                                </Button>
                                <Button
                                    onPress={() => {
                                        setQuant(5);
                                    }}
                                    style={{
                                        backgroundColor: quant === 5 ? '#0BC07D' : '#F0F2F6',
                                        color: quant === 5 ? '#fff' : '#000',
                                        height: 30,
                                        minWidth: 48,
                                        borderRadius: 12,
                                    }}
                                >
                                    5
                                </Button>
                                <Button
                                    onPress={() => {
                                        setQuant(10);
                                    }}
                                    style={{
                                        backgroundColor: quant === 10 ? '#0BC07D' : '#F0F2F6',
                                        height: 30,
                                        color: quant === 10 ? '#fff' : '#000',
                                        minWidth: 48,
                                        borderRadius: 12,
                                    }}
                                >
                                    10
                                </Button>
                            </View>
                            <View
                                borderColor="#F0F2F6"
                                borderWidth={1}
                                p={3}
                                borderRadius={18}
                                flexDirection="row"
                                justifyContent="flex-end"
                                gap={16}
                            >
                                <Icons
                                    name="remove"
                                    color="#04BF7B"
                                    size={24}
                                    onPress={() => {
                                        const probValue = valueQuant - quant;
                                        if (probValue > 0) setValueQuant(valueQuant - quant);
                                        if (probValue <= 0) setValueQuant(0);
                                    }}
                                />
                                <Text>{valueQuant}</Text>
                                <Icons
                                    name="add"
                                    color="#04BF7B"
                                    size={24}
                                    onPress={() => {
                                        setValueQuant(valueQuant + quant);
                                    }}
                                />
                            </View>
                        </View>
                        <View>
                            <XStack
                                style={{
                                    backgroundColor: '#F0F2F6',
                                    paddingRight: 14,
                                    borderWidth: 0,
                                    borderRadius: 20,
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    zIndex: 20,
                                    marginBottom: 10,
                                    height: 36,
                                }}
                            >
                                <Input
                                    placeholder="Observação para entrega..."
                                    style={{
                                        backgroundColor: 'transparent',
                                        borderWidth: 0,
                                        borderColor: 'transparent',
                                        flex: 1,
                                        marginRight: 14,
                                        fontSize: 10,
                                    }}
                                    maxLength={999}
                                    onChangeText={setObs}
                                    value={obs}
                                />
                            </XStack>
                        </View>
                    </View>
                )}
            </View>
        );
    }
);



type CustomSelectProps = {
    items: SelectItem[];
    native?: boolean;
};

const CustomSelect: React.FC<CustomSelectProps> = ({ items, ...props }) => {
    const [val, setVal] = useState('');

    return (
        <Select value={val} onValueChange={setVal} disablePreventBodyScroll {...props}>
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
                    placeholder={items[0].name}
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
                                        key={item.name}
                                        value={item.name.toLowerCase()}
                                    >
                                        <Select.ItemText>{item.name}</Select.ItemText>
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
};

type ProductsProps = {};

const Products: React.FC<ProductsProps> = () => {
    const [currentClass, setCurrentClass] = useState('Favoritos');
    const memoizedClassItems = useMemo(() => classItems, []);
    const [productsList, setProductsList] = useState<Product[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
    const [favorites, setFavorites] = useState<Product[]>([])
    const [searchQuery, setSearchQuery] = useState('');


    const flatListRef = useRef<VirtualizedList<Product>>(null);

    const loadProducts = useCallback(async () => {
        try {
            const result = await fetch('http://192.168.201.96:9841/product/list', {
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
    }, []);

    const loadFavorites = useCallback(async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (token == null) return [];
            const result = await fetch('http://192.168.201.96:9841/favorite/list', {
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

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                await loadProducts();
                const favs = await loadFavorites();
                if (favs.length < 1) return
                setFavorites(favs); // Atualiza o estado dos favoritos
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [loadProducts, loadFavorites]);




    const saveFavorite = useCallback(async (productId: string) => {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (token == null) return;
            const result = await fetch('http://192.168.201.96:9841/favorite/save', {
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

            const product = productsList?.find(product => product.id === productId);
            if (product) {
                setFavorites((prevFavorites) => [...prevFavorites, product]);
            }
        } catch (error) {
            console.error(error);
        }
    }, [productsList]);

    const addToFavorites = useCallback(async (productId: string) => {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (token == null) return;
            // Atualizar o estado localmente
            const productToAdd = productsList?.find(product => product.id === productId);
            if (productToAdd) {
                setFavorites([...favorites, productToAdd]);
            }
            const result = await fetch('http://192.168.201.96:9841/favorite/save', {
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


    const delFavorite = useCallback(async (productId: string) => {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (token == null) return;
            const result = await fetch('http://192.168.201.96:9841/favorite/del', {
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

            setFavorites((prevFavorites) => prevFavorites.filter(fav => fav.id !== productId));
        } catch (error) {
            console.error(error);
        }
    }, []);


    const removeFromFavorites = useCallback(async (productId: string) => {
        try {
            const token = await SecureStore.getItemAsync('token');
            setFavorites(favorites.filter(favorite => favorite.id !== productId));
            if (token == null) return;
            const result = await fetch('http://192.168.201.96:9841/favorite/del', {
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
        loadProducts();
    }, []);

    useEffect(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
        }
    }, [currentClass]);

    useEffect(() => {
        if (productsList) {
            productsList.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
        }
    }, [productsList]);

    useEffect(() => {
        let filteredProducts = productsList || [];

        if (currentClass === 'Favoritos') {
            filteredProducts = favorites;
        } else {
            filteredProducts = productsList?.filter(product => product.class.toLowerCase() === currentClass.toLowerCase()) || [];
        }

        if (searchQuery) {
            filteredProducts = (productsList as Product[]).filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setDisplayedProducts(filteredProducts);
    }, [currentClass, productsList, favorites, searchQuery]);



    const handlePress = useCallback((name: string) => {
        setCurrentClass(name);
    }, []);

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

    const renderProduct = useCallback(
        ({ item }: { item: Product }) => <ProductBox key={item.id} toggleFavorite={toggleFavorite} {...item} favorites={favorites} />,
        [saveFavorite, delFavorite, favorites]
    );


    const MemoizedProductBox = React.memo(ProductBox);


    const keyExtractor = useCallback((item: Product) => item.id, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#04BF7B" />
            </View>
        );
    }

    return (
        <Stack pt={20} style={{ backgroundColor: '#f9f9f9', height: '100%' }}>
            <View style={{ height: 40, flex: 1, paddingTop: 8 }}>
                <View style={{ alignItems: 'center', paddingLeft: 20, flexDirection: 'row' }}>
                    <Circle height={46} width={46} style={{ padding: 12, backgroundColor: '#F0F2F6' }}>
                        <Image source={require('../../assets/icon-conectar-positivo.png')} style={{ height: 32, width: 32 }} />
                    </Circle>
                    <YStack style={{ paddingLeft: 10, paddingTop: 10 }}>
                        <Text style={{ color: '#666' }}>Entregar para</Text>
                        <CustomSelect items={items} />
                    </YStack>
                </View>

                <XStack
                    style={{
                        backgroundColor: '#F0F2F6',
                        marginHorizontal: 20,
                        paddingRight: 14,
                        borderWidth: 0,
                        borderRadius: 20,
                        alignItems: 'center',
                        flexDirection: 'row',
                        zIndex: 20,
                    }}
                >
                    <Input
                        placeholder="Buscar produtos..."
                        style={{
                            backgroundColor: 'transparent',
                            borderWidth: 0,
                            borderColor: 'transparent',
                            flex: 1,
                            marginRight: 14,

                        }}
                        maxLength={50}
                        onChangeText={setSearchQuery}
                    />
                    <Icons name="search" size={24} color="#04BF7B" />
                </XStack>

                <FlatList
                    style={{ marginTop: 20, maxHeight: 50 }}
                    data={memoizedClassItems}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.name}
                    renderItem={renderClassItem} 
                />

                <View style={{ backgroundColor: '#F0F2F6', flex: 1, padding: 16, borderTopColor: '#aaa', borderTopWidth: 0.5 }}>
                    {currentClass.toLowerCase() == 'favoritos' && favorites.length < 1 ?
                        <View style={{ flex: 1, paddingTop: 50, alignItems: 'center', flexDirection: 'column' }}>
                            <Text pl={15} style={{ alignSelf: 'flex-start', fontSize: 14, color: '#A9A9A9', textAlign: 'center' }}>
                                Para salvar produtos na lista de favoritos, clique no botão de favoritar
                                <Text> </Text>
                                <Icons name="heart-outline" size={20} color="gray" />
                            </Text>
                        </View>


                        :
                        <VirtualizedList
                            ref={flatListRef}
                            style={{ flex: 1 }}
                            data={MemoizedProductBox}
                            getItemCount={() => displayedProducts.length}
                            getItem={(data, index) => displayedProducts[index]}
                            keyExtractor={(item) => item.id}
                            renderItem={renderProduct}
                            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                            initialNumToRender={10} // Renderiza os primeiros 10 itens inicialmente
                            windowSize={4} // Quantidade de itens a serem renderizados fora da tela
                        />
                    }

                </View>
            </View>
        </Stack>
    );
};

const items = [
    { name: 'Cumbuca Catete' },
    { name: 'Cumbuca Maracanã' },
    { name: 'Maya Café' },
    { name: 'Epifania Oriental' },
    { name: 'Boteco Colarinho Botafogo' },
    { name: 'Boteco Colarinho Copacabana' },
    { name: 'Experimenta' },
    { name: 'TT Burguer Arpoador' },
    { name: 'TT Burguer Barra' },
    { name: 'Nhac!' },
];

const classItems = [
    { name: 'Favoritos' },
    { name: 'Fruta' },
    { name: 'Legumes' },
    { name: 'Verduras' },
    { name: 'Especiarias' },
    { name: 'Granja' },
    { name: 'Cogumelos e trufas' },
    { name: 'Higienizados' },
];


export default Products
