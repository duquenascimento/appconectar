import React, { ReactNode, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Platform, TextInput, Linking } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icons from '@expo/vector-icons/Ionicons';
import { getOrders } from '../../src/services/orderService'
import { loadRestaurants } from '../../src/services/restaurantService';
import { RootStackParamList } from '../../src/types/navigationTypes';
import { ordersScreenStyles as styles } from '../../src/styles/styles';
import BottomNavigation from '../../src/components/navigation/BottomNavigation';


type OrdersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Orders'>;

interface Order {
    orderDocument: ReactNode;
    id: string;
    deliveryDate: string;
    totalConectar: number;
    calcOrderAgain: {
        data: {
            supplier: {
                name: string;
            };
        }[];
    };
}

interface Restaurant {
    externalId: any;
    id: string;
    name: string;
}

// Função para formatar a data
const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

export function OrdersScreen({ navigation }: { navigation: OrdersScreenNavigationProp }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
    const [restaurantOpen, setRestaurantOpen] = useState(false);

    useEffect(() => {
        const LoadRestaurants = async () => {
            try {
                console.log('Iniciando o carregamento dos restaurantes...');
                const restaurantsData = await loadRestaurants();
                console.log('Restaurantes carregados:', restaurantsData);

                setRestaurants(restaurantsData);
                if (restaurantsData.length > 0) {
                    console.log('Restaurante selecionado automaticamente:', restaurantsData[0].externalId);
                    setSelectedRestaurant(restaurantsData[0].externalId);
                }
            } catch (error) {
                console.error('Erro ao carregar restaurantes:', error);
            }
        };

        LoadRestaurants();
    }, []);

    useEffect(() => {
        console.log('selectedRestaurant mudou:', selectedRestaurant);
        const loadOrders = async () => {
            if (!selectedRestaurant) {
                console.log('Nenhum restaurante selecionado. Não carregando pedidos.');
                return;
            }

            console.log('Carregando pedidos para o restaurante:', selectedRestaurant);
            setLoading(true);

            try {
                const ordersData = await getOrders(1, 10, selectedRestaurant);
                console.log('Pedidos carregados:', ordersData);
                setOrders(ordersData);
                setFilteredOrders(ordersData);
            } catch (error) {
                console.error('Erro ao carregar pedidos:', error);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [selectedRestaurant]);

    const handleSearch = (query: string) => {
        console.log('Iniciando handleSearch com query:', query);
        setSearchQuery(query);
    
        // Verificar se a query pode ser uma data parcial (D, DD, DD/MM ou DD/MM/YYYY)
        const datePartialRegex = /^(\d{1,2})(\/\d{1,2})?(\/\d{1,4})?$/;
        
        const isDatePartial = datePartialRegex.test(query);
    
        const filtered = orders.filter((order) => {
            // Filtragem por data parcial (se aplicável)
            if (isDatePartial) {
                const [day, month, year] = query.split('/');
                const deliveryDate = order.deliveryDate.split('T')[0]; // Formato: YYYY-MM-DD
                const [orderYear, orderMonth, orderDay] = deliveryDate.split('-');
    
                // Comparar dia
                if (day && !orderDay.startsWith(day)) return false;
    
                // Comparar mês (se fornecido)
                if (month && !orderMonth.startsWith(month)) return false;
    
                // Comparar ano (se fornecido)
                if (year && !orderYear.startsWith(year)) return false;
    
                return true;
            }
    
            // Filtragem por ID, valor total ou nome do fornecedor
            const matchesId = order.id.toLowerCase().includes(query.toLowerCase());
            const matchesTotal = order.totalConectar.toString().includes(query);
            const matchesSupplier = order.calcOrderAgain.data[0].supplier.name.toLowerCase().includes(query.toLowerCase());
    
            console.log('Pedido:', order.id);
            console.log('Matches ID:', matchesId);
            console.log('Matches Total:', matchesTotal);
            console.log('Matches Supplier:', matchesSupplier);
    
            return matchesId || matchesTotal || matchesSupplier;
        });
    
        console.log('Pedidos filtrados:', filtered);
        setFilteredOrders(filtered);
    
        // Exibir mensagem se nenhum pedido for encontrado
        if (filtered.length === 0 && query.length > 0) {
            console.log('Nenhum pedido encontrado para a query:', query);
        }
    };


    const toggleOrderSelection = (orderId: string) => {
        setSelectedOrders((prevSelected) => {
            if (prevSelected.includes(orderId)) {
                return prevSelected.filter(id => id !== orderId);
            } else {
                return [...prevSelected, orderId];
            }
        });
    };

    const handleDownloadSelectedOrders = async () => {
        setIsDownloading(true);
        for (const orderId of selectedOrders) {
            const order: any = orders.find(order => order.id === orderId);
            if (order && order.orderDocument) {
                if (Platform.OS === 'web') {
                    window.open(order.orderDocument, '_blank');
                } else {
                    try {
                        await Linking.openURL(order.orderDocument);
                        console.log(`Link aberto: ${order.orderDocument}`);
                    } catch (error) {
                        console.error(`Erro ao abrir o link:`, error);
                    }
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        setIsDownloading(false);
    };

    const truncateText = (text: string, maxLength: number) => {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        return text;
    };

    const renderItem = ({ item }: { item: Order }) => {
        const supplierName = item.calcOrderAgain?.data[0]?.supplier?.name || 'Fornecedor não disponível';
        const truncatedSupplierName = truncateText(supplierName, 20);

        return (
            <TouchableOpacity
                style={[
                    styles.stackContainer,
                    Platform.OS === 'web' && styles.stackContainerWeb,
                ]}
                onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
            >
                <View style={styles.itemContainer}>
                    <View style={styles.leftContainer}>
                        <Text style={styles.orderId}>{item.id}</Text>
                        <Text style={styles.deliveryDate}>
                            {formatDate(item.deliveryDate)}
                        </Text>
                    </View>

                    <View style={styles.rightContainer}>
                        <Text style={styles.totalConectar}>
                            R$ {item.totalConectar.toFixed(2)}
                        </Text>
                        <Text style={styles.supplierName}>{truncatedSupplierName}</Text>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.checkbox}
                            onPress={() => toggleOrderSelection(item.id)}
                        >
                            <Text>{selectedOrders.includes(item.id) ? '✓' : ''}</Text>
                        </TouchableOpacity>
                    </View>
                    <Icons name="chevron-forward" size={24} color="#04BF7B" />
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#04BF7B" />
            </View>
        );
    }

    return (
        <>
            <View style={styles.container}>
                <View style={styles.pickerContainer}>
                    <DropDownPicker
                        value={selectedRestaurant}
                        style={{
                            borderWidth: 1,
                            borderColor: 'lightgray',
                            borderRadius: 5,
                            flex: 1,
                            paddingHorizontal: 20,
                            marginTop: 20
                        }}
                        setValue={(value) => {
                            console.log('Novo restaurante selecionado:', value);
                            setSelectedRestaurant(value);
                        }}
                        items={restaurants.map((restaurant) => ({
                            label: restaurant.name,
                            value: restaurant.externalId,
                        }))}
                        open={restaurantOpen}
                        setOpen={setRestaurantOpen}
                        placeholder="Selecione um restaurante"
                        listMode="SCROLLVIEW"
                    />
                </View>

                <View style={styles.searchContainer}>
                    <TextInput
                        style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                        placeholder="Buscar pedidos..."
                        value={searchQuery}
                        onChangeText={(text) => {
                            setSearchQuery(text);
                            handleSearch(text);
                        }}
                    />
                    <Icons name="search" size={24} color="#04BF7B" style={styles.searchIcon} />
                </View>

                <TouchableOpacity
                    style={[
                        styles.downloadButton,
                        (selectedOrders.length === 0 || isDownloading) && styles.downloadButtonDisabled,
                    ]}
                    onPress={handleDownloadSelectedOrders}
                    disabled={selectedOrders.length === 0 || isDownloading}
                >
                    {isDownloading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.downloadButtonText}>Baixar Documentos Selecionados</Text>
                    )}
                </TouchableOpacity>

                <FlatList
                    data={filteredOrders}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Nenhum pedido encontrado.</Text>
                        </View>
                    }
                />
            </View>

            <BottomNavigation navigation={navigation} />
        </>
    );
}