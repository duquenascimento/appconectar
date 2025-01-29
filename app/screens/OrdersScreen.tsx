import React, { ReactNode, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Platform, TextInput, Linking } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';  // Importando o DropDownPicker
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icons from '@expo/vector-icons/Ionicons';
import { getOrders } from '../services/orderService';
import { loadRestaurants } from '../services/restaurantService';
import { RootStackParamList } from '../types/navigationTypes';
import { ordersScreenStyles as styles } from '../styles/styles';
import { BottomNavigation } from '../components/navigation/BottomNavigation';

type OrdersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Orders'>;

interface Order {
    orderDocument: ReactNode;
    id: string;
    orderDate: string;
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
    id: string;
    name: string;
}

export function OrdersScreen({ navigation }: { navigation: OrdersScreenNavigationProp }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
    const [restaurantOpen, setRestaurantOpen] = useState(false);  // Estado para controlar abertura do DropDownPicker

    useEffect(() => {
        const LoadRestaurants = async () => {
            try {
                const restaurantsData = await loadRestaurants();
                setRestaurants(restaurantsData);
                if (restaurantsData.length > 0) {
                    setSelectedRestaurant(restaurantsData[0].externalId);
                }
            } catch (error) {
                console.error('Erro ao carregar restaurantes:', error);
            }
        };

        LoadRestaurants();
    }, []);

    useEffect(() => {
        const loadOrders = async () => {
            if (!selectedRestaurant) return;

            try {
                const ordersData = await getOrders(1, 10, selectedRestaurant);
                setOrders(ordersData);
                setFilteredOrders(ordersData); // Inicializa a lista filtrada com todos os pedidos
            } catch (error) {
                console.error('Erro ao carregar pedidos:', error);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [selectedRestaurant]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        let filtered = orders;
    
        if (query) {
            // Verifica se a query é uma data no formato DD/MM/YYYY
            const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
            const isDateQuery = dateRegex.test(query);
    
            if (isDateQuery) {
                // Converte a data digitada (DD/MM/YYYY) para o formato YYYY-MM-DD
                const [day, month, year] = query.split('/');
                const formattedQueryDate = `${year}-${month}-${day}`;
    
                // Filtra os pedidos pela data
                filtered = filtered.filter((order) => {
                    const orderDate = order.orderDate.split('T')[0]; // Remove o horário, se houver
                    return orderDate === formattedQueryDate;
                });
            } else {
                // Filtra por outros campos (id, valor, fornecedor, etc.)
                filtered = filtered.filter((order) => {
                    return (
                        order.id.toLowerCase().includes(query.toLowerCase()) ||
                        order.totalConectar.toString().includes(query) ||
                        order.calcOrderAgain.data[0].supplier.name.toLowerCase().includes(query.toLowerCase())
                    );
                });
            }
        }
    
        setFilteredOrders(filtered);
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
                        <Text style={styles.orderDate}>
                            {new Date(item.orderDate).toLocaleDateString('pt-BR')}
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
                {/* Substituindo o Picker por DropDownPicker */}
                <View style={styles.pickerContainer}>
                    <DropDownPicker
                        value={selectedRestaurant}
                        style={{
                            borderWidth: 1,
                            borderColor: 'lightgray',
                            borderRadius: 5,
                            flex: 1,
                        }}
                        setValue={setSelectedRestaurant}
                        items={restaurants.map((restaurant) => ({
                            label: restaurant.name,
                            value: restaurant.id,
                        }))}
                        open={restaurantOpen}
                        setOpen={setRestaurantOpen}
                        placeholder="Selecione um restaurante"
                        listMode="MODAL"
                    />
                </View>

                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar pedidos..."
                        value={searchQuery}
                        onChangeText={handleSearch}
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
                        <Text style={styles.downloadButtonText}>Baixar Recibo Selecionados</Text>
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
            <View>
                <BottomNavigation navigation={navigation} />
            </View>
        </>
    );
}
