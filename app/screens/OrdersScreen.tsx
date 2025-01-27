import React, { ReactNode, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Platform, TextInput, Linking } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icons from '@expo/vector-icons/Ionicons';
import { getOrders } from '../services/orderService';
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

export function OrdersScreen({ navigation }: { navigation: OrdersScreenNavigationProp }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const ordersData = await getOrders();
                setOrders(ordersData);
                setFilteredOrders(ordersData); // Inicializa a lista filtrada com todos os pedidos
            } catch (error) {
                console.error('Erro ao carregar pedidos:', error);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query) {
            const filtered = orders.filter((order) => {
                return (
                    order.id.toLowerCase().includes(query.toLowerCase()) ||
                    order.orderDate.toLowerCase().includes(query.toLowerCase()) ||
                    order.totalConectar.toString().includes(query) ||
                    order.calcOrderAgain.data[0].supplier.name.toLowerCase().includes(query.toLowerCase())
                );
            });
            setFilteredOrders(filtered);
        } else {
            setFilteredOrders(orders); // Se a busca estiver vazia, mostra todos os pedidos
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
                await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo de atraso
            }
        }
        setIsDownloading(false);
    };
    
    const renderItem = ({ item }: { item: Order }) => {
        const supplierName = item.calcOrderAgain?.data[0]?.supplier?.name || 'Fornecedor não disponível';
 
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
                        <Text style={styles.supplierName}>{supplierName}</Text>
                    </View>
    
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.checkbox}
                            onPress={() => toggleOrderSelection(item.id)}
                        >
                            <Text>{selectedOrders.includes(item.id) ? '✓' : ''}</Text>{/*{selectedOrders.includes(item.id) ? '✓' : ''}*/}
                        </TouchableOpacity>
                        <Text style={styles.totalConectar} >
                            {/*item.orderDocument*/}
                        </Text>
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
        <Text style={styles.downloadButtonText}>Baixar Selecionados</Text>
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